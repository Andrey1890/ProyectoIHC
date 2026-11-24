const { ModelFactory } = require("../models/model.factory");
const { paginateCollection } = require("../middlewares/pagination.middleware");
const { HttpAppError } = require("../middlewares/error.middleware");

async function getAll(req, res, next) {
  try {
    const repo = ModelFactory.getRepository("producto");
    const productos = await repo.findAll({
      categoria: req.query.categoria,
      tipoUso: req.query.tipoUso,
      q: req.query.q || req.query.search
    });
    return res.status(200).json(paginateCollection(productos, req.pagination));
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const repo = ModelFactory.getRepository("producto");
    const producto = await repo.findByIdOrSlug(req.params.id);
    if (!producto) {
      throw new HttpAppError(404, `Producto '${req.params.id}' no encontrado.`, "PRODUCT_NOT_FOUND");
    }
    return res.status(200).json({ ok: true, producto });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const repo = ModelFactory.getRepository("producto");
    const payload = {
      ...req.body,
      sku_hash: req.body?.sku_hash || req.security?.sku_hash
    };
    const creado = await repo.create(payload);
    return res.status(201).json({ ok: true, producto: creado });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const repo = ModelFactory.getRepository("producto");
    const payload = {
      ...req.body,
      sku_hash: req.body?.sku_hash || req.security?.sku_hash
    };
    const actualizado = await repo.update(req.params.id, payload);
    return res.status(200).json({ ok: true, producto: actualizado });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const repo = ModelFactory.getRepository("producto");
    const resultado = await repo.remove(req.params.id);
    return res.status(200).json({ ok: true, ...resultado });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  delete: remove,
  listarProductos: getAll,
  obtenerProductoPorId: getById,
  crearProducto: create,
  actualizarProducto: update,
  eliminarProducto: remove
};
