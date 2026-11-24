const { defineTableEntity } = require("./base.repository");

const {
  Model: OrdenEntradaDetalleModel,
  Factory: OrdenEntradaDetalleFactory,
  Repository: OrdenEntradaDetalleRepository,
  getInstance: getOrdenEntradaDetalleRepository
} = defineTableEntity({
  tableName: "OrdenEntradaDetalle",
  pkColumns: ["id_orden_entrada", "id_lote"],
  columns: ["id_orden_entrada", "id_lote", "oed_cantidad_recibida", "oed_costo_unit", "oed_subtotal"],
  defaultOrder: "id_orden_entrada"
});

module.exports = {
  OrdenEntradaDetalleModel,
  OrdenEntradaDetalleFactory,
  OrdenEntradaDetalleRepository,
  getOrdenEntradaDetalleRepository
};
