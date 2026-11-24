const fs = require("fs");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const apiRoutes = require("./routes/index.routes");
const { CorsChainHandler } = require("./middlewares/cors.middleware");
const { LoggerChainHandler } = require("./middlewares/logger.middleware");
const { SanitizeChainHandler } = require("./middlewares/sanitize.middleware");
const { PaginationChainHandler } = require("./middlewares/pagination.middleware");
const { HashChainHandler } = require("./middlewares/hash.middleware");
const {
  BaseChainHandler,
  notFoundMiddleware,
  errorMiddleware
} = require("./middlewares/error.middleware");

function resolveFrontendDir() {
  const candidates = [
    path.resolve(__dirname, "../frontend"),
    path.resolve(__dirname, "../frontend-client"),
    path.resolve(__dirname, "../../frontend")
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "index.html"))) {
      return dir;
    }
  }
  return null;
}

function createApp() {
  const app = express();
  app.disable("x-powered-by");

  // Cabeceras HTTP de seguridad (OWASP)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

  // Cadena 1: CORS preflight antes de parsear cuerpo
  app.use(new CorsChainHandler().toMiddleware());

  // Parseo de payloads REST JSON y formularios
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Cadena 2 (Chain of Responsibility global): Logger -> Sanitize -> Pagination -> Hash
  const globalChainMiddleware = BaseChainHandler.buildChain([
    new LoggerChainHandler(),
    new SanitizeChainHandler(),
    new PaginationChainHandler(),
    new HashChainHandler()
  ]);
  app.use(globalChainMiddleware);

  // Capa 2 (Backend REST MVC)
  app.use("/api", apiRoutes);
  app.use("/api/v1", apiRoutes);

  // Capa 3 (Frontend estatico local si esta presente; en Vercel devuelve JSON de salud)
  const frontendDir = resolveFrontendDir();
  if (frontendDir) {
    app.use(express.static(frontendDir, {
      index: "index.html",
      extensions: ["html"]
    }));

    app.get("/", (_req, res) => {
      res.sendFile(path.join(frontendDir, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.status(200).json({
        ok: true,
        service: "DERMAKOR API REST MVC (Prisma + Supabase)",
        endpoints: [
          "/api/status",
          "/api/auth/register",
          "/api/auth/login",
          "/api/productos",
          "/api/pedidos",
          "/api/pedidos/mis-pedidos"
        ]
      });
    });
  }

  // Cierre de cadena: 404 + manejo centralizado de errores
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

const app = createApp();

module.exports = {
  createApp,
  app
};
