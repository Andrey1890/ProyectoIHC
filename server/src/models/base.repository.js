const { getSupabaseSingleton } = require("../config/supabase.singleton");
const { HttpAppError } = require("../middlewares/error.middleware");
const { BY_TABLE } = require("../config/entity.metadata");
const { hashPasswordBcrypt } = require("../middlewares/hash.middleware");

function toPrimitiveValue(val) {
  if (typeof val === "string") {
    return val.trim();
  }
  if (val && typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  return val;
}

function normalizeRowValues(rawRow = {}, allowedColumns = null, hiddenFields = []) {
  const hiddenSet = new Set(hiddenFields);
  const result = {};
  const entries = allowedColumns
    ? allowedColumns.map((col) => [col, rawRow[col]])
    : Object.entries(rawRow);

  for (const [key, val] of entries) {
    if (hiddenSet.has(key) || val === undefined) {
      continue;
    }
    result[key] = toPrimitiveValue(val);
  }
  return result;
}

/**
 * Modelo base MVC para entidades mapeadas directamente a Prisma ORM.
 */
class BaseEntityModel {
  constructor(data = {}, columns = [], hiddenFields = []) {
    const clean = normalizeRowValues(
      data,
      columns.length > 0 ? columns : null,
      hiddenFields
    );
    Object.assign(this, clean);
  }

  toDTO() {
    return { ...this };
  }
}

/**
 * Repositorio base Singleton + Repository apoyado 100% en Prisma ORM (sin SQL crudo).
 */
class BaseTableRepository {
  static #instances = new Map();
  #db;

  constructor({
    tableName,
    modelDelegate = null,
    pkColumns,
    prefix = null,
    columns,
    defaultOrder = null,
    statusColumn = null,
    hiddenFields = [],
    ModelClass = BaseEntityModel,
    FactoryClass = null
  }) {
    this.tableName = tableName;
    this.modelDelegate =
      modelDelegate || (tableName.charAt(0).toLowerCase() + tableName.slice(1));
    this.pkColumns = [...pkColumns];
    this.prefix = prefix;
    this.columns = [...columns];
    this.defaultOrder = defaultOrder || pkColumns[0];
    this.statusColumn = statusColumn || null;
    this.hiddenFields = hiddenFields;
    this.ModelClass = ModelClass;
    this.FactoryClass = FactoryClass;
    this.#db = getSupabaseSingleton();
  }

  static registerSingleton(RepoClass) {
    if (!BaseTableRepository.#instances.has(RepoClass)) {
      BaseTableRepository.#instances.set(RepoClass, new RepoClass());
    }
    return BaseTableRepository.#instances.get(RepoClass);
  }

  getDb() {
    return this.#db;
  }

  getPrisma() {
    return this.#db.getPrisma();
  }

  getDelegate() {
    const prisma = this.getPrisma();
    const delegate = prisma[this.modelDelegate];
    if (!delegate) {
      throw new Error(`Delegado Prisma '${this.modelDelegate}' no existe para tabla '${this.tableName}'.`);
    }
    return delegate;
  }

  mapRowToModel(row = {}) {
    if (this.FactoryClass && typeof this.FactoryClass.createFromDbRow === "function") {
      return this.FactoryClass.createFromDbRow(row);
    }
    return new this.ModelClass(row, this.columns, this.hiddenFields);
  }

  #parseCompositeKey(idValue) {
    const raw = String(idValue || "").trim();
    if (!raw) {
      throw new HttpAppError(400, "Identificador requerido.", "VALIDATION_ID");
    }
    if (this.pkColumns.length === 1) {
      return [raw];
    }
    const parts = raw.split(":").map((p) => p.trim());
    if (parts.length !== this.pkColumns.length || parts.some((p) => !p)) {
      throw new HttpAppError(
        400,
        `Clave compuesta invalida para ${this.tableName}. Formato esperado: ${this.pkColumns.join(":")}.`,
        "VALIDATION_COMPOSITE_ID"
      );
    }
    return parts;
  }

  #buildFlatWhere(pkValues) {
    const where = {};
    this.pkColumns.forEach((col, idx) => {
      where[col] = pkValues[idx];
    });
    return where;
  }

  #filterRows(items, filters = {}) {
    const reserved = new Set(["page", "limit", "raw", "envelope", "sort"]);
    const entries = Object.entries(filters || {}).filter(
      ([k, v]) => !reserved.has(k) && v !== undefined && v !== "" && this.columns.includes(k)
    );
    if (entries.length === 0) {
      return items;
    }
    return items.filter((item) =>
      entries.every(([k, v]) =>
        String(item[k] ?? "").trim().toLowerCase() === String(v).trim().toLowerCase()
      )
    );
  }

  async findAll(filters = {}) {
    const delegate = this.getDelegate();
    const rows = await delegate.findMany({
      orderBy: { [this.defaultOrder]: "asc" }
    });
    const dtos = (Array.isArray(rows) ? rows : []).map((r) => this.mapRowToModel(r).toDTO());
    return this.#filterRows(dtos, filters);
  }

  async findById(idValue) {
    const pkValues = this.#parseCompositeKey(idValue);
    const delegate = this.getDelegate();
    const row = await delegate.findFirst({
      where: this.#buildFlatWhere(pkValues)
    });

    if (!row) {
      throw new HttpAppError(
        404,
        `Registro '${idValue}' no encontrado en ${this.tableName}.`,
        "ENTITY_NOT_FOUND"
      );
    }

    return this.mapRowToModel(row).toDTO();
  }

  #coerceData(rawData = {}, { isCreate = false } = {}) {
    const meta = BY_TABLE[this.tableName];
    const fieldMap = new Map(
      Array.isArray(meta?.fields) ? meta.fields.map((f) => [f.name, f]) : []
    );
    const result = {};

    for (const [col, rawVal] of Object.entries(rawData || {})) {
      if (rawVal === undefined) {
        continue;
      }
      const field = fieldMap.get(col);
      if (!field) {
        result[col] = rawVal;
        continue;
      }

      const isEmptyStr = typeof rawVal === "string" && rawVal.trim() === "";
      if (rawVal === null || isEmptyStr) {
        if (field.optional && !field.hasDefault) {
          result[col] = null;
        }
        // Si es requerido o tiene default (incl. usu_clave_hash vacio al editar), se omite
        continue;
      }

      if (field.type === "Int") {
        const parsed = Number.parseInt(String(rawVal).trim(), 10);
        if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
          throw new HttpAppError(400, `Valor invalido para ${col}`, "VALIDATION_TYPE");
        }
        result[col] = parsed;
        continue;
      }

      if (field.type === "Decimal") {
        const parsed = Number(rawVal);
        if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
          throw new HttpAppError(400, `Valor invalido para ${col}`, "VALIDATION_TYPE");
        }
        result[col] = parsed;
        continue;
      }

      if (field.type === "DateTime") {
        const str = String(rawVal).trim();
        const iso = field.kind === "date" && str.length === 10 ? `${str}T00:00:00.000Z` : str;
        const dt = new Date(iso);
        if (Number.isNaN(dt.getTime())) {
          throw new HttpAppError(400, `Valor invalido para ${col}`, "VALIDATION_TYPE");
        }
        result[col] = dt;
        continue;
      }

      let strVal = String(rawVal).trim();
      if (this.tableName === "Usuarios" && col === "usu_clave_hash" && !/^\$2[aby]\$/.test(strVal)) {
        strVal = hashPasswordBcrypt(strVal);
      }
      result[col] = strVal;
    }

    if (isCreate && this.tableName === "Usuarios" && !result.usu_clave_hash) {
      throw new HttpAppError(400, "Contrasena requerida para crear usuario.", "VALIDATION_PASSWORD_REQUIRED");
    }

    return result;
  }

  async create(payload = {}) {
    const rawData = {};
    for (const col of this.columns) {
      if (payload[col] !== undefined) {
        rawData[col] = payload[col];
      }
    }

    const data = this.#coerceData(rawData, { isCreate: true });

    if (this.prefix && this.pkColumns.length === 1 && !data[this.pkColumns[0]]) {
      data[this.pkColumns[0]] = await this.#db.nextId(
        this.getPrisma(),
        this.tableName,
        this.pkColumns[0],
        this.prefix
      );
    }

    const missingPks = this.pkColumns.filter((col) => data[col] === undefined || data[col] === "");
    if (missingPks.length > 0 && this.tableName !== "LOG") {
      throw new HttpAppError(
        400,
        `Campos de clave primaria requeridos: ${missingPks.join(", ")}.`,
        "VALIDATION_PK_REQUIRED"
      );
    }

    const delegate = this.getDelegate();
    const createdRow = await delegate.create({ data });
    return this.mapRowToModel(createdRow || data).toDTO();
  }

  async update(idValue, patch = {}) {
    const pkValues = this.#parseCompositeKey(idValue);
    const pkSet = new Set(this.pkColumns);
    const rawUpdates = {};

    for (const col of this.columns) {
      if (!pkSet.has(col) && patch[col] !== undefined) {
        rawUpdates[col] = patch[col];
      }
    }

    const updates = this.#coerceData(rawUpdates, { isCreate: false });

    if (Object.keys(updates).length === 0) {
      throw new HttpAppError(
        400,
        `Debe enviar al menos un campo valido de ${this.tableName} para actualizar.`,
        "VALIDATION_EMPTY_PATCH"
      );
    }

    const delegate = this.getDelegate();
    const where = this.#buildFlatWhere(pkValues);

    if (this.pkColumns.length === 1) {
      try {
        const updatedRow = await delegate.update({
          where,
          data: updates
        });
        return this.mapRowToModel(updatedRow).toDTO();
      } catch (err) {
        if (err.code === "P2025") {
          throw new HttpAppError(404, `Registro '${idValue}' no encontrado en ${this.tableName}.`, "ENTITY_NOT_FOUND");
        }
        throw err;
      }
    }

    const res = await delegate.updateMany({ where, data: updates });
    if (!res || res.count === 0) {
      throw new HttpAppError(404, `Registro '${idValue}' no encontrado en ${this.tableName}.`, "ENTITY_NOT_FOUND");
    }
    return this.findById(idValue);
  }

  async remove(idValue, { hard = false } = {}) {
    const pkValues = this.#parseCompositeKey(idValue);

    if (this.statusColumn && !hard) {
      const patched = await this.update(idValue, { [this.statusColumn]: "INACTIVO" });
      return {
        deleted: true,
        softDelete: true,
        id: idValue,
        registro: patched
      };
    }

    const delegate = this.getDelegate();
    const where = this.#buildFlatWhere(pkValues);

    if (this.pkColumns.length === 1) {
      try {
        await delegate.delete({ where });
      } catch (err) {
        if (err.code === "P2025") {
          throw new HttpAppError(404, `Registro '${idValue}' no encontrado en ${this.tableName}.`, "ENTITY_NOT_FOUND");
        }
        throw err;
      }
    } else {
      const res = await delegate.deleteMany({ where });
      if (!res || res.count === 0) {
        throw new HttpAppError(404, `Registro '${idValue}' no encontrado en ${this.tableName}.`, "ENTITY_NOT_FOUND");
      }
    }

    return {
      deleted: true,
      id: idValue
    };
  }
}

/**
 * Helper Factory que crea de forma uniforme las clases Model, Factory y Repository (Singleton)
 * respaldadas por Prisma ORM para cualquier tabla de schema.prisma.
 */
function defineTableEntity(config) {
  class EntityModel extends BaseEntityModel {
    constructor(data = {}) {
      super(data, config.columns, config.hiddenFields || []);
    }
  }

  class EntityFactory {
    static createFromDbRow(row = {}) {
      return new EntityModel(row);
    }

    static createFromJson(raw = {}) {
      return new EntityModel(raw);
    }
  }

  class EntityRepository extends BaseTableRepository {
    constructor() {
      super({
        ...config,
        ModelClass: EntityModel,
        FactoryClass: EntityFactory
      });
    }

    static getInstance() {
      return BaseTableRepository.registerSingleton(EntityRepository);
    }
  }

  return {
    Model: EntityModel,
    Factory: EntityFactory,
    Repository: EntityRepository,
    getInstance: () => EntityRepository.getInstance()
  };
}

module.exports = {
  BaseEntityModel,
  BaseTableRepository,
  defineTableEntity,
  normalizeRowValues
};
