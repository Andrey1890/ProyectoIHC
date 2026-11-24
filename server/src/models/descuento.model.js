const { defineTableEntity } = require("./base.repository");

const {
  Model: DescuentoModel,
  Factory: DescuentoFactory,
  Repository: DescuentoRepository,
  getInstance: getDescuentoRepository
} = defineTableEntity({
  tableName: "Descuentos",
  pkColumns: ["id_descuento"],
  prefix: "DSC",
  statusColumn: "des_estado",
  columns: [
    "id_descuento",
    "des_codigo",
    "des_nombre",
    "des_tipo",
    "des_valor",
    "des_fecha_inicio",
    "des_fecha_fin",
    "des_uso_maximo",
    "des_uso_actual",
    "des_estado"
  ],
  defaultOrder: "id_descuento"
});

module.exports = {
  DescuentoModel,
  DescuentoFactory,
  DescuentoRepository,
  getDescuentoRepository
};
