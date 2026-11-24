const fs = require("fs");
const path = require("path");
const { getSupabaseSingleton } = require("../config/supabase.singleton");
const { HttpAppError } = require("../middlewares/error.middleware");
const {
  ProductoFactory,
  ProductoModelSingleton,
  slugify,
  normalizeText
} = require("./producto.model");

const SINGLETON_TOKEN = Symbol("ProductoRepository");
const BACKUP_JSON_PATH = path.resolve(__dirname, "../../frontend-client/data/productos.json");

/**
 * Patron Singleton + Repository: encapsula todo acceso CRUD al catalogo
 * usando Prisma ORM sobre Supabase PostgreSQL (sin SQL crudo).
 */
class ProductoRepository {
  static #instance = null;
  #db;
  #modelHelper;

  constructor(token) {
    if (token !== SINGLETON_TOKEN) {
      throw new Error("Use ProductoRepository.getInstance().");
    }
    this.#db = getSupabaseSingleton();
    this.#modelHelper = ProductoModelSingleton.getInstance();
  }

  static getInstance() {
    if (!ProductoRepository.#instance) {
      ProductoRepository.#instance = new ProductoRepository(SINGLETON_TOKEN);
    }
    return ProductoRepository.#instance;
  }

  #readLocalBackup() {
    if (!fs.existsSync(BACKUP_JSON_PATH)) {
      return [];
    }
    const raw = JSON.parse(fs.readFileSync(BACKUP_JSON_PATH, "utf8"));
    return Array.isArray(raw) ? raw.map((item) => ProductoFactory.createFromJson(item).toDTO()) : [];
  }

  #mapPrismaProductRow(row) {
    const imgs = Array.isArray(row.ProductoImagenes)
      ? [...row.ProductoImagenes]
      : (row.ProductoImagenes ? [row.ProductoImagenes] : []);
    imgs.sort((a, b) => {
      const aPort = String(a.img_es_portada || "").trim() === "S" ? 0 : 1;
      const bPort = String(b.img_es_portada || "").trim() === "S" ? 0 : 1;
      if (aPort !== bPort) return aPort - bPort;
      return Number(a.img_orden || 1) - Number(b.img_orden || 1);
    });

    const lotes = Array.isArray(row.Lotes)
      ? row.Lotes
      : (row.Lotes ? [row.Lotes] : []);
    const stock = lotes.reduce((sum, lote) => {
      const est = String(lote.lot_estado || "").trim();
      return est === "ACTIVO" || est === "DISPONIBLE"
        ? sum + Number(lote.lot_stock_actual || 0)
        : sum;
    }, 0);

    const precio =
      row.pro_precio && typeof row.pro_precio.toNumber === "function"
        ? row.pro_precio.toNumber()
        : Number(row.pro_precio || 0);

    return {
      id_producto_db: row.id_producto,
      pro_codigo: row.pro_codigo,
      pro_nombre: row.pro_nombre,
      pro_descripcion: row.pro_descripcion,
      pro_precio: precio,
      cat_nombre: row.Categorias?.cat_nombre || "",
      img_url: String(imgs[0]?.img_url || "").trim(),
      stock
    };
  }

  async findAll(filters = {}) {
    try {
      const prisma = this.#db.getPrisma();
      const rows = await prisma.productos.findMany({
        include: {
          Categorias: true,
          ProductoImagenes: true,
          Lotes: true
        },
        orderBy: { id_producto: "asc" }
      });

      const catalog = (Array.isArray(rows) ? rows : [])
        .filter((r) => String(r.pro_estado || "").trim() === "ACTIVO")
        .map((r) => ProductoFactory.createFromDbRow(this.#mapPrismaProductRow(r)).toDTO());

      return this.#modelHelper.filterProducts(catalog, filters);
    } catch (error) {
      console.warn("[ProductoRepository] Fallback a JSON local por error Prisma/Supabase:", error.message);
      return this.#modelHelper.filterProducts(this.#readLocalBackup(), filters);
    }
  }

  async findByIdOrSlug(identifier) {
    const key = normalizeText(identifier);
    if (!key) {
      return null;
    }
    const all = await this.findAll();
    return (
      all.find(
        (p) =>
          normalizeText(p.id) === key ||
          normalizeText(p.id_producto_db) === key
      ) || null
    );
  }

  async create(payload = {}) {
    const model = ProductoFactory.createFromJson(payload);
    if (!model.id) {
      model.id = slugify(model.nombre);
    }

    return this.#db.withTransaction(async (tx) => {
      const cats = await tx.categorias.findMany();
      const matchedCat = (Array.isArray(cats) ? cats : []).find(
        (c) => normalizeText(c.cat_nombre) === normalizeText(model.categoria)
      );
      const idCategoria = String(matchedCat?.id_categoria || "CAT0000005").trim();

      const idProducto = await this.#db.nextId(tx, "Productos", "id_producto", "PRD");
      const seqNum = idProducto.replace("PRD", "").slice(-3);
      const proCodigo = model.codigo || `DK-2026-${seqNum}`;
      const proDescripcion = ProductoFactory.toDbMetaPayload(model);

      await tx.productos.create({
        data: {
          id_producto: idProducto,
          id_categoria: idCategoria,
          pro_codigo: proCodigo,
          pro_nombre: model.nombre,
          pro_descripcion: proDescripcion,
          pro_precio: model.precio,
          pro_estado: "ACTIVO"
        }
      });

      if (model.imagen) {
        const idImagen = await this.#db.nextId(tx, "ProductoImagenes", "id_imagen", "IMG");
        await tx.productoImagenes.create({
          data: {
            id_imagen: idImagen,
            id_producto: idProducto,
            img_url: model.imagen,
            img_orden: 1,
            img_es_portada: "S"
          }
        });
      }

      if (model.stock > 0) {
        const idLote = await this.#db.nextId(tx, "Lotes", "id_lote", "LOT");
        const today = new Date();
        const exp = new Date(today.getTime() + 18 * 30 * 24 * 60 * 60 * 1000);
        await tx.lotes.create({
          data: {
            id_lote: idLote,
            id_producto: idProducto,
            id_sede: "SED0000001",
            lot_numero: `LOT-QTO-${seqNum}`,
            lot_fecha_fabricacion: today,
            lot_fecha_caducidad: exp,
            lot_stock_actual: model.stock,
            lot_estado: "ACTIVO"
          }
        });
      }

      model.id_producto_db = idProducto;
      model.codigo = proCodigo;
      return model.toDTO();
    });
  }

  async update(identifier, patch = {}) {
    const existing = await this.findByIdOrSlug(identifier);
    if (!existing) {
      throw new HttpAppError(404, `Producto '${identifier}' no encontrado.`, "PRODUCT_NOT_FOUND");
    }

    const merged = ProductoFactory.createFromJson({
      ...existing,
      ...patch,
      id_producto_db: existing.id_producto_db
    });
    const proDescripcion = ProductoFactory.toDbMetaPayload(merged);

    await this.#db.withTransaction(async (tx) => {
      const updateData = {
        pro_nombre: merged.nombre,
        pro_descripcion: proDescripcion,
        pro_precio: merged.precio
      };

      if (patch.categoria) {
        const cats = await tx.categorias.findMany();
        const matchedCat = (Array.isArray(cats) ? cats : []).find(
          (c) => normalizeText(c.cat_nombre) === normalizeText(merged.categoria)
        );
        if (matchedCat?.id_categoria) {
          updateData.id_categoria = String(matchedCat.id_categoria).trim();
        }
      }

      await tx.productos.update({
        where: { id_producto: existing.id_producto_db },
        data: updateData
      });

      if (patch.imagen !== undefined) {
        await tx.productoImagenes.updateMany({
          where: { id_producto: existing.id_producto_db },
          data: { img_url: merged.imagen }
        });
      }
    });

    return merged.toDTO();
  }

  async remove(identifier) {
    const existing = await this.findByIdOrSlug(identifier);
    if (!existing) {
      throw new HttpAppError(404, `Producto '${identifier}' no encontrado.`, "PRODUCT_NOT_FOUND");
    }

    const prisma = this.#db.getPrisma();
    await prisma.productos.update({
      where: { id_producto: existing.id_producto_db },
      data: { pro_estado: "INACTIVO" }
    });

    return {
      deleted: true,
      id: existing.id,
      id_producto_db: existing.id_producto_db
    };
  }
}

module.exports = {
  ProductoRepository,
  getProductoRepository: () => ProductoRepository.getInstance()
};
