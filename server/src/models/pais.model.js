const { defineTableEntity } = require("./base.repository");

const {
  Model: PaisModel,
  Factory: PaisFactory,
  Repository: PaisRepository,
  getInstance: getPaisRepository
} = defineTableEntity({
  tableName: "Paises",
  pkColumns: ["id_pais"],
  prefix: "PAI",
  columns: ["id_pais", "pai_codigo", "pai_nombre"],
  defaultOrder: "id_pais"
});

module.exports = {
  PaisModel,
  PaisFactory,
  PaisRepository,
  getPaisRepository
};
