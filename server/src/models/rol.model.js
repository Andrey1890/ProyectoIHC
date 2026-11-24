const { defineTableEntity } = require("./base.repository");

const {
  Model: RolModel,
  Factory: RolFactory,
  Repository: RolRepository,
  getInstance: getRolRepository
} = defineTableEntity({
  tableName: "Roles",
  pkColumns: ["id_rol"],
  prefix: "ROL",
  statusColumn: "rol_estado",
  columns: ["id_rol", "rol_nombre", "rol_descripcion", "rol_estado"],
  defaultOrder: "id_rol"
});

module.exports = {
  RolModel,
  RolFactory,
  RolRepository,
  getRolRepository
};
