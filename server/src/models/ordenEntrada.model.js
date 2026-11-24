const { defineTableEntity } = require("./base.repository");

const {
  Model: OrdenEntradaModel,
  Factory: OrdenEntradaFactory,
  Repository: OrdenEntradaRepository,
  getInstance: getOrdenEntradaRepository
} = defineTableEntity({
  tableName: "OrdenesEntrada",
  pkColumns: ["id_orden_entrada"],
  prefix: "OEN",
  statusColumn: "oen_estado",
  columns: [
    "id_orden_entrada",
    "id_compra",
    "id_sede",
    "id_empleado",
    "oen_numero",
    "oen_fecha",
    "oen_observacion",
    "oen_estado"
  ],
  defaultOrder: "id_orden_entrada"
});

module.exports = {
  OrdenEntradaModel,
  OrdenEntradaFactory,
  OrdenEntradaRepository,
  getOrdenEntradaRepository
};
