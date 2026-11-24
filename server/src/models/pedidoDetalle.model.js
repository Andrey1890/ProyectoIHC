const { defineTableEntity } = require("./base.repository");

const {
  Model: PedidoDetalleModel,
  Factory: PedidoDetalleFactory,
  Repository: PedidoDetalleRepository,
  getInstance: getPedidoDetalleRepository
} = defineTableEntity({
  tableName: "PedidoDetalle",
  pkColumns: ["id_pedido", "id_producto"],
  columns: ["id_pedido", "id_producto", "pde_cantidad", "pde_precio_unit", "pde_subtotal"],
  defaultOrder: "id_pedido"
});

module.exports = {
  PedidoDetalleModel,
  PedidoDetalleFactory,
  PedidoDetalleRepository,
  getPedidoDetalleRepository
};
