(function (global) {
  "use strict";

  var bound = false;
  var entitiesMeta = [];
  var currentRows = [];
  var currentMeta = null;

  function showStatus(msg, isSuccess) {
    var MVC = global.DermakorMVC;
    if (MVC && MVC.CartView) {
      MVC.CartView.showAlert("admin-status-alert", msg, isSuccess ? "success" : "error");
    }
  }

  function findMetaBySlug(slug) {
    return entitiesMeta.find(function (e) { return e.slug === slug; }) || null;
  }

  async function resolveFkOptionsMap(entityMeta) {
    var MVC = global.DermakorMVC;
    var map = {};
    if (!entityMeta || !Array.isArray(entityMeta.fields)) return map;

    var fkFields = entityMeta.fields.filter(function (f) { return Boolean(f.fk); });
    await Promise.all(
      fkFields.map(async function (f) {
        var opts = await MVC.EntityModel.fetchFkOptions(f.fk);
        if (Array.isArray(opts) && opts.length > 0) {
          map[f.name] = opts;
        }
      })
    );
    return map;
  }

  function applySearchAndRender() {
    var MVC = global.DermakorMVC;
    var searchEl = document.getElementById("crud-search-input");
    var thead = document.getElementById("admin-entidad-thead");
    var tbody = document.getElementById("admin-entidad-tbody");
    if (!currentMeta) return;

    var term = searchEl ? searchEl.value.trim().toLowerCase() : "";
    var filtered = !term
      ? currentRows
      : currentRows.filter(function (row) {
          return Object.values(row || {}).some(function (v) {
            return String(v == null ? "" : v).toLowerCase().includes(term);
          });
        });

    MVC.EntityView.renderTable(thead, tbody, currentMeta, filtered, {
      onEdit: function (row) {
        openForm("edit", row);
      },
      onDelete: async function (row) {
        var idVal = MVC.EntityView.buildCompositeId(row, currentMeta.pk);
        if (!global.confirm("¿Eliminar registro '" + idVal + "' de " + currentMeta.table + "?")) {
          return;
        }
        try {
          await MVC.EntityModel.remove(currentMeta.slug, idVal);
          showStatus("Registro '" + idVal + "' eliminado de " + currentMeta.table + ".", true);
          await loadSelectedEntity(currentMeta.slug);
        } catch (err) {
          showStatus(err.message || "Error al eliminar el registro.", false);
        }
      }
    });
  }

  async function openForm(mode, row) {
    var MVC = global.DermakorMVC;
    var formBox = document.getElementById("crud-form-container");
    if (!currentMeta || !formBox) return;

    var fkMap = await resolveFkOptionsMap(currentMeta);
    MVC.EntityView.renderForm(formBox, currentMeta, {
      mode: mode,
      row: row,
      fkOptionsMap: fkMap,
      onSubmit: async function (payload) {
        try {
          if (mode === "edit") {
            var idVal = MVC.EntityView.buildCompositeId(row, currentMeta.pk);
            await MVC.EntityModel.update(currentMeta.slug, idVal, payload);
            showStatus("Registro '" + idVal + "' actualizado en " + currentMeta.table + ".", true);
          } else {
            await MVC.EntityModel.create(currentMeta.slug, payload);
            showStatus("Registro creado en " + currentMeta.table + ".", true);
          }
          formBox.style.display = "none";
          await loadSelectedEntity(currentMeta.slug);
        } catch (err) {
          showStatus(err.message || "Error al guardar el registro en " + currentMeta.table + ".", false);
        }
      }
    });
    formBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function loadSelectedEntity(slug) {
    var MVC = global.DermakorMVC;
    var formBox = document.getElementById("crud-form-container");
    var noteEl = document.getElementById("crud-readonly-note");
    var btnNew = document.getElementById("crud-btn-nuevo");

    if (formBox) formBox.style.display = "none";
    currentMeta = findMetaBySlug(slug);
    if (!currentMeta) return;

    MVC.EntityView.renderReadonlyNotice(noteEl, currentMeta);
    if (btnNew) {
      btnNew.style.display = currentMeta.mode === "readonly" ? "none" : "inline-flex";
    }

    try {
      currentRows = await MVC.EntityModel.fetchAll(currentMeta.slug);
      applySearchAndRender();
    } catch (err) {
      showStatus(err.message || "Error al consultar " + currentMeta.table + ".", false);
    }
  }

  async function ensureInitialized() {
    var MVC = global.DermakorMVC;
    var sel = document.getElementById("select-entidad-bd");
    var searchEl = document.getElementById("crud-search-input");
    var btnNew = document.getElementById("crud-btn-nuevo");

    if (entitiesMeta.length === 0) {
      entitiesMeta = await MVC.EntityModel.getMetadata();
      MVC.EntityView.renderEntityOptions(sel, entitiesMeta);
    }

    if (!bound) {
      bound = true;
      if (sel) {
        sel.addEventListener("change", function () {
          loadSelectedEntity(sel.value);
        });
      }
      if (searchEl) {
        searchEl.addEventListener("input", applySearchAndRender);
      }
      if (btnNew) {
        btnNew.addEventListener("click", function () {
          openForm("create", null);
        });
      }
    }
  }

  async function load(preselectSlug) {
    try {
      await ensureInitialized();
      var sel = document.getElementById("select-entidad-bd");
      var target = preselectSlug || (sel ? sel.value : "categorias");
      if (sel && target) {
        sel.value = target;
      }
      await loadSelectedEntity(target);
    } catch (err) {
      showStatus(err.message || "No se pudo cargar la metadata de entidades BD.", false);
    }
  }

  async function openNewForSlug(slug) {
    try {
      await ensureInitialized();
      var sel = document.getElementById("select-entidad-bd");
      if (sel) sel.value = slug;
      await loadSelectedEntity(slug);
      await openForm("create", null);
    } catch (err) {
      showStatus(err.message || "No se pudo abrir el formulario de " + slug + ".", false);
    }
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.EntityController = {
    load: load,
    openNewForSlug: openNewForSlug
  };
})(window);
