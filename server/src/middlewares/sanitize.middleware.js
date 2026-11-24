const { BaseChainHandler } = require("./error.middleware");

const SECRET_FIELDS = new Set(["clave", "password", "contrasena"]);

function cleanSqlComments(value) {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\*|\*\//g, "")
    .replace(/--(?=\s|$)/g, "");
}

function cleanString(value, { preserveFormatting = false, stripSqlComments = false } = {}) {
  let clean = value.replace(/\0/g, "");
  if (preserveFormatting) {
    return clean;
  }
  clean = clean
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/javascript\s*:/gi, "");
  if (stripSqlComments) {
    clean = cleanSqlComments(clean);
  }
  return clean.trim();
}

function sanitizeDeep(node, options = {}, keyName = "") {
  if (typeof node === "string") {
    return cleanString(node, {
      preserveFormatting: SECRET_FIELDS.has(keyName),
      stripSqlComments: Boolean(options.stripSqlComments)
    });
  }
  if (Array.isArray(node)) {
    return node.map((item) => sanitizeDeep(item, options));
  }
  if (node && typeof node === "object") {
    const sanitized = {};
    for (const [key, val] of Object.entries(node)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      sanitized[key] = sanitizeDeep(val, options, key);
    }
    return sanitized;
  }
  return node;
}

class SanitizeChainHandler extends BaseChainHandler {
  process(req, res, next) {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeDeep(req.body, { stripSqlComments: false });
    }
    if (req.query && typeof req.query === "object") {
      req.query = sanitizeDeep(req.query, { stripSqlComments: true });
    }
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeDeep(req.params, { stripSqlComments: true });
    }
    return this.forward(req, res, next);
  }
}

const sanitizeHandler = new SanitizeChainHandler();

module.exports = {
  SanitizeChainHandler,
  sanitizeMiddleware: sanitizeHandler.toMiddleware()
};
