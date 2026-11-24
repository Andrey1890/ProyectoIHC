(function (global) {
  "use strict";

  var kardexBound = false;
  var lotesBound = false;
  var comprasBound = false;
  var ajustesBound = false;

  var cachedProducts = [];
  var cachedComprasState = {
    proveedores: [],
    sedes: [],
    empleados: [],
    productos: []
  };
  var cachedAjustesLotes = [];

  function showStatus(msg, isSuccess) {
    var MVC = global.DermakorMVC;
    if (MVC && MVC.CartView) {
      MVC.CartView.showAlert("admin-status-alert", msg, isSuccess ? "success" : "error");
    }
  }

  function clearEl(el) {
    if (!el) return;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function plusMonthsIso(months) {
    var d = new Date();
    d.setMonth(d.getMonth() + (months || 18));
    return d.toISOString().slice(0, 10);
  }

  function buildProductLabel(p) {
    var id = p.id_producto_db || p.id_producto || p.id || "";
    var name = p.pro_nombre || p.nombre || id;
    var cod = p.pro_codigo || p.codigo || "";
    return (cod ? "[" + cod + "] " : "") + name + " (" + id + ")";
  }

  async function ensureProductsLoaded() {
    var MVC = global.DermakorMVC;
    if (cachedProducts.length === 0) {
      cachedProducts = await MVC.ProductModel.fetchAll("limit=100");
    }
    return cachedProducts;
  }

  // ==================== 1. KÁRDEX ====================

  async function populateKardexLotes(idProd) {
    var MVC = global.DermakorMVC;
    var loteSel = document.getElementById("kardex-lote-select");
    if (!loteSel) return;
    clearEl(loteSel);

    var optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = "Todos los lotes del producto";
    loteSel.appendChild(optAll);

    if (!idProd) return;
    try {
      var res = await MVC.InventoryModel.getLotes({ id_producto: idProd });
      (res.lotes || []).forEach(function (l) {
        var opt = document.createElement("option");
        opt.value = l.id_lote;
        opt.textContent = l.lot_numero + " (" + l.id_lote + ") · Stock: " + l.lot_stock_actual + " · Cad: " + l.lot_fecha_caducidad;
        loteSel.appendChild(opt);
      });
    } catch (_err) {
      // Silencioso si no hay lotes
    }
  }

  async function runKardexQuery() {
    var MVC = global.DermakorMVC;
    var prodSel = document.getElementById("kardex-prod-select");
    var loteSel = document.getElementById("kardex-lote-select");
    var cardsEl = document.getElementById("kardex-resumen-cards");
    var tbody = document.getElementById("kardex-movimientos-tbody");
    if (!prodSel) return;

    var idProd = prodSel.value;
    if (!idProd) return;

    try {
      var data = await MVC.InventoryModel.getKardex({
        id_producto: idProd,
        id_lote: loteSel ? loteSel.value : ""
      });
      var tot = data.totales || {};
      MVC.InventoryView.renderSummaryCards(cardsEl, [
        { label: "Stock Actual", value: data.stock_actual, tone: "vigente" },
        { label: "Saldo Inicial", value: data.saldo_inicial },
        { label: "Entradas (+)", value: "+" + (tot.entradas || 0), tone: "vigente" },
        { label: "Salidas (-)", value: "-" + (tot.salidas || 0), tone: "vencido" },
        { label: "Ajustes (Neto)", value: tot.ajustes || 0, tone: "por-vencer" }
      ]);
      MVC.InventoryView.renderKardexTable(tbody, data.movimientos || []);
    } catch (err) {
      showStatus(err.message || "Error al consultar el Kárdex.", false);
    }
  }

  async function loadKardexTab(preselectProdId) {
    var prodSel = document.getElementById("kardex-prod-select");
    var loteSel = document.getElementById("kardex-lote-select");
    var btnConsult = document.getElementById("kardex-btn-consultar");

    try {
      var prods = await ensureProductsLoaded();
      if (prodSel) {
        var prev = preselectProdId || prodSel.value;
        clearEl(prodSel);
        prods.forEach(function (p) {
          var id = p.id_producto_db || p.id_producto || "";
          if (!id) return;
          var opt = document.createElement("option");
          opt.value = id;
          opt.textContent = buildProductLabel(p);
          prodSel.appendChild(opt);
        });
        if (prev && Array.from(prodSel.options).some(function (o) { return o.value === prev; })) {
          prodSel.value = prev;
        }
        if (!prodSel.value && prodSel.options.length > 0) {
          prodSel.selectedIndex = 0;
        }
      }

      if (!kardexBound) {
        kardexBound = true;
        if (prodSel) {
          prodSel.addEventListener("change", async function () {
            await populateKardexLotes(prodSel.value);
            await runKardexQuery();
          });
        }
        if (loteSel) {
          loteSel.addEventListener("change", runKardexQuery);
        }
        if (btnConsult) {
          btnConsult.addEventListener("click", runKardexQuery);
        }
      }

      if (prodSel && prodSel.value) {
        await populateKardexLotes(prodSel.value);
        await runKardexQuery();
      }
    } catch (err) {
      showStatus(err.message || "No se pudo inicializar el módulo Kárdex.", false);
    }
  }

  // ==================== 2. LOTES Y CADUCIDADES ====================

  async function runLotesQuery() {
    var MVC = global.DermakorMVC;
    var filterSel = document.getElementById("lotes-semaforo-filter");
    var cardsEl = document.getElementById("lotes-resumen-cards");
    var tbody = document.getElementById("lotes-tbody");
    try {
      var estado = filterSel ? filterSel.value : "";
      var res = await MVC.InventoryModel.getLotes({ estado: estado });
      var r = res.resumen || {};
      MVC.InventoryView.renderSummaryCards(cardsEl, [
        { label: "Total Lotes", value: r.total_lotes || 0 },
        { label: "Vencidos", value: r.vencidos || 0, tone: "vencido" },
        { label: "Por Vencer (<=90d)", value: r.por_vencer || 0, tone: "por-vencer" },
        { label: "Vigentes (>90d)", value: r.vigentes || 0, tone: "vigente" },
        { label: "Stock Total", value: r.stock_total || 0 }
      ]);
      MVC.InventoryView.renderLotesTable(tbody, res.lotes || []);
    } catch (err) {
      showStatus(err.message || "Error al consultar lotes y caducidades.", false);
    }
  }

  async function loadLotesTab() {
    var filterSel = document.getElementById("lotes-semaforo-filter");
    var btnRef = document.getElementById("lotes-btn-refrescar");
    if (!lotesBound) {
      lotesBound = true;
      if (filterSel) filterSel.addEventListener("change", runLotesQuery);
      if (btnRef) btnRef.addEventListener("click", runLotesQuery);
    }
    await runLotesQuery();
  }

  // ==================== 3. COMPRAS A PROVEEDORES ====================

  function recalcCompraTotal() {
    var container = document.getElementById("compra-lineas-container");
    var totalEl = document.getElementById("compra-total-preview");
    if (!container || !totalEl) return;

    var total = 0;
    container.querySelectorAll(".linea-dinamica-row").forEach(function (row) {
      var qty = Number(row.querySelector(".compra-linea-qty").value || 0);
      var cost = Number(row.querySelector(".compra-linea-cost").value || 0);
      var sub = qty * cost;
      if (!Number.isFinite(sub) || sub < 0) sub = 0;
      row.querySelector(".compra-linea-sub").textContent = "$" + sub.toFixed(2);
      total += sub;
    });
    totalEl.textContent = "$" + total.toFixed(2);
  }

  function addCompraLineRow() {
    var container = document.getElementById("compra-lineas-container");
    if (!container) return;

    var row = document.createElement("div");
    row.className = "linea-dinamica-row";

    var selProd = document.createElement("select");
    selProd.className = "campo-control compra-linea-prod";
    selProd.required = true;
    cachedComprasState.productos.forEach(function (p) {
      var id = p.id_producto_db || p.id_producto || "";
      if (!id) return;
      var opt = document.createElement("option");
      opt.value = id;
      opt.textContent = buildProductLabel(p);
      opt.setAttribute("data-precio", String(p.precio || p.pro_precio || 0));
      selProd.appendChild(opt);
    });

    var inpQty = document.createElement("input");
    inpQty.type = "number";
    inpQty.min = "1";
    inpQty.step = "1";
    inpQty.value = "10";
    inpQty.className = "campo-control compra-linea-qty";
    inpQty.placeholder = "Cant.";
    inpQty.required = true;

    var inpCost = document.createElement("input");
    inpCost.type = "number";
    inpCost.min = "0";
    inpCost.step = "0.01";
    var firstPrice = cachedComprasState.productos[0] ? Number(cachedComprasState.productos[0].precio || 10) : 10;
    inpCost.value = (firstPrice * 0.6).toFixed(2);
    inpCost.className = "campo-control compra-linea-cost";
    inpCost.placeholder = "Costo unit.";
    inpCost.required = true;

    var spanSub = document.createElement("span");
    spanSub.className = "compra-linea-sub";
    spanSub.style.fontWeight = "700";
    spanSub.style.minWidth = "78px";

    var btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "btn-accion-sm peligro";
    btnDel.textContent = "Quitar";
    btnDel.addEventListener("click", function () {
      if (container.querySelectorAll(".linea-dinamica-row").length > 1) {
        row.remove();
        recalcCompraTotal();
      }
    });

    selProd.addEventListener("change", function () {
      var opt = selProd.options[selProd.selectedIndex];
      var p = opt ? Number(opt.getAttribute("data-precio") || 0) : 0;
      if (p > 0) {
        inpCost.value = (p * 0.6).toFixed(2);
      }
      recalcCompraTotal();
    });
    inpQty.addEventListener("input", recalcCompraTotal);
    inpCost.addEventListener("input", recalcCompraTotal);

    row.appendChild(selProd);
    row.appendChild(inpQty);
    row.appendChild(inpCost);
    row.appendChild(spanSub);
    row.appendChild(btnDel);
    container.appendChild(row);
    recalcCompraTotal();
  }

  function showPostRecepcionBanner(firstProdId, msg) {
    var banner = document.getElementById("compra-post-recepcion-banner");
    if (!banner) return;
    clearEl(banner);
    banner.style.display = "flex";

    var txt = document.createElement("span");
    txt.textContent = msg;
    banner.appendChild(txt);

    var btnLotes = document.createElement("button");
    btnLotes.type = "button";
    btnLotes.className = "btn-accion-sm";
    btnLotes.textContent = "Ver Lotes y Caducidades →";
    btnLotes.addEventListener("click", function () {
      if (global.DermakorMVC.AdminController && global.DermakorMVC.AdminController.switchTab) {
        global.DermakorMVC.AdminController.switchTab("lotes");
      }
      loadLotesTab();
    });

    var btnKardex = document.createElement("button");
    btnKardex.type = "button";
    btnKardex.className = "btn-accion-sm";
    btnKardex.textContent = "Ver Kárdex del Producto →";
    btnKardex.addEventListener("click", function () {
      if (global.DermakorMVC.AdminController && global.DermakorMVC.AdminController.switchTab) {
        global.DermakorMVC.AdminController.switchTab("kardex");
      }
      loadKardexTab(firstProdId);
    });

    banner.appendChild(btnLotes);
    banner.appendChild(btnKardex);
  }

  function renderRecepcionForm(compra, detalles, prodMap) {
    var MVC = global.DermakorMVC;
    var container = document.getElementById("compra-recepcion-container");
    if (!container) return;
    clearEl(container);
    container.style.display = "block";

    var idCompra = String(compra.id_compra || "").trim();
    var comNum = String(compra.com_numero || idCompra).trim();

    var form = document.createElement("form");
    form.className = "caja-formulario";
    form.style.marginTop = "16px";
    form.style.borderColor = "#059669";

    var h3 = document.createElement("h3");
    h3.className = "subtitulo-formulario";
    h3.textContent = "Recibir Mercadería — Compra " + comNum + " (" + idCompra + ")";
    form.appendChild(h3);

    var topRow = document.createElement("div");
    topRow.className = "fila-formulario";

    var gEmp = document.createElement("div");
    gEmp.className = "campo-grupo";
    var lEmp = document.createElement("label");
    lEmp.className = "campo-etiqueta";
    lEmp.textContent = "Empleado que recibe *";
    var selEmp = document.createElement("select");
    selEmp.className = "campo-control";
    selEmp.required = true;
    cachedComprasState.empleados.forEach(function (e) {
      var opt = document.createElement("option");
      opt.value = String(e.id_empleado || "").trim();
      opt.textContent = opt.value + " — " + (e.emp_nombres || "") + " " + (e.emp_apellidos || "");
      selEmp.appendChild(opt);
    });
    gEmp.appendChild(lEmp);
    gEmp.appendChild(selEmp);

    var gObs = document.createElement("div");
    gObs.className = "campo-grupo";
    var lObs = document.createElement("label");
    lObs.className = "campo-etiqueta";
    lObs.textContent = "Observación de Orden de Entrada";
    var inpObs = document.createElement("input");
    inpObs.type = "text";
    inpObs.maxLength = 150;
    inpObs.className = "campo-control";
    inpObs.value = ("Recepcion compra " + comNum).slice(0, 150);
    gObs.appendChild(lObs);
    gObs.appendChild(inpObs);

    topRow.appendChild(gEmp);
    topRow.appendChild(gObs);
    form.appendChild(topRow);

    var wrap = document.createElement("div");
    wrap.className = "tabla-admin-wrap";
    var table = document.createElement("table");
    table.className = "tabla-admin";

    var thead = document.createElement("thead");
    var htr = document.createElement("tr");
    ["Producto", "Nro. Lote (<=20)", "Fabricación", "Caducidad", "Cantidad", "Costo Unit."].forEach(function (h) {
      var th = document.createElement("th");
      th.textContent = h;
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    var fabDefault = todayIso();
    var cadDefault = plusMonthsIso(18);
    var rowControls = [];

    (detalles || []).forEach(function (d, idx) {
      var tr = document.createElement("tr");
      var idProd = String(d.id_producto || "").trim();

      var tdProd = document.createElement("td");
      tdProd.textContent = (prodMap.get(idProd) || idProd) + " (" + idProd + ")";
      tr.appendChild(tdProd);

      var tdLot = document.createElement("td");
      var inpLot = document.createElement("input");
      inpLot.type = "text";
      inpLot.maxLength = 20;
      inpLot.required = true;
      inpLot.className = "campo-control";
      inpLot.value = ("L-" + comNum + "-" + (idx + 1)).slice(0, 20);
      tdLot.appendChild(inpLot);
      tr.appendChild(tdLot);

      var tdFab = document.createElement("td");
      var inpFab = document.createElement("input");
      inpFab.type = "date";
      inpFab.required = true;
      inpFab.className = "campo-control";
      inpFab.value = fabDefault;
      tdFab.appendChild(inpFab);
      tr.appendChild(tdFab);

      var tdCad = document.createElement("td");
      var inpCad = document.createElement("input");
      inpCad.type = "date";
      inpCad.required = true;
      inpCad.className = "campo-control";
      inpCad.value = cadDefault;
      tdCad.appendChild(inpCad);
      tr.appendChild(tdCad);

      var tdQty = document.createElement("td");
      var inpQty = document.createElement("input");
      inpQty.type = "number";
      inpQty.min = "1";
      inpQty.step = "1";
      inpQty.required = true;
      inpQty.className = "campo-control";
      inpQty.value = String(d.cde_cantidad || 1);
      tdQty.appendChild(inpQty);
      tr.appendChild(tdQty);

      var tdCost = document.createElement("td");
      var inpCost = document.createElement("input");
      inpCost.type = "number";
      inpCost.min = "0";
      inpCost.step = "0.01";
      inpCost.required = true;
      inpCost.className = "campo-control";
      inpCost.value = Number(d.cde_costo_unit || 0).toFixed(2);
      tdCost.appendChild(inpCost);
      tr.appendChild(tdCost);

      rowControls.push({
        id_producto: idProd,
        inpLot: inpLot,
        inpFab: inpFab,
        inpCad: inpCad,
        inpQty: inpQty,
        inpCost: inpCost
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrap.appendChild(table);
    form.appendChild(wrap);

    var btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "10px";
    btnRow.style.marginTop = "14px";

    var btnSubmit = document.createElement("button");
    btnSubmit.type = "submit";
    btnSubmit.className = "boton-primario";
    btnSubmit.textContent = "Confirmar Recepción y Crear Lotes";

    var btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.className = "btn-accion-sm";
    btnCancel.textContent = "Cancelar";
    btnCancel.addEventListener("click", function () {
      container.style.display = "none";
      clearEl(container);
    });

    btnRow.appendChild(btnSubmit);
    btnRow.appendChild(btnCancel);
    form.appendChild(btnRow);

    form.addEventListener("submit", async function (ev) {
      ev.preventDefault();
      var lotesPayload = rowControls.map(function (rc) {
        return {
          id_producto: rc.id_producto,
          lot_numero: rc.inpLot.value.trim(),
          fecha_fabricacion: rc.inpFab.value,
          fecha_caducidad: rc.inpCad.value,
          cantidad: Number.parseInt(rc.inpQty.value, 10),
          costo_unit: Number(rc.inpCost.value)
        };
      });

      try {
        var res = await MVC.InventoryModel.recibirCompra(idCompra, {
          id_empleado: selEmp.value,
          observacion: inpObs.value.trim(),
          lotes: lotesPayload
        });
        container.style.display = "none";
        clearEl(container);
        var msg = "Compra " + comNum + " recibida (" + (res.lotes ? res.lotes.length : lotesPayload.length) + " lote(s) creados).";
        showStatus(msg, true);
        showPostRecepcionBanner(lotesPayload[0] ? lotesPayload[0].id_producto : "", msg);
        await loadComprasTab();
      } catch (err) {
        showStatus(err.message || "Error al recibir mercadería.", false);
      }
    });

    container.appendChild(form);
    container.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function loadComprasTab() {
    var MVC = global.DermakorMVC;
    var provSel = document.getElementById("compra-prov-select");
    var sedeSel = document.getElementById("compra-sede-select");
    var lineasContainer = document.getElementById("compra-lineas-container");
    var tbody = document.getElementById("compras-tbody");
    var detBox = document.getElementById("compra-detalle-box");

    try {
      var results = await Promise.all([
        MVC.InventoryModel.fetchProveedores(),
        MVC.InventoryModel.fetchSedes(),
        MVC.InventoryModel.fetchEmpleados(),
        ensureProductsLoaded(),
        MVC.InventoryModel.fetchCompras()
      ]);

      var proveedores = results[0];
      var sedes = results[1];
      var empleados = results[2];
      var productos = results[3];
      var compras = results[4];

      cachedComprasState = {
        proveedores: proveedores,
        sedes: sedes,
        empleados: empleados,
        productos: productos
      };

      var provMap = new Map();
      if (provSel) clearEl(provSel);
      proveedores.forEach(function (p) {
        var id = String(p.id_proveedor || "").trim();
        var nom = String(p.prv_razon_social || id).trim();
        provMap.set(id, nom);
        if (provSel) {
          var opt = document.createElement("option");
          opt.value = id;
          opt.textContent = nom + " (" + (p.prv_ruc || id) + ")";
          provSel.appendChild(opt);
        }
      });

      var sedeMap = new Map();
      if (sedeSel) clearEl(sedeSel);
      sedes.forEach(function (s) {
        var id = String(s.id_sede || "").trim();
        var nom = String(s.sed_nombre || id).trim();
        sedeMap.set(id, nom);
        if (sedeSel) {
          var opt = document.createElement("option");
          opt.value = id;
          opt.textContent = nom + " (" + id + ")";
          sedeSel.appendChild(opt);
        }
      });

      var prodMap = new Map();
      productos.forEach(function (p) {
        var id = String(p.id_producto_db || p.id_producto || "").trim();
        prodMap.set(id, String(p.pro_nombre || p.nombre || id));
      });

      if (lineasContainer && lineasContainer.children.length === 0) {
        addCompraLineRow();
      }

      if (!comprasBound) {
        comprasBound = true;
        var btnAddLine = document.getElementById("compra-btn-add-linea");
        if (btnAddLine) btnAddLine.addEventListener("click", addCompraLineRow);

        var btnNewProv = document.getElementById("compra-btn-nuevo-prov");
        if (btnNewProv) {
          btnNewProv.addEventListener("click", function () {
            if (global.DermakorMVC.AdminController && global.DermakorMVC.AdminController.switchTab) {
              global.DermakorMVC.AdminController.switchTab("tablas");
            }
            if (global.DermakorMVC.EntityController) {
              global.DermakorMVC.EntityController.openNewForSlug("proveedores");
            }
          });
        }

        var formCompra = document.getElementById("form-compra-nueva");
        if (formCompra) {
          formCompra.addEventListener("submit", async function (ev) {
            ev.preventDefault();
            var items = [];
            document.querySelectorAll("#compra-lineas-container .linea-dinamica-row").forEach(function (r) {
              items.push({
                id_producto: r.querySelector(".compra-linea-prod").value,
                cantidad: Number.parseInt(r.querySelector(".compra-linea-qty").value, 10),
                costo_unit: Number(r.querySelector(".compra-linea-cost").value)
              });
            });
            var comNumEl = document.getElementById("compra-numero-input");
            try {
              var created = await MVC.InventoryModel.createCompra({
                id_proveedor: provSel ? provSel.value : "",
                id_sede: sedeSel ? sedeSel.value : "",
                com_numero: comNumEl ? comNumEl.value.trim() : "",
                items: items
              });
              showStatus("Orden de compra " + (created.compra?.com_numero || "") + " creada en estado PENDIENTE.", true);
              if (comNumEl) comNumEl.value = "";
              if (lineasContainer) {
                clearEl(lineasContainer);
                addCompraLineRow();
              }
              await loadComprasTab();
            } catch (err) {
              showStatus(err.message || "Error al crear la orden de compra.", false);
            }
          });
        }
      }

      var sortedCompras = compras.slice().sort(function (a, b) {
        return String(b.id_compra || "").localeCompare(String(a.id_compra || ""));
      });

      MVC.InventoryView.renderComprasTable(tbody, sortedCompras, provMap, sedeMap, {
        onViewDetail: async function (c) {
          try {
            var dets = await MVC.InventoryModel.fetchCompraDetalles(c.id_compra);
            MVC.InventoryView.renderCompraDetalleBox(detBox, c, dets, prodMap);
          } catch (err) {
            showStatus(err.message || "Error al cargar el detalle de la compra.", false);
          }
        },
        onReceive: async function (c) {
          try {
            var dets = await MVC.InventoryModel.fetchCompraDetalles(c.id_compra);
            renderRecepcionForm(c, dets, prodMap);
          } catch (err) {
            showStatus(err.message || "Error al preparar la recepción de mercadería.", false);
          }
        },
        onCancel: async function (c) {
          if (!global.confirm("¿Anular la orden de compra " + (c.com_numero || c.id_compra) + "?")) return;
          try {
            await MVC.InventoryModel.anularCompra(c.id_compra);
            showStatus("Orden de compra " + (c.com_numero || c.id_compra) + " anulada.", true);
            await loadComprasTab();
          } catch (err) {
            showStatus(err.message || "Error al anular compra.", false);
          }
        }
      });
    } catch (err) {
      showStatus(err.message || "No se pudo cargar el módulo de compras.", false);
    }
  }

  // ==================== 4. AJUSTES DE INVENTARIO ====================

  function addAjusteLineRow() {
    var container = document.getElementById("ajuste-lineas-container");
    if (!container) return;

    var row = document.createElement("div");
    row.className = "linea-dinamica-row";

    var selLote = document.createElement("select");
    selLote.className = "campo-control ajuste-linea-lote";
    selLote.required = true;
    cachedAjustesLotes.forEach(function (l) {
      var opt = document.createElement("option");
      opt.value = l.id_lote;
      opt.textContent = "[" + l.lot_numero + "] " + l.producto_nombre + " — Stock: " + l.lot_stock_actual + " — Cad: " + l.lot_fecha_caducidad;
      selLote.appendChild(opt);
    });

    var inpQty = document.createElement("input");
    inpQty.type = "number";
    inpQty.min = "1";
    inpQty.step = "1";
    inpQty.value = "1";
    inpQty.className = "campo-control ajuste-linea-qty";
    inpQty.placeholder = "Cantidad";
    inpQty.required = true;

    var btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "btn-accion-sm peligro";
    btnDel.textContent = "Quitar";
    btnDel.addEventListener("click", function () {
      if (container.querySelectorAll(".linea-dinamica-row").length > 1) {
        row.remove();
      }
    });

    row.appendChild(selLote);
    row.appendChild(inpQty);
    row.appendChild(btnDel);
    container.appendChild(row);
  }

  async function loadAjustesTab() {
    var MVC = global.DermakorMVC;
    var sedeSel = document.getElementById("ajuste-sede-select");
    var empSel = document.getElementById("ajuste-emp-select");
    var lineasContainer = document.getElementById("ajuste-lineas-container");
    var tbody = document.getElementById("ajustes-tbody");

    try {
      var results = await Promise.all([
        MVC.InventoryModel.fetchSedes(),
        MVC.InventoryModel.fetchEmpleados(),
        MVC.InventoryModel.getLotes({}),
        MVC.InventoryModel.fetchAjustes()
      ]);

      var sedes = results[0];
      var empleados = results[1];
      cachedAjustesLotes = results[2].lotes || [];
      var ajustes = results[3];

      var sedeMap = new Map();
      if (sedeSel) clearEl(sedeSel);
      sedes.forEach(function (s) {
        var id = String(s.id_sede || "").trim();
        var nom = String(s.sed_nombre || id).trim();
        sedeMap.set(id, nom);
        if (sedeSel) {
          var opt = document.createElement("option");
          opt.value = id;
          opt.textContent = nom + " (" + id + ")";
          sedeSel.appendChild(opt);
        }
      });

      var empMap = new Map();
      if (empSel) clearEl(empSel);
      empleados.forEach(function (e) {
        var id = String(e.id_empleado || "").trim();
        var nom = (String(e.emp_nombres || "").trim() + " " + String(e.emp_apellidos || "").trim()).trim() || id;
        empMap.set(id, nom);
        if (empSel) {
          var opt = document.createElement("option");
          opt.value = id;
          opt.textContent = nom + " (" + id + ")";
          empSel.appendChild(opt);
        }
      });

      if (lineasContainer) {
        clearEl(lineasContainer);
        addAjusteLineRow();
      }

      if (!ajustesBound) {
        ajustesBound = true;
        var btnAdd = document.getElementById("ajuste-btn-add-linea");
        if (btnAdd) btnAdd.addEventListener("click", addAjusteLineRow);

        var formAj = document.getElementById("form-ajuste-nuevo");
        if (formAj) {
          formAj.addEventListener("submit", async function (ev) {
            ev.preventDefault();
            var items = [];
            document.querySelectorAll("#ajuste-lineas-container .linea-dinamica-row").forEach(function (r) {
              var idLote = r.querySelector(".ajuste-linea-lote").value;
              var qty = Number.parseInt(r.querySelector(".ajuste-linea-qty").value, 10);
              if (idLote) items.push({ id_lote: idLote, cantidad: qty });
            });

            var tipoEl = document.getElementById("ajuste-tipo-select");
            var motEl = document.getElementById("ajuste-motivo-input");
            var obsEl = document.getElementById("ajuste-obs-input");

            try {
              var res = await MVC.InventoryModel.createAjuste({
                id_sede: sedeSel ? sedeSel.value : "",
                id_empleado: empSel ? empSel.value : "",
                tipo: tipoEl ? tipoEl.value : "EGRESO",
                motivo: motEl ? motEl.value.trim() : "",
                observacion: obsEl ? obsEl.value.trim() : "",
                items: items
              });
              showStatus("Ajuste " + (res.ajuste?.aju_numero || "") + " registrado y stock actualizado.", true);
              if (obsEl) obsEl.value = "";
              await loadAjustesTab();
            } catch (err) {
              showStatus(err.message || "Error al registrar ajuste de inventario.", false);
            }
          });
        }
      }

      var sortedAjustes = ajustes.slice().sort(function (a, b) {
        return String(b.id_ajuste || "").localeCompare(String(a.id_ajuste || ""));
      });
      MVC.InventoryView.renderAjustesTable(tbody, sortedAjustes, sedeMap, empMap);
    } catch (err) {
      showStatus(err.message || "Error al cargar ajustes de inventario.", false);
    }
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.InventoryController = {
    loadKardexTab: loadKardexTab,
    loadLotesTab: loadLotesTab,
    loadComprasTab: loadComprasTab,
    loadAjustesTab: loadAjustesTab
  };
})(window);
