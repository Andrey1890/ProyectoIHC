const net = require("net");
const { PrismaClient } = require("@prisma/client");
const ENV = require("./env.config");

const SINGLETON_TOKEN = Symbol("SupabaseDatabaseSingleton");
const ALLOWED_ID_TARGETS = new Set([
  "AjustesInventario.id_ajuste",
  "Carritos.id_carrito",
  "Categorias.id_categoria",
  "Ciudades.id_ciudad",
  "Clientes.id_cliente",
  "Compras.id_compra",
  "Departamentos.id_departamento",
  "Descuentos.id_descuento",
  "Empleados.id_empleado",
  "Envios.id_envio",
  "Facturas.id_factura",
  "Lotes.id_lote",
  "OrdenesEntrada.id_orden_entrada",
  "OrdenesSalida.id_orden_salida",
  "Pagos.id_pago",
  "Paises.id_pais",
  "Pedidos.id_pedido",
  "ProductoImagenes.id_imagen",
  "Productos.id_producto",
  "Proveedores.id_proveedor",
  "Roles.id_rol",
  "Sedes.id_sede",
  "Usuarios.id_usuario"
]);

const MODEL_PK_MAP = Object.freeze({
  AjusteDetalle: ["id_ajuste", "id_lote"],
  AjustesInventario: ["id_ajuste"],
  CarritoDetalle: ["id_carrito", "id_producto"],
  Carritos: ["id_carrito"],
  Categorias: ["id_categoria"],
  Ciudades: ["id_ciudad"],
  Clientes: ["id_cliente"],
  CompraDetalle: ["id_compra", "id_producto"],
  Compras: ["id_compra"],
  Departamentos: ["id_departamento"],
  Descuentos: ["id_descuento"],
  Empleados: ["id_empleado"],
  Envios: ["id_envio"],
  Facturas: ["id_factura"],
  LOG: ["id_usuario", "log_fecha"],
  Lotes: ["id_lote"],
  OrdenEntradaDetalle: ["id_orden_entrada", "id_lote"],
  OrdenSalidaDetalle: ["id_orden_salida", "id_lote"],
  OrdenesEntrada: ["id_orden_entrada"],
  OrdenesSalida: ["id_orden_salida"],
  Pagos: ["id_pago"],
  Paises: ["id_pais"],
  PedidoDetalle: ["id_pedido", "id_producto"],
  Pedidos: ["id_pedido"],
  ProductoImagenes: ["id_imagen"],
  Productos: ["id_producto"],
  Proveedores: ["id_proveedor"],
  Roles: ["id_rol"],
  Sedes: ["id_sede"],
  Usuarios: ["id_usuario"]
});

const MANY_RELATIONS = new Set([
  "AjusteDetalle",
  "CarritoDetalle",
  "Carritos",
  "CompraDetalle",
  "Compras",
  "Ciudades",
  "Clientes",
  "Empleados",
  "Envios",
  "Facturas",
  "Lotes",
  "OrdenEntradaDetalle",
  "OrdenSalidaDetalle",
  "OrdenesEntrada",
  "OrdenesSalida",
  "Pagos",
  "PedidoDetalle",
  "Pedidos",
  "ProductoImagenes",
  "Productos",
  "Proveedores",
  "Sedes",
  "Usuarios"
]);

function normalizePrismaInputValue(val) {
  if (val instanceof Date) {
    return val.toISOString();
  }
  return val;
}

function buildPostgrestSelect(args = {}) {
  if (args.select && typeof args.select === "object") {
    return Object.entries(args.select)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([field]) => field)
      .join(",") || "*";
  }
  if (!args.include || typeof args.include !== "object") {
    return "*";
  }
  const relParts = [];
  for (const [relName, relOpt] of Object.entries(args.include)) {
    if (!relOpt) continue;
    if (relOpt === true) {
      relParts.push(`${relName}(*)`);
    } else if (typeof relOpt === "object") {
      relParts.push(`${relName}(${buildPostgrestSelect(relOpt)})`);
    }
  }
  return relParts.length > 0 ? `*,${relParts.join(",")}` : "*";
}

