const ENV = require("../config/env.config");

/**
 * Error HTTP controlado para distinguir fallas de validacion/negocio (4xx)
 * de errores inesperados de servidor (5xx).
 */
class HttpAppError extends Error {
  constructor(statusCode, message, code = "APP_ERROR", details = null) {
    super(message);
    this.name = "HttpAppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Patron Chain of Responsibility: eslabon base reutilizable para middlewares
 * y cadenas de validacion. Cada manejador decide si corta la cadena con
 * respuesta/error o delega al siguiente eslabon via forward().
 */
class BaseChainHandler {
  #nextHandler = null;

  setNext(handler) {
    this.#nextHandler = handler;
    return handler;
  }

  async handle(req, res, next) {
    try {
      await this.process(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async process(req, res, next) {
    await this.forward(req, res, next);
  }

  async forward(req, res, next) {
    if (this.#nextHandler) {
      return this.#nextHandler.handle(req, res, next);
    }
    return next();
  }

  toMiddleware() {
    return (req, res, next) => this.handle(req, res, next);
  }

  /**
   * Conecta ordenadamente una lista de handlers en una cadena unica y
   * retorna el middleware Express del primer eslabon.
   * @param {BaseChainHandler[]} handlers
   */
  static buildChain(handlers) {
    if (!Array.isArray(handlers) || handlers.length === 0) {
      return (_req, _res, next) => next();
    }
    for (let i = 0; i < handlers.length - 1; i += 1) {
      handlers[i].setNext(handlers[i + 1]);
    }
    return handlers[0].toMiddleware();
  }
}

function notFoundMiddleware(req, res, _next) {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({
      ok: false,
      code: "ROUTE_NOT_FOUND",
      error: `Ruta REST no encontrada: ${req.method} ${req.originalUrl}`
    });
  }
  return res.status(404).send("Recurso no encontrado en DERMAKOR.");
}

function mapPostgresError(err) {
  switch (err.code) {
    case "P2002":
    case "23505":
      return { status: 409, code: "DB_UNIQUE_VIOLATION", message: "El registro ya existe en base de datos." };
    case "P2003":
    case "23503":
      return { status: 400, code: "DB_FOREIGN_KEY", message: "Referencia relacional invalida en base de datos." };
    case "P2025":
      return { status: 404, code: "DB_RECORD_NOT_FOUND", message: "Registro no encontrado en base de datos." };
    case "23514":
      return { status: 400, code: "DB_CHECK_VIOLATION", message: "Valor fuera de las restricciones de negocio." };
    case "ECONNREFUSED":
    case "ENOTFOUND":
    case "ETIMEDOUT":
      return { status: 503, code: "DB_UNAVAILABLE", message: "Servicio de base de datos Supabase temporalmente no disponible." };
    default:
      return null;
  }
}

function errorMiddleware(err, _req, res, _next) {
  const pgMapped = mapPostgresError(err);
  const statusCode = err instanceof HttpAppError
    ? err.statusCode
    : (pgMapped ? pgMapped.status : (err.statusCode || 500));

  const code = err instanceof HttpAppError
    ? err.code
    : (pgMapped ? pgMapped.code : "INTERNAL_SERVER_ERROR");

  const message = pgMapped
    ? pgMapped.message
    : (err.message || "Error interno del servidor REST.");

  if (statusCode >= 500) {
    console.error(`[ErrorMiddleware] ${code}:`, err.stack || err.message);
  }

  const payload = {
    ok: false,
    code,
    error: message
  };

  if (err instanceof HttpAppError && err.details) {
    payload.details = err.details;
  }
  if (ENV.NODE_ENV !== "production" && statusCode >= 500) {
    payload.detail = err.message;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  HttpAppError,
  BaseChainHandler,
  notFoundMiddleware,
  errorMiddleware
};
