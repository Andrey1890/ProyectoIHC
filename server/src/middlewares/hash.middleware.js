const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const ENV = require("../config/env.config");
const { BaseChainHandler } = require("./error.middleware");

function hashPasswordBcrypt(plainText) {
  // Hash bcrypt de 60 caracteres ($2a$10$...) compatible con CHAR(60) en Supabase PostgreSQL
  return bcrypt.hashSync(String(plainText), 10);
}

function hashPasswordScrypt(plainText) {
  const salt = crypto.randomBytes(8).toString("hex");
  const derived = crypto.scryptSync(String(plainText), salt, 16).toString("hex");
  return `$s2$${salt}$${derived}`;
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value), "utf8").digest("hex");
}

function generateSkuHash(seedValue) {
  const hmac = crypto
    .createHmac("sha256", ENV.HASH_SECRET_SALT || "clave_secreta_para_hashes_2026")
    .update(String(seedValue || Date.now()), "utf8")
    .digest("hex");
  return `sku-${hmac.slice(0, 16).toUpperCase()}`;
}

function verifyPassword(plainText, storedHash) {
  const candidate = String(plainText || "");
  const stored = String(storedHash || "").trim();
  if (!candidate || !stored) {
    return false;
  }

  // Estandar bcrypt ($2a$ / $2b$ / $2y$)
  if (/^\$2[aby]\$/.test(stored)) {
    return bcrypt.compareSync(candidate, stored);
  }

  // Retrocompatibilidad scrypt ($s2$)
  if (stored.startsWith("$s2$")) {
    const parts = stored.split("$");
    if (parts.length !== 4) return false;
    const [, , salt, expectedHex] = parts;
    const derived = crypto.scryptSync(candidate, salt, 16);
    const expectedBuf = Buffer.from(expectedHex, "hex");
    if (derived.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(derived, expectedBuf);
  }

  // Retrocompatibilidad SHA-256 hex
  if (/^[a-f0-9]{64}$/i.test(stored)) {
    const digestBuf = Buffer.from(sha256Hex(candidate), "hex");
    const storedBuf = Buffer.from(stored.toLowerCase(), "hex");
    return digestBuf.length === storedBuf.length && crypto.timingSafeEqual(digestBuf, storedBuf);
  }

  // Semilla demo heredada previa a migracion bcrypt
  if (stored === "pbkdf2_sha256$2026$dermakor" || stored === "hash_pbkdf2_2026") {
    return candidate.length >= 4;
  }

  return candidate === stored;
}

class HashChainHandler extends BaseChainHandler {
  process(req, res, next) {
    const rawPassword = req.body?.clave ?? req.body?.password;
    req.security = {
      ...(req.security || {}),
      hashPassword: hashPasswordBcrypt,
      hashPasswordBcrypt,
      hashPasswordScrypt,
      verifyPassword,
      sha256Hex,
      generateSkuHash
    };

    if (typeof rawPassword === "string" && rawPassword.length > 0) {
      req.security.claveHash = hashPasswordBcrypt(rawPassword);
      req.security.claveSha256 = sha256Hex(rawPassword);
    }

    if (req.body && typeof req.body === "object") {
      req.security.payloadDigest = sha256Hex(JSON.stringify(req.body));

      const isWriteVerb = req.method === "POST" || req.method === "PUT" || req.method === "PATCH";
      const hasProductContext = Boolean(
        req.body.nombre || req.body.marca || req.body.codigo || req.body.id || req.params?.id
      );

      if (isWriteVerb && hasProductContext) {
        const seed = req.body.codigo || req.body.id || req.params?.id || req.body.nombre || req.body.marca;
        const skuHash = req.body.sku_hash || generateSkuHash(seed);
        req.body.sku_hash = skuHash;
        req.security.sku_hash = skuHash;
      }
    }

    return this.forward(req, res, next);
  }
}

const hashHandler = new HashChainHandler();

module.exports = {
  HashChainHandler,
  hashMiddleware: hashHandler.toMiddleware(),
  hashPassword: hashPasswordBcrypt,
  hashPasswordBcrypt,
  hashPasswordScrypt,
  verifyPassword,
  sha256Hex,
  generateSkuHash
};
