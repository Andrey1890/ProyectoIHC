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

  function renderResponsiveImg(imgUrl, altText) {
    var cleanUrl = String(imgUrl || "images/01_exoface.webp").trim();
    var mini = /-400\.webp$/i.test(cleanUrl) || !/\.webp$/i.test(cleanUrl)
      ? cleanUrl
      : cleanUrl.slice(0, -5) + "-400.webp";
    var srcset = /\.webp$/i.test(cleanUrl) && !/-400\.webp$/i.test(cleanUrl)
      ? ' srcset="' + escapeHtml(mini) + ' 400w, ' + escapeHtml(cleanUrl) + ' 800w" sizes="(max-width: 600px) 92vw, 280px"'
      : "";
    return '<img src="' + escapeHtml(mini) + '"' + srcset + ' width="400" height="300" loading="lazy" decoding="async" alt="' + escapeHtml(altText) + '" />';
  }

  function createProductCard(prod, handlers) {
    var h = handlers || {};
    var card = document.createElement("article");
    card.className = "tarjeta-producto";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", "Ver producto " + String(prod.nombre || ""));

    var stockNum = typeof prod.stock === "number" ? prod.stock : 25;
    var agotado = stockNum <= 0;

    card.innerHTML =
      '<div class="tarjeta-producto-imagen">' +
        renderResponsiveImg(prod.imagen, "Imagen de " + (prod.nombre || "producto")) +
      "</div>" +
      '<div class="tarjeta-producto-cuerpo">' +
        '<div class="tarjeta-marca">' + escapeHtml(prod.marca || "Dermakor") + " • " + escapeHtml(prod.categoria || "Cuidado") + "</div>" +
        '<h3 class="tarjeta-titulo">' + escapeHtml(prod.nombre) + "</h3>" +
        '<p class="tarjeta-subtitulo">' + escapeHtml(prod.subtitulo || prod.presentacion || "") + "</p>" +
        '<div class="tarjeta-pie">' +
          '<div class="tarjeta-precio">$' + Number(prod.precio || 0).toFixed(2) + "</div>" +
          '<button type="button" class="btn-agregar-rapido"' + (agotado ? " disabled" : "") + ">" +
            (agotado ? "Agotado" : "Agregar al carrito") +
          "</button>" +
        "</div>" +
      "</div>";

    var addBtn = card.querySelector(".btn-agregar-rapido");
    if (addBtn && !agotado && typeof h.onAddToCart === "function") {
      addBtn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        h.onAddToCart(prod);
      });
    }
    if (typeof h.onInspect === "function") {
      card.addEventListener("click", function () {
        h.onInspect(prod);
      });
      card.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          h.onInspect(prod);
        }
      });
    }
    return card;
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.ProductView = {
    escapeHtml: escapeHtml,
    createProductCard: createProductCard
  };
})(window);
