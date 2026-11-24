(function (global) {
  "use strict";

  function requireAuthForCheckout() {
    var MVC = global.DermakorMVC;
    if (!MVC.AuthModel.isAuthenticated()) {
      MVC.CartView.showAlert(
        "alerta-error-pago",
        "Debes iniciar sesión con tu cuenta antes de confirmar tu pedido.",
        "error"
      );
      if (typeof global.mostrarToastNotificacion === "function") {
        global.mostrarToastNotificacion("Inicia sesión para confirmar tu compra.");
      }
      if (typeof global.abrirModalAuth === "function") {
        global.abrirModalAuth();
      }
      return false;
    }
    return true;
  }

  async function submitOrder(payload) {
    var MVC = global.DermakorMVC;
    if (!requireAuthForCheckout()) {
      throw new Error("AUTH_REQUIRED_FOR_ORDER");
    }
    var result = await MVC.OrderModel.createOrder(payload);
    if (result && result.ok) {
      MVC.CartModel.clear();
    }
    return result;
  }

  function guardProtectedCheckoutPages() {
    var page = document.body.getAttribute("data-pagina");
    if (page === "checkout-envio" || page === "checkout-pago") {
      var MVC = global.DermakorMVC;
      if (!MVC.AuthModel.isAuthenticated()) {
        var boxId = page === "checkout-pago" ? "alerta-error-pago" : "alerta-error-envio";
        MVC.CartView.showAlert(
          boxId,
          "Inicio de sesión obligatorio para comprar y emitir factura. Por favor inicia sesión arriba o vuelve al carrito.",
          "error"
        );
      }
    }
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.CartController = {
    requireAuthForCheckout: requireAuthForCheckout,
    submitOrder: submitOrder,
    guardProtectedCheckoutPages: guardProtectedCheckoutPages
  };
})(window);
