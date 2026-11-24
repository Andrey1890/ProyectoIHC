const { defineTableEntity } = require("./base.repository");

const {
  Model: CompraDetalleModel,
  Factory: CompraDetalleFactory,
  Repository: CompraDetalleRepository,
  getInstance: getCompraDetalleRepository
} = defineTableEntity({
  tableName: "CompraDetalle",
  pkColumns: ["id_compra", "id_producto"],
  columns: ["id_compra", "id_producto", "cde_cantidad", "cde_costo_unit", "cde_subtotal"],
  defaultOrder: "id_compra"
});

module.exports = {
  CompraDetalleModel,
  CompraDetalleFactory,
  CompraDetalleRepository,
  getCompraDetalleRepository
};
