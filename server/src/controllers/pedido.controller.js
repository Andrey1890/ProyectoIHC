const { ModelFactory } = require("../models/model.factory");
const { createCrudController } = require("./base.controller");
const { paginateCollection } = require("../middlewares/pagination.middleware");
const { HttpAppError } = require("../middlewares/error.middleware");

const baseCrud = createCrudController(
  () => ModelFactory.getRepository("pedido"),
  "pedido"
);

async function listarPedidos(req, res, next) {
  try {
    const pedidoRepo = ModelFactory.getRepository("pedido");
    const limit = Number.parseInt(req.query?.limit, 10) || 100;
    const pedidos = await pedidoRepo.findRecent(limit);
    return res.status(200).json(paginateCollection(pedidos, req.pagination));
  } catch (error) {
    return next(error);
  }
}

async function misPedidos(req, res, next) {
  try {
    const pedidoRepo = ModelFactory.getRepository("pedido");
    const pedidos = await pedidoRepo.findByUser(req.user || {});
    return res.status(200).json({
      ok: true,
      total: pedidos.length,
      pedidos,
      data: pedidos
    });
  } catch (error) {
    return next(error);
  }
}

async function obtenerPedidoPorId(req, res, next) {
  try {
    const pedidoRepo = ModelFactory.getRepository("pedido");
    const pedido = await pedidoRepo.findById(req.params.id);
    if (
      req.user &&
      req.user.role !== "admin" &&
      req.user.id_cliente &&
      pedido.userId &&
      pedido.userId !== req.user.id_cliente
    ) {
      throw new HttpAppError(
        403,
        "Acceso denegado: no puedes consultar pedidos de otro usuario.",
        "AUTH_FORBIDDEN"
      );
    }
    return res.status(200).json({ ok: true, pedido });
  } catch (error) {
    return next(error);
  }
}

async function procesarCheckout(req, res, next) {
  try {
    const pedidoRepo = ModelFactory.getRepository("pedido");
    const resultado = await pedidoRepo.createCheckoutTransaction({
      ...req.body,
      user: req.user || null
    });
    return res.status(201).json(resultado);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ...baseCrud,
  listarPedidos,
  misPedidos,
  obtenerPedidoPorId,
  procesarCheckout
};
