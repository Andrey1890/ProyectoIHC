const { defineTableEntity } = require("./base.repository");

const {
  Model: OrdenSalidaModel,
  Factory: OrdenSalidaFactory,
  Repository: OrdenSalidaRepository,
  getInstance: getOrdenSalidaRepository
} = defineTableEntity({
  tableName: "OrdenesSalida",
  pkColumns: ["id_orden_salida"],
  prefix: "OSA",
  statusColumn: "osa_estado",
  columns: [
    "id_orden_salida",
    "id_pedido",
    "id_sede",
    "id_empleado",
    "osa_numero",
    "osa_fecha",
    "osa_observacion",
    "osa_estado"
  ],
  defaultOrder: "id_orden_salida"
});

module.exports = {
  OrdenSalidaModel,
  OrdenSalidaFactory,
  OrdenSalidaRepository,
  getOrdenSalidaRepository
};
