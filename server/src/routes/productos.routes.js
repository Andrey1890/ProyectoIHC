const express = require("express");
const productosController = require("../controllers/productos.controller");
const { loggerMiddleware } = require("../middlewares/logger.middleware");
const { sanitizeMiddleware } = require("../middlewares/sanitize.middleware");
const { paginationMiddleware } = require("../middlewares/pagination.middleware");
const { hashMiddleware } = require("../middlewares/hash.middleware");
const { authenticateJwt, authorizeRoles } = require("../middlewares/auth.middleware");
const {
  validateIdMiddleware,
  validateProductoBodyMiddleware,
  validateProductoUpdateMiddleware
} = require("../middlewares/validate.middleware");

const router = express.Router();

// Rutas publicas de consulta de catalogo
router.get(
  "/",
  [loggerMiddleware, sanitizeMiddleware, paginationMiddleware],
  productosController.getAll
);

router.get(
  "/:id",
  [loggerMiddleware, sanitizeMiddleware, validateIdMiddleware],
  productosController.getById
);

// Rutas administrativas protegidas con JWT + Rol admin (OWASP API5 / BFLA)
router.post(
  "/",
  [
    loggerMiddleware,
    sanitizeMiddleware,
    authenticateJwt,
    authorizeRoles("admin"),
    validateProductoBodyMiddleware,
    hashMiddleware
  ],
  productosController.create
);

router.put(
  "/:id",
  [
    loggerMiddleware,
    sanitizeMiddleware,
    authenticateJwt,
    authorizeRoles("admin"),
    validateIdMiddleware,
    validateProductoUpdateMiddleware,
    hashMiddleware
  ],
  productosController.update
);

router.patch(
  "/:id",
  [
    loggerMiddleware,
    sanitizeMiddleware,
    authenticateJwt,
    authorizeRoles("admin"),
    validateIdMiddleware,
    validateProductoUpdateMiddleware,
    hashMiddleware
  ],
  productosController.update
);

router.delete(
  "/:id",
  [
    loggerMiddleware,
    sanitizeMiddleware,
    authenticateJwt,
    authorizeRoles("admin"),
    validateIdMiddleware
  ],
  productosController.delete
);

module.exports = router;
