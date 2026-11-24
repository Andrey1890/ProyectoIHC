const { defineTableEntity } = require("./base.repository");

const {
  Model: CompraModel,
  Factory: CompraFactory,
  Repository: CompraRepository,
  getInstance: getCompraRepository
} = defineTableEntity({
  tableName: "Compras",
  pkColumns: ["id_compra"],
  prefix: "COM",
  statusColumn: "com_estado",
  columns: ["id_compra", "id_proveedor", "id_sede", "com_numero", "com_fecha", "com_total", "com_estado"],
  defaultOrder: "id_compra"
});

module.exports = {
  CompraModel,
  CompraFactory,
  CompraRepository,
  getCompraRepository
};
