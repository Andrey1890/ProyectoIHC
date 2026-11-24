const { getSupabaseSingleton } = require("../config/supabase.singleton");
const { HttpAppError } = require("../middlewares/error.middleware");

function toNum(val, fallback = 0) {
  if (val && typeof val === "object" && typeof val.toNumber === "function") {
    return val.toNumber();
  }
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function trimStr(val) {
  return String(val == null ? "" : val).trim();
}

function parseDateValue(raw, label) {
  const s = trimStr(raw);
  if (!s) {
    throw new HttpAppError(400, `Fecha requerida para ${label}.`, "VALIDATION_DATE");
  }
  const iso = s.length === 10 ? `${s}T00:00:00.000Z` : s;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    throw new HttpAppError(400, `Fecha invalida para ${label}: ${s}.`, "VALIDATION_DATE");
  }
  return dt;
}

function toIsoDate(val) {
  if (!val) return "";
  const dt = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

function computeSemaforo(caducidadVal) {
  const dt = caducidadVal instanceof Date ? caducidadVal : new Date(caducidadVal);
  if (Number.isNaN(dt.getTime())) {
    return { dias_para_caducar: 0, semaforo: "VIGENTE" };
  }
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const cadUtc = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
  const dias = Math.round((cadUtc - todayUtc) / 86400000);
  let semaforo = "VIGENTE";
  if (dias < 0) {
    semaforo = "VENCIDO";
  } else if (dias <= 90) {
    semaforo = "POR_VENCER";
  }
  return { dias_para_caducar: dias, semaforo };
}

class InventarioRepository {
  static #instance = null;
  #db;

  constructor() {
    this.#db = getSupabaseSingleton();
  }

  static getInstance() {
    if (!InventarioRepository.#instance) {
      InventarioRepository.#instance = new InventarioRepository();
    }
    return InventarioRepository.#instance;
  }

  async crearCompra(payload = {}) {
    const idProveedor = trimStr(payload.id_proveedor);
    const idSede = trimStr(payload.id_sede);
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!idProveedor) {
      throw new HttpAppError(400, "id_proveedor es obligatorio.", "VALIDATION_PROVEEDOR");
    }
    if (!idSede) {
      throw new HttpAppError(400, "id_sede es obligatorio.", "VALIDATION_SEDE");
    }
    if (items.length === 0) {
      throw new HttpAppError(400, "Debe incluir al menos un producto en items.", "VALIDATION_ITEMS");
    }

    // Agrupar productos duplicados y validar cantidades/costos
    const grouped = new Map();
    for (const raw of items) {
      const idProducto = trimStr(raw?.id_producto);
      const cantidad = Number.parseInt(String(raw?.cantidad ?? ""), 10);
      const costoUnit = Number(raw?.costo_unit ?? raw?.costo ?? NaN);

      if (!idProducto) {
        throw new HttpAppError(400, "Cada linea debe indicar id_producto.", "VALIDATION_PRODUCT");
      }
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new HttpAppError(400, `Cantidad invalida para ${idProducto}. Debe ser entero > 0.`, "VALIDATION_QTY");
      }
      if (!Number.isFinite(costoUnit) || costoUnit < 0) {
        throw new HttpAppError(400, `Costo unitario invalido para ${idProducto}. Debe ser >= 0.`, "VALIDATION_COST");
      }

      const lineSubtotal = Number((cantidad * costoUnit).toFixed(2));
      if (grouped.has(idProducto)) {
        const prev = grouped.get(idProducto);
        prev.cantidad += cantidad;
        prev.subtotal = Number((prev.subtotal + lineSubtotal).toFixed(2));
        prev.costoUnit = Number((prev.subtotal / prev.cantidad).toFixed(2));
      } else {
        grouped.set(idProducto, {
          id_producto: idProducto,
          cantidad,
          costoUnit: Number(costoUnit.toFixed(2)),
          subtotal: lineSubtotal
        });
      }
    }

    const prisma = this.#db.getPrisma();
    const [proveedores, sedes, productos] = await Promise.all([
      prisma.proveedores.findMany(),
      prisma.sedes.findMany(),
      prisma.productos.findMany()
    ]);

    if (!proveedores.some((p) => trimStr(p.id_proveedor) === idProveedor)) {
      throw new HttpAppError(404, `Proveedor '${idProveedor}' no existe.`, "PROVEEDOR_NOT_FOUND");
    }
    if (!sedes.some((s) => trimStr(s.id_sede) === idSede)) {
      throw new HttpAppError(404, `Sede '${idSede}' no existe.`, "SEDE_NOT_FOUND");
    }
    const prodSet = new Set(productos.map((p) => trimStr(p.id_producto)));
    for (const idProd of grouped.keys()) {
      if (!prodSet.has(idProd)) {
        throw new HttpAppError(404, `Producto '${idProd}' no existe.`, "PRODUCT_NOT_FOUND");
      }
    }

    return this.#db.withTransaction(async (tx) => {
      const idCompra = await this.#db.nextId(tx, "Compras", "id_compra", "COM");
      const customNum = trimStr(payload.com_numero);
      const comNumero = (customNum || `COM-2026-${idCompra.replace("COM", "").slice(-4)}`).slice(0, 15);

      let comTotal = 0;
      for (const item of grouped.values()) {
        comTotal = Number((comTotal + item.subtotal).toFixed(2));
      }

      const compra = await tx.compras.create({
        data: {
          id_compra: idCompra,
          id_proveedor: idProveedor,
          id_sede: idSede,
          com_numero: comNumero,
          com_total: comTotal,
          com_estado: "PENDIENTE"
        }
      });

      const detalles = [];
      for (const item of grouped.values()) {
        const det = await tx.compraDetalle.create({
          data: {
            id_compra: idCompra,
            id_producto: item.id_producto,
            cde_cantidad: item.cantidad,
            cde_costo_unit: item.costoUnit,
            cde_subtotal: item.subtotal
          }
        });
        detalles.push(det);
      }

      return { compra, detalles };
    });
  }

  async recibirCompra(idCompraRaw, payload = {}) {
    const idCompra = trimStr(idCompraRaw);
    const idEmpleado = trimStr(payload.id_empleado);
    const lotesInput = Array.isArray(payload.lotes) ? payload.lotes : [];

    if (!idCompra) {
      throw new HttpAppError(400, "id_compra es obligatorio.", "VALIDATION_ID");
    }
    if (!idEmpleado) {
      throw new HttpAppError(400, "id_empleado es obligatorio para la recepcion.", "VALIDATION_EMPLEADO");
    }
    if (lotesInput.length === 0) {
      throw new HttpAppError(400, "Debe enviar al menos un lote en la recepcion.", "VALIDATION_LOTES");
    }

    const prisma = this.#db.getPrisma();
    const [compras, detallesCompra, empleados] = await Promise.all([
      prisma.compras.findMany(),
      prisma.compraDetalle.findMany(),
      prisma.empleados.findMany()
    ]);

    const compra = compras.find((c) => trimStr(c.id_compra) === idCompra);
    if (!compra) {
      throw new HttpAppError(404, `Compra '${idCompra}' no encontrada.`, "COMPRA_NOT_FOUND");
    }
    const estadoCompra = trimStr(compra.com_estado).toUpperCase();
    if (estadoCompra !== "PENDIENTE") {
      throw new HttpAppError(
        409,
        `La compra '${idCompra}' esta en estado '${estadoCompra}' y no puede recibirse.`,
        "COMPRA_INVALID_STATE"
      );
    }

    if (!empleados.some((e) => trimStr(e.id_empleado) === idEmpleado)) {
      throw new HttpAppError(404, `Empleado '${idEmpleado}' no encontrado.`, "EMPLEADO_NOT_FOUND");
    }

    const allowedProducts = new Set(
      detallesCompra
        .filter((d) => trimStr(d.id_compra) === idCompra)
        .map((d) => trimStr(d.id_producto))
    );

    const parsedLotes = lotesInput.map((raw, idx) => {
      const idProducto = trimStr(raw?.id_producto);
      const lotNumero = trimStr(raw?.lot_numero).slice(0, 20);
      const cantidad = Number.parseInt(String(raw?.cantidad ?? ""), 10);
      const costoUnit = Number(raw?.costo_unit ?? raw?.costo ?? NaN);

      if (!idProducto || !allowedProducts.has(idProducto)) {
        throw new HttpAppError(
          400,
          `El producto '${idProducto || idx + 1}' no pertenece al detalle de la compra '${idCompra}'.`,
          "VALIDATION_COMPRA_PRODUCT"
        );
      }
      if (!lotNumero) {
        throw new HttpAppError(400, `lot_numero es obligatorio en linea ${idx + 1}.`, "VALIDATION_LOT_NUM");
      }
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new HttpAppError(400, `Cantidad invalida en lote '${lotNumero}'. Debe ser entero > 0.`, "VALIDATION_QTY");
      }
      if (!Number.isFinite(costoUnit) || costoUnit < 0) {
        throw new HttpAppError(400, `Costo unitario invalido en lote '${lotNumero}'.`, "VALIDATION_COST");
      }

      const fechaFab = parseDateValue(raw?.fecha_fabricacion || raw?.lot_fecha_fabricacion, `fecha_fabricacion (${lotNumero})`);
      const fechaCad = parseDateValue(raw?.fecha_caducidad || raw?.lot_fecha_caducidad, `fecha_caducidad (${lotNumero})`);
      if (fechaCad.getTime() <= fechaFab.getTime()) {
        throw new HttpAppError(
          400,
          `En lote '${lotNumero}', la fecha de caducidad debe ser posterior a la fecha de fabricacion.`,
          "VALIDATION_EXPIRATION_DATE"
        );
      }

      return {
        id_producto: idProducto,
        lot_numero: lotNumero,
        fecha_fabricacion: fechaFab,
        fecha_caducidad: fechaCad,
        cantidad,
        costo_unit: Number(costoUnit.toFixed(2)),
        subtotal: Number((cantidad * costoUnit).toFixed(2))
      };
    });

    const idSede = trimStr(compra.id_sede);
    const comNumero = trimStr(compra.com_numero);
    const observacion = (trimStr(payload.observacion) || `Recepcion compra ${comNumero}`).slice(0, 150);

    return this.#db.withTransaction(async (tx) => {
      const idOrdenEntrada = await this.#db.nextId(tx, "OrdenesEntrada", "id_orden_entrada", "OEN");
      const oenNumero = `OEN-2026-${idOrdenEntrada.replace("OEN", "").slice(-4)}`.slice(0, 15);

      const ordenEntrada = await tx.ordenesEntrada.create({
        data: {
          id_orden_entrada: idOrdenEntrada,
          id_compra: idCompra,
          id_sede: idSede,
          id_empleado: idEmpleado,
          oen_numero: oenNumero,
          oen_observacion: observacion,
          oen_estado: "RECIBIDA"
        }
      });

      const createdLotes = [];
      const createdDetalles = [];

      for (const item of parsedLotes) {
        const idLote = await this.#db.nextId(tx, "Lotes", "id_lote", "LOT");
        const lote = await tx.lotes.create({
          data: {
            id_lote: idLote,
            id_producto: item.id_producto,
            id_sede: idSede,
            lot_numero: item.lot_numero,
            lot_fecha_fabricacion: item.fecha_fabricacion,
            lot_fecha_caducidad: item.fecha_caducidad,
            lot_stock_actual: item.cantidad,
            lot_estado: "ACTIVO"
          }
        });
        createdLotes.push(lote);

        const detEntrada = await tx.ordenEntradaDetalle.create({
          data: {
            id_orden_entrada: idOrdenEntrada,
            id_lote: idLote,
            oed_cantidad_recibida: item.cantidad,
            oed_costo_unit: item.costo_unit,
            oed_subtotal: item.subtotal
          }
        });
        createdDetalles.push(detEntrada);
      }

      const updatedCompra = await tx.compras.update({
        where: { id_compra: idCompra },
        data: { com_estado: "RECIBIDA" }
      });

      return {
        ordenEntrada,
        lotes: createdLotes,
        detalles: createdDetalles,
        compra: updatedCompra
      };
    });
  }

  async anularCompra(idCompraRaw) {
    const idCompra = trimStr(idCompraRaw);
    if (!idCompra) {
      throw new HttpAppError(400, "id_compra es obligatorio.", "VALIDATION_ID");
    }

    const prisma = this.#db.getPrisma();
    const compras = await prisma.compras.findMany();
    const compra = compras.find((c) => trimStr(c.id_compra) === idCompra);
    if (!compra) {
      throw new HttpAppError(404, `Compra '${idCompra}' no encontrada.`, "COMPRA_NOT_FOUND");
    }
    const estado = trimStr(compra.com_estado).toUpperCase();
    if (estado !== "PENDIENTE") {
      throw new HttpAppError(
        409,
        `Solo se pueden anular compras en estado PENDIENTE (actual: ${estado}).`,
        "COMPRA_INVALID_STATE"
      );
    }

    const updated = await prisma.compras.update({
      where: { id_compra: idCompra },
      data: { com_estado: "ANULADA" }
    });
    return updated;
  }

  async crearAjuste(payload = {}) {
    const idSede = trimStr(payload.id_sede);
    const idEmpleado = trimStr(payload.id_empleado);
    const tipo = trimStr(payload.tipo).toUpperCase();
    const motivo = trimStr(payload.motivo).slice(0, 15);
    const observacion = trimStr(payload.observacion).slice(0, 150);
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!idSede) {
      throw new HttpAppError(400, "id_sede es obligatorio.", "VALIDATION_SEDE");
    }
    if (!idEmpleado) {
      throw new HttpAppError(400, "id_empleado es obligatorio.", "VALIDATION_EMPLEADO");
    }
    if (tipo !== "INGRESO" && tipo !== "EGRESO") {
      throw new HttpAppError(400, "El tipo de ajuste debe ser INGRESO o EGRESO.", "VALIDATION_AJUSTE_TIPO");
    }
    if (!motivo) {
      throw new HttpAppError(400, "motivo es obligatorio (max 15 caracteres).", "VALIDATION_MOTIVO");
    }
    if (!observacion) {
      throw new HttpAppError(400, "observacion es obligatoria.", "VALIDATION_OBSERVACION");
    }
    if (items.length === 0) {
      throw new HttpAppError(400, "Debe incluir al menos un lote en items.", "VALIDATION_ITEMS");
    }

    const grouped = new Map();
    for (const raw of items) {
      const idLote = trimStr(raw?.id_lote);
      const cantidad = Number.parseInt(String(raw?.cantidad ?? ""), 10);
      const obsItem = trimStr(raw?.observacion || observacion).slice(0, 100);

      if (!idLote) {
        throw new HttpAppError(400, "Cada linea de ajuste debe indicar id_lote.", "VALIDATION_LOTE");
      }
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new HttpAppError(400, `Cantidad invalida para lote '${idLote}'. Debe ser entero > 0.`, "VALIDATION_QTY");
      }

      if (grouped.has(idLote)) {
        grouped.get(idLote).cantidad += cantidad;
      } else {
        grouped.set(idLote, { id_lote: idLote, cantidad, observacion: obsItem });
      }
    }

    const prisma = this.#db.getPrisma();
    const [sedes, empleados, lotes] = await Promise.all([
      prisma.sedes.findMany(),
      prisma.empleados.findMany(),
      prisma.lotes.findMany()
    ]);

    if (!sedes.some((s) => trimStr(s.id_sede) === idSede)) {
      throw new HttpAppError(404, `Sede '${idSede}' no encontrada.`, "SEDE_NOT_FOUND");
    }
    if (!empleados.some((e) => trimStr(e.id_empleado) === idEmpleado)) {
      throw new HttpAppError(404, `Empleado '${idEmpleado}' no encontrado.`, "EMPLEADO_NOT_FOUND");
    }

    const loteMap = new Map(lotes.map((l) => [trimStr(l.id_lote), l]));
    for (const item of grouped.values()) {
      const lote = loteMap.get(item.id_lote);
      if (!lote) {
        throw new HttpAppError(404, `Lote '${item.id_lote}' no encontrado.`, "LOTE_NOT_FOUND");
      }
      const stockActual = Number(lote.lot_stock_actual || 0);
      if (tipo === "EGRESO" && stockActual - item.cantidad < 0) {
        throw new HttpAppError(
          409,
          `Stock insuficiente en lote '${trimStr(lote.lot_numero)}' (${item.id_lote}). Disponible: ${stockActual}, solicitado: ${item.cantidad}.`,
          "INSUFFICIENT_LOT_STOCK"
        );
      }
    }

    return this.#db.withTransaction(async (tx) => {
      const idAjuste = await this.#db.nextId(tx, "AjustesInventario", "id_ajuste", "AJU");
      const ajuNumero = `AJU-2026-${idAjuste.replace("AJU", "").slice(-4)}`.slice(0, 15);

      const ajuste = await tx.ajustesInventario.create({
        data: {
          id_ajuste: idAjuste,
          id_sede: idSede,
          id_empleado: idEmpleado,
          aju_numero: ajuNumero,
          aju_tipo: tipo,
          aju_motivo: motivo,
          aju_observacion: observacion
        }
      });

      const detalles = [];
      for (const item of grouped.values()) {
        await tx.lotes.update({
          where: { id_lote: item.id_lote },
          data: {
            lot_stock_actual:
              tipo === "INGRESO"
                ? { increment: item.cantidad }
                : { decrement: item.cantidad }
          }
        });

        const det = await tx.ajusteDetalle.create({
          data: {
            id_ajuste: idAjuste,
            id_lote: item.id_lote,
            ade_cantidad: item.cantidad,
            ade_observacion: item.observacion
          }
        });
        detalles.push(det);
      }

      return { ajuste, detalles };
    });
  }

  async crearVentaAdmin(payload = {}) {
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (items.length === 0) {
      throw new HttpAppError(400, "Debe seleccionar al menos un producto para la venta.", "VALIDATION_ITEMS");
    }

    const { getPedidoRepository } = require("./pedido.model");
    const estadoRaw = trimStr(payload.estado_inicial || "PENDIENTE").toUpperCase();
    const estadoInicial = estadoRaw === "APROBADO" || estadoRaw === "PAGADO" ? estadoRaw : "PENDIENTE";

    const cliente = {
      nombre: trimStr(payload.cliente_nombre) || "Cliente Mostrador Dermakor",
      cedulaRuc: trimStr(payload.cliente_cedula) || "1718293849",
      correo: trimStr(payload.cliente_correo) || "cliente@example.com",
      telefono: trimStr(payload.cliente_telefono) || "0990000000",
      direccion: trimStr(payload.direccion) || "Quito, Sede Principal"
    };

    return getPedidoRepository().createCheckoutTransaction({
      cliente,
      items,
      envio: {
        id_sede: trimStr(payload.id_sede) || "SED0000001",
        direccion: cliente.direccion
      },
      estadoInicial
    });
  }

  async listarLotesConSemaforo({ estado = "", id_producto = "" } = {}) {
    const prisma = this.#db.getPrisma();
    const [lotes, productos, sedes, ordenesSalida, ordenSalidaDetalle] = await Promise.all([
      prisma.lotes.findMany(),
      prisma.productos.findMany(),
      prisma.sedes.findMany(),
      prisma.ordenesSalida.findMany(),
      prisma.ordenSalidaDetalle.findMany()
    ]);

    const reservadoOsaIds = new Set(
      (Array.isArray(ordenesSalida) ? ordenesSalida : [])
        .filter((o) => trimStr(o.osa_estado).toUpperCase() === "RESERVADO")
        .map((o) => trimStr(o.id_orden_salida))
    );
    const reservadoByLote = new Map();
    for (const det of Array.isArray(ordenSalidaDetalle) ? ordenSalidaDetalle : []) {
      if (!reservadoOsaIds.has(trimStr(det.id_orden_salida))) continue;
      const idLote = trimStr(det.id_lote);
      reservadoByLote.set(idLote, (reservadoByLote.get(idLote) || 0) + Number(det.osd_cantidad_despachada || 0));
    }

    const prodMap = new Map(productos.map((p) => [trimStr(p.id_producto), p]));
    const sedeMap = new Map(sedes.map((s) => [trimStr(s.id_sede), s]));
    const filterProd = trimStr(id_producto);
    const filterEstado = trimStr(estado).toUpperCase();

    const enriched = lotes
      .filter((l) => !filterProd || trimStr(l.id_producto) === filterProd)
      .map((l) => {
        const idLote = trimStr(l.id_lote);
        const idProd = trimStr(l.id_producto);
        const idSede = trimStr(l.id_sede);
        const prod = prodMap.get(idProd);
        const sede = sedeMap.get(idSede);
        const { dias_para_caducar, semaforo } = computeSemaforo(l.lot_fecha_caducidad);
        const stockDisp = Number(l.lot_stock_actual || 0);
        const stockRes = reservadoByLote.get(idLote) || 0;

        return {
          id_lote: idLote,
          id_producto: idProd,
          pro_codigo: trimStr(prod?.pro_codigo),
          producto_nombre: trimStr(prod?.pro_nombre) || idProd,
          id_sede: idSede,
          sede_nombre: trimStr(sede?.sed_nombre) || idSede,
          lot_numero: trimStr(l.lot_numero),
          lot_fecha_fabricacion: toIsoDate(l.lot_fecha_fabricacion),
          lot_fecha_caducidad: toIsoDate(l.lot_fecha_caducidad),
          lot_stock_actual: stockDisp,
          stock_disponible: stockDisp,
          stock_reservado: stockRes,
          stock_fisico: stockDisp + stockRes,
          lot_estado: trimStr(l.lot_estado),
          dias_para_caducar,
          semaforo
        };
      })
      .sort((a, b) => a.lot_fecha_caducidad.localeCompare(b.lot_fecha_caducidad));

    const stockDispTotal = enriched.reduce((acc, l) => acc + l.stock_disponible, 0);
    const stockResTotal = enriched.reduce((acc, l) => acc + l.stock_reservado, 0);
    const resumen = {
      total_lotes: enriched.length,
      vencidos: enriched.filter((l) => l.semaforo === "VENCIDO").length,
      por_vencer: enriched.filter((l) => l.semaforo === "POR_VENCER").length,
      vigentes: enriched.filter((l) => l.semaforo === "VIGENTE").length,
      stock_total: stockDispTotal,
      stock_disponible_total: stockDispTotal,
      stock_reservado_total: stockResTotal,
      stock_fisico_total: stockDispTotal + stockResTotal
    };

    const filtered = filterEstado
      ? enriched.filter((l) => l.semaforo === filterEstado)
      : enriched;

    return {
      total: filtered.length,
      resumen,
      lotes: filtered
    };
  }

  async obtenerKardex({ id_producto = "", id_lote = "", id_sede = "" } = {}) {
    const targetProd = trimStr(id_producto);
    const targetLote = trimStr(id_lote);
    const targetSede = trimStr(id_sede);

    if (!targetProd) {
      throw new HttpAppError(400, "El parametro id_producto es requerido.", "VALIDATION_PRODUCT_REQUIRED");
    }

    const prisma = this.#db.getPrisma();
    const [
      productos,
      lotes,
      ordenesEntrada,
      ordenEntradaDetalle,
      ordenesSalida,
      ordenSalidaDetalle,
      ajustesInventario,
      ajusteDetalle,
      pedidos
    ] = await Promise.all([
      prisma.productos.findMany(),
      prisma.lotes.findMany(),
      prisma.ordenesEntrada.findMany(),
      prisma.ordenEntradaDetalle.findMany(),
      prisma.ordenesSalida.findMany(),
      prisma.ordenSalidaDetalle.findMany(),
      prisma.ajustesInventario.findMany(),
      prisma.ajusteDetalle.findMany(),
      prisma.pedidos.findMany()
    ]);

    const prod = productos.find((p) => trimStr(p.id_producto) === targetProd);
    if (!prod) {
      throw new HttpAppError(404, `Producto '${targetProd}' no encontrado.`, "PRODUCT_NOT_FOUND");
    }

    const filteredLotes = lotes.filter((l) => {
      if (trimStr(l.id_producto) !== targetProd) return false;
      if (targetLote && trimStr(l.id_lote) !== targetLote) return false;
      if (targetSede && trimStr(l.id_sede) !== targetSede) return false;
      return true;
    });

    const loteMap = new Map(filteredLotes.map((l) => [trimStr(l.id_lote), l]));
    const oenMap = new Map(ordenesEntrada.map((o) => [trimStr(o.id_orden_entrada), o]));
    const osaMap = new Map(ordenesSalida.map((o) => [trimStr(o.id_orden_salida), o]));
    const ajuMap = new Map(ajustesInventario.map((a) => [trimStr(a.id_ajuste), a]));
    const pedMap = new Map(pedidos.map((p) => [trimStr(p.id_pedido), p]));

    const rawMovs = [];

    // Entradas (Ordenes de entrada)
    for (const det of ordenEntradaDetalle) {
      const idLote = trimStr(det.id_lote);
      const lote = loteMap.get(idLote);
      if (!lote) continue;
      const oen = oenMap.get(trimStr(det.id_orden_entrada));
      const qty = Number(det.oed_cantidad_recibida || 0);
      rawMovs.push({
        fecha: oen?.oen_fecha ? new Date(oen.oen_fecha).toISOString() : new Date().toISOString(),
        sortRank: 1,
        tipo: "ENTRADA",
        documento: trimStr(oen?.oen_numero) || trimStr(det.id_orden_entrada),
        id_lote: idLote,
        lot_numero: trimStr(lote.lot_numero),
        entrada: qty,
        salida: 0,
        costo_unit: toNum(det.oed_costo_unit, 0),
        detalle: trimStr(oen?.oen_observacion) || "Entrada de mercaderia"
      });
    }

    // Salidas, Reservas Pendientes y Devoluciones por Cancelación
    let stockReservado = 0;
    let ventasAprobadas = 0;
    let devueltoCanceladas = 0;

    for (const det of ordenSalidaDetalle) {
      const idLote = trimStr(det.id_lote);
      const lote = loteMap.get(idLote);
      if (!lote) continue;
      const osa = osaMap.get(trimStr(det.id_orden_salida));
      const osaEstado = trimStr(osa?.osa_estado).toUpperCase();
      const osaNum = trimStr(osa?.osa_numero) || trimStr(det.id_orden_salida);
      const ped = osa?.id_pedido ? pedMap.get(trimStr(osa.id_pedido)) : null;
      const pedNum = trimStr(ped?.ped_numero);
      const docLabel = pedNum || osaNum;
      const fechaBase = osa?.osa_fecha ? new Date(osa.osa_fecha).toISOString() : new Date().toISOString();
      const qty = Number(det.osd_cantidad_despachada || 0);
      const precioUnit = toNum(det.osd_precio_unit, 0);

      if (osaEstado === "RESERVADO") {
        stockReservado += qty;
        rawMovs.push({
          fecha: fechaBase,
          sortRank: 3,
          tipo: "RESERVA_PENDIENTE",
          documento: docLabel,
          id_lote: idLote,
          lot_numero: trimStr(lote.lot_numero),
          entrada: 0,
          salida: qty,
          costo_unit: precioUnit,
          detalle: `Compra en PENDIENTE — stock reservado (${osaNum})`
        });
      } else if (osaEstado === "ANULADO") {
        devueltoCanceladas += qty;
        rawMovs.push({
          fecha: fechaBase,
          sortRank: 3,
          tipo: "RESERVA_INICIAL",
          documento: docLabel,
          id_lote: idLote,
          lot_numero: trimStr(lote.lot_numero),
          entrada: 0,
          salida: qty,
          costo_unit: precioUnit,
          detalle: `Apartado inicial antes de anular (${docLabel})`
        });

        const obsStr = trimStr(osa?.osa_observacion);
        const revMatch = obsStr.match(/REVERSO:(\S+)/);
        let revIso = new Date(new Date(fechaBase).getTime() + 1000).toISOString();
        if (revMatch) {
          const cand = revMatch[1].endsWith("Z") ? revMatch[1] : `${revMatch[1]}Z`;
          const dt = new Date(cand);
          if (!Number.isNaN(dt.getTime())) {
            revIso = dt.toISOString();
          }
        }
        rawMovs.push({
          fecha: revIso,
          sortRank: 4,
          tipo: "DEVOLUCION_CANCELADA",
          documento: docLabel,
          id_lote: idLote,
          lot_numero: trimStr(lote.lot_numero),
          entrada: qty,
          salida: 0,
          costo_unit: precioUnit,
          detalle: "Compra CANCELADA — inventario regresa al lote"
        });
      } else {
        ventasAprobadas += qty;
        rawMovs.push({
          fecha: fechaBase,
          sortRank: 3,
          tipo: "VENTA_APROBADA",
          documento: docLabel,
          id_lote: idLote,
          lot_numero: trimStr(lote.lot_numero),
          entrada: 0,
          salida: qty,
          costo_unit: precioUnit,
          detalle: `Venta aprobada — stock restado (${osaNum})`
        });
      }
    }

    // Ajustes de inventario (+/-)
    for (const det of ajusteDetalle) {
      const idLote = trimStr(det.id_lote);
      const lote = loteMap.get(idLote);
      if (!lote) continue;
      const aju = ajuMap.get(trimStr(det.id_ajuste));
      const ajuTipo = trimStr(aju?.aju_tipo).toUpperCase();
      const qty = Number(det.ade_cantidad || 0);
      const isIngreso = ajuTipo === "INGRESO";
      rawMovs.push({
        fecha: aju?.aju_fecha ? new Date(aju.aju_fecha).toISOString() : new Date().toISOString(),
        sortRank: 2,
        tipo: isIngreso ? "AJUSTE_INGRESO" : "AJUSTE_EGRESO",
        documento: trimStr(aju?.aju_numero) || trimStr(det.id_ajuste),
        id_lote: idLote,
        lot_numero: trimStr(lote.lot_numero),
        entrada: isIngreso ? qty : 0,
        salida: isIngreso ? 0 : qty,
        costo_unit: 0,
        detalle: `${trimStr(aju?.aju_motivo) || "AJUSTE"} — ${trimStr(det.ade_observacion || aju?.aju_observacion)}`
      });
    }

    rawMovs.sort((a, b) => {
      const cmp = a.fecha.localeCompare(b.fecha);
      return cmp !== 0 ? cmp : a.sortRank - b.sortRank;
    });

    const stockDisponible = filteredLotes.reduce((acc, l) => acc + Number(l.lot_stock_actual || 0), 0);
    const stockFisico = stockDisponible + stockReservado;
    const netoMovs = rawMovs.reduce((acc, m) => acc + (m.entrada - m.salida), 0);
    const saldoInicial = stockDisponible - netoMovs;

    let totalEntradas = 0;
    let totalSalidas = 0;
    let netoAjustes = 0;
    for (const m of rawMovs) {
      if (m.tipo === "ENTRADA") totalEntradas += m.entrada;
      else if (m.tipo === "VENTA_APROBADA" || m.tipo === "RESERVA_PENDIENTE" || m.tipo === "SALIDA") totalSalidas += m.salida;
      else if (m.tipo === "AJUSTE_INGRESO" || m.tipo === "AJUSTE_EGRESO") netoAjustes += m.entrada - m.salida;
    }

    let running = saldoInicial;
    const targetLoteObj = targetLote ? loteMap.get(targetLote) : null;
    const movimientos = [
      {
        fecha: null,
        tipo: "SALDO_INICIAL",
        documento: "-",
        id_lote: targetLote || "-",
        lot_numero: targetLoteObj ? trimStr(targetLoteObj.lot_numero) : "TODOS",
        entrada: saldoInicial > 0 ? saldoInicial : 0,
        salida: saldoInicial < 0 ? Math.abs(saldoInicial) : 0,
        costo_unit: 0,
        saldo: saldoInicial,
        detalle: "Saldo base previo a movimientos registrados"
      }
    ];

    for (const m of rawMovs) {
      running += m.entrada - m.salida;
      movimientos.push({
        fecha: m.fecha,
        tipo: m.tipo,
        documento: m.documento,
        id_lote: m.id_lote,
        lot_numero: m.lot_numero,
        entrada: m.entrada,
        salida: m.salida,
        costo_unit: m.costo_unit,
        saldo: running,
        detalle: m.detalle
      });
    }

    return {
      producto: {
        id_producto: trimStr(prod.id_producto),
        pro_codigo: trimStr(prod.pro_codigo),
        pro_nombre: trimStr(prod.pro_nombre),
        pro_precio: toNum(prod.pro_precio, 0)
      },
      stock_actual: stockDisponible,
      stock_disponible: stockDisponible,
      stock_reservado: stockReservado,
      stock_fisico: stockFisico,
      saldo_inicial: saldoInicial,
      totales: {
        entradas: totalEntradas,
        salidas: totalSalidas,
        ventas_aprobadas: ventasAprobadas,
        reservado_pendiente: stockReservado,
        devuelto_canceladas: devueltoCanceladas,
        ajustes: netoAjustes
      },
      movimientos
    };
  }

  async obtenerResumen() {
    const prisma = this.#db.getPrisma();
    const [productos, lotes, categorias] = await Promise.all([
      prisma.productos.findMany(),
      prisma.lotes.findMany(),
      prisma.categorias.findMany()
    ]);

    const catMap = new Map(categorias.map((c) => [trimStr(c.id_categoria), trimStr(c.cat_nombre)]));
    const lotesByProd = new Map();
    for (const l of lotes) {
      const idProd = trimStr(l.id_producto);
      if (!lotesByProd.has(idProd)) {
        lotesByProd.set(idProd, []);
      }
      lotesByProd.get(idProd).push(l);
    }

    const resumenProductos = [];
    for (const p of productos) {
      const idProd = trimStr(p.id_producto);
      const prodLotes = lotesByProd.get(idProd) || [];
      if (prodLotes.length === 0) continue;

      let stockTotal = 0;
      let vencidos = 0;
      let porVencer = 0;
      let vigentes = 0;
      let proximaCaducidad = null;

      for (const l of prodLotes) {
        stockTotal += Number(l.lot_stock_actual || 0);
        const cadIso = toIsoDate(l.lot_fecha_caducidad);
        if (cadIso && (!proximaCaducidad || cadIso < proximaCaducidad)) {
          proximaCaducidad = cadIso;
        }
        const { semaforo } = computeSemaforo(l.lot_fecha_caducidad);
        if (semaforo === "VENCIDO") vencidos += 1;
        else if (semaforo === "POR_VENCER") porVencer += 1;
        else vigentes += 1;
      }

      resumenProductos.push({
        id_producto: idProd,
        pro_codigo: trimStr(p.pro_codigo),
        pro_nombre: trimStr(p.pro_nombre),
        categoria: catMap.get(trimStr(p.id_categoria)) || "",
        stock_total: stockTotal,
        total_lotes: prodLotes.length,
        proxima_caducidad: proximaCaducidad,
        vencidos,
        por_vencer: porVencer,
        vigentes
      });
    }

    resumenProductos.sort((a, b) =>
      String(a.proxima_caducidad || "9999-12-31").localeCompare(String(b.proxima_caducidad || "9999-12-31"))
    );

    return {
      total: resumenProductos.length,
      productos: resumenProductos
    };
  }
}

module.exports = {
  InventarioRepository,
  getInventarioRepository: () => InventarioRepository.getInstance()
};
