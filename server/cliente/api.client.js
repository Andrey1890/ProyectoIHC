const SINGLETON_TOKEN = Symbol("DermakorApiClient");

/**
 * Cliente REST (Capa 3 - Cliente HTTP programatico) implementado con patron Singleton.
 */
class DermakorApiClient {
  static #instance = null;
  #baseUrl;
  #token = "";

  constructor(token, baseUrl = "http://localhost:4050/api/v1") {
    if (token !== SINGLETON_TOKEN) {
      throw new Error("Use DermakorApiClient.getInstance(baseUrl).");
    }
    this.#baseUrl = String(baseUrl).replace(/\/+$/, "");
  }

  static getInstance(baseUrl) {
    if (!DermakorApiClient.#instance) {
      DermakorApiClient.#instance = new DermakorApiClient(
        SINGLETON_TOKEN,
        baseUrl || "http://localhost:4050/api/v1"
      );
    } else if (baseUrl) {
      DermakorApiClient.#instance.setBaseUrl(baseUrl);
    }
    return DermakorApiClient.#instance;
  }

  setBaseUrl(baseUrl) {
    this.#baseUrl = String(baseUrl).replace(/\/+$/, "");
  }

  getBaseUrl() {
    return this.#baseUrl;
  }

  setToken(jwtToken) {
    this.#token = String(jwtToken || "").trim();
  }

  getToken() {
    return this.#token;
  }

  async request(endpoint, options = {}) {
    const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.#baseUrl}${cleanPath}`;
    const authHeader = options.token || this.#token;
    const headers = {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(authHeader ? { Authorization: `Bearer ${authHeader}` } : {}),
      ...(options.headers || {})
    };

    const { token: _omitToken, ...fetchOpts } = options;
    const response = await fetch(url, {
      ...fetchOpts,
      headers,
      body: options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      data
    };
  }

  getStatus() {
    return this.request("/status");
  }

  getProductos(query = "") {
    return this.request(`/productos${query ? `?${query}` : ""}`);
  }

  getProductoById(id) {
    return this.request(`/productos/${encodeURIComponent(id)}`);
  }

  createProducto(payload, token) {
    return this.request("/productos", { method: "POST", body: payload, token });
  }

  updateProducto(id, payload, token) {
    return this.request(`/productos/${encodeURIComponent(id)}`, { method: "PUT", body: payload, token });
  }

  deleteProducto(id, token) {
    return this.request(`/productos/${encodeURIComponent(id)}`, { method: "DELETE", token });
  }

  login(correo, clave) {
    return this.request("/auth/login", { method: "POST", body: { correo, clave } });
  }

  registro(payload) {
    return this.request("/auth/register", { method: "POST", body: payload });
  }

  validarCupon(codigo) {
    return this.request(`/cupon?codigo=${encodeURIComponent(codigo)}`);
  }

  getSedes() {
    return this.request("/sedes");
  }

  getPedidos(token) {
    return this.request("/pedidos", { token });
  }

  getMisPedidos(token) {
    return this.request("/pedidos/mis-pedidos", { token });
  }

  crearPedido(payload, token) {
    return this.request("/pedidos", { method: "POST", body: payload, token });
  }

  checkout(payload, token) {
    return this.request("/checkout", { method: "POST", body: payload, token });
  }
}

module.exports = {
  DermakorApiClient,
  getApiClient: (baseUrl) => DermakorApiClient.getInstance(baseUrl)
};
