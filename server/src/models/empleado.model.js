const { defineTableEntity } = require("./base.repository");

const {
  Model: EmpleadoModel,
  Factory: EmpleadoFactory,
  Repository: EmpleadoRepository,
  getInstance: getEmpleadoRepository
} = defineTableEntity({
  tableName: "Empleados",
  pkColumns: ["id_empleado"],
  prefix: "EMP",
  columns: [
    "id_empleado",
    "id_usuario",
    "id_departamento",
    "id_sede",
    "emp_ci",
    "emp_nombres",
    "emp_apellidos",
    "emp_cargo",
    "emp_sueldo"
  ],
  defaultOrder: "id_empleado"
});

module.exports = {
  EmpleadoModel,
  EmpleadoFactory,
  EmpleadoRepository,
  getEmpleadoRepository
};
