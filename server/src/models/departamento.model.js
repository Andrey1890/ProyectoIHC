const { defineTableEntity } = require("./base.repository");

const {
  Model: DepartamentoModel,
  Factory: DepartamentoFactory,
  Repository: DepartamentoRepository,
  getInstance: getDepartamentoRepository
} = defineTableEntity({
  tableName: "Departamentos",
  pkColumns: ["id_departamento"],
  prefix: "DEP",
  statusColumn: "dep_estado",
  columns: ["id_departamento", "dep_nombre", "dep_telefono", "dep_estado"],
  defaultOrder: "id_departamento"
});

module.exports = {
  DepartamentoModel,
  DepartamentoFactory,
  DepartamentoRepository,
  getDepartamentoRepository
};
