const { defineTableEntity } = require("./base.repository");

const {
  Model: ClienteModel,
  Factory: ClienteFactory,
  Repository: ClienteRepository,
  getInstance: getClienteRepository
} = defineTableEntity({
  tableName: "Clientes",
  pkColumns: ["id_cliente"],
  prefix: "CLI",
  columns: [
    "id_cliente",
    "id_usuario",
    "id_ciudad",
    "cli_ci_ruc",
    "cli_nombres",
    "cli_apellidos",
    "cli_telefono",
    "cli_direccion"
  ],
  defaultOrder: "id_cliente"
});

module.exports = {
  ClienteModel,
  ClienteFactory,
  ClienteRepository,
  getClienteRepository
};
