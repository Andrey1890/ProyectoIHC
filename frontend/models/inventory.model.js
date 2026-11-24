(function (global) {
  "use strict";

  function toArray(res) {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }

  async function getKardex(params) {
    var p = params || {};
    var qs = new URLSearchParams();
    if (p.id_producto) qs.set("id_producto", String(p.id_producto));
    if (p.id_lote) qs.set("id_lote", String(p.id_lote));
    if (p.id_sede) qs.set("id_sede", String(p.id_sede));
    return global.DermakorMVC.ApiModel.request("/api/v1/inventario/kardex?" + qs.toString());
  }

  async function getLotes(params) {
    var p = params || {};
    var qs = new URLSearchParams();
    if (p.estado) qs.set("estado", String(p.estado));
    if (p.id_producto) qs.set("id_producto", String(p.id_producto));
    var qStr = qs.toString();
    return global.DermakorMVC.ApiModel.request("/api/v1/inventario/lotes" + (qStr ? "?" + qStr : ""));
  }

  async function getResumen() {
    return global.DermakorMVC.ApiModel.request("/api/v1/inventario/resumen");
  }

  async function createCompra(payload) {
    return global.DermakorMVC.ApiModel.request("/api/v1/inventario/compras", {
      method: "POST",
      body: payload
    });
  }

  async function recibirCompra(idCompra, payload) {
    return global.DermakorMVC.ApiModel.request(
      "/api/v1/inventario/compras/" + encodeURIComponent(idCompra) + "/recepcion",
      {
        method: "POST",
        body: payload
      }
    );
  }

  async function anularCompra(idCompra) {
    return global.DermakorMVC.ApiModel.request(
      "/api/v1/inventario/compras/" + encodeURIComponent(idCompra) + "/anular",
      {
        method: "POST",
        body: {}
      }
    );
  }

  async function createAjuste(payload) {
    return global.DermakorMVC.ApiModel.request("/api/v1/inventario/ajustes", {
      method: "POST",
      body: payload
    });
  }

  async function createVentaAdmin(payload) {
    return global.DermakorMVC.ApiModel.request("/api/v1/inventario/ventas", {
      method: "POST",
      body: payload
    });
  }

  async function fetchCiudades() {
    var res = await global.DermakorMVC.ApiModel.request("/api/v1/ciudades?raw=true");
    return toArray(res);
  }

  async function fetchCompras() {
    var res = await global.DermakorMVC.ApiModel.request("/api/v1/compras?raw=true");
    return toArray(res);
  }

  async function fetchCompraDetalles(idCompra) {
    var res = await global.DermakorMVC.ApiModel.request(
      "/api/v1/compra-detalle?id_compra=" + encodeURIComponent(idCompra) + "&raw=true"
    );
    return toArray(res);
  }

  async function fetchProveedores() {
    var res = await global.DermakorMVC.ApiModel.request("/api/v1/proveedores?raw=true");
    return toArray(res);
  }

  async function fetchSedes() {
    var res = await global.DermakorMVC.ApiModel.request("/api/v1/sedes?raw=true");
    return toArray(res);
  }

  async function fetchEmpleados() {
    var res = await global.DermakorMVC.ApiModel.request("/api/v1/empleados?raw=true");
    return toArray(res);
  }

  async function fetchAjustes() {
    var res = await global.DermakorMVC.ApiModel.request("/api/v1/ajustes-inventario?raw=true");
    return toArray(res);
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.InventoryModel = {
    toArray: toArray,
    getKardex: getKardex,
    getLotes: getLotes,
    getResumen: getResumen,
    createCompra: createCompra,
    recibirCompra: recibirCompra,
    anularCompra: anularCompra,
    createAjuste: createAjuste,
    createVentaAdmin: createVentaAdmin,
    fetchCiudades: fetchCiudades,
    fetchCompras: fetchCompras,
    fetchCompraDetalles: fetchCompraDetalles,
    fetchProveedores: fetchProveedores,
    fetchSedes: fetchSedes,
    fetchEmpleados: fetchEmpleados,
    fetchAjustes: fetchAjustes
  };
})(window);
