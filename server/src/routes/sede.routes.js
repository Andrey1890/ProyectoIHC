const express = require("express");
const sedeController = require("../controllers/sede.controller");
const { loggerMiddleware } = require("../middlewares/logger.middleware");
const { sanitizeMiddleware } = require("../middlewares/sanitize.middleware");
const { paginationMiddleware } = require("../middlewares/pagination.middleware");
const { validateIdMiddleware } = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", [loggerMiddleware, sanitizeMiddleware, paginationMiddleware], sedeController.listarSedes);
router.get("/:id", [loggerMiddleware, sanitizeMiddleware, validateIdMiddleware], sedeController.getById);
router.post("/", [loggerMiddleware, sanitizeMiddleware], sedeController.create);
router.put("/:id", [loggerMiddleware, sanitizeMiddleware, validateIdMiddleware], sedeController.update);
router.patch("/:id", [loggerMiddleware, sanitizeMiddleware, validateIdMiddleware], sedeController.update);
router.delete("/:id", [loggerMiddleware, sanitizeMiddleware, validateIdMiddleware], sedeController.delete);

module.exports = router;
