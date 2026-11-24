const { defineTableEntity } = require("./base.repository");

const {
  Model: CarritoDetalleModel,
  Factory: CarritoDetalleFactory,
  Repository: CarritoDetalleRepository,
  getInstance: getCarritoDetalleRepository
} = defineTableEntity({
  tableName: "CarritoDetalle",
  pkColumns: ["id_carrito", "id_producto"],
  columns: ["id_carrito", "id_producto", "cad_cantidad"],
  defaultOrder: "id_carrito"
});

module.exports = {
  CarritoDetalleModel,
  CarritoDetalleFactory,
  CarritoDetalleRepository,
  getCarritoDetalleRepository
};
