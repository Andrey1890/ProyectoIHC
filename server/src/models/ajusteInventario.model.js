const { defineTableEntity } = require("./base.repository");

const {
  Model: AjusteInventarioModel,
  Factory: AjusteInventarioFactory,
  Repository: AjusteInventarioRepository,
  getInstance: getAjusteInventarioRepository
} = defineTableEntity({
  tableName: "AjustesInventario",
  pkColumns: ["id_ajuste"],
  prefix: "AJU",
  columns: [
    "id_ajuste",
    "id_sede",
    "id_empleado",
    "aju_numero",
    "aju_tipo",
    "aju_motivo",
    "aju_fecha",
    "aju_observacion"
  ],
  defaultOrder: "id_ajuste"
});

module.exports = {
  AjusteInventarioModel,
  AjusteInventarioFactory,
  AjusteInventarioRepository,
  getAjusteInventarioRepository
};
