const { defineTableEntity } = require("./base.repository");

const {
  Model: ProductoImagenModel,
  Factory: ProductoImagenFactory,
  Repository: ProductoImagenRepository,
  getInstance: getProductoImagenRepository
} = defineTableEntity({
  tableName: "ProductoImagenes",
  pkColumns: ["id_imagen"],
  prefix: "IMG",
  columns: ["id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada"],
  defaultOrder: "id_imagen"
});

module.exports = {
  ProductoImagenModel,
  ProductoImagenFactory,
  ProductoImagenRepository,
  getProductoImagenRepository
};
