(function (global) {
  "use strict";

  var cachedProducts = [];
  var editingId = "";

  function showStatus(msg, isSuccess) {
    var MVC = global.DermakorMVC;
    MVC.CartView.showAlert("admin-status-alert", msg, isSuccess ? "success" : "error");
  }

  async function loadProductsTab() {
    var MVC = global.DermakorMVC;
    var tbody = document.getElementById("admin-productos-tbody");
    try {
      cachedProducts = await MVC.ProductModel.fetchAll("limit=100");
      MVC.AdminView.renderProductsTable(tbody, cachedProducts, {
        onEdit: function (prod) {
          editingId = prod.id_producto_db || prod.id || "";
          document.getElementById("admin-prod-nombre").value = prod.nombre || "";
          document.getElementById("admin-prod-marca").value = prod.marca || "Dermakor";
          document.getElementById("admin-prod-categoria").value = prod.categoria || "Cuidado facial";
          document.getElementById("admin-prod-precio").value = Number(prod.precio || 0);
          document.getElementById("admin-prod-stock").value = Number(prod.stock || 25);
          var imgVal = prod.imagen || "images/01_exoface.webp";
          document.getElementById("admin-prod-imagen").value = imgVal;
          var prevImg = document.getElementById("admin-prod-img-preview");
          if (prevImg) {
            prevImg.src = imgVal;
            prevImg.alt = "Vista previa de " + (prod.nombre || "producto");
          }
          document.getElementById("admin-prod-submit").textContent = "Guardar cambios del producto";
          document.getElementById("admin-prod-cancel").style.display = "inline-flex";
          document.getElementById("admin-prod-nombre").focus();
        },
        onDelete: async function (prod) {
          var targetId = prod.id_producto_db || prod.id;
          if (!global.confirm('¿Desactivar producto "' + prod.nombre + '"?')) return;
          try {
            await MVC.ProductModel.remove(targetId);
            showStatus("Producto '" + prod.nombre + "' eliminado/desactivado correctamente.", true);
            await loadProductsTab();
          } catch (err) {
            showStatus(err.message || "Error al eliminar producto.", false);
          }
        }
      });
    } catch (err) {
      showStatus(err.message || "No se pudo cargar el catalogo administrativo.", false);
    }
  }

  var ventasBound = false;

  async function populateVentaProductosSelect() {
    var MVC = global.DermakorMVC;
    var sel = document.getElementById("venta-prod-select");
    if (!sel) return;
    while (sel.firstChild) sel.removeChild(sel.firstChild);

    try {
      var list = await MVC.ProductModel.fetchAll("limit=100");
      var sorted = (Array.isArray(list) ? list : []).slice().sort(function (a, b) {
        return String(b.id_producto_db || "").localeCompare(String(a.id_producto_db || ""));
      });
      sorted.forEach(function (p) {
        var id = p.id_producto_db || p.id_producto || "";
        if (!id) return;
        var opt = document.createElement("option");
        opt.value = id;
        var disp = Number(p.stock || 0);
        var res = Number(p.stock_reservado || 0);
        opt.textContent = "[" + (p.codigo || id) + "] " + p.nombre + " — Disp: " + disp + (res > 0 ? " (Res: " + res + ")" : "") + " — $" + Number(p.precio || 0).toFixed(2);
        sel.appendChild(opt);
      });
    } catch (_err) {
      // Silencioso
    }
  }

  async function loadAllOrdersTab() {
    var MVC = global.DermakorMVC;
    var tbody = document.getElementById("admin-pedidos-tbody");
    var cardsEl = document.getElementById("ventas-resumen-cards");

    if (!ventasBound) {
      ventasBound = true;
      var formVenta = document.getElementById("form-admin-venta-rapida");
      if (formVenta) {
        formVenta.addEventListener("submit", async function (ev) {
          ev.preventDefault();
          var idProd = document.getElementById("venta-prod-select")?.value;
          var qty = Number.parseInt(document.getElementById("venta-cantidad-input")?.value || "1", 10);
          var cliNom = document.getElementById("venta-cliente-input")?.value.trim() || "María Fernández";
          var estInit = document.getElementById("venta-estado-select")?.value || "PENDIENTE";
          try {
            var res = await MVC.InventoryModel.createVentaAdmin({
              cliente_nombre: cliNom,
              estado_inicial: estInit,
              items: [{ id_producto: idProd, cantidad: qty }]
            });
            showStatus(
              "Pedido " + (res.ped_numero || res.id_pedido) + " creado en estado " + (res.estado || estInit) +
              (estInit === "PENDIENTE" ? " (inventario reservado)." : " (inventario restado definitivamente)."),
              true
            );
            await loadAllOrdersTab();
          } catch (err) {
            showStatus(err.message || "No se pudo registrar la venta/reserva.", false);
          }
        });
      }
    }

    await populateVentaProductosSelect();

    try {
      var list = await MVC.OrderModel.fetchAllOrders();
      if (cardsEl && MVC.InventoryView) {
        var cntPend = list.filter(function (o) { return String(o.estado || "").trim().toUpperCase() === "PENDIENTE"; }).length;
        var cntApr = list.filter(function (o) {
          var s = String(o.estado || "").trim().toUpperCase();
          return s === "APROBADO" || s === "PAGADO";
        }).length;
        var cntCan = list.filter(function (o) {
          var s = String(o.estado || "").trim().toUpperCase();
          return s === "CANCELADO" || s === "ANULADO";
        }).length;
        MVC.InventoryView.renderSummaryCards(cardsEl, [
          { label: "Total Pedidos", value: list.length },
          { label: "⏳ En Pendiente (Reservados)", value: cntPend, tone: "por-vencer" },
          { label: "✅ Aprobados / Pagados", value: cntApr, tone: "vigente" },
          { label: "↩️ Cancelados (Devueltos)", value: cntCan, tone: "vencido" }
        ]);
      }

      MVC.AdminView.renderOrdersTable(tbody, list, {
        onApprove: async function (o) {
          try {
            await MVC.OrderModel.aprobarOrder(o.id_pedido);
            showStatus("Pedido " + (o.ped_numero || o.id_pedido) + " APROBADO (PAGADO): el stock reservado pasó a venta definitiva.", true);
            await loadAllOrdersTab();
          } catch (err) {
            showStatus(err.message || "Error al aprobar el pedido.", false);
          }
        },
        onCancel: async function (o) {
          if (!global.confirm("¿Cancelar pedido " + (o.ped_numero || o.id_pedido) + " y devolver el inventario a los lotes?")) return;
          try {
            var res = await MVC.OrderModel.cancelarOrder(o.id_pedido, "Anulado desde Panel Admin");
            showStatus(
              "Pedido " + (o.ped_numero || o.id_pedido) + " CANCELADO: regresaron " + (res.unidades_devueltas || 0) + " unidad(es) al inventario.",
              true
            );
            await loadAllOrdersTab();
          } catch (err) {
            showStatus(err.message || "Error al cancelar el pedido.", false);
          }
        },
        onViewKardex: function (idProd) {
          switchTab("kardex");
          if (MVC.InventoryController) {
            MVC.InventoryController.loadKardexTab(idProd);
          }
        }
      });
    } catch (err) {
      showStatus(err.message || "Solo el administrador puede consultar todos los pedidos.", false);
    }
  }

  async function loadMyOrdersTab() {
    var MVC = global.DermakorMVC;
    var tbody = document.getElementById("admin-mis-pedidos-tbody");
    try {
      var list = await MVC.OrderModel.fetchMyOrders();
      MVC.AdminView.renderOrdersTable(tbody, list);
    } catch (err) {
      showStatus(err.message || "No se pudieron cargar tus pedidos.", false);
    }
  }

  async function loadEntityTab(entitySlug) {
    var MVC = global.DermakorMVC;
    var thead = document.getElementById("admin-entidad-thead");
    var tbody = document.getElementById("admin-entidad-tbody");
    try {
      var rows = await MVC.OrderModel.fetchEntityTable(entitySlug);
      MVC.AdminView.renderGenericTable(thead, tbody, rows);
    } catch (err) {
      showStatus(err.message || "Error al consultar la entidad " + entitySlug, false);
    }
  }

  function resetProductForm() {
    editingId = "";
    var form = document.getElementById("form-admin-producto");
    if (form) form.reset();
    var prevImg = document.getElementById("admin-prod-img-preview");
    if (prevImg) {
      prevImg.src = "images/01_exoface-400.webp";
      prevImg.alt = "Vista previa de fotografía del producto en edición";
    }
    var sub = document.getElementById("admin-prod-submit");
    if (sub) sub.textContent = "Guardar nuevo producto";
    var can = document.getElementById("admin-prod-cancel");
    if (can) can.style.display = "none";
  }

  function switchTab(tabName) {
    document.querySelectorAll(".admin-tab-btn").forEach(function (btn) {
      btn.classList.toggle("activo", btn.getAttribute("data-tab") === tabName);
    });
    document.querySelectorAll(".admin-tab-panel").forEach(function (panel) {
      panel.style.display = panel.getAttribute("data-panel") === tabName ? "block" : "none";
    });
    document.querySelectorAll(".admin-guia-paso").forEach(function (stepBtn) {
      var target = stepBtn.getAttribute("data-go-tab");
      var isMatch = target === tabName || (tabName === "lotes" && target === "kardex");
      stepBtn.classList.toggle("activo", isMatch);
    });
  }

  async function renderArchitectureStatus(MVC) {
    var frontEl = document.getElementById("arch-frontend-origin");
    var backEl = document.getElementById("arch-backend-url");
    var dbEl = document.getElementById("arch-db-status");
    var pillEl = document.getElementById("arch-service-pill");
    if (!frontEl || !backEl || !dbEl) return;

    var origin = (typeof window !== "undefined" && window.location) ? window.location.origin : "N/A";
    var apiBase = MVC.ApiModel.resolveApiBaseUrl() || origin;
    frontEl.textContent = origin;
    backEl.textContent = apiBase + "/api";

    try {
      var res = await MVC.ApiModel.request("/api/status");
      var bdOk = res && (res.status === "ok" || res.ok || res.database === "connected");
      var tablas = res && (res.total_tablas_mvc || res.tablesCount || 30);
      var prods = res && typeof res.total_productos === "number" ? " · " + res.total_productos + " productos" : "";
      dbEl.textContent = bdOk
        ? "Conectado (" + tablas + " módulos activos" + prods + ")"
        : "Servicio operativo";
      dbEl.style.color = "#047857";
      if (pillEl) {
        pillEl.textContent = "En línea";
        pillEl.style.color = "#047857";
      }
    } catch (err) {
      dbEl.textContent = "Sin conexión al servicio (" + (err.message || "error") + ")";
      dbEl.style.color = "#B91C1C";
      if (pillEl) {
        pillEl.textContent = "Sin conexión";
        pillEl.style.color = "#B91C1C";
      }
    }
  }

  async function init() {
    if (document.body.getAttribute("data-pagina") !== "admin") return;
    var MVC = global.DermakorMVC;
    renderArchitectureStatus(MVC);
    var isAuth = MVC.AuthModel.isAuthenticated();
    var isAdmin = MVC.AuthModel.isAdmin();

    var unauthBox = document.getElementById("admin-auth-guard");
    var mainPanel = document.getElementById("admin-main-panel");

    if (!isAuth) {
      if (unauthBox) unauthBox.style.display = "block";
      if (mainPanel) mainPanel.style.display = "none";
      return;
    }

    if (unauthBox) unauthBox.style.display = "none";
    if (mainPanel) mainPanel.style.display = "block";

    // Mostrar pestañas exclusivas admin solo cuando es administrador
    document.querySelectorAll("[data-admin-only='true']").forEach(function (el) {
      el.style.display = isAdmin ? "" : "none";
    });

    if (!isAdmin) {
      var titleEl = document.getElementById("admin-page-title");
      var subEl = document.getElementById("admin-page-subtitle");
      if (titleEl) titleEl.textContent = "Mis Pedidos";
      if (subEl) subEl.textContent = "Consulta el historial y estado de tus compras en DERMAKOR.";
    }

    var inpImg = document.getElementById("admin-prod-imagen");
    if (inpImg) {
      inpImg.addEventListener("input", function () {
        var prevImg = document.getElementById("admin-prod-img-preview");
        if (prevImg && inpImg.value.trim()) {
          prevImg.src = inpImg.value.trim();
        }
      });
    }

    document.querySelectorAll(".admin-tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tab = btn.getAttribute("data-tab");
        switchTab(tab);
        if (tab === "productos") loadProductsTab();
        if (tab === "pedidos-admin") loadAllOrdersTab();
        if (tab === "mis-pedidos") loadMyOrdersTab();
        if (tab === "kardex" && MVC.InventoryController) MVC.InventoryController.loadKardexTab();
        if (tab === "lotes" && MVC.InventoryController) MVC.InventoryController.loadLotesTab();
        if (tab === "compras" && MVC.InventoryController) MVC.InventoryController.loadComprasTab();
        if (tab === "ajustes" && MVC.InventoryController) MVC.InventoryController.loadAjustesTab();
        if (tab === "tablas" && MVC.EntityController) {
          MVC.EntityController.load();
        }
      });
    });

    document.querySelectorAll(".admin-guia-paso").forEach(function (stepBtn) {
      stepBtn.addEventListener("click", function () {
        var targetTab = stepBtn.getAttribute("data-go-tab");
        if (!targetTab) return;
        switchTab(targetTab);
        if (targetTab === "compras" && MVC.InventoryController) MVC.InventoryController.loadComprasTab();
        if (targetTab === "pedidos-admin") loadAllOrdersTab();
        if (targetTab === "kardex" && MVC.InventoryController) MVC.InventoryController.loadKardexTab();
        if (targetTab === "lotes" && MVC.InventoryController) MVC.InventoryController.loadLotesTab();
      });
    });

    var formProd = document.getElementById("form-admin-producto");
    if (formProd) {
      formProd.addEventListener("submit", async function (ev) {
        ev.preventDefault();
        var payload = {
          nombre: document.getElementById("admin-prod-nombre").value.trim(),
          marca: document.getElementById("admin-prod-marca").value.trim() || "Dermakor",
          categoria: document.getElementById("admin-prod-categoria").value.trim() || "Cuidado facial",
          precio: Number(document.getElementById("admin-prod-precio").value),
          stock: Number.parseInt(document.getElementById("admin-prod-stock").value || "25", 10),
          imagen: document.getElementById("admin-prod-imagen").value.trim() || "images/01_exoface.webp"
        };
        try {
          if (editingId) {
            await MVC.ProductModel.update(editingId, payload);
            showStatus("Los cambios del producto se guardaron correctamente.", true);
          } else {
            await MVC.ProductModel.create(payload);
            showStatus("El producto se agregó al catálogo correctamente.", true);
          }
          resetProductForm();
          await loadProductsTab();
        } catch (err) {
          showStatus(err.message || "Error al guardar producto.", false);
        }
      });
    }

    var cancelBtn = document.getElementById("admin-prod-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", resetProductForm);

    if (window.location.hash === "#mis-pedidos" || !isAdmin) {
      switchTab("mis-pedidos");
      await loadMyOrdersTab();
    } else {
      switchTab("productos");
      await loadProductsTab();
    }
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.AdminController = {
    init: init,
    switchTab: switchTab,
    loadProductsTab: loadProductsTab,
    loadAllOrdersTab: loadAllOrdersTab,
    loadMyOrdersTab: loadMyOrdersTab
  };
})(window);
