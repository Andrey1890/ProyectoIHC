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
      tr.innerHTML =
        "<td><code>" + escapeHtml(safeId) + "</code></td>" +
        "<td><strong>" + escapeHtml(p.nombre) + "</strong><br/><small>" + escapeHtml(p.marca || "Dermakor") + "</small></td>" +
        "<td>" + escapeHtml(p.categoria || "Cuidado facial") + "</td>" +
        "<td>$" + Number(p.precio || 0).toFixed(2) + "</td>" +
        "<td>" + Number(p.stock || 0) + "</td>" +
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

  function renderOrdersTable(tbody, orders) {
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!Array.isArray(orders) || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No se encontraron pedidos registrados.</td></tr>';
      return;
    }

    orders.forEach(function (o) {
      var tr = document.createElement("tr");
      var fechaStr = String(o.createdAt || o.fecha || "").split("T")[0];
      tr.innerHTML =
        "<td><code>" + escapeHtml(o.id_pedido || o.id) + "</code></td>" +
        "<td>" + escapeHtml(o.cliente || o.userId || "Cliente") + "</td>" +
        "<td>" + escapeHtml(fechaStr) + "</td>" +
        "<td><code>" + escapeHtml(o.fac_numero || o.ped_numero || "-") + "</code></td>" +
        '<td><span class="badge-rol-usuario badge-rol-admin">' + escapeHtml(o.estado || "PAGADO") + "</span></td>" +
        "<td><strong>$" + Number(o.total || 0).toFixed(2) + "</strong></td>";
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
