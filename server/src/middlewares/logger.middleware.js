const crypto = require("crypto");
const { BaseChainHandler } = require("./error.middleware");

class LoggerChainHandler extends BaseChainHandler {
  process(req, res, next) {
    if (req._loggerAttached) {
      return this.forward(req, res, next);
    }
    req._loggerAttached = true;

    const requestId = req.headers["x-request-id"] || crypto.randomUUID().slice(0, 8);
    req.requestId = String(requestId);
    res.setHeader("X-Request-Id", req.requestId);

    const forwardedFor = req.headers["x-forwarded-for"];
    const clientIp = (
      Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : String(forwardedFor || "").split(",")[0].trim()
    ) || req.ip || req.socket?.remoteAddress || "unknown";

    const startNs = process.hrtime.bigint();
    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startNs) / 1e6;
      console.log(
        `[${new Date().toISOString()}] [${req.requestId}] IP=${clientIp} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs.toFixed(2)} ms)`
      );
    });

    return this.forward(req, res, next);
  }
}

const loggerHandler = new LoggerChainHandler();

module.exports = {
  LoggerChainHandler,
  loggerMiddleware: loggerHandler.toMiddleware()
};
