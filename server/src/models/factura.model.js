const { defineTableEntity } = require("./base.repository");

const {
  Model: FacturaModel,
  Factory: FacturaFactory,
  Repository: FacturaRepository,
  getInstance: getFacturaRepository
} = defineTableEntity({
  tableName: "Facturas",
  pkColumns: ["id_factura"],
  prefix: "FAC",
  statusColumn: "fac_estado",
  columns: [
    "id_factura",
    "id_pedido",
    "fac_numero",
    "fac_autorizacion_sri",
    "fac_fecha_emision",
    "fac_total",
    "fac_estado"
  ],
  defaultOrder: "id_factura"
});

module.exports = {
  FacturaModel,
  FacturaFactory,
  FacturaRepository,
  getFacturaRepository
};
