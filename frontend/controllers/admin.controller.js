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
          document.getElementById("admin-prod-imagen").value = prod.imagen || "images/01_exoface.webp";
          document.getElementById("admin-prod-submit").textContent = "Guardar Cambios Producto";
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

  async function loadAllOrdersTab() {
    var MVC = global.DermakorMVC;
    var tbody = document.getElementById("admin-pedidos-tbody");
    try {
      var list = await MVC.OrderModel.fetchAllOrders();
      MVC.AdminView.renderOrdersTable(tbody, list);
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
    var sub = document.getElementById("admin-prod-submit");
    if (sub) sub.textContent = "Crear Producto (POST)";
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
  }

  async function renderArchitectureStatus(MVC) {
    var frontEl = document.getElementById("arch-frontend-origin");
    var backEl = document.getElementById("arch-backend-url");
    var dbEl = document.getElementById("arch-db-status");
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
        ? "Conectado (Supabase + Prisma ORM · " + tablas + " tablas" + prods + ")"
        : "Respuesta recibida del backend";
      dbEl.style.color = "#047857";
    } catch (err) {
      dbEl.textContent = "Sin conexión al backend (" + (err.message || "error") + ")";
      dbEl.style.color = "#B91C1C";
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

    // Mostrar pestañas exclusivas admin solo cuando role === admin
    document.querySelectorAll("[data-admin-only='true']").forEach(function (el) {
      el.style.display = isAdmin ? "" : "none";
    });

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
            showStatus("Producto actualizado correctamente en Supabase.", true);
          } else {
            await MVC.ProductModel.create(payload);
            showStatus("Producto creado correctamente con JWT Admin y Prisma ORM.", true);
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
