const { defineTableEntity } = require("./base.repository");

const {
  Model: ProveedorModel,
  Factory: ProveedorFactory,
  Repository: ProveedorRepository,
  getInstance: getProveedorRepository
} = defineTableEntity({
  tableName: "Proveedores",
  pkColumns: ["id_proveedor"],
  prefix: "PRV",
  columns: ["id_proveedor", "id_ciudad", "prv_ruc", "prv_razon_social", "prv_telefono", "prv_email"],
  defaultOrder: "id_proveedor"
});

module.exports = {
  ProveedorModel,
  ProveedorFactory,
  ProveedorRepository,
  getProveedorRepository
};
