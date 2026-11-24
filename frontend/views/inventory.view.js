(function (global) {
  "use strict";

  function clearEl(el) {
    if (!el) return;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function makeCell(text, className) {
    var td = document.createElement("td");
    if (className) td.className = className;
    td.textContent = text == null ? "" : String(text);
    return td;
  }

  function renderSummaryCards(container, cards) {
    if (!container) return;
    clearEl(container);
    (cards || []).forEach(function (card) {
      var div = document.createElement("div");
      div.className = "admin-resumen-card" + (card.tone ? " " + card.tone : "");

      var lbl = document.createElement("span");
      lbl.className = "admin-resumen-label";
      lbl.textContent = card.label || "";

      var val = document.createElement("strong");
      val.className = "admin-resumen-value";
      val.textContent = card.value == null ? "0" : String(card.value);

      div.appendChild(lbl);
      div.appendChild(val);
      container.appendChild(div);
    });
  }

  function formatDateTimeShort(iso) {
    if (!iso) return "-";
    var str = String(iso);
    return str.replace("T", " ").slice(0, 16);
  }

  function getKardexTipoClass(tipo) {
    var t = String(tipo || "").toUpperCase();
    if (t === "ENTRADA" || t === "DEVOLUCION_CANCELADA") return "kardex-entrada";
    if (t === "SALIDA" || t === "VENTA_APROBADA") return "kardex-salida";
    if (t === "RESERVA_PENDIENTE" || t === "RESERVA_INICIAL" || t.indexOf("AJUSTE") === 0) return "kardex-ajuste";
    return "kardex-inicial";
  }

  function renderKardexTable(tbody, movimientos) {
    if (!tbody) return;
    clearEl(tbody);

    if (!Array.isArray(movimientos) || movimientos.length === 0) {
      var trEmpty = document.createElement("tr");
      var tdEmpty = document.createElement("td");
      tdEmpty.colSpan = 9;
      tdEmpty.textContent = "No hay movimientos registrados para el filtro seleccionado.";
      trEmpty.appendChild(tdEmpty);
      tbody.appendChild(trEmpty);
      return;
    }

    movimientos.forEach(function (m) {
      var tr = document.createElement("tr");
      tr.appendChild(makeCell(formatDateTimeShort(m.fecha)));

      var tdTipo = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "kardex-badge " + getKardexTipoClass(m.tipo);
      badge.textContent = String(m.tipo || "-");
      tdTipo.appendChild(badge);
      tr.appendChild(tdTipo);

      var tdDoc = document.createElement("td");
      var codeDoc = document.createElement("code");
      codeDoc.textContent = m.documento || "-";
      tdDoc.appendChild(codeDoc);
      tr.appendChild(tdDoc);

      var tdLote = document.createElement("td");
      tdLote.textContent = m.lot_numero ? (m.lot_numero + (m.id_lote && m.id_lote !== "-" ? " (" + m.id_lote + ")" : "")) : (m.id_lote || "-");
      tr.appendChild(tdLote);

      tr.appendChild(makeCell(m.entrada > 0 ? "+" + m.entrada : "0", m.entrada > 0 ? "kardex-num-pos" : ""));
      tr.appendChild(makeCell(m.salida > 0 ? "-" + m.salida : "0", m.salida > 0 ? "kardex-num-neg" : ""));
      tr.appendChild(makeCell("$" + Number(m.costo_unit || 0).toFixed(2)));

      var tdSaldo = document.createElement("td");
      var strongSaldo = document.createElement("strong");
      strongSaldo.textContent = String(m.saldo != null ? m.saldo : 0);
      tdSaldo.appendChild(strongSaldo);
      tr.appendChild(tdSaldo);

      tr.appendChild(makeCell(m.detalle || ""));
      tbody.appendChild(tr);
    });
  }

  function getSemaforoClass(semaforo) {
    var s = String(semaforo || "").toUpperCase();
    if (s === "VENCIDO") return "vencido";
    if (s === "POR_VENCER") return "por-vencer";
    return "vigente";
  }

  function getSemaforoLabel(semaforo) {
    var s = String(semaforo || "").toUpperCase();
    if (s === "VENCIDO") return "VENCIDO";
    if (s === "POR_VENCER") return "POR VENCER";
    return "VIGENTE";
  }

  function renderLotesTable(tbody, lotes, handlers) {
    if (!tbody) return;
    clearEl(tbody);

    if (!Array.isArray(lotes) || lotes.length === 0) {
      var trEmpty = document.createElement("tr");
      var tdEmpty = document.createElement("td");
      tdEmpty.colSpan = 12;
      tdEmpty.textContent = "No hay lotes registrados para este filtro.";
      trEmpty.appendChild(tdEmpty);
      tbody.appendChild(trEmpty);
      return;
    }

    lotes.forEach(function (l) {
      var tr = document.createElement("tr");

      var tdLote = document.createElement("td");
      var codeEl = document.createElement("code");
      codeEl.textContent = l.id_lote || "";
      var smallNum = document.createElement("div");
      smallNum.textContent = l.lot_numero || "";
      smallNum.style.fontSize = "11px";
      smallNum.style.color = "#475569";
      tdLote.appendChild(codeEl);
      tdLote.appendChild(smallNum);
      tr.appendChild(tdLote);

      var tdProd = document.createElement("td");
      var strongProd = document.createElement("strong");
      strongProd.textContent = l.producto_nombre || l.id_producto || "";
      var smallCod = document.createElement("div");
      smallCod.textContent = (l.pro_codigo || "") + " · " + (l.id_producto || "");
      smallCod.style.fontSize = "11px";
      smallCod.style.color = "#475569";
      tdProd.appendChild(strongProd);
      tdProd.appendChild(smallCod);
      tr.appendChild(tdProd);

      tr.appendChild(makeCell(l.sede_nombre || l.id_sede || ""));
      tr.appendChild(makeCell(l.lot_fecha_fabricacion || "-"));
      tr.appendChild(makeCell(l.lot_fecha_caducidad || "-"));
      tr.appendChild(makeCell(String(l.dias_para_caducar) + " d"));

      var disp = Number(l.stock_disponible != null ? l.stock_disponible : (l.lot_stock_actual || 0));
      var res = Number(l.stock_reservado || 0);
      var fis = Number(l.stock_fisico != null ? l.stock_fisico : (disp + res));

      tr.appendChild(makeCell(fis));
      tr.appendChild(makeCell(res > 0 ? String(res) : "0", res > 0 ? "kardex-num-neg" : ""));

      var tdStock = document.createElement("td");
      var stStrong = document.createElement("strong");
      stStrong.textContent = String(disp);
      tdStock.appendChild(stStrong);
      tr.appendChild(tdStock);

      tr.appendChild(makeCell(l.lot_estado || "ACTIVO"));

      var tdSem = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "badge-semaforo " + getSemaforoClass(l.semaforo);
      badge.textContent = getSemaforoLabel(l.semaforo);
      tdSem.appendChild(badge);
      tr.appendChild(tdSem);

      var tdAcc = document.createElement("td");
      var btnKar = document.createElement("button");
      btnKar.type = "button";
      btnKar.className = "btn-accion-sm";
      btnKar.textContent = "📊 Kárdex";
      btnKar.addEventListener("click", function () {
        if (handlers && handlers.onViewKardex) handlers.onViewKardex(l);
      });
      tdAcc.appendChild(btnKar);
      tr.appendChild(tdAcc);

      tbody.appendChild(tr);
    });
  }

  function renderComprasTable(tbody, compras, provMap, sedeMap, handlers) {
    if (!tbody) return;
    clearEl(tbody);

    if (!Array.isArray(compras) || compras.length === 0) {
      var trEmpty = document.createElement("tr");
      var tdEmpty = document.createElement("td");
      tdEmpty.colSpan = 7;
      tdEmpty.textContent = "No hay ordenes de compra registradas.";
      trEmpty.appendChild(tdEmpty);
      tbody.appendChild(trEmpty);
      return;
    }

    compras.forEach(function (c) {
      var tr = document.createElement("tr");
      var idCompra = String(c.id_compra || "").trim();
      var estado = String(c.com_estado || "").trim().toUpperCase();

      var tdId = document.createElement("td");
      var codeId = document.createElement("code");
      codeId.textContent = idCompra;
      var numDiv = document.createElement("div");
      numDiv.textContent = c.com_numero || "";
      numDiv.style.fontSize = "11px";
      numDiv.style.color = "#475569";
      tdId.appendChild(codeId);
      tdId.appendChild(numDiv);
      tr.appendChild(tdId);

      var provName = provMap.get(String(c.id_proveedor || "").trim()) || c.id_proveedor || "";
      var sedeName = sedeMap.get(String(c.id_sede || "").trim()) || c.id_sede || "";
      tr.appendChild(makeCell(provName));
      tr.appendChild(makeCell(sedeName));
      tr.appendChild(makeCell(formatDateTimeShort(c.com_fecha)));
      tr.appendChild(makeCell("$" + Number(c.com_total || 0).toFixed(2)));

      var tdEst = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "badge-rol-usuario " + (estado === "RECIBIDA" ? "badge-semaforo vigente" : estado === "ANULADA" ? "badge-semaforo vencido" : "badge-semaforo por-vencer");
      badge.textContent = estado;
      tdEst.appendChild(badge);
      tr.appendChild(tdEst);

      var tdAcc = document.createElement("td");
      var wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.gap = "6px";
      wrap.style.flexWrap = "wrap";

      var btnDet = document.createElement("button");
      btnDet.type = "button";
      btnDet.className = "btn-accion-sm";
      btnDet.textContent = "Ver detalle";
      btnDet.addEventListener("click", function () {
        if (handlers && handlers.onViewDetail) handlers.onViewDetail(c);
      });
      wrap.appendChild(btnDet);

      if (estado === "PENDIENTE") {
        var btnRec = document.createElement("button");
        btnRec.type = "button";
        btnRec.className = "btn-accion-sm";
        btnRec.style.borderColor = "#059669";
        btnRec.style.color = "#065F46";
        btnRec.textContent = "Recibir mercadería";
        btnRec.addEventListener("click", function () {
          if (handlers && handlers.onReceive) handlers.onReceive(c);
        });
        wrap.appendChild(btnRec);

        var btnAnu = document.createElement("button");
        btnAnu.type = "button";
        btnAnu.className = "btn-accion-sm peligro";
        btnAnu.textContent = "Anular";
        btnAnu.addEventListener("click", function () {
          if (handlers && handlers.onCancel) handlers.onCancel(c);
        });
        wrap.appendChild(btnAnu);
      }

      tdAcc.appendChild(wrap);
      tr.appendChild(tdAcc);
      tbody.appendChild(tr);
    });
  }

  function renderCompraDetalleBox(container, compra, detalles, prodMap) {
    if (!container) return;
    clearEl(container);
    container.style.display = "block";

    var headerRow = document.createElement("div");
    headerRow.style.display = "flex";
    headerRow.style.justifyContent = "space-between";
    headerRow.style.alignItems = "center";
    headerRow.style.marginBottom = "10px";

    var title = document.createElement("h3");
    title.style.margin = "0";
    title.textContent = "Detalle de Compra " + (compra.com_numero || compra.id_compra) + " (" + (compra.com_estado || "") + ")";
    headerRow.appendChild(title);

    var btnClose = document.createElement("button");
    btnClose.type = "button";
    btnClose.className = "btn-accion-sm";
    btnClose.textContent = "Cerrar detalle";
    btnClose.addEventListener("click", function () {
      container.style.display = "none";
      clearEl(container);
    });
    headerRow.appendChild(btnClose);
    container.appendChild(headerRow);

    var wrap = document.createElement("div");
    wrap.className = "tabla-admin-wrap";
    var table = document.createElement("table");
    table.className = "tabla-admin";

    var thead = document.createElement("thead");
    var htr = document.createElement("tr");
    ["ID Producto", "Producto", "Cantidad", "Costo Unit.", "Subtotal"].forEach(function (h) {
      var th = document.createElement("th");
      th.textContent = h;
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    (detalles || []).forEach(function (d) {
      var tr = document.createElement("tr");
      var idProd = String(d.id_producto || "").trim();
      tr.appendChild(makeCell(idProd));
      tr.appendChild(makeCell(prodMap.get(idProd) || idProd));
      tr.appendChild(makeCell(d.cde_cantidad));
      tr.appendChild(makeCell("$" + Number(d.cde_costo_unit || 0).toFixed(2)));
      tr.appendChild(makeCell("$" + Number(d.cde_subtotal || 0).toFixed(2)));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);
  }

  function renderAjustesTable(tbody, ajustes, sedeMap, empMap) {
    if (!tbody) return;
    clearEl(tbody);

    if (!Array.isArray(ajustes) || ajustes.length === 0) {
      var trEmpty = document.createElement("tr");
      var tdEmpty = document.createElement("td");
      tdEmpty.colSpan = 7;
      tdEmpty.textContent = "No hay ajustes de inventario registrados.";
      trEmpty.appendChild(tdEmpty);
      tbody.appendChild(trEmpty);
      return;
    }

    ajustes.forEach(function (a) {
      var tr = document.createElement("tr");
      var tdId = document.createElement("td");
      var cEl = document.createElement("code");
      cEl.textContent = a.id_ajuste || "";
      var num = document.createElement("div");
      num.textContent = a.aju_numero || "";
      num.style.fontSize = "11px";
      num.style.color = "#475569";
      tdId.appendChild(cEl);
      tdId.appendChild(num);
      tr.appendChild(tdId);

      tr.appendChild(makeCell(formatDateTimeShort(a.aju_fecha)));
      tr.appendChild(makeCell(sedeMap.get(String(a.id_sede || "").trim()) || a.id_sede || ""));
      tr.appendChild(makeCell(empMap.get(String(a.id_empleado || "").trim()) || a.id_empleado || ""));

      var tdTipo = document.createElement("td");
      var badge = document.createElement("span");
      var isIng = String(a.aju_tipo || "").trim().toUpperCase() === "INGRESO";
      badge.className = "kardex-badge " + (isIng ? "kardex-entrada" : "kardex-salida");
      badge.textContent = String(a.aju_tipo || "");
      tdTipo.appendChild(badge);
      tr.appendChild(tdTipo);

      tr.appendChild(makeCell(a.aju_motivo || ""));
      tr.appendChild(makeCell(a.aju_observacion || ""));
      tbody.appendChild(tr);
    });
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.InventoryView = {
    renderSummaryCards: renderSummaryCards,
    renderKardexTable: renderKardexTable,
    renderLotesTable: renderLotesTable,
    renderComprasTable: renderComprasTable,
    renderCompraDetalleBox: renderCompraDetalleBox,
    renderAjustesTable: renderAjustesTable
  };
})(window);
