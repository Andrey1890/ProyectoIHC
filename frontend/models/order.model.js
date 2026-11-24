(function (global) {
  "use strict";

  async function createOrder(payload) {
    return global.DermakorMVC.ApiModel.request("/api/pedidos", {
      method: "POST",
      body: payload
    });
  }

  async function fetchMyOrders() {
    var res = await global.DermakorMVC.ApiModel.request("/api/pedidos/mis-pedidos");
    return (res && (res.pedidos || res.data)) || [];
  }

  async function fetchAllOrders() {
    var res = await global.DermakorMVC.ApiModel.request("/api/pedidos");
    if (Array.isArray(res)) return res;
    return (res && res.data) || [];
  }

  async function fetchEntityTable(entitySlug) {
    var clean = String(entitySlug || "productos").replace(/^\/+/, "");
    var res = await global.DermakorMVC.ApiModel.request("/api/v1/" + clean + "?page=1");
    if (Array.isArray(res)) return res;
    return (res && res.data) || [];
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.OrderModel = {
    createOrder: createOrder,
    fetchMyOrders: fetchMyOrders,
    fetchAllOrders: fetchAllOrders,
    fetchEntityTable: fetchEntityTable
  };
})(window);
