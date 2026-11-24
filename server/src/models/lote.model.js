const { defineTableEntity } = require("./base.repository");

const {
  Model: LoteModel,
  Factory: LoteFactory,
  Repository: LoteRepository,
  getInstance: getLoteRepository
} = defineTableEntity({
  tableName: "Lotes",
  pkColumns: ["id_lote"],
  prefix: "LOT",
  statusColumn: "lot_estado",
  columns: [
    "id_lote",
    "id_producto",
    "id_sede",
    "lot_numero",
    "lot_fecha_fabricacion",
    "lot_fecha_caducidad",
    "lot_stock_actual",
    "lot_estado"
  ],
  defaultOrder: "id_lote"
});

module.exports = {
  LoteModel,
  LoteFactory,
  LoteRepository,
  getLoteRepository
};
