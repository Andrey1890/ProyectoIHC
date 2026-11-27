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

  function renderProductsTable(tbody, products, handlers) {
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!Array.isArray(products) || products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No hay productos registrados.</td></tr>';
      return;
    }

    products.forEach(function (p) {
      var tr = document.createElement("tr");
      var safeId = p.id_producto_db || p.id || "";
      var displayCode = p.codigo || safeId;
      var rawImg = String(p.imagen || "images/01_exoface-400.webp").trim();
      var thumbImg = /\.webp$/i.test(rawImg) && !/-400\.webp$/i.test(rawImg)
        ? rawImg.slice(0, -5) + "-400.webp"
        : rawImg;
      var altProd = "Miniatura clínica de " + (p.nombre || "producto") + " (" + (p.marca || "DERMAKOR") + ")";
      var stockDisp = Number(p.stock || 0);
      var stockRes = Number(p.stock_reservado || 0);
      var stockBadge = stockRes > 0
        ? "<div><strong>" + stockDisp + " disp.</strong></div><small style=\"color:#92400E;\">Reservado: " + stockRes + " · Físico: " + (stockDisp + stockRes) + "</small>"
        : String(stockDisp);

      tr.innerHTML =
        "<td><code>" + escapeHtml(displayCode) + "</code>" +
          (displayCode !== safeId ? "<br/><small style=\"color:#64748B;\">" + escapeHtml(safeId) + "</small>" : "") +
        "</td>" +
        '<td><div style="display:flex;align-items:center;gap:10px;">' +
          '<img class="admin-prod-thumb" src="' + escapeHtml(thumbImg) + '" width="44" height="44" loading="lazy" decoding="async" alt="' + escapeHtml(altProd) + '" onerror="this.onerror=null;this.src=\'images/01_exoface-400.webp\';" />' +
          "<div><strong>" + escapeHtml(p.nombre) + "</strong><br/><small>" + escapeHtml(p.marca || "Dermakor") + "</small></div>" +
        "</div></td>" +
        "<td>" + escapeHtml(p.categoria || "Cuidado facial") + "</td>" +
        "<td>$" + Number(p.precio || 0).toFixed(2) + "</td>" +
        "<td>" + stockBadge + "</td>" +
        '<td><div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button type="button" class="btn-accion-sm btn-edit-prod">Editar</button>' +
          '<button type="button" class="btn-accion-sm peligro btn-del-prod">Eliminar</button>' +
        "</div></td>";

      tr.querySelector(".btn-edit-prod").addEventListener("click", function () {
        if (handlers && handlers.onEdit) handlers.onEdit(p);
      });
      tr.querySelector(".btn-del-prod").addEventListener("click", function () {
        if (handlers && handlers.onDelete) handlers.onDelete(p);
      });
      tbody.appendChild(tr);
    });
  }

  function orderEstadoMeta(rawEstado) {
    var st = String(rawEstado || "PAGADO").trim().toUpperCase();
    if (st === "PENDIENTE") {
      return { text: "En espera · Stock reservado", cls: "badge-semaforo por-vencer" };
    }
    if (st === "CANCELADO" || st === "ANULADO") {
      return { text: "Anulado · Stock reingresado", cls: "badge-semaforo vencido" };
    }
    return { text: "Confirmado · Stock descontado", cls: "badge-semaforo vigente" };
  }

  function renderOrdersTable(tbody, orders, handlers) {
    if (!tbody) return;
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
    var showActions = Boolean(handlers && (handlers.onApprove || handlers.onCancel || handlers.onViewKardex));

    if (!Array.isArray(orders) || orders.length === 0) {
      var trEmpty = document.createElement("tr");
      var tdEmpty = document.createElement("td");
      tdEmpty.colSpan = showActions ? 8 : 6;
      tdEmpty.textContent = "No se encontraron pedidos registrados.";
      trEmpty.appendChild(tdEmpty);
      tbody.appendChild(trEmpty);
      return;
    }

    orders.forEach(function (o) {
      var tr = document.createElement("tr");
      var fechaStr = String(o.createdAt || o.fecha || "").replace("T", " ").slice(0, 16);
      var estadoUpper = String(o.estado || "PAGADO").trim().toUpperCase();
      var metaEst = orderEstadoMeta(estadoUpper);

      var tdId = document.createElement("td");
      var codeId = document.createElement("code");
      codeId.textContent = o.ped_numero || o.id_pedido || o.id || "";
      var smallFac = document.createElement("div");
      smallFac.style.fontSize = "11px";
      smallFac.style.color = "#475569";
      smallFac.textContent = o.fac_numero ? ("Fact. " + o.fac_numero) : (o.id_pedido || "");
      tdId.appendChild(codeId);
      tdId.appendChild(smallFac);
      tr.appendChild(tdId);

      var tdCli = document.createElement("td");
      tdCli.textContent = o.cliente || o.userId || "Cliente";
      tr.appendChild(tdCli);

      if (showActions) {
        var tdDet = document.createElement("td");
        var detList = Array.isArray(o.detalles) ? o.detalles : [];
        tdDet.textContent = detList.length > 0
          ? detList.map(function (d) { return (d.productoNombre || d.id_producto) + " × " + d.cantidad; }).join(", ")
          : "-";
        tr.appendChild(tdDet);
      }

      var tdFecha = document.createElement("td");
      tdFecha.textContent = fechaStr;
      tr.appendChild(tdFecha);

      if (!showActions) {
        var tdRef = document.createElement("td");
        var cRef = document.createElement("code");
        cRef.textContent = o.fac_numero || o.ped_numero || "-";
        tdRef.appendChild(cRef);
        tr.appendChild(tdRef);
      }

      var tdEst = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = metaEst.cls;
      badge.textContent = metaEst.text;
      tdEst.appendChild(badge);
      tr.appendChild(tdEst);

      var tdTot = document.createElement("td");
      var strongTot = document.createElement("strong");
      strongTot.textContent = "$" + Number(o.total || 0).toFixed(2);
      tdTot.appendChild(strongTot);
      tr.appendChild(tdTot);

      if (showActions) {
        var tdAcc = document.createElement("td");
        var wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.gap = "6px";
        wrap.style.flexWrap = "wrap";

        if (estadoUpper === "PENDIENTE" && handlers.onApprove) {
          var btnApr = document.createElement("button");
          btnApr.type = "button";
          btnApr.className = "btn-accion-sm";
          btnApr.style.borderColor = "#059669";
          btnApr.style.color = "#065F46";
          btnApr.textContent = "✅ Aprobar";
          btnApr.addEventListener("click", function () { handlers.onApprove(o); });
          wrap.appendChild(btnApr);
        }

        if ((estadoUpper === "PENDIENTE" || estadoUpper === "APROBADO" || estadoUpper === "PAGADO") && handlers.onCancel) {
          var btnCan = document.createElement("button");
          btnCan.type = "button";
          btnCan.className = "btn-accion-sm peligro";
          btnCan.textContent = "↩️ Cancelar";
          btnCan.addEventListener("click", function () { handlers.onCancel(o); });
          wrap.appendChild(btnCan);
        }

        if (handlers.onViewKardex && Array.isArray(o.detalles) && o.detalles.length > 0) {
          var btnKar = document.createElement("button");
          btnKar.type = "button";
          btnKar.className = "btn-accion-sm";
          btnKar.textContent = "📊 Kárdex";
          btnKar.addEventListener("click", function () { handlers.onViewKardex(o.detalles[0].id_producto); });
          wrap.appendChild(btnKar);
        }

        tdAcc.appendChild(wrap);
        tr.appendChild(tdAcc);
      }

      tbody.appendChild(tr);
    });
  }

  function renderGenericTable(headEl, bodyEl, rows) {
    if (!headEl || !bodyEl) return;
    headEl.innerHTML = "";
    bodyEl.innerHTML = "";

    if (!Array.isArray(rows) || rows.length === 0) {
      bodyEl.innerHTML = "<tr><td>La tabla seleccionada no tiene registros.</td></tr>";
      return;
    }

    var cols = Object.keys(rows[0]).slice(0, 7);
    var headTr = document.createElement("tr");
    cols.forEach(function (c) {
      var th = document.createElement("th");
      th.textContent = c;
      headTr.appendChild(th);
    });
    headEl.appendChild(headTr);

    rows.slice(0, 40).forEach(function (row) {
      var tr = document.createElement("tr");
      cols.forEach(function (c) {
        var td = document.createElement("td");
        var val = row[c];
        if (val !== null && typeof val === "object") {
          val = JSON.stringify(val).slice(0, 60);
        }
        td.textContent = String(val == null ? "" : val).slice(0, 80);
        tr.appendChild(td);
      });
      bodyEl.appendChild(tr);
    });
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.AdminView = {
    renderProductsTable: renderProductsTable,
    renderOrdersTable: renderOrdersTable,
    renderGenericTable: renderGenericTable
  };
})(window);
