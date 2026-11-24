const { getInventarioRepository } = require("../models/inventario.repository");

async function crearCompra(req, res, next) {
  try {
    const repo = getInventarioRepository();
    const result = await repo.crearCompra(req.body || {});
    return res.status(201).json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}

async function recibirCompra(req, res, next) {
  try {
    const repo = getInventarioRepository();
    const result = await repo.recibirCompra(req.params.id, req.body || {});
    return res.status(201).json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}

async function anularCompra(req, res, next) {
  try {
    const repo = getInventarioRepository();
    const compra = await repo.anularCompra(req.params.id);
    return res.status(200).json({ ok: true, compra });
  } catch (error) {
    return next(error);
  }
}

async function crearAjuste(req, res, next) {
  try {
    const repo = getInventarioRepository();
    const result = await repo.crearAjuste(req.body || {});
    return res.status(201).json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}

async function listarLotes(req, res, next) {
  try {
    const repo = getInventarioRepository();
    const result = await repo.listarLotesConSemaforo({
      estado: req.query?.estado,
      id_producto: req.query?.id_producto
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}

async function obtenerKardex(req, res, next) {
  try {
    const repo = getInventarioRepository();
    const result = await repo.obtenerKardex({
      id_producto: req.query?.id_producto,
      id_lote: req.query?.id_lote,
      id_sede: req.query?.id_sede
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}

async function obtenerResumen(req, res, next) {
  try {
    const repo = getInventarioRepository();
    const result = await repo.obtenerResumen();
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  crearCompra,
  recibirCompra,
  anularCompra,
  crearAjuste,
  listarLotes,
  obtenerKardex,
  obtenerResumen
};