function normalizePostgrestRowRelations(row, includeObj) {
  if (!row || typeof row !== "object" || !includeObj) {
    return row;
  }
  const clone = { ...row };
  for (const [relName, relOpt] of Object.entries(includeObj)) {
    if (!relOpt) continue;
    const rawRel = clone[relName];
    if (MANY_RELATIONS.has(relName)) {
      const arr = Array.isArray(rawRel) ? rawRel : (rawRel ? [rawRel] : []);
      clone[relName] = relOpt.include
        ? arr.map((child) => normalizePostgrestRowRelations(child, relOpt.include))
        : arr;
    } else if (rawRel && typeof rawRel === "object" && relOpt.include) {
      clone[relName] = normalizePostgrestRowRelations(rawRel, relOpt.include);
    }
  }
  return clone;
}

function matchesScalarFilter(actual, cond) {
  if (cond === null || cond === undefined) {
    return actual == null;
  }
  if (typeof cond !== "object" || cond instanceof Date) {
    const a = typeof actual === "string" ? actual.trim() : actual;
    const b = cond instanceof Date ? cond.toISOString() : (typeof cond === "string" ? cond.trim() : cond);
    return a === b;
  }

  const normActual = typeof actual === "string" ? actual.trim() : actual;
  if ("equals" in cond) {
    const b = typeof cond.equals === "string" ? cond.equals.trim() : cond.equals;
    if (cond.mode === "insensitive" && typeof normActual === "string" && typeof b === "string") {
      if (normActual.toLowerCase() !== b.toLowerCase()) return false;
    } else if (normActual !== b) {
      return false;
    }
  }
  if ("in" in cond && Array.isArray(cond.in)) {
    const set = cond.in.map((v) => (typeof v === "string" ? v.trim() : v));
    if (!set.includes(normActual)) return false;
  }
  if ("notIn" in cond && Array.isArray(cond.notIn)) {
    const set = cond.notIn.map((v) => (typeof v === "string" ? v.trim() : v));
    if (set.includes(normActual)) return false;
  }
  if ("contains" in cond) {
    const needle = String(cond.contains);
    const hay = String(normActual ?? "");
    const ok = cond.mode === "insensitive"
      ? hay.toLowerCase().includes(needle.toLowerCase())
      : hay.includes(needle);
    if (!ok) return false;
  }
  if ("startsWith" in cond) {
    const prefix = String(cond.startsWith);
    const hay = String(normActual ?? "");
    const ok = cond.mode === "insensitive"
      ? hay.toLowerCase().startsWith(prefix.toLowerCase())
      : hay.startsWith(prefix);
    if (!ok) return false;
  }
  if ("gte" in cond) {
    const target = cond.gte instanceof Date ? cond.gte.getTime() : cond.gte;
    const left = normActual instanceof Date ? normActual.getTime() : (Number.isNaN(Number(normActual)) ? Date.parse(normActual) : Number(normActual));
    if (!(left >= target)) return false;
  }
  if ("lte" in cond) {
    const target = cond.lte instanceof Date ? cond.lte.getTime() : cond.lte;
    const left = normActual instanceof Date ? normActual.getTime() : (Number.isNaN(Number(normActual)) ? Date.parse(normActual) : Number(normActual));
    if (!(left <= target)) return false;
  }
  return true;
}

function matchesPrismaWhere(row, where) {
  if (!where || typeof where !== "object") {
    return true;
  }
  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;
    if (key === "AND") {
      const list = Array.isArray(val) ? val : [val];
      if (!list.every((sub) => matchesPrismaWhere(row, sub))) return false;
      continue;
    }
    if (key === "OR") {
      const list = Array.isArray(val) ? val : [val];
      if (!list.some((sub) => matchesPrismaWhere(row, sub))) return false;
      continue;
    }
    if (key.includes("_") && val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      const innerKeys = Object.keys(val);
      const isOperatorObj = innerKeys.some((k) => ["equals", "in", "notIn", "contains", "startsWith", "gte", "lte", "mode"].includes(k));
      if (!isOperatorObj && !(key in row)) {
        // Clave compuesta Prisma (ej: id_pedido_id_producto: { id_pedido, id_producto })
        if (!matchesPrismaWhere(row, val)) return false;
        continue;
      }
    }
    if (!matchesScalarFilter(row[key], val)) {
      return false;
    }
  }
  return true;
}

