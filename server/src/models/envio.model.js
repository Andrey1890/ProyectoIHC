const { defineTableEntity } = require("./base.repository");

const {
  Model: EnvioModel,
  Factory: EnvioFactory,
  Repository: EnvioRepository,
  getInstance: getEnvioRepository
} = defineTableEntity({
  tableName: "Envios",
  pkColumns: ["id_envio"],
  prefix: "ENV",
  statusColumn: "env_estado",
  columns: [
    "id_envio",
    "id_orden_salida",
    "env_direccion_entrega",
    "env_transportista",
    "env_numero_guia",
    "env_fecha_envio",
    "env_estado"
  ],
  defaultOrder: "id_envio"
});

module.exports = {
  EnvioModel,
  EnvioFactory,
  EnvioRepository,
  getEnvioRepository
};
