const { ModelFactory } = require("../models/model.factory");
const { createCrudController } = require("./base.controller");

module.exports = createCrudController(
  () => ModelFactory.getRepository("ajustesInventario"),
  "ajusteInventario"
);
