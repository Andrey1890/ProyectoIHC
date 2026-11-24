(function (global) {
  "use strict";

  function bootstrapMvc() {
    var MVC = global.DermakorMVC || {};
    if (MVC.AuthController) {
      MVC.AuthController.init();
    }
    if (MVC.CartController) {
      MVC.CartController.guardProtectedCheckoutPages();
    }
    if (MVC.AdminController) {
      MVC.AdminController.init();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapMvc);
  } else {
    bootstrapMvc();
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.AppController = {
    bootstrap: bootstrapMvc
  };
})(window);
