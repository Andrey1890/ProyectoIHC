(function (global) {
  "use strict";

  var DEFAULT_LOCAL_PORT = "4050";
  // URL productiva de Vercel (se actualiza automaticamente tras el despliegue Vercel)
  var DEFAULT_PROD_API_URL = global.DERMAKOR_PROD_API_URL || "";

  function resolveApiBaseUrl() {
    if (global.DERMAKOR_API_URL) {
      return String(global.DERMAKOR_API_URL).replace(/\/+$/, "");
    }
    try {
      var overrideUrl = localStorage.getItem("dermakor_api_url");
      if (overrideUrl) {
        return String(overrideUrl).replace(/\/+$/, "");
      }
    } catch (_e) {}

    if (typeof window !== "undefined" && window.location) {
      var proto = window.location.protocol || "http:";
      var host = window.location.hostname || "localhost";
      var port = String(window.location.port || "");

      if (host === "localhost" || host === "127.0.0.1") {
        if (port && port !== DEFAULT_LOCAL_PORT) {
          return proto + "//" + host + ":" + DEFAULT_LOCAL_PORT;
        }
        return "";
      }

      var prodBase = global.DERMAKOR_PROD_API_URL || DEFAULT_PROD_API_URL;
      if (prodBase) {
        return String(prodBase).replace(/\/+$/, "");
      }
    }
    return "";
  }

  function buildUrl(endpoint) {
    var clean = String(endpoint || "").trim();
    if (/^https?:\/\//i.test(clean)) {
      return clean;
    }
    if (!clean.startsWith("/")) {
      clean = "/" + clean;
    }
    return resolveApiBaseUrl() + clean;
  }

  function readToken() {
    try {
      return localStorage.getItem("dermakor_jwt_token") || sessionStorage.getItem("dermakor_jwt_token") || "";
    } catch (_e) {
      return "";
    }
  }

  async function request(endpoint, options) {
    var opts = options || {};
    var token = opts.token !== undefined ? opts.token : readToken();
    var headers = Object.assign({ Accept: "application/json" }, opts.headers || {});
    if (opts.body !== undefined && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    var response;
    try {
      response = await fetch(buildUrl(endpoint), {
        method: opts.method || "GET",
        headers: headers,
        body: opts.body !== undefined && typeof opts.body !== "string"
          ? JSON.stringify(opts.body)
          : opts.body
      });
    } catch (_networkErr) {
      var netError = new Error("No se pudo conectar con el servidor API. Verifica tu conexion o el estado del backend.");
      netError.status = 0;
      netError.code = "NETWORK_ERROR";
      throw netError;
    }

    var data = null;
    var ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      var msg = (data && (data.error || data.message)) || ("Error HTTP " + response.status);
      if (response.status === 401) {
        msg = (data && data.error) || "Sesión no autenticada o expirada (401 Unauthorized).";
      } else if (response.status === 403) {
        msg = (data && data.error) || "Acceso denegado: no tienes permisos suficientes (403 Forbidden).";
      } else if (response.status >= 500) {
        msg = (data && data.error) || "Error interno del servidor (500 Internal Server Error).";
      }
      var err = new Error(msg);
      err.status = response.status;
      err.code = (data && data.code) || ("HTTP_" + response.status);
      err.payload = data;
      throw err;
    }

    return data;
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.ApiModel = {
    resolveApiBaseUrl: resolveApiBaseUrl,
    buildUrl: buildUrl,
    request: request
  };
})(window);
