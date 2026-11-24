const { ModelFactory } = require("../models/model.factory");

async function validarCupon(req, res, next) {
  try {
    const pedidoRepo = ModelFactory.getRepository("pedido");
    const codigo = req.cuponCodigo || req.params.codigo || req.query.codigo;
    const cupon = await pedidoRepo.findCuponActivo(codigo);
    return res.status(200).json({ ok: true, cupon });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  validarCupon
};
