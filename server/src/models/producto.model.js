const { generateSkuHash } = require("../middlewares/hash.middleware");

const META_DELIMITER = "||META||";
const SINGLETON_TOKEN = Symbol("ProductoModelSingleton");

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Modelo de dominio MVC para un producto dermatologico DERMAKOR.
 */
class ProductoModel {
  constructor(props = {}) {
    this.id = props.id || props.slug || slugify(props.nombre) || props.id_producto_db || "";
    this.id_producto_db = props.id_producto_db || props.id_producto || null;
    this.codigo = props.codigo || props.pro_codigo || "";
    this.nombre = String(props.nombre || "").trim();
    this.marca = String(props.marca || "Dermakor").trim();
    this.categoria = String(props.categoria || "Cuidado facial").trim();
    this.tipoUso = String(props.tipoUso || "casa").trim();
    this.subtitulo = String(props.subtitulo || "").trim();
    this.presentacion = String(props.presentacion || "Unidad").trim();
    this.precio = Number(Number(props.precio || 0).toFixed(2));
    this.precioProfesional = Number(Number(props.precioProfesional ?? this.precio).toFixed(2));
    this.stock = Number.isFinite(Number(props.stock)) ? Number.parseInt(props.stock, 10) : 25;
    this.stock_reservado = Number.isFinite(Number(props.stock_reservado)) ? Number.parseInt(props.stock_reservado, 10) : 0;
    this.stock_fisico = Number.isFinite(Number(props.stock_fisico)) ? Number.parseInt(props.stock_fisico, 10) : (this.stock + this.stock_reservado);
    this.imagen = String(props.imagen || "").trim();
    this.destacadoHome = Boolean(props.destacadoHome);
    this.esExosoma = Boolean(props.esExosoma || normalizeText(this.categoria) === "exosomas");
    this.createdAt = String(props.createdAt || "2026-01-15T00:00:00.000Z").trim();
    this.descripcion = String(props.descripcion || "").trim();
    this.principiosActivos = Array.isArray(props.principiosActivos) ? props.principiosActivos : [];
    this.beneficios = Array.isArray(props.beneficios) ? props.beneficios : [];
    this.modoUso = String(
      props.modoUso ||
      "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista."
    ).trim();
    this.sku_hash = String(
      props.sku_hash || generateSkuHash(this.codigo || this.id_producto_db || this.id || this.nombre)
    ).trim();
  }

  toDTO() {
    const dto = {
      id: this.id,
      id_producto_db: this.id_producto_db,
      sku_hash: this.sku_hash,
      nombre: this.nombre,
      marca: this.marca,
      categoria: this.categoria,
      tipoUso: this.tipoUso,
      subtitulo: this.subtitulo,
      presentacion: this.presentacion,
      precio: this.precio,
      precioProfesional: this.precioProfesional,
      stock: this.stock,
      stock_reservado: this.stock_reservado,
      stock_fisico: this.stock_fisico,
      imagen: this.imagen,
      destacadoHome: this.destacadoHome,
      createdAt: this.createdAt,
      descripcion: this.descripcion,
      principiosActivos: this.principiosActivos,
      beneficios: this.beneficios,
      modoUso: this.modoUso
    };
    if (this.esExosoma) {
      dto.esExosoma = true;
    }
    return dto;
  }
}

/**
 * Patron Factory: construye instancias consistentes de ProductoModel a partir
 * de filas relacionales de Supabase PostgreSQL, JSON estatico o peticiones HTTP.
 */
