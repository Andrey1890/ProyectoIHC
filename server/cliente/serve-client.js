const fs = require("fs");
const path = require("path");
const express = require("express");
const ENV = require("../src/config/env.config");

const FRONTEND_DIR = fs.existsSync(path.resolve(__dirname, "../frontend/index.html"))
  ? path.resolve(__dirname, "../frontend")
  : path.resolve(__dirname, "../frontend-client");

const app = express();

app.disable("x-powered-by");
app.use(
  express.static(FRONTEND_DIR, {
    index: "index.html",
    extensions: ["html"]
  })
);

app.get("/", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

function startClientServer(port = ENV.CLIENT_PORT) {
  const server = app.listen(port, () => {
    console.log("=========================================================");
    console.log(` DERMAKOR Capa 3 Frontend MVC (Cliente Web Desacoplado)`);
    console.log(` Cliente Web : http://localhost:${port}`);
    console.log(` Backend API : http://localhost:${ENV.PORT}/api/v1`);
    console.log("=========================================================");
  });
  return server;
}

if (require.main === module) {
  startClientServer(ENV.CLIENT_PORT);
}

module.exports = {
  app,
  startClientServer
};