function sortRowsByOrderBy(rows, orderBy) {
  if (!orderBy) return rows;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((a, b) => {
    for (const ord of orders) {
      for (const [field, dir] of Object.entries(ord)) {
        const av = a[field] instanceof Date ? a[field].toISOString() : String(a[field] ?? "");
        const bv = b[field] instanceof Date ? b[field].toISOString() : String(b[field] ?? "");
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        if (cmp !== 0) {
          return String(dir).toLowerCase() === "desc" ? -cmp : cmp;
        }
      }
    }
    return 0;
  });
}

function flattenPrismaWhereForPk(model, where = {}) {
  const pkCols = MODEL_PK_MAP[model] || [];
  const flat = {};
  for (const [k, v] of Object.entries(where)) {
    if (k.includes("_") && v && typeof v === "object" && !Array.isArray(v) && !(k in MODEL_PK_MAP) && pkCols.length > 1) {
      Object.assign(flat, v);
    } else {
      flat[k] = v;
    }
  }
  return Object.entries(flat)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=eq.${encodeURIComponent(typeof v === "string" ? v.trim() : v)}`)
    .join("&");
}

/**
 * Patron Singleton: garantiza una unica instancia compartida de PrismaClient (ORM)
 * conectada a Supabase PostgreSQL, con extension transparente PostgREST HTTPS 443
 * cuando el firewall bloquea el puerto TCP 5432.
 */
class SupabaseDatabaseSingleton {
  static #instance = null;
  #basePrisma;
  #prisma;
  #instanceId;
  #pgAvailable = null;
  #pgCheckedAt = 0;

  constructor(token) {
    if (token !== SINGLETON_TOKEN) {
      throw new Error("Use SupabaseDatabaseSingleton.getInstance() en lugar de new.");
    }

    this.#instanceId = `supabase-prisma-${Date.now()}`;
    this.#basePrisma = new PrismaClient({
      datasources: {
        db: { url: ENV.DATABASE_URL }
      }
    });

    const self = this;
    this.#prisma = this.#basePrisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            if (await self.isPgAvailable()) {
              return query(args);
            }
            return self.#executePrismaViaPostgrest({ model, operation, args });
          }
        }
      }
    });
  }

  /**
   * Retorna la instancia unica del administrador de base de datos.
   * @returns {SupabaseDatabaseSingleton}
   */
  static getInstance() {
    if (!SupabaseDatabaseSingleton.#instance) {
      SupabaseDatabaseSingleton.#instance = new SupabaseDatabaseSingleton(SINGLETON_TOKEN);
    }
    return SupabaseDatabaseSingleton.#instance;
  }

  getInstanceId() {
    return this.#instanceId;
  }

  getPrisma() {
    return this.#prisma;
  }

  getBasePrisma() {
    return this.#basePrisma;
  }

  async isPgAvailable() {
    if (this.#pgAvailable !== null && Date.now() - this.#pgCheckedAt < 60000) {
      return this.#pgAvailable;
    }

    const reachable = await new Promise((resolve) => {
      let settled = false;
      const socket = net.connect({
        host: ENV.SUPABASE.host,
        port: ENV.SUPABASE.port,
        family: 4,
        timeout: 2000
      });

      const finish = (ok) => {
        if (!settled) {
          settled = true;
          socket.destroy();
          resolve(ok);
        }
      };

      socket.on("connect", () => finish(true));
      socket.on("timeout", () => finish(false));
      socket.on("error", () => finish(false));
    });

    this.#pgAvailable = reachable;
    this.#pgCheckedAt = Date.now();
    return reachable;
  }

  async withTransaction(work) {
    if (await this.isPgAvailable()) {
      return this.#basePrisma.$transaction(
        async (tx) => work(tx),
        { maxWait: 15000, timeout: 30000 }
      );
    }
    return work(this.#prisma);
  }

  async #executePrismaViaPostgrest({ model, operation, args = {} }) {
    const selectStr = buildPostgrestSelect(args);

    if (operation === "findMany" || operation === "findFirst" || operation === "findUnique" || operation === "findFirstOrThrow" || operation === "findUniqueOrThrow" || operation === "count") {
      const rows = await this.fetchRest(model, `select=${selectStr}`);
      const normalized = (Array.isArray(rows) ? rows : []).map((r) =>
        normalizePostgrestRowRelations(r, args.include)
      );
      const filtered = normalized.filter((r) => matchesPrismaWhere(r, args.where));
      if (operation === "count") {
        return filtered.length;
      }
      const ordered = sortRowsByOrderBy(filtered, args.orderBy);
      const skip = Number(args.skip || 0);
      const take = args.take !== undefined ? Number(args.take) : undefined;
      const sliced = take !== undefined ? ordered.slice(skip, skip + take) : ordered.slice(skip);

      if (operation === "findMany") {
        return sliced;
      }
      const found = sliced[0] || null;
      if (!found && (operation === "findFirstOrThrow" || operation === "findUniqueOrThrow")) {
        const err = new Error(`Registro no encontrado en ${model}`);
        err.code = "P2025";
        throw err;
      }
      return found;
    }

    if (operation === "upsert") {
      const existing = await this.#executePrismaViaPostgrest({
        model,
        operation: "findFirst",
        args: { where: args.where }
      });
      if (existing) {
        return this.#executePrismaViaPostgrest({
          model,
          operation: "update",
          args: { where: args.where, data: args.update || {} }
        });
      }
      return this.#executePrismaViaPostgrest({
        model,
        operation: "create",
        args: { data: args.create || {} }
      });
    }

    if (operation === "create") {
      const cleanBody = {};
      for (const [k, v] of Object.entries(args.data || {})) {
        if (v !== undefined) {
          cleanBody[k] = normalizePrismaInputValue(v);
        }
      }
      const inserted = await this.requestRest(model, {
        method: "POST",
        body: cleanBody
      });
      return Array.isArray(inserted) ? inserted[0] : inserted;
    }

    if (operation === "update" || operation === "updateMany") {
      const existingRows = await this.#executePrismaViaPostgrest({
        model,
        operation: "findMany",
        args: { where: args.where }
      });
      if (existingRows.length === 0) {
        if (operation === "updateMany") {
          return { count: 0 };
        }
        const err = new Error(`Registro no encontrado para actualizar en ${model}`);
        err.code = "P2025";
        throw err;
      }

      const targetRow = existingRows[0];
      const patchBody = {};
      for (const [k, v] of Object.entries(args.data || {})) {
        if (v === undefined) continue;
        if (v && typeof v === "object" && !(v instanceof Date)) {
          if ("increment" in v) {
            patchBody[k] = Number(targetRow[k] || 0) + Number(v.increment || 0);
            continue;
          }
          if ("decrement" in v) {
            patchBody[k] = Number(targetRow[k] || 0) - Number(v.decrement || 0);
            continue;
          }
        }
        patchBody[k] = normalizePrismaInputValue(v);
      }

      const pkCols = MODEL_PK_MAP[model] || Object.keys(args.where || {});
      const query = operation === "update"
        ? pkCols.map((col) => `${col}=eq.${encodeURIComponent(typeof targetRow[col] === "string" ? targetRow[col].trim() : targetRow[col])}`).join("&")
        : flattenPrismaWhereForPk(model, args.where);

      const updated = await this.requestRest(model, {
        method: "PATCH",
        query,
        body: patchBody
      });
      const updatedArr = Array.isArray(updated) ? updated : (updated ? [updated] : []);
      return operation === "updateMany" ? { count: updatedArr.length } : updatedArr[0];
    }

    if (operation === "delete" || operation === "deleteMany") {
      const existingRows = await this.#executePrismaViaPostgrest({
        model,
        operation: "findMany",
        args: { where: args.where }
      });
      if (existingRows.length === 0) {
        if (operation === "deleteMany") {
          return { count: 0 };
        }
        const err = new Error(`Registro no encontrado para eliminar en ${model}`);
        err.code = "P2025";
        throw err;
      }

      const pkCols = MODEL_PK_MAP[model] || Object.keys(args.where || {});
      const targetRow = existingRows[0];
      const query = operation === "delete"
        ? pkCols.map((col) => `${col}=eq.${encodeURIComponent(typeof targetRow[col] === "string" ? targetRow[col].trim() : targetRow[col])}`).join("&")
        : flattenPrismaWhereForPk(model, args.where);

      const deleted = await this.requestRest(model, {
        method: "DELETE",
        query
      });
      const deletedArr = Array.isArray(deleted) ? deleted : (deleted ? [deleted] : []);
      return operation === "deleteMany" ? { count: deletedArr.length } : (deletedArr[0] || targetRow);
    }

    throw new Error(`Operacion Prisma '${operation}' no soportada en transporte dual.`);
  }

  /**
   * Genera el siguiente ID prefijado usando Prisma ORM (sin SQL crudo).
   */
  async nextId(txOrPrisma, table, column, prefix) {
    const targetKey = `${table}.${column}`;
    if (!ALLOWED_ID_TARGETS.has(targetKey)) {
      throw new Error(`Destino no autorizado para nextId: ${targetKey}`);
    }

    const delegateName = table.charAt(0).toLowerCase() + table.slice(1);
    const client = txOrPrisma || this.#prisma;
    const rows = await client[delegateName].findMany({
      select: { [column]: true },
      orderBy: { [column]: "desc" },
      take: 50
    });

    const pattern = new RegExp(`^${prefix}([0-9]+)$`);
    let maxNum = 0;
    for (const row of Array.isArray(rows) ? rows : []) {
      const val = String(row[column] || "").trim();
      const match = val.match(pattern);
      if (match) {
        const num = Number.parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
    return `${prefix}${String(maxNum + 1).padStart(7, "0")}`;
  }

  async healthCheck() {
    const pgOpen = await this.isPgAvailable();
    const totalProductos = await this.#prisma.productos.count({
      where: { pro_estado: "ACTIVO" }
    });
    return {
      db: ENV.SUPABASE.database,
      orm: "prisma",
      total_productos: Number(totalProductos || 0),
      transport: pgOpen ? "prisma-postgresql" : "prisma-postgrest-https"
    };
  }

  async requestRest(
    resource,
    { method = "GET", query = "", body = undefined, prefer = "return=representation" } = {}
  ) {
    if (!ENV.SUPABASE.anonKey) {
      throw new Error("SUPABASE_ANON_KEY no configurada para transporte PostgREST HTTPS.");
    }
    const cleanQuery = String(query || "").replace(/^\?/, "");
    const separator = cleanQuery ? `?${cleanQuery}` : "";
    const url = `${ENV.SUPABASE.restUrl}/${resource}${separator}`;

    const headers = {
      apikey: ENV.SUPABASE.anonKey,
      Authorization: `Bearer ${ENV.SUPABASE.anonKey}`,
      "Content-Type": "application/json"
    };
    if (prefer) {
      headers.Prefer = prefer;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Supabase PostgREST HTTP ${response.status}: ${text}`);
    }
    if (response.status === 204 || !text) {
      return null;
    }
    return JSON.parse(text);
  }

  async fetchRest(resource, queryString = "") {
    return this.requestRest(resource, { method: "GET", query: queryString });
  }

  async close() {
    await this.#basePrisma.$disconnect();
  }
}

module.exports = {
  SupabaseDatabaseSingleton,
  getSupabaseSingleton: () => SupabaseDatabaseSingleton.getInstance()
};