class ProductoFactory {
  static createFromDbRow(row = {}) {
    const rawDesc = String(row.pro_descripcion || "");
    let description = rawDesc.trim();
    let meta = {};

    const metaIndex = rawDesc.indexOf(META_DELIMITER);
    if (metaIndex !== -1) {
      description = rawDesc.slice(0, metaIndex).trim();
      const metaRaw = rawDesc.slice(metaIndex + META_DELIMITER.length).trim();
      try {
        meta = JSON.parse(metaRaw);
      } catch (_err) {
        meta = {};
      }
    }

    const precio = Number(row.pro_precio || meta.precio || 0);
    const idDb = String(row.id_producto_db || row.id_producto || "").trim();

    return new ProductoModel({
      id: meta.slug || slugify(row.pro_nombre) || idDb,
      id_producto_db: idDb,
      codigo: String(row.pro_codigo || "").trim(),
      sku_hash: meta.sku_hash || row.sku_hash || "",
      nombre: String(row.pro_nombre || "").trim(),
      marca: meta.marca || "Dermakor",
      categoria: String(row.cat_nombre || meta.categoria || "Cuidado facial").trim(),
      tipoUso: meta.tipoUso || "casa",
      subtitulo: meta.subtitulo || "",
      presentacion: meta.presentacion || "Unidad",
      precio,
      precioProfesional: meta.precioProfesional ?? Number((precio * 0.85).toFixed(2)),
      stock: Number(row.stock ?? 25),
      stock_reservado: Number(row.stock_reservado ?? 0),
      stock_fisico: Number(row.stock_fisico ?? Number(row.stock ?? 25) + Number(row.stock_reservado ?? 0)),
      imagen: String(row.img_url || meta.imagen || "").trim(),
      destacadoHome: Boolean(meta.destacadoHome),
      esExosoma: Boolean(meta.esExosoma),
      descripcion: description,
      principiosActivos: Array.isArray(meta.principiosActivos) ? meta.principiosActivos : [],
      beneficios: Array.isArray(meta.beneficios) ? meta.beneficios : [],
      modoUso: meta.modoUso || ""
    });
  }

  static createFromJson(raw = {}) {
    return new ProductoModel(raw);
  }

  static toDbMetaPayload(input = {}) {
    const model = input instanceof ProductoModel ? input : new ProductoModel(input);
    const cleanDesc = model.descripcion || `${model.nombre} - ${model.subtitulo}`.trim();
    const meta = {
      slug: model.id || slugify(model.nombre),
      sku_hash: model.sku_hash,
      marca: model.marca,
      tipoUso: model.tipoUso,
      subtitulo: model.subtitulo,
      presentacion: model.presentacion,
      precioProfesional: model.precioProfesional,
      imagen: model.imagen,
      destacadoHome: model.destacadoHome,
      principiosActivos: model.principiosActivos,
      beneficios: model.beneficios,
      modoUso: model.modoUso
    };
    return `${cleanDesc} ${META_DELIMITER}${JSON.stringify(meta)}`;
  }
}

/**
 * Patron Singleton para utilidades y configuracion de modelo de Producto.
 */
class ProductoModelSingleton {
  static #instance = null;

  constructor(token) {
    if (token !== SINGLETON_TOKEN) {
      throw new Error("Use ProductoModelSingleton.getInstance().");
    }
    this.createdAt = new Date().toISOString();
  }

  static getInstance() {
    if (!ProductoModelSingleton.#instance) {
      ProductoModelSingleton.#instance = new ProductoModelSingleton(SINGLETON_TOKEN);
    }
    return ProductoModelSingleton.#instance;
  }

  filterProducts(items = [], filters = {}) {
    const catNorm = normalizeText(filters.categoria);
    const tipoNorm = normalizeText(filters.tipoUso);
    const searchNorm = normalizeText(filters.q || filters.search);

    return items.filter((item) => {
      if (catNorm && catNorm !== "todos" && normalizeText(item.categoria) !== catNorm) {
        return false;
      }
      if (tipoNorm && tipoNorm !== "todos") {
        const itemTipo = normalizeText(item.tipoUso);
        if (itemTipo !== tipoNorm && itemTipo !== "ambos") {
          return false;
        }
      }
      if (searchNorm) {
        const haystack = normalizeText(
          `${item.nombre} ${item.marca} ${item.categoria} ${item.subtitulo} ${item.descripcion}`
        );
        if (!haystack.includes(searchNorm)) {
          return false;
        }
      }
      return true;
    });
  }
}

module.exports = {
  ProductoModel,
  ProductoFactory,
  ProductoModelSingleton,
  slugify,
  normalizeText
};
