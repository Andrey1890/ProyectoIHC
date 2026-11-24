(function (global) {
  "use strict";

  async function fetchAll(queryString) {
    var qs = queryString ? ("?" + queryString.replace(/^\?/, "")) : "";
    var res = await global.DermakorMVC.ApiModel.request("/api/productos" + qs);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  async function fetchById(id) {
    var res = await global.DermakorMVC.ApiModel.request("/api/productos/" + encodeURIComponent(id));
    return res && res.producto ? res.producto : res;
  }

  async function create(payload) {
    return global.DermakorMVC.ApiModel.request("/api/productos", {
      method: "POST",
      body: payload
    });
  }

  async function update(id, payload) {
    return global.DermakorMVC.ApiModel.request("/api/productos/" + encodeURIComponent(id), {
      method: "PUT",
      body: payload
    });
  }

  async function remove(id) {
    return global.DermakorMVC.ApiModel.request("/api/productos/" + encodeURIComponent(id), {
      method: "DELETE"
    });
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.ProductModel = {
    fetchAll: fetchAll,
    fetchById: fetchById,
    create: create,
    update: update,
    remove: remove
  };
})(window);
