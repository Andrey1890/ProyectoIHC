const express = require("express");
const inventarioController = require("../controllers/inventario.controller");
const { loggerMiddleware } = require("../middlewares/logger.middleware");
const { sanitizeMiddleware } = require("../middlewares/sanitize.middleware");
const { authenticateJwt, authorizeRoles } = require("../middlewares/auth.middleware");
const { validateIdMiddleware } = require("../middlewares/validate.middleware");

const router = express.Router();
const adminChain = [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("admin")];

router.post("/compras", adminChain, inventarioController.crearCompra);
router.post("/compras/:id/recepcion", [...adminChain, validateIdMiddleware], inventarioController.recibirCompra);
router.post("/compras/:id/anular", [...adminChain, validateIdMiddleware], inventarioController.anularCompra);

router.post("/ajustes", adminChain, inventarioController.crearAjuste);

router.get("/lotes", adminChain, inventarioController.listarLotes);
router.get("/kardex", adminChain, inventarioController.obtenerKardex);
router.get("/resumen", adminChain, inventarioController.obtenerResumen);

module.exports = router;
