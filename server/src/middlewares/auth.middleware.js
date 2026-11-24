const jwt = require("jsonwebtoken");
const ENV = require("../config/env.config");
const { BaseChainHandler, HttpAppError } = require("./error.middleware");

function extractBearerToken(req) {
  const header = String(req.headers?.authorization || req.headers?.Authorization || "").trim();
  if (!header) {
    return "";
  }
  const parts = header.split(/\s+/);
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1].trim();
  }
  return "";
}

function normalizeRole(rawRole, idRol = "") {
  const roleStr = String(rawRole || "").trim().toLowerCase();
  const idRolStr = String(idRol || "").trim().toUpperCase();
  if (roleStr === "admin" || idRolStr === "ROL0000001") {
    return "admin";
  }
  return "user";
}

function signJwtToken(userDto = {}) {
  const payload = {
    id: userDto.id_usuario || userDto.id || "",
    id_usuario: userDto.id_usuario || "",
    id_cliente: userDto.id_cliente || "",
    email: userDto.correo || userDto.email || "",
    username: userDto.username || userDto.nombre || "",
    nombre: userDto.nombre || userDto.username || "",
    cedulaRuc: userDto.cedulaRuc || "1718293849",
    role: normalizeRole(userDto.role, userDto.id_rol)
  };
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN || "8h" });
}

class AuthenticateJwtHandler extends BaseChainHandler {
  process(req, _res, next) {
    const token = extractBearerToken(req);
    if (!token) {
      throw new HttpAppError(
        401,
        "Autenticacion requerida. Envie el token en la cabecera Authorization: Bearer <token>.",
        "AUTH_UNAUTHORIZED"
      );
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      req.user = {
        ...decoded,
        role: normalizeRole(decoded.role, decoded.id_rol)
      };
      return this.forward(req, _res, next);
    } catch (_err) {
      throw new HttpAppError(401, "Token JWT invalido o expirado.", "AUTH_INVALID_TOKEN");
    }
  }
}

class OptionalJwtHandler extends BaseChainHandler {
  process(req, _res, next) {
    const token = extractBearerToken(req);
    if (token) {
      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        req.user = {
          ...decoded,
          role: normalizeRole(decoded.role, decoded.id_rol)
        };
      } catch (_err) {
        req.user = null;
      }
    }
    return this.forward(req, _res, next);
  }
}

class AuthorizeRolesHandler extends BaseChainHandler {
  constructor(roles = []) {
    super();
    this.allowedRoles = roles.map((r) => String(r).toLowerCase());
  }

  process(req, _res, next) {
    if (!req.user) {
      throw new HttpAppError(401, "Usuario no autenticado.", "AUTH_UNAUTHORIZED");
    }
    const userRole = normalizeRole(req.user.role, req.user.id_rol);
    if (!this.allowedRoles.includes(userRole)) {
      throw new HttpAppError(
        403,
        `Acceso denegado (403 Forbidden). Se requiere rol: ${this.allowedRoles.join(" o ")}.`,
        "AUTH_FORBIDDEN"
      );
    }
    return this.forward(req, _res, next);
  }
}

const authenticateJwt = new AuthenticateJwtHandler().toMiddleware();
const optionalJwt = new OptionalJwtHandler().toMiddleware();

function authorizeRoles(...roles) {
  return new AuthorizeRolesHandler(roles).toMiddleware();
}

module.exports = {
  signJwtToken,
  normalizeRole,
  extractBearerToken,
  AuthenticateJwtHandler,
  OptionalJwtHandler,
  AuthorizeRolesHandler,
  authenticateJwt,
  optionalJwt,
  authorizeRoles
};
