const express = require("express");
const authController = require("../controllers/auth.controller");
const { hashMiddleware } = require("../middlewares/hash.middleware");
const {
  validateLoginChain,
  validateRegistroChain
} = require("../middlewares/validate.middleware");

const router = express.Router();

router.post("/login", [validateLoginChain, hashMiddleware], authController.login);
router.post("/registro", [validateRegistroChain, hashMiddleware], authController.registro);
router.post("/register", [validateRegistroChain, hashMiddleware], authController.registro);
router.post("/auth/login", [validateLoginChain, hashMiddleware], authController.login);
router.post("/auth/registro", [validateRegistroChain, hashMiddleware], authController.registro);
router.post("/auth/register", [validateRegistroChain, hashMiddleware], authController.registro);

module.exports = router;
