const { defineTableEntity } = require("./base.repository");

const {
  Model: CiudadModel,
  Factory: CiudadFactory,
  Repository: CiudadRepository,
  getInstance: getCiudadRepository
} = defineTableEntity({
  tableName: "Ciudades",
  pkColumns: ["id_ciudad"],
  prefix: "CIU",
  columns: ["id_ciudad", "id_pais", "ciu_nombre"],
  defaultOrder: "id_ciudad"
});

module.exports = {
  CiudadModel,
  CiudadFactory,
  CiudadRepository,
  getCiudadRepository
};
