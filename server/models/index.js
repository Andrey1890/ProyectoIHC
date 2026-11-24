module.exports = {
  ...require("../src/models/model.factory"),
  ...require("../src/models/producto.model"),
  ...require("../src/models/producto.repository"),
  ...require("../src/models/usuario.model"),
  ...require("../src/models/pedido.model")
};
