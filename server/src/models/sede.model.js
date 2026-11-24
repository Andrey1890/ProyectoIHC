const { BaseEntityModel, BaseTableRepository } = require("./base.repository");

const SEDE_COLUMNS = [
  "id_sede",
  "id_ciudad",
  "sed_nombre",
  "sed_direccion",
  "sed_telefono",
  "sed_tipo",
  "sed_latitud",
  "sed_longitud"
];

function toDecimalNum(v) {
  if (v && typeof v === "object" && typeof v.toNumber === "function") {
    return v.toNumber();
  }
  return Number(v || 0);
}

class SedeModel extends BaseEntityModel {
  constructor(row = {}) {
    super(row, SEDE_COLUMNS);
    this.nombre = String(row.sed_nombre || row.nombre || "").trim();
    this.direccion = String(row.sed_direccion || row.direccion || "").trim();
    this.telefono = String(row.sed_telefono || row.telefono || "").trim();
    this.tipo = String(row.sed_tipo || row.tipo || "").trim();
    this.latitud = toDecimalNum(row.sed_latitud ?? row.latitud);
    this.longitud = toDecimalNum(row.sed_longitud ?? row.longitud);
    this.ciudad = String(row.ciu_nombre || row.Ciudades?.ciu_nombre || row.ciudad || "Quito").trim();
  }
}

class SedeFactory {
  static createFromDbRow(row = {}) {
    return new SedeModel(row);
  }

  static createFromJson(raw = {}) {
    return new SedeModel(raw);
  }
}

/**
 * Repositorio Singleton para Sedes usando Prisma ORM (sin SQL crudo).
 */
class SedeRepository extends BaseTableRepository {
  constructor() {
    super({
      tableName: "Sedes",
      pkColumns: ["id_sede"],
      prefix: "SED",
      columns: SEDE_COLUMNS,
      defaultOrder: "id_sede",
      ModelClass: SedeModel,
      FactoryClass: SedeFactory
    });
  }

  static getInstance() {
    return BaseTableRepository.registerSingleton(SedeRepository);
  }

  async findAll(filters = {}) {
    const prisma = this.getPrisma();
    const rows = await prisma.sedes.findMany({
      include: { Ciudades: true },
      orderBy: { id_sede: "asc" }
    });

    const mapped = (Array.isArray(rows) ? rows : []).map((r) =>
      SedeFactory.createFromDbRow(r).toDTO()
    );
    const activeFilters = Object.entries(filters || {}).filter(
      ([k, v]) => v !== undefined && v !== "" && SEDE_COLUMNS.includes(k)
    );
    if (activeFilters.length === 0) {
      return mapped;
    }
    return mapped.filter((item) =>
      activeFilters.every(([k, v]) => String(item[k] ?? "").toLowerCase() === String(v).toLowerCase())
    );
  }
}

module.exports = {
  SedeModel,
  SedeFactory,
  SedeRepository,
  getSedeRepository: () => SedeRepository.getInstance()
};
