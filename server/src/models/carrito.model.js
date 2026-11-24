const { defineTableEntity } = require("./base.repository");

const {
  Model: CarritoModel,
  Factory: CarritoFactory,
  Repository: CarritoRepository,
  getInstance: getCarritoRepository
} = defineTableEntity({
  tableName: "Carritos",
  pkColumns: ["id_carrito"],
  prefix: "CAR",
  statusColumn: "car_estado",
  columns: ["id_carrito", "id_cliente", "car_fecha", "car_estado"],
  defaultOrder: "id_carrito"
});

module.exports = {
  CarritoModel,
  CarritoFactory,
  CarritoRepository,
  getCarritoRepository
};
