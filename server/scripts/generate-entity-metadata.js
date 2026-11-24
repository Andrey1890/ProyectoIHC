const fs = require("fs");
const path = require("path");

const SCHEMA_PATH = path.resolve(__dirname, "../prisma/schema.prisma");
const OUTPUT_PATH = path.resolve(__dirname, "../src/config/entity.metadata.js");

const SLUG_MAP = {
  AjusteDetalle: "ajuste-detalle",
  AjustesInventario: "ajustes-inventario",
  CarritoDetalle: "carrito-detalle",
  Carritos: "carritos",
  Categorias: "categorias",
  Ciudades: "ciudades",
  Clientes: "clientes",
  CompraDetalle: "compra-detalle",
  Compras: "compras",
  Departamentos: "departamentos",
  Descuentos: "descuentos",
  Empleados: "empleados",
  Envios: "envios",
  Facturas: "facturas",
  LOG: "logs",
  Lotes: "lotes",
  OrdenEntradaDetalle: "orden-entrada-detalle",
  OrdenSalidaDetalle: "orden-salida-detalle",
  OrdenesEntrada: "ordenes-entrada",
  OrdenesSalida: "ordenes-salida",
  Pagos: "pagos",
  Paises: "paises",
  PedidoDetalle: "pedido-detalle",
  Pedidos: "pedidos",
  ProductoImagenes: "producto-imagenes",
  Productos: "productos",
  Proveedores: "proveedores",
  Roles: "roles",
  Sedes: "sedes",
  Usuarios: "usuarios"
};

const READONLY_SLUGS = new Set(["logs", "pedidos", "productos"]);
const SCALAR_TYPES = new Set(["String", "Int", "Decimal", "DateTime"]);

function parseSchema(schemaText) {
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  const entities = [];
  let match;

  while ((match = modelRegex.exec(schemaText)) !== null) {
    const modelName = match[1];
    const body = match[2];
    const lines = body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//"));

    let tableName = modelName;
    const pk = [];
    const fields = [];
    const fkMap = new Map();

    for (const line of lines) {
      const mapMatch = line.match(/^@@map\("([^"]+)"\)/);
      if (mapMatch) {
        tableName = mapMatch[1];
        continue;
      }

      const compIdMatch = line.match(/^@@id\(\[([^\]]+)\]\)/);
      if (compIdMatch) {
        const cols = compIdMatch[1].split(",").map((c) => c.trim()).filter(Boolean);
        pk.length = 0;
        pk.push(...cols);
        continue;
      }

      if (line.startsWith("@@")) {
        continue;
      }

      // Relation line or scalar line
      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;

      const fieldName = parts[0];
      const rawType = parts[1];

      // Ignore list relation fields like `Clientes Clientes[]`
      if (rawType.endsWith("[]")) {
        continue;
      }

      const relMatch = line.match(/@relation\(fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\]/);
      if (relMatch) {
        const targetModel = rawType.replace(/\?$/, "");
        const fkField = relMatch[1].split(",")[0].trim();
        const refField = relMatch[2].split(",")[0].trim();
        fkMap.set(fkField, {
          table: targetModel,
          slug: SLUG_MAP[targetModel] || targetModel.toLowerCase(),
          ref: refField
        });
        continue;
      }

      const optional = rawType.endsWith("?");
      const baseType = rawType.replace(/\?$/, "");
      if (!SCALAR_TYPES.has(baseType)) {
        // Non-list relation without @relation on this side
        continue;
      }

      if (/\s@id(\s|$)/.test(line) && pk.length === 0) {
        pk.push(fieldName);
      }

      let kind = baseType.toLowerCase();
      if (baseType === "DateTime") {
        if (/@db\.Date(\s|$)/.test(line)) {
          kind = "date";
        } else if (/@db\.Timestamp/.test(line)) {
          kind = "datetime";
        } else {
          kind = "datetime";
        }
      }

      let maxLength = null;
      const lenMatch = line.match(/@db\.(?:Char|VarChar)\((\d+)\)/);
      if (lenMatch) {
        maxLength = Number.parseInt(lenMatch[1], 10);
      }

      const hasDefault = /@default\(/.test(line);

      fields.push({
        name: fieldName,
        type: baseType,
        kind,
        maxLength,
        optional,
        hasDefault,
        fk: null
      });
    }

    for (const f of fields) {
      if (fkMap.has(f.name)) {
        f.fk = fkMap.get(f.name);
      }
    }

    const slug = SLUG_MAP[modelName] || tableName.toLowerCase();
    entities.push({
      table: tableName,
      slug,
      pk,
      mode: READONLY_SLUGS.has(slug) ? "readonly" : "crud",
      fields
    });
  }

  return entities;
}

function main() {
  const schemaText = fs.readFileSync(SCHEMA_PATH, "utf8");
  const entities = parseSchema(schemaText);

  const byTable = {};
  const bySlug = {};
  for (const e of entities) {
    byTable[e.table] = e;
    bySlug[e.slug] = e;
  }

  const header =
    "// Archivo generado automaticamente por server/scripts/generate-entity-metadata.js\n" +
    "// No editar manualmente.\n\n";
  const content =
    header +
    "const ENTITIES = " +
    JSON.stringify(entities, null, 2) +
    ";\n\n" +
    "const BY_TABLE = Object.freeze(Object.fromEntries(ENTITIES.map((e) => [e.table, e])));\n" +
    "const BY_SLUG = Object.freeze(Object.fromEntries(ENTITIES.map((e) => [e.slug, e])));\n\n" +
    "module.exports = {\n" +
    "  ENTITIES,\n" +
    "  BY_TABLE,\n" +
    "  BY_SLUG\n" +
    "};\n";

  fs.writeFileSync(OUTPUT_PATH, content, "utf8");
  console.log(`Generated ${entities.length} entity metadata entries -> ${OUTPUT_PATH}`);
}

main();
