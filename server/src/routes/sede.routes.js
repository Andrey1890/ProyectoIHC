const express = require("express");
const sedeController = require("../controllers/sede.controller");
const { loggerMiddleware } = require("../middlewares/logger.middleware");
const { sanitizeMiddleware } = require("../middlewares/sanitize.middleware");
const { paginationMiddleware } = require("../middlewares/pagination.middleware");
const { authenticateJwt, authorizeRoles } = require("../middlewares/auth.middleware");
const { validateIdMiddleware } = require("../middlewares/validate.middleware");

const router = express.Router();
const adminGuards = [authenticateJwt, authorizeRoles("admin")];

router.get("/", [loggerMiddleware, sanitizeMiddleware, paginationMiddleware], sedeController.listarSedes);
router.get("/:id", [loggerMiddleware, sanitizeMiddleware, validateIdMiddleware], sedeController.getById);
router.post("/", [loggerMiddleware, sanitizeMiddleware, ...adminGuards], sedeController.create);
router.put("/:id", [loggerMiddleware, sanitizeMiddleware, ...adminGuards, validateIdMiddleware], sedeController.update);
router.patch("/:id", [loggerMiddleware, sanitizeMiddleware, ...adminGuards, validateIdMiddleware], sedeController.update);
router.delete("/:id", [loggerMiddleware, sanitizeMiddleware, ...adminGuards, validateIdMiddleware], sedeController.delete);

module.exports = router;
