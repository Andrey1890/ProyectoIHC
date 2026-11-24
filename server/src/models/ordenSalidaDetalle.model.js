const { defineTableEntity } = require("./base.repository");

const {
  Model: OrdenSalidaDetalleModel,
  Factory: OrdenSalidaDetalleFactory,
  Repository: OrdenSalidaDetalleRepository,
  getInstance: getOrdenSalidaDetalleRepository
} = defineTableEntity({
  tableName: "OrdenSalidaDetalle",
  pkColumns: ["id_orden_salida", "id_lote"],
  columns: ["id_orden_salida", "id_lote", "osd_cantidad_despachada", "osd_precio_unit", "osd_subtotal"],
  defaultOrder: "id_orden_salida"
});

module.exports = {
  OrdenSalidaDetalleModel,
  OrdenSalidaDetalleFactory,
  OrdenSalidaDetalleRepository,
  getOrdenSalidaDetalleRepository
};
