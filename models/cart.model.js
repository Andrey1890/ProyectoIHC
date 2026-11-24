(function (global) {
  "use strict";

  var CART_KEY = "dermakor_carrito";

  function getItems() {
    try {
      var raw = localStorage.getItem(CART_KEY) || sessionStorage.getItem(CART_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_e) {
      return [];
    }
  }

  function saveItems(items) {
    try {
      var serialized = JSON.stringify(Array.isArray(items) ? items : []);
      localStorage.setItem(CART_KEY, serialized);
      sessionStorage.setItem(CART_KEY, serialized);
    } catch (_e) {}
  }

  function clear() {
    saveItems([]);
  }

  function calculateTotals(items, shippingCost, discountAmount) {
    var list = Array.isArray(items) ? items : getItems();
    var subtotal = list.reduce(function (acc, item) {
      return acc + (Number(item.precio || 0) * Number(item.cantidad || 0));
    }, 0);
    var discount = Math.min(subtotal, Math.max(0, Number(discountAmount || 0)));
    var netBase = Math.max(0, subtotal - discount);
    var iva = Math.round(netBase * 0.15 * 100) / 100;
    var shipping = Number(shippingCost || 0);
    var total = Math.round((netBase + iva + shipping) * 100) / 100;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      iva: iva,
      shipping: shipping,
      total: total
    };
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.CartModel = {
    getItems: getItems,
    saveItems: saveItems,
    clear: clear,
    calculateTotals: calculateTotals
  };
})(window);
