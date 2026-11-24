const { defineTableEntity } = require("./base.repository");

const {
  Model: CategoriaModel,
  Factory: CategoriaFactory,
  Repository: CategoriaRepository,
  getInstance: getCategoriaRepository
} = defineTableEntity({
  tableName: "Categorias",
  pkColumns: ["id_categoria"],
  prefix: "CAT",
  statusColumn: "cat_estado",
  columns: ["id_categoria", "cat_nombre", "cat_descripcion", "cat_estado"],
  defaultOrder: "id_categoria"
});

module.exports = {
  CategoriaModel,
  CategoriaFactory,
  CategoriaRepository,
  getCategoriaRepository
};
