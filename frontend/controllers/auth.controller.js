(function (global) {
  "use strict";

  function syncHeader() {
    var MVC = global.DermakorMVC;
    if (!MVC || !MVC.AuthModel || !MVC.AuthView) return;
    var user = MVC.AuthModel.getUser();
    MVC.AuthView.renderHeaderWidget(user, MVC.AuthModel.isAdmin());

    var loginBtn = document.getElementById("btn-mvc-open-auth");
    if (loginBtn && typeof global.abrirModalAuth === "function") {
      loginBtn.addEventListener("click", function () {
        global.abrirModalAuth();
      });
    }
    var logoutBtn = document.getElementById("btn-mvc-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }
  }

  async function handleLoginSubmit(correo, clave) {
    var MVC = global.DermakorMVC;
    MVC.AuthView.showAuthFeedback("", false);
    try {
      var res = await MVC.AuthModel.login(correo, clave);
      syncHeader();
      return { ok: true, res: res };
    } catch (err) {
      MVC.AuthView.showAuthFeedback(err.message || "Error al iniciar sesión.", false);
      return { ok: false, error: err };
    }
  }

  async function handleRegisterSubmit(payload) {
    var MVC = global.DermakorMVC;
    MVC.AuthView.showAuthFeedback("", false);
    try {
      var res = await MVC.AuthModel.register(payload);
      syncHeader();
      return { ok: true, res: res };
    } catch (err) {
      MVC.AuthView.showAuthFeedback(err.message || "Error al registrar usuario.", false);
      return { ok: false, error: err };
    }
  }

  function handleLogout() {
    var MVC = global.DermakorMVC;
    MVC.AuthModel.logout();
    if (typeof global.usuarioActual !== "undefined") {
      global.usuarioActual = null;
    }
    syncHeader();
    if (typeof global.mostrarToastNotificacion === "function") {
      global.mostrarToastNotificacion("Has cerrado sesión.");
    }
    if (document.body.getAttribute("data-pagina") === "admin") {
      window.location.href = "index.html";
    }
  }

  function injectDemoHelperInModal() {
    var loginForm = document.getElementById("form-auth-login");
    if (!loginForm || document.getElementById("mvc-demo-accounts")) return;
    var box = document.createElement("div");
    box.id = "mvc-demo-accounts";
    box.style.cssText = "margin-top: 12px; padding: 10px 12px; border-radius: 8px; background: #F8FAFC; border: 1px solid #E2E8F0; font-size: 12px; color: #334155;";
    box.innerHTML =
      '<div style="font-weight:700; margin-bottom:6px;">Cuentas de prueba (JWT + RBAC):</div>' +
      '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
        '<button type="button" class="btn-accion-sm" id="btn-fill-admin">Usar Admin (admin@dermakor.com)</button>' +
        '<button type="button" class="btn-accion-sm" id="btn-fill-user">Usar Cliente (cliente@example.com)</button>' +
      "</div>";
    loginForm.appendChild(box);

    document.getElementById("btn-fill-admin").addEventListener("click", function () {
      var c = document.getElementById("login-correo");
      var p = document.getElementById("login-clave");
      if (c) c.value = "admin@dermakor.com";
      if (p) p.value = "Admin123!";
    });
    document.getElementById("btn-fill-user").addEventListener("click", function () {
      var c = document.getElementById("login-correo");
      var p = document.getElementById("login-clave");
      if (c) c.value = "cliente@example.com";
      if (p) p.value = "Cliente123!";
    });
  }

  function init() {
    syncHeader();
    injectDemoHelperInModal();
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.AuthController = {
    init: init,
    syncHeader: syncHeader,
    handleLoginSubmit: handleLoginSubmit,
    handleRegisterSubmit: handleRegisterSubmit,
    handleLogout: handleLogout
  };
})(window);
