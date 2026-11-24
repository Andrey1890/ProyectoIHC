const { defineTableEntity } = require("./base.repository");

const {
  Model: AjusteDetalleModel,
  Factory: AjusteDetalleFactory,
  Repository: AjusteDetalleRepository,
  getInstance: getAjusteDetalleRepository
} = defineTableEntity({
  tableName: "AjusteDetalle",
  pkColumns: ["id_ajuste", "id_lote"],
  columns: ["id_ajuste", "id_lote", "ade_cantidad", "ade_observacion"],
  defaultOrder: "id_ajuste"
});

module.exports = {
  AjusteDetalleModel,
  AjusteDetalleFactory,
  AjusteDetalleRepository,
  getAjusteDetalleRepository
};
