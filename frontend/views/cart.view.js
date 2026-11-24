(function (global) {
  "use strict";

  function showAlert(containerId, message, type) {
    var box = document.getElementById(containerId);
    if (!box) return;
    box.className = "alerta-mensaje " + (type === "success" ? "alerta-exito" : "alerta-error");
    box.setAttribute("role", "alert");
    box.setAttribute("aria-live", "polite");
    box.style.display = message ? "flex" : "none";
    box.textContent = message || "";
  }

  function updateNavCount(totalItems) {
    var badge = document.getElementById("contador-items-nav");
    if (badge) {
      badge.textContent = String(totalItems || 0);
    }
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.CartView = {
    showAlert: showAlert,
    updateNavCount: updateNavCount
  };
})(window);
