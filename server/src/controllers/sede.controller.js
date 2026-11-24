const { ModelFactory } = require("../models/model.factory");
const { createCrudController } = require("./base.controller");

const baseCrud = createCrudController(
  () => ModelFactory.getRepository("sede"),
  "sede",
  { rawListForLegacy: true }
);

async function listarSedes(req, res, next) {
  return baseCrud.getAll(req, res, next);
}

module.exports = {
  ...baseCrud,
  listarSedes
};
