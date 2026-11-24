(function (global) {
  "use strict";

  var cachedMeta = null;

  function toArray(res) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  async function getMetadata(forceReload) {
    if (cachedMeta && !forceReload) {
      return cachedMeta;
    }
    var res = await global.DermakorMVC.ApiModel.request("/api/v1/meta/entidades");
    cachedMeta = (res && Array.isArray(res.entidades)) ? res.entidades : [];
    return cachedMeta;
  }

  async function fetchAll(slug) {
    if (slug === "productos" && global.DermakorMVC.ProductModel) {
      return global.DermakorMVC.ProductModel.fetchAll("limit=100");
    }
    var res = await global.DermakorMVC.ApiModel.request("/api/v1/" + encodeURIComponent(slug) + "?raw=true");
    return toArray(res);
  }

  async function create(slug, payload) {
    return global.DermakorMVC.ApiModel.request("/api/v1/" + encodeURIComponent(slug), {
      method: "POST",
      body: payload
    });
  }

  async function update(slug, id, payload) {
    return global.DermakorMVC.ApiModel.request(
      "/api/v1/" + encodeURIComponent(slug) + "/" + encodeURIComponent(id),
      {
        method: "PUT",
        body: payload
      }
    );
  }

  async function remove(slug, id) {
    return global.DermakorMVC.ApiModel.request(
      "/api/v1/" + encodeURIComponent(slug) + "/" + encodeURIComponent(id),
      {
        method: "DELETE"
      }
    );
  }

  function buildFkLabel(row, pkCol, slug) {
    if (slug === "productos") {
      var pId = row.id_producto_db || row.id_producto || row.id || "";
      var pName = row.pro_nombre || row.nombre || "";
      return pName ? (pId + " — " + pName) : String(pId);
    }
    var pkVal = row[pkCol] != null ? String(row[pkCol]).trim() : "";
    var keys = Object.keys(row || {});
    var labelCol = keys.find(function (k) {
      return /_nombre|_razon_social|_numero|_codigo|_email/.test(k);
    });
    var desc = labelCol && row[labelCol] != null ? String(row[labelCol]).trim() : "";
    return desc ? (pkVal + " — " + desc) : pkVal;
  }

  async function fetchFkOptions(fk) {
    if (!fk || !fk.slug) return [];
    try {
      var rows = await fetchAll(fk.slug);
      return rows.map(function (row) {
        var val = fk.slug === "productos"
          ? String(row.id_producto_db || row.id_producto || row[fk.ref] || "").trim()
          : String(row[fk.ref] != null ? row[fk.ref] : "").trim();
        return {
          value: val,
          label: buildFkLabel(row, fk.ref, fk.slug)
        };
      }).filter(function (opt) { return opt.value !== ""; });
    } catch (_err) {
      return null;
    }
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.EntityModel = {
    toArray: toArray,
    getMetadata: getMetadata,
    fetchAll: fetchAll,
    create: create,
    update: update,
    remove: remove,
    fetchFkOptions: fetchFkOptions
  };
})(window);
