const express = require("express");
const cuponController = require("../controllers/cupon.controller");
const { validateCuponChain } = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", validateCuponChain, cuponController.validarCupon);
router.get("/:codigo", validateCuponChain, cuponController.validarCupon);

module.exports = router;
