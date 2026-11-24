const { defineTableEntity } = require("./base.repository");

const {
  Model: LogModel,
  Factory: LogFactory,
  Repository: LogRepository,
  getInstance: getLogRepository
} = defineTableEntity({
  tableName: "LOG",
  pkColumns: ["id_usuario", "log_fecha"],
  columns: [
    "id_usuario",
    "log_accion",
    "log_tabla",
    "log_ip",
    "log_fecha",
    "log_datos_antes",
    "log_datos_despues"
  ],
  defaultOrder: "log_fecha"
});

module.exports = {
  LogModel,
  LogFactory,
  LogRepository,
  getLogRepository
};
