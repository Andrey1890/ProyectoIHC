const ENV = require("../config/env.config");
const { BaseChainHandler } = require("./error.middleware");

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }
  const allowedList = Array.isArray(ENV.CORS_ORIGINS) ? ENV.CORS_ORIGINS : [];
  if (allowedList.includes(origin)) {
    return true;
  }
  // Origenes oficiales autorizados para produccion (GitHub Pages y Vercel del proyecto)
  if (origin === "https://andrey1890.github.io") {
    return true;
  }
  if (/^https:\/\/[a-z0-9-]+-?andrey1890s?-projects\.vercel\.app$/i.test(origin) || /^https:\/\/[a-z0-9-]*dermakor[a-z0-9-]*\.vercel\.app$/i.test(origin) || /^https:\/\/[a-z0-9-]*proyecto-?ihc[a-z0-9-]*\.vercel\.app$/i.test(origin)) {
    return true;
  }
  // Solo permitir localhost:* en entornos distintos a produccion
  if (ENV.NODE_ENV !== "production" && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
    return true;
  }
  return false;
}

class CorsChainHandler extends BaseChainHandler {
  process(req, res, next) {
    const requestOrigin = req.headers.origin;
    if (requestOrigin && !isOriginAllowed(requestOrigin)) {
      return res.status(403).json({
        ok: false,
        code: "CORS_FORBIDDEN",
        error: "Origen no permitido por CORS"
      });
    }

    if (requestOrigin) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    } else if (ENV.NODE_ENV !== "production") {
      res.setHeader("Access-Control-Allow-Origin", ENV.CORS_ORIGINS[0] || "http://localhost:4051");
    }
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    const rawMethods = ENV.CORS_METHODS || "GET,POST,PUT,PATCH,DELETE";
    const methodsHeader = rawMethods.toUpperCase().includes("OPTIONS")
      ? rawMethods
      : `${rawMethods},OPTIONS`;
    res.setHeader("Access-Control-Allow-Methods", methodsHeader);
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, X-Request-Id"
    );

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    return this.forward(req, res, next);
  }
}

const corsHandler = new CorsChainHandler();

module.exports = {
  CorsChainHandler,
  corsMiddleware: corsHandler.toMiddleware(),
  isOriginAllowed
};
