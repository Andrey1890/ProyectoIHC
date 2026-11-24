const express = require("express");
const pedidoController = require("../controllers/pedido.controller");
const { loggerMiddleware } = require("../middlewares/logger.middleware");
const { sanitizeMiddleware } = require("../middlewares/sanitize.middleware");
const { paginationMiddleware } = require("../middlewares/pagination.middleware");
const { authenticateJwt, authorizeRoles } = require("../middlewares/auth.middleware");
const { validateCheckoutChain, validateIdMiddleware } = require("../middlewares/validate.middleware");

const router = express.Router();

// Ruta especifica del usuario autenticado (debe declararse antes de /:id)
router.get(
  "/mis-pedidos",
  [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("user", "admin")],
  pedidoController.misPedidos
);

// Listado global de pedidos exclusivo para Administrador
router.get(
  "/",
  [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("admin"), paginationMiddleware],
  pedidoController.listarPedidos
);

router.get(
  "/:id",
  [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("user", "admin"), validateIdMiddleware],
  pedidoController.obtenerPedidoPorId
);

// Confirmacion de pedido para cualquier usuario autenticado (user / admin)
router.post(
  "/",
  [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("user", "admin"), validateCheckoutChain],
  pedidoController.procesarCheckout
);

router.post(
  "/checkout",
  [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("user", "admin"), validateCheckoutChain],
  pedidoController.procesarCheckout
);

router.put(
  "/:id",
  [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("admin"), validateIdMiddleware],
  pedidoController.update
);

router.patch(
  "/:id",
  [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("admin"), validateIdMiddleware],
  pedidoController.update
);

router.delete(
  "/:id",
  [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("admin"), validateIdMiddleware],
  pedidoController.delete
);

module.exports = router;
