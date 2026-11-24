(function (global) {
  "use strict";

  function clearEl(el) {
    if (!el) return;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function renderEntityOptions(selectEl, entities) {
    if (!selectEl) return;
    clearEl(selectEl);
    (entities || []).forEach(function (ent) {
      var opt = document.createElement("option");
      opt.value = ent.slug;
      opt.textContent = ent.table + (ent.mode === "readonly" ? " (solo lectura)" : "");
      selectEl.appendChild(opt);
    });
  }

  function buildCompositeId(row, pkCols) {
    return (pkCols || []).map(function (col) {
      return String(row && row[col] != null ? row[col] : "").trim();
    }).join(":");
  }

  function formatCellValue(val, field) {
    if (val == null) return "";
    if (typeof val === "object") {
      try {
        return JSON.stringify(val).slice(0, 80);
      } catch (_e) {
        return "[Objeto]";
      }
    }
    var s = String(val);
    if (field && field.type === "DateTime") {
      if (field.kind === "date") return s.slice(0, 10);
      return s.replace("T", " ").slice(0, 16);
    }
    return s.length > 90 ? s.slice(0, 87) + "..." : s;
  }

  function renderTable(headEl, bodyEl, entityMeta, rows, handlers) {
    if (!headEl || !bodyEl) return;
    clearEl(headEl);
    clearEl(bodyEl);

    var fields = Array.isArray(entityMeta?.fields) && entityMeta.fields.length > 0
      ? entityMeta.fields
      : (Array.isArray(rows) && rows.length > 0
        ? Object.keys(rows[0]).map(function (k) { return { name: k, type: "String" }; })
        : []);

    var isReadonly = entityMeta && entityMeta.mode === "readonly";

    var headTr = document.createElement("tr");
    fields.forEach(function (f) {
      var th = document.createElement("th");
      th.textContent = f.name;
      headTr.appendChild(th);
    });
    if (!isReadonly) {
      var thAcc = document.createElement("th");
      thAcc.textContent = "Acciones";
      headTr.appendChild(thAcc);
    }
    headEl.appendChild(headTr);

    if (!Array.isArray(rows) || rows.length === 0) {
      var trEmpty = document.createElement("tr");
      var tdEmpty = document.createElement("td");
      tdEmpty.colSpan = Math.max(1, fields.length + (isReadonly ? 0 : 1));
      tdEmpty.textContent = "No se encontraron registros para mostrar.";
      trEmpty.appendChild(tdEmpty);
      bodyEl.appendChild(trEmpty);
      return;
    }

    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      fields.forEach(function (f) {
        var td = document.createElement("td");
        td.textContent = formatCellValue(row[f.name], f);
        tr.appendChild(td);
      });

      if (!isReadonly) {
        var tdAcc = document.createElement("td");
        var wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.gap = "6px";

        var btnEdit = document.createElement("button");
        btnEdit.type = "button";
        btnEdit.className = "btn-accion-sm";
        btnEdit.textContent = "Editar";
        btnEdit.addEventListener("click", function () {
          if (handlers && handlers.onEdit) handlers.onEdit(row);
        });

        var btnDel = document.createElement("button");
        btnDel.type = "button";
        btnDel.className = "btn-accion-sm peligro";
        btnDel.textContent = "Eliminar";
        btnDel.addEventListener("click", function () {
          if (handlers && handlers.onDelete) handlers.onDelete(row);
        });

        wrap.appendChild(btnEdit);
        wrap.appendChild(btnDel);
        tdAcc.appendChild(wrap);
        tr.appendChild(tdAcc);
      }

      bodyEl.appendChild(tr);
    });
  }

  function renderReadonlyNotice(noteEl, entityMeta) {
    if (!noteEl) return;
    if (!entityMeta || entityMeta.mode !== "readonly") {
      noteEl.style.display = "none";
      noteEl.textContent = "";
      return;
    }
    noteEl.style.display = "block";
    if (entityMeta.slug === "productos") {
      noteEl.textContent = "Solo lectura aqui: gestionar creacion, edicion y eliminacion desde la pestana Productos.";
    } else if (entityMeta.slug === "pedidos") {
      noteEl.textContent = "Solo lectura: los pedidos se generan transaccionalmente desde el flujo de checkout.";
    } else {
      noteEl.textContent = "Entidad de auditoria (LOG) en modo solo lectura.";
    }
  }

  var FRIENDLY_LABELS = {
    id_ciudad: "Ciudad",
    id_pais: "País",
    id_proveedor: "Proveedor",
    id_sede: "Sede",
    id_producto: "Producto",
    id_categoria: "Categoría",
    id_rol: "Rol",
    id_usuario: "Usuario",
    id_cliente: "Cliente",
    id_empleado: "Empleado",
    prv_ruc: "RUC (13 dígitos)",
    prv_razon_social: "Razón social",
    prv_telefono: "Teléfono",
    prv_email: "Correo electrónico",
    lot_numero: "Número de lote",
    lot_fecha_fabricacion: "Fecha de fabricación",
    lot_fecha_caducidad: "Fecha de caducidad",
    lot_stock_actual: "Stock disponible",
    lot_estado: "Estado del lote",
    usu_nombre: "Nombre completo",
    usu_email: "Correo electrónico",
    usu_estado: "Estado"
  };

  function formatFieldLabel(fieldName) {
    return FRIENDLY_LABELS[fieldName] ? (FRIENDLY_LABELS[fieldName] + " (" + fieldName + ")") : fieldName;
  }

  function formatInputDateValue(rawVal, kind) {
    if (rawVal == null || rawVal === "") return "";
    var s = String(rawVal).trim();
    if (kind === "date") {
      return s.slice(0, 10);
    }
    return s.slice(0, 16);
  }

  function renderForm(container, entityMeta, opts) {
    if (!container) return;
    clearEl(container);
    if (!entityMeta || entityMeta.mode === "readonly") {
      container.style.display = "none";
      return;
    }

    var options = opts || {};
    var mode = options.mode === "edit" ? "edit" : "create";
    var row = options.row || {};
    var fkOptionsMap = options.fkOptionsMap || {};
    var pkSet = new Set(entityMeta.pk || []);
    var hasPrefix = Boolean(entityMeta.prefix) && (entityMeta.pk || []).length === 1;

    container.style.display = "block";

    var form = document.createElement("form");
    form.className = "caja-formulario";
    form.style.marginBottom = "18px";

    var title = document.createElement("h3");
    title.className = "subtitulo-formulario";
    title.textContent = (mode === "edit" ? "Editar registro en " : "Nuevo registro en ") + entityMeta.table;
    form.appendChild(title);

    var grid = document.createElement("div");
    grid.className = "fila-formulario";
    grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";

    var inputRefs = {};

    (entityMeta.fields || []).forEach(function (field) {
      var group = document.createElement("div");
      group.className = "campo-grupo";

      var isPk = pkSet.has(field.name);
      var isAutoPkCreate = isPk && hasPrefix && mode === "create";
      var isUsuarioHash = entityMeta.slug === "usuarios" && field.name === "usu_clave_hash";

      var label = document.createElement("label");
      label.className = "campo-etiqueta";
      label.htmlFor = "crud-field-" + field.name;
      label.textContent = isUsuarioHash
        ? "Contraseña (se cifra con bcrypt)"
        : formatFieldLabel(field.name) + (!field.optional && !field.hasDefault && !isAutoPkCreate ? " *" : "");
      group.appendChild(label);

      var fkOpts = field.fk ? fkOptionsMap[field.name] : null;
      var control;

      if (field.fk && Array.isArray(fkOpts)) {
        control = document.createElement("select");
        control.className = "campo-control";
        var defOpt = document.createElement("option");
        defOpt.value = "";
        defOpt.textContent = "-- Seleccionar " + field.fk.table + " --";
        control.appendChild(defOpt);
        fkOpts.forEach(function (o) {
          var opt = document.createElement("option");
          opt.value = o.value;
          opt.textContent = o.label;
          control.appendChild(opt);
        });
        if (mode === "edit" && row[field.name] != null) {
          control.value = String(row[field.name]).trim();
        }
        if (isPk && mode === "edit") {
          control.disabled = true;
        }
        if (!field.optional && !field.hasDefault) {
          control.required = true;
        }
      } else {
        control = document.createElement("input");
        control.className = "campo-control";

        if (isAutoPkCreate) {
          control.type = "text";
          control.value = "(automático)";
          control.disabled = true;
        } else if (isUsuarioHash) {
          control.type = "password";
          control.value = "";
          control.placeholder = mode === "edit" ? "(sin cambios)" : "Mínimo 6 caracteres";
          if (mode === "create") control.required = true;
        } else if (field.type === "Int") {
          control.type = "number";
          control.step = "1";
          if (mode === "edit" && row[field.name] != null) control.value = String(row[field.name]);
        } else if (field.type === "Decimal") {
          control.type = "number";
          control.step = "0.01";
          if (mode === "edit" && row[field.name] != null) control.value = String(row[field.name]);
        } else if (field.type === "DateTime") {
          control.type = field.kind === "date" ? "date" : "datetime-local";
          if (mode === "edit" && row[field.name] != null) {
            control.value = formatInputDateValue(row[field.name], field.kind);
          }
        } else {
          control.type = "text";
          if (field.maxLength) control.maxLength = field.maxLength;
          if (mode === "edit" && row[field.name] != null) control.value = String(row[field.name]).trim();
        }

        if (isPk && mode === "edit") {
          control.readOnly = true;
          control.disabled = true;
        }

        if (!isAutoPkCreate && !isUsuarioHash && !field.optional && !field.hasDefault && !(isPk && mode === "edit")) {
          control.required = true;
        }
      }

      control.id = "crud-field-" + field.name;
      inputRefs[field.name] = { el: control, field: field, isAutoPkCreate: isAutoPkCreate, isPk: isPk };
      group.appendChild(control);
      grid.appendChild(group);
    });

    form.appendChild(grid);

    var btnBar = document.createElement("div");
    btnBar.style.display = "flex";
    btnBar.style.gap = "10px";
    btnBar.style.flexWrap = "wrap";
    btnBar.style.marginTop = "12px";

    var btnSave = document.createElement("button");
    btnSave.type = "submit";
    btnSave.className = "boton-primario";
    btnSave.textContent = mode === "edit" ? "Guardar Cambios" : "Crear Registro";

    var btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.className = "boton-secundario";
    btnCancel.textContent = "Cancelar";
    btnCancel.addEventListener("click", function () {
      clearEl(container);
      container.style.display = "none";
      if (options.onCancel) options.onCancel();
    });

    btnBar.appendChild(btnSave);
    btnBar.appendChild(btnCancel);
    form.appendChild(btnBar);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var payload = {};
      Object.keys(inputRefs).forEach(function (col) {
        var ref = inputRefs[col];
        if (ref.isAutoPkCreate) return;
        if (mode === "edit" && ref.isPk) return;
        var val = ref.el.value;
        if (entityMeta.slug === "usuarios" && col === "usu_clave_hash" && mode === "edit" && val === "") {
          return;
        }
        if (mode === "create" && ref.field.hasDefault && val === "") {
          return;
        }
        payload[col] = val;
      });
      if (options.onSubmit) {
        options.onSubmit(payload);
      }
    });

    container.appendChild(form);
  }

  global.DermakorMVC = global.DermakorMVC || {};
  global.DermakorMVC.EntityView = {
    buildCompositeId: buildCompositeId,
    renderEntityOptions: renderEntityOptions,
    renderTable: renderTable,
    renderReadonlyNotice: renderReadonlyNotice,
    renderForm: renderForm
  };
})(window);
