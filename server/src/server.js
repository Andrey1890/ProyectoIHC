const ENV = require("./config/env.config");
const { getSupabaseSingleton } = require("./config/supabase.singleton");
const { app } = require("./app");

function startServer(port = ENV.PORT) {
  const db = getSupabaseSingleton();
  const server = app.listen(port, () => {
    const address = server.address();
    const activePort = typeof address === "object" && address ? address.port : port;
    console.log("=========================================================");
    console.log(` DERMAKOR Server2 - Arquitectura 3 Capas REST MVC + Prisma ORM`);
    console.log(` Capa 3 Frontend : http://localhost:${activePort} (Cliente opcional :${ENV.CLIENT_PORT})`);
    console.log(` Capa 2 API REST : http://localhost:${activePort}${ENV.API_PREFIX}`);
    console.log(` Capa 1 Supabase : ${ENV.SUPABASE.host}:${ENV.SUPABASE.port}/${ENV.SUPABASE.database}`);
    console.log(` Prisma Singleton: ${db.getInstanceId()}`);
    console.log("=========================================================");
  });

  const shutdown = async (signal) => {
    console.log(`\n[Server2] Recibido ${signal}. Cerrando servidor HTTP y Prisma Singleton...`);
    server.close(async () => {
      await db.close().catch(() => {});
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  return server;
}

if (require.main === module) {
  startServer(ENV.PORT);
}

module.exports = {
  startServer
};
