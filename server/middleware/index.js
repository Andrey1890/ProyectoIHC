module.exports = {
  ...require("../src/middlewares/auth.middleware"),
  ...require("../src/middlewares/cors.middleware"),
  ...require("../src/middlewares/error.middleware"),
  ...require("../src/middlewares/hash.middleware"),
  ...require("../src/middlewares/logger.middleware"),
  ...require("../src/middlewares/pagination.middleware"),
  ...require("../src/middlewares/sanitize.middleware"),
  ...require("../src/middlewares/validate.middleware")
};
