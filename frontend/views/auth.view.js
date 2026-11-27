(function (global) {
  "use strict";

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderHeaderWidget(user, isAdmin) {
    var container = document.getElementById("widget-usuario-header");
    if (!container) return;

    if (user) {
      var roleBadge = isAdmin
        ? '<span class="badge-rol-usuario badge-rol-admin">Administrador</span>'
        : '<span class="badge-rol-usuario badge-rol-user">Cliente</span>';
      var adminBtn = isAdmin
        ? '<a href="admin.html" class="boton-panel-admin" aria-label="Abrir Centro de Gestión">⚙️ Gestión</a>'
        : '<a href="admin.html#mis-pedidos" class="btn-cerrar-sesion" style="text-decoration:none;">📦 Mis Pedidos</a>';

      container.innerHTML =
        '<div class="usuario-logeado-badge">' +
          "<span>👤 " + escapeHtml(user.nombre || user.username || user.correo) + "</span>" +
          roleBadge +
          adminBtn +
          '<button type="button" class="btn-cerrar-sesion" id="btn-mvc-logout">Cerrar sesión</button>' +
        "</div>";
    } else {
      container.innerHTML =
        '<button type="button" class="boton-iniciar-sesion" id="btn-mvc-open-auth">' +
          "<span>👤</span> Iniciar Sesión / Registrarse" +
        "</button>";
    }
  }

  function ensureAuthAlertBox() {
    var modal = document.getElementById("modal-autenticacion");
    if (!modal) return null;
    var existing = document.getElementById("auth-modal-feedback");
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "auth-modal-feedback";
      existing.className = "alerta-mensaje alerta-error";
      existing.setAttribute("role", "alert");
      existing.setAttribute("aria-live", "polite");
      existing.style.display = "none";
      var tabs = modal.querySelector(".modal-auth-tabs");
      if (tabs && tabs.parentNode) {
        tabs.parentNode.insertBefore(existing, tabs.nextSibling);
      }
    }
    return existing;
  }

  function showAuthFeedback(message, isSuccess) {
    var box = ensureAuthAlertBox();
    if (!box) return;
    if (!message) {
      box.style.display = "none";
      box.textContent = "";
      return;
    }
    box.className = "alerta-mensaje " + (isSuccess ? "alerta-exito" : "alerta-error");
    box.style.display = "flex";
    box.textContent = message;
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.AuthView = {
    renderHeaderWidget: renderHeaderWidget,
    showAuthFeedback: showAuthFeedback
  };
})(window);
