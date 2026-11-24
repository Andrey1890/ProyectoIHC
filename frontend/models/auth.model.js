(function (global) {
  "use strict";

  var TOKEN_KEY = "dermakor_jwt_token";
  var USER_KEY = "dermakor_usuario_sesion";

  function saveSession(token, user) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(TOKEN_KEY, token);
      }
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (_e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (_e) {}
  }

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
    } catch (_e) {
      return "";
    }
  }

  function getUser() {
    try {
      var raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) {
      return null;
    }
  }

  function isAuthenticated() {
    return Boolean(getToken() && getUser());
  }

  function isAdmin() {
    var user = getUser();
    return Boolean(isAuthenticated() && user && String(user.role || "").toLowerCase() === "admin");
  }

  async function login(correo, clave) {
    var res = await global.DermakorMVC.ApiModel.request("/api/auth/login", {
      method: "POST",
      body: { correo: correo, clave: clave }
    });
    if (res && res.ok && res.token && res.usuario) {
      saveSession(res.token, res.usuario);
    }
    return res;
  }

  async function register(payload) {
    var res = await global.DermakorMVC.ApiModel.request("/api/auth/register", {
      method: "POST",
      body: payload
    });
    if (res && res.ok && res.token && res.usuario) {
      saveSession(res.token, res.usuario);
    }
    return res;
  }

  function logout() {
    clearSession();
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.AuthModel = {
    getToken: getToken,
    getUser: getUser,
    saveSession: saveSession,
    isAuthenticated: isAuthenticated,
    isAdmin: isAdmin,
    login: login,
    register: register,
    logout: logout
  };
})(window);
