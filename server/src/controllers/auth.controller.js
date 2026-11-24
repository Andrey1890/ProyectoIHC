const { ModelFactory } = require("../models/model.factory");
const { signJwtToken } = require("../middlewares/auth.middleware");
const { hashPasswordBcrypt } = require("../middlewares/hash.middleware");

async function login(req, res, next) {
  try {
    const usuarioRepo = ModelFactory.getRepository("usuario");
    const correo = req.body.correo || req.body.email;
    const clave = req.body.clave || req.body.password;
    const usuario = await usuarioRepo.authenticate(
      correo,
      clave,
      req.security.verifyPassword
    );
    const token = signJwtToken(usuario);
    return res.status(200).json({ ok: true, token, usuario });
  } catch (error) {
    return next(error);
  }
}

async function registro(req, res, next) {
  try {
    const usuarioRepo = ModelFactory.getRepository("usuario");
    const rawPass = req.body.clave || req.body.password || "Dermakor2026!";
    const claveHash = req.security?.claveHash || hashPasswordBcrypt(rawPass);
    const usuario = await usuarioRepo.registerOrUpsert(req.body, claveHash);
    const token = signJwtToken(usuario);
    return res.status(201).json({ ok: true, token, usuario });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  registro,
  register: registro
};
