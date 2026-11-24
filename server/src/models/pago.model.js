const { defineTableEntity } = require("./base.repository");

const {
  Model: PagoModel,
  Factory: PagoFactory,
  Repository: PagoRepository,
  getInstance: getPagoRepository
} = defineTableEntity({
  tableName: "Pagos",
  pkColumns: ["id_pago"],
  prefix: "PAG",
  statusColumn: "pag_estado",
  columns: ["id_pago", "id_pedido", "pag_metodo", "pag_monto", "pag_fecha", "pag_referencia", "pag_estado"],
  defaultOrder: "id_pago"
});

module.exports = {
  PagoModel,
  PagoFactory,
  PagoRepository,
  getPagoRepository
};
