const { getSupabaseSingleton } = require("../config/supabase.singleton");
const { HttpAppError } = require("../middlewares/error.middleware");
const { UsuarioFactory } = require("./usuario.model");
const { BaseTableRepository } = require("./base.repository");
const { getSedeRepository } = require("./sede.model");

const SINGLETON_TOKEN = Symbol("PedidoRepository");
const PEDIDO_COLUMNS = [
  "id_pedido",
  "id_cliente",
  "id_sede",
  "id_ciudad",
  "id_descuento",
  "ped_numero",
  "ped_direccion_entrega",
  "ped_latitud",
  "ped_longitud",
  "ped_fecha",
  "ped_subtotal",
  "ped_descuento",
  "ped_iva",
  "ped_total",
  "ped_estado"
];

function toNum(v) {
  if (v && typeof v === "object" && typeof v.toNumber === "function") {
    return v.toNumber();
  }
  return Number(v || 0);
}

class PedidoModel {
  constructor(props = {}) {
    this.id_pedido = String(props.id_pedido || "").trim();
    this.id = this.id_pedido;
    this.userId = String(props.userId || props.id_cliente || "").trim();
    this.id_cliente = this.userId;
    this.ped_numero = String(props.ped_numero || "").trim();
    this.cliente = String(props.cliente || "").trim();
    this.identificacion = String(props.identificacion || "").trim();
    this.fecha = props.fecha || null;
    this.createdAt = props.createdAt || props.fecha || null;
    this.estado = String(props.estado || "").trim();
    this.osa_estado = String(props.osa_estado || "").trim();
    this.subtotal = toNum(props.subtotal);
    this.descuento = toNum(props.descuento);
    this.iva = toNum(props.iva);
    this.total = toNum(props.total);
    this.fac_numero = String(props.fac_numero || "").trim();
    this.detalles = Array.isArray(props.detalles) ? props.detalles : [];
  }

  toDTO() {
    return {
      id: this.id,
      id_pedido: this.id_pedido,
      userId: this.userId,
      ped_numero: this.ped_numero,
      cliente: this.cliente,
      identificacion: this.identificacion,
      fecha: this.fecha,
      createdAt: this.createdAt,
      estado: this.estado,
      osa_estado: this.osa_estado,
      subtotal: this.subtotal,
      descuento: this.descuento,
      iva: this.iva,
      total: this.total,
      fac_numero: this.fac_numero,
      detalles: this.detalles
    };
  }
}

class PedidoFactory {
  static createFromDbRow(row = {}) {
    if ("Clientes" in row || "Facturas" in row || "PedidoDetalle" in row) {
      return PedidoFactory.mapPrismaRelationRow(row);
    }
    return new PedidoModel({
      id_pedido: row.id_pedido,
      userId: row.id_cliente,
      ped_numero: row.ped_numero,
      cliente: row.cliente,
      identificacion: row.identificacion,
      fecha: row.ped_fecha,
      createdAt: row.ped_fecha,
      estado: row.ped_estado,
      subtotal: row.ped_subtotal,
      descuento: row.ped_descuento,
      iva: row.ped_iva,
      total: row.ped_total,
      fac_numero: row.fac_numero
    });
  }

  static mapPrismaRelationRow(row = {}) {
    const cli = Array.isArray(row.Clientes) ? row.Clientes[0] : row.Clientes;
    const fac = Array.isArray(row.Facturas) ? row.Facturas[0] : row.Facturas;
    const rawDetalles = Array.isArray(row.PedidoDetalle)
      ? row.PedidoDetalle
      : (row.PedidoDetalle ? [row.PedidoDetalle] : []);
    const detalles = rawDetalles.map((det) => ({
      id_pedido: String(det.id_pedido || row.id_pedido || "").trim(),
      id_producto: String(det.id_producto || "").trim(),
      productoNombre: String(det.Productos?.pro_nombre || "").trim(),
      cantidad: Number(det.pde_cantidad || 0),
      precioUnitario: toNum(det.pde_precio_unit),
      subtotal: toNum(det.pde_subtotal)
    }));
    const cliente = `${String(cli?.cli_nombres || "").trim()} ${String(cli?.cli_apellidos || "").trim()}`.trim();
    return new PedidoModel({
      id_pedido: row.id_pedido,
      userId: String(row.id_cliente || cli?.id_cliente || "").trim(),
      ped_numero: row.ped_numero,
      cliente,
      identificacion: cli?.cli_ci_ruc || "",
      fecha: row.ped_fecha,
      createdAt: row.ped_fecha,
      estado: row.ped_estado,
      subtotal: row.ped_subtotal,
      descuento: row.ped_descuento,
      iva: row.ped_iva,
      total: row.ped_total,
      fac_numero: fac?.fac_numero || "",
      detalles
    });
  }

  static generateSriAuthorization(pedNumberStr = "0000001") {
    const now = new Date();
    const ddmmyyyy =
      String(now.getDate()).padStart(2, "0") +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getFullYear());
    const base = `${ddmmyyyy}0117924839100012001001${String(pedNumberStr).padStart(9, "0")}123456781`;
    return base.padEnd(49, "7").slice(0, 49);
  }
}

/**
 * Patron Singleton + Repository con Prisma ORM para Pedidos, Cupones
 * y Checkout transaccional ACID (sin SQL crudo).
 */
class PedidoRepository {
  static #instance = null;
  #db;
  #tableRepo;

  constructor(token) {
    if (token !== SINGLETON_TOKEN) {
      throw new Error("Use PedidoRepository.getInstance().");
    }
    this.#db = getSupabaseSingleton();
    this.#tableRepo = new BaseTableRepository({
      tableName: "Pedidos",
      pkColumns: ["id_pedido"],
      prefix: "PED",
      statusColumn: "ped_estado",
      columns: PEDIDO_COLUMNS,
      defaultOrder: "id_pedido"
    });
  }

  static getInstance() {
    if (!PedidoRepository.#instance) {
      PedidoRepository.#instance = new PedidoRepository(SINGLETON_TOKEN);
    }
    return PedidoRepository.#instance;
  }

  findAll(filters = {}) {
    return this.#tableRepo.findAll(filters);
  }

  create(payload = {}) {
    return this.#tableRepo.create(payload);
  }

  update(id, patch = {}) {
    return this.#tableRepo.update(id, patch);
  }

  remove(id, opts = {}) {
    return this.#tableRepo.remove(id, opts);
  }

  async findRecent(limit = 50) {
    const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
    const prisma = this.#db.getPrisma();
    const [rows, productos, ordenesSalida] = await Promise.all([
      prisma.pedidos.findMany({
        include: {
          Clientes: true,
          Facturas: true,
          PedidoDetalle: true
        },
        orderBy: { ped_fecha: "desc" },
        take: safeLimit
      }),
      prisma.productos.findMany(),
      prisma.ordenesSalida.findMany()
    ]);

    const prodMap = new Map(
      (Array.isArray(productos) ? productos : []).map((p) => [
        String(p.id_producto || "").trim(),
        String(p.pro_nombre || "").trim()
      ])
    );
    const osaByPedido = new Map();
    for (const o of Array.isArray(ordenesSalida) ? ordenesSalida : []) {
      const idPed = String(o.id_pedido || "").trim();
      if (idPed && !osaByPedido.has(idPed)) {
        osaByPedido.set(idPed, String(o.osa_estado || "").trim());
      }
    }

    return (Array.isArray(rows) ? rows : []).map((row) => {
      const dto = PedidoFactory.mapPrismaRelationRow(row).toDTO();
      dto.osa_estado = osaByPedido.get(dto.id_pedido) || "";
      dto.detalles = (dto.detalles || []).map((d) => ({
        ...d,
        productoNombre: d.productoNombre || prodMap.get(String(d.id_producto || "").trim()) || d.id_producto
      }));
      return dto;
    });
  }

  async findByUser(userContext = {}) {
    const targetCliente = String(userContext.id_cliente || "").trim();
    const targetUsuario = String(userContext.id_usuario || userContext.id || "").trim();
    const targetEmail = String(userContext.email || userContext.correo || "").trim().toLowerCase();

    const prisma = this.#db.getPrisma();
    const rows = await prisma.pedidos.findMany({
      include: {
        Clientes: {
          include: { Usuarios: true }
        },
        Facturas: true,
        PedidoDetalle: true
      },
      orderBy: { ped_fecha: "desc" }
    });

    const filtered = (Array.isArray(rows) ? rows : []).filter((row) => {
      const pedCliId = String(row.id_cliente || "").trim();
      const cli = Array.isArray(row.Clientes) ? row.Clientes[0] : row.Clientes;
      const cliUsuId = String(cli?.id_usuario || "").trim();
      const cliEmail = String(cli?.Usuarios?.usu_email || "").trim().toLowerCase();
      return (
        (targetCliente && pedCliId === targetCliente) ||
        (targetUsuario && cliUsuId === targetUsuario) ||
        (targetEmail && cliEmail === targetEmail)
      );
    });

    return filtered.map((row) => PedidoFactory.mapPrismaRelationRow(row).toDTO());
  }

  async findById(idPedido) {
    const prisma = this.#db.getPrisma();
    const targetId = String(idPedido || "").trim();
    const [row, productos, ordenesSalida] = await Promise.all([
      prisma.pedidos.findFirst({
        where: { id_pedido: targetId },
        include: {
          Clientes: true,
          Facturas: true,
          PedidoDetalle: true
        }
      }),
      prisma.productos.findMany(),
      prisma.ordenesSalida.findMany()
    ]);
    if (!row) {
      throw new HttpAppError(404, `Pedido '${idPedido}' no encontrado.`, "ORDER_NOT_FOUND");
    }
    const prodMap = new Map(
      (Array.isArray(productos) ? productos : []).map((p) => [
        String(p.id_producto || "").trim(),
        String(p.pro_nombre || "").trim()
      ])
    );
    const osaMatch = (Array.isArray(ordenesSalida) ? ordenesSalida : []).find(
      (o) => String(o.id_pedido || "").trim() === targetId
    );
    const dto = PedidoFactory.mapPrismaRelationRow(row).toDTO();
    dto.osa_estado = osaMatch ? String(osaMatch.osa_estado || "").trim() : "";
    dto.detalles = (dto.detalles || []).map((d) => ({
      ...d,
      productoNombre: d.productoNombre || prodMap.get(String(d.id_producto || "").trim()) || d.id_producto
    }));
    return dto;
  }

  async findSedes() {
    return getSedeRepository().findAll();
  }

  async findCuponActivo(codigo) {
    const prisma = this.#db.getPrisma();
    const rows = await prisma.descuentos.findMany();
    const target = String(codigo || "").trim().toUpperCase();
    const now = Date.now();

    const matched = (Array.isArray(rows) ? rows : []).find((d) => {
      const code = String(d.des_codigo || "").trim().toUpperCase();
      const estado = String(d.des_estado || "").trim();
      const start = new Date(d.des_fecha_inicio).getTime();
      const end = new Date(d.des_fecha_fin).getTime();
      const usoActual = Number(d.des_uso_actual || 0);
      const usoMaximo = Number(d.des_uso_maximo || 0);
      return code === target && estado === "ACTIVO" && start <= now && now <= end && usoActual < usoMaximo;
    });

    if (!matched) {
      throw new HttpAppError(404, "Cupon invalido, expirado o sin usos disponibles.", "COUPON_INVALID");
    }

    return {
      id_descuento: String(matched.id_descuento || "").trim(),
      codigo: String(matched.des_codigo || "").trim(),
      nombre: String(matched.des_nombre || "").trim(),
      tipo: String(matched.des_tipo || "").trim(),
      valor: toNum(matched.des_valor)
    };
  }

  async createCheckoutTransaction({ cliente, items, cupon = null, envio = {}, estadoInicial = "PAGADO" }) {
    const estadoUpper = String(estadoInicial || "PAGADO").trim().toUpperCase();
    const isPendiente = estadoUpper === "PENDIENTE";
    const pedEstado = isPendiente ? "PENDIENTE" : "PAGADO";
    const osaEstado = isPendiente ? "RESERVADO" : "DESPACHADO";
    const pagEstado = isPendiente ? "PENDIENTE" : "APROBADO";
    const facEstado = isPendiente ? "PENDIENTE" : "EMITIDA";
    const envEstado = isPendiente ? "PENDIENTE" : "DESPACHADO";

    return this.#db.withTransaction(async (tx) => {
      const direccion = String(envio.direccion || cliente.direccion || "Quito, Ecuador").slice(0, 150);
      const targetCi = String(cliente.cedulaRuc || "").trim();
      const targetEmail = String(cliente.correo || "").trim().toLowerCase();

      const existingClients = await tx.clientes.findMany({
        include: { Usuarios: true }
      });
      const foundCli = (Array.isArray(existingClients) ? existingClients : []).find((c) => {
        const ciMatch = String(c.cli_ci_ruc || "").trim() === targetCi;
        const emailMatch = String(c.Usuarios?.usu_email || "").trim().toLowerCase() === targetEmail;
        return ciMatch || emailMatch;
      });

      let idCliente = foundCli ? String(foundCli.id_cliente).trim() : "";
      if (!idCliente) {
        const idUsuario = await this.#db.nextId(tx, "Usuarios", "id_usuario", "USU");
        await tx.usuarios.create({
          data: {
            id_usuario: idUsuario,
            id_rol: "ROL0000003",
            usu_nombre: String(cliente.nombre).slice(0, 50),
            usu_email: targetEmail.slice(0, 100),
            usu_clave_hash: "pbkdf2_sha256$2026$dermakor",
            usu_estado: "ACTIVO"
          }
        });

        idCliente = await this.#db.nextId(tx, "Clientes", "id_cliente", "CLI");
        const { cli_nombres, cli_apellidos } = UsuarioFactory.splitFullName(cliente.nombre);
        await tx.clientes.create({
          data: {
            id_cliente: idCliente,
            id_usuario: idUsuario,
            id_ciudad: "CIU0000001",
            cli_ci_ruc: targetCi.slice(0, 13),
            cli_nombres: cli_nombres.slice(0, 60),
            cli_apellidos: cli_apellidos.slice(0, 60),
            cli_telefono: String(cliente.telefono || "0990000000").slice(0, 15),
            cli_direccion: direccion.slice(0, 120)
          }
        });
      }

      let cuponData = null;
      if (cupon?.codigo) {
        try {
          const foundCup = await this.findCuponActivo(cupon.codigo);
          cuponData = {
            id_descuento: foundCup.id_descuento,
            des_tipo: foundCup.tipo,
            des_valor: foundCup.valor
          };
        } catch (_err) {
          cuponData = null;
        }
      }

      const catalogRows = await tx.productos.findMany();
      const groupedMap = new Map();
      for (const rawItem of items) {
        const refId = String(rawItem.id_producto_db || rawItem.id_producto || rawItem.productoId || rawItem.id || "").trim();
        const matchedProd = (Array.isArray(catalogRows) ? catalogRows : []).find(
          (p) =>
            String(p.id_producto || "").trim() === refId ||
            String(p.pro_descripcion || "").includes(`"slug": "${refId}"`) ||
            String(p.pro_descripcion || "").includes(`"slug":"${refId}"`)
        );
        if (!matchedProd) {
          throw new HttpAppError(400, `Producto '${refId}' no existe en catalogo activo.`, "PRODUCT_NOT_FOUND");
        }
        const resolvedId = String(matchedProd.id_producto).trim();
        // Seguridad OWASP: priorizar el precio oficial en BD sobre cualquier valor enviado por el cliente
        const dbPrice = toNum(matchedProd.pro_precio);
        const unitPrice = dbPrice > 0 ? dbPrice : toNum(rawItem.precio ?? rawItem.precioUnitario ?? 0);
        const qty = Number.parseInt(rawItem.cantidad, 10);

        if (groupedMap.has(resolvedId)) {
          groupedMap.get(resolvedId).cantidad += qty;
        } else {
          groupedMap.set(resolvedId, { id_producto: resolvedId, cantidad: qty, precioUnit: unitPrice });
        }
      }

      let subtotalAccum = 0;
      for (const item of groupedMap.values()) {
        subtotalAccum += Number((item.cantidad * item.precioUnit).toFixed(2));
      }
      const totals = this.#computeTotals(subtotalAccum, cuponData);

      const idSede = String(envio.id_sede || "SED0000001").trim();
      const idPedido = await this.#db.nextId(tx, "Pedidos", "id_pedido", "PED");
      const pedSeq = idPedido.replace("PED", "");
      const pedNumero = `PED-2026-${pedSeq.slice(-4)}`;

      await tx.pedidos.create({
        data: {
          id_pedido: idPedido,
          id_cliente: idCliente,
          id_sede: idSede,
          id_ciudad: "CIU0000001",
          id_descuento: cuponData?.id_descuento || null,
          ped_numero: pedNumero,
          ped_direccion_entrega: direccion,
          ped_latitud: -0.18659,
          ped_longitud: -78.48412,
          ped_subtotal: totals.subtotal,
          ped_descuento: totals.discountAmt,
          ped_iva: totals.ivaAmt,
          ped_total: totals.finalTotal,
          ped_estado: pedEstado
        }
      });

      const idOrdenSalida = await this.#db.nextId(tx, "OrdenesSalida", "id_orden_salida", "OSA");
      const osaNumero = `OSA-2026-${idOrdenSalida.replace("OSA", "").slice(-4)}`;
      const osaObs = (isPendiente ? `Reserva pendiente pedido ${pedNumero}` : `Despacho aprobado pedido ${pedNumero}`).slice(0, 150);
      await tx.ordenesSalida.create({
        data: {
          id_orden_salida: idOrdenSalida,
          id_pedido: idPedido,
          id_sede: idSede,
          id_empleado: "EMP0000001",
          osa_numero: osaNumero,
          osa_observacion: osaObs,
          osa_estado: osaEstado
        }
      });

      for (const item of groupedMap.values()) {
        const lineSubtotal = Number((item.cantidad * item.precioUnit).toFixed(2));
        await tx.pedidoDetalle.create({
          data: {
            id_pedido: idPedido,
            id_producto: item.id_producto,
            pde_cantidad: item.cantidad,
            pde_precio_unit: item.precioUnit,
            pde_subtotal: lineSubtotal
          }
        });

        const allLotes = await tx.lotes.findMany({
          where: { id_producto: item.id_producto }
        });
        const activeLotes = (Array.isArray(allLotes) ? allLotes : [])
          .filter((l) => {
            const est = String(l.lot_estado || "").trim().toUpperCase();
            return (est === "ACTIVO" || est === "DISPONIBLE") && Number(l.lot_stock_actual || 0) > 0;
          })
          .sort((a, b) => new Date(a.lot_fecha_caducidad).getTime() - new Date(b.lot_fecha_caducidad).getTime());

        const totalDisp = activeLotes.reduce((acc, l) => acc + Number(l.lot_stock_actual || 0), 0);
        if (totalDisp < item.cantidad) {
          const prodRow = (Array.isArray(catalogRows) ? catalogRows : []).find(
            (p) => String(p.id_producto || "").trim() === item.id_producto
          );
          const prodName = String(prodRow?.pro_nombre || item.id_producto).trim();
          throw new HttpAppError(
            409,
            `Stock disponible insuficiente para '${prodName}' (disponible: ${totalDisp}, solicitado: ${item.cantidad}).`,
            "INSUFFICIENT_STOCK"
          );
        }

        let remaining = item.cantidad;
        for (const lote of activeLotes) {
          if (remaining <= 0) break;
          const idLote = String(lote.id_lote).trim();
          const lotStock = Number(lote.lot_stock_actual || 0);
          const take = Math.min(remaining, lotStock);
          if (take <= 0) continue;

          await tx.lotes.update({
            where: { id_lote: idLote },
            data: { lot_stock_actual: { decrement: take } }
          });
          await tx.ordenSalidaDetalle.create({
            data: {
              id_orden_salida: idOrdenSalida,
              id_lote: idLote,
              osd_cantidad_despachada: take,
              osd_precio_unit: item.precioUnit,
              osd_subtotal: Number((take * item.precioUnit).toFixed(2))
            }
          });
          remaining -= take;
        }
      }

      if (cuponData) {
        await tx.descuentos.update({
          where: { id_descuento: cuponData.id_descuento },
          data: { des_uso_actual: { increment: 1 } }
        });
      }

      const idPago = await this.#db.nextId(tx, "Pagos", "id_pago", "PAG");
      await tx.pagos.create({
        data: {
          id_pago: idPago,
          id_pedido: idPedido,
          pag_metodo: "TARJETA_WEB",
          pag_monto: totals.finalTotal,
          pag_referencia: `PAY-REST-${pedSeq.slice(-6)}`,
          pag_estado: pagEstado
        }
      });

      const idFactura = await this.#db.nextId(tx, "Facturas", "id_factura", "FAC");
      const facNumero = `001-001-${pedSeq.padStart(9, "0").slice(-9)}`;
      const facAutSri = PedidoFactory.generateSriAuthorization(pedSeq);
      await tx.facturas.create({
        data: {
          id_factura: idFactura,
          id_pedido: idPedido,
          fac_numero: facNumero,
          fac_autorizacion_sri: facAutSri,
          fac_total: totals.finalTotal,
          fac_estado: facEstado
        }
      });

      const idEnvio = await this.#db.nextId(tx, "Envios", "id_envio", "ENV");
      const guiaTracking = `DK-QTO-${pedSeq.slice(-6)}`;
      await tx.envios.create({
        data: {
          id_envio: idEnvio,
          id_orden_salida: idOrdenSalida,
          env_direccion_entrega: direccion,
          env_transportista: "Servientrega Ecuador",
          env_numero_guia: guiaTracking,
          env_estado: envEstado
        }
      });

      return {
        ok: true,
        id: idPedido,
        id_pedido: idPedido,
        userId: idCliente,
        ped_numero: pedNumero,
        estado: pedEstado,
        osa_estado: osaEstado,
        id_factura: idFactura,
        fac_numero: facNumero,
        fac_autorizacion_sri: facAutSri,
        guia_tracking: guiaTracking,
        subtotal: totals.subtotal,
        descuento: totals.discountAmt,
        iva: totals.ivaAmt,
        total: totals.finalTotal,
        fac_total: totals.finalTotal,
        createdAt: new Date().toISOString(),
        detalles: Array.from(groupedMap.values()).map((it) => ({
          id_pedido: idPedido,
          id_producto: it.id_producto,
          cantidad: it.cantidad,
          precioUnitario: it.precioUnit,
          subtotal: Number((it.cantidad * it.precioUnit).toFixed(2))
        }))
      };
    });
  }

  async aprobarPedido(idPedidoRaw) {
    const idPedido = String(idPedidoRaw || "").trim();
    if (!idPedido) {
      throw new HttpAppError(400, "id_pedido es obligatorio.", "VALIDATION_ID");
    }

    const prisma = this.#db.getPrisma();
    const ped = await prisma.pedidos.findFirst({ where: { id_pedido: idPedido } });
    if (!ped) {
      throw new HttpAppError(404, `Pedido '${idPedido}' no encontrado.`, "ORDER_NOT_FOUND");
    }
    const estadoActual = String(ped.ped_estado || "").trim().toUpperCase();
    if (estadoActual !== "PENDIENTE") {
      throw new HttpAppError(
        409,
        `Solo se pueden aprobar pedidos en estado PENDIENTE (actual: ${estadoActual}).`,
        "ORDER_INVALID_STATE"
      );
    }

    await this.#db.withTransaction(async (tx) => {
      await tx.pedidos.update({
        where: { id_pedido: idPedido },
        data: { ped_estado: "PAGADO" }
      });

      const [ordenes, pagos, facturas, envios] = await Promise.all([
        tx.ordenesSalida.findMany(),
        tx.pagos.findMany(),
        tx.facturas.findMany(),
        tx.envios.findMany()
      ]);

      const pedNum = String(ped.ped_numero || idPedido).trim();
      const targetOrdenes = (Array.isArray(ordenes) ? ordenes : []).filter(
        (o) => String(o.id_pedido || "").trim() === idPedido
      );
      const ordenIds = new Set();

      for (const osa of targetOrdenes) {
        const idOsa = String(osa.id_orden_salida || "").trim();
        ordenIds.add(idOsa);
        await tx.ordenesSalida.update({
          where: { id_orden_salida: idOsa },
          data: {
            osa_estado: "DESPACHADO",
            osa_observacion: `Venta aprobada ${pedNum}`.slice(0, 150)
          }
        });
      }

      for (const p of Array.isArray(pagos) ? pagos : []) {
        if (String(p.id_pedido || "").trim() === idPedido) {
          await tx.pagos.update({
            where: { id_pago: String(p.id_pago).trim() },
            data: { pag_estado: "APROBADO" }
          });
        }
      }

      for (const f of Array.isArray(facturas) ? facturas : []) {
        if (String(f.id_pedido || "").trim() === idPedido) {
          await tx.facturas.update({
            where: { id_factura: String(f.id_factura).trim() },
            data: { fac_estado: "EMITIDA" }
          });
        }
      }

      for (const e of Array.isArray(envios) ? envios : []) {
        if (ordenIds.has(String(e.id_orden_salida || "").trim())) {
          await tx.envios.update({
            where: { id_envio: String(e.id_envio).trim() },
            data: { env_estado: "DESPACHADO" }
          });
        }
      }
    });

    return this.findById(idPedido);
  }

  async cancelarPedido(idPedidoRaw, motivo = "") {
    const idPedido = String(idPedidoRaw || "").trim();
    if (!idPedido) {
      throw new HttpAppError(400, "id_pedido es obligatorio.", "VALIDATION_ID");
    }

    const prisma = this.#db.getPrisma();
    const ped = await prisma.pedidos.findFirst({ where: { id_pedido: idPedido } });
    if (!ped) {
      throw new HttpAppError(404, `Pedido '${idPedido}' no encontrado.`, "ORDER_NOT_FOUND");
    }
    const estadoActual = String(ped.ped_estado || "").trim().toUpperCase();
    if (estadoActual === "CANCELADO" || estadoActual === "ANULADO") {
      throw new HttpAppError(
        409,
        `El pedido '${idPedido}' ya se encuentra ${estadoActual}.`,
        "ORDER_ALREADY_CANCELLED"
      );
    }

    let unidadesDevueltas = 0;

    await this.#db.withTransaction(async (tx) => {
      const [ordenes, osDetalles, pagos, facturas, envios] = await Promise.all([
        tx.ordenesSalida.findMany(),
        tx.ordenSalidaDetalle.findMany(),
        tx.pagos.findMany(),
        tx.facturas.findMany(),
        tx.envios.findMany()
      ]);

      const targetOrdenes = (Array.isArray(ordenes) ? ordenes : []).filter(
        (o) => String(o.id_pedido || "").trim() === idPedido
      );
      const ordenIds = new Set(targetOrdenes.map((o) => String(o.id_orden_salida || "").trim()));

      for (const det of Array.isArray(osDetalles) ? osDetalles : []) {
        const idOsa = String(det.id_orden_salida || "").trim();
        if (!ordenIds.has(idOsa)) continue;
        const idLote = String(det.id_lote || "").trim();
        const qty = Number(det.osd_cantidad_despachada || 0);
        if (idLote && qty > 0) {
          await tx.lotes.update({
            where: { id_lote: idLote },
            data: { lot_stock_actual: { increment: qty } }
          });
          unidadesDevueltas += qty;
        }
      }

      const reversoIso = new Date().toISOString().slice(0, 19);
      const cleanMotivo = String(motivo || "").trim();
      const obsCancel = (`Cancelado${cleanMotivo ? ": " + cleanMotivo : ""} | REVERSO:${reversoIso}`).slice(0, 150);

      for (const osa of targetOrdenes) {
        await tx.ordenesSalida.update({
          where: { id_orden_salida: String(osa.id_orden_salida).trim() },
          data: {
            osa_estado: "ANULADO",
            osa_observacion: obsCancel
          }
        });
      }

      await tx.pedidos.update({
        where: { id_pedido: idPedido },
        data: { ped_estado: "CANCELADO" }
      });

      for (const p of Array.isArray(pagos) ? pagos : []) {
        if (String(p.id_pedido || "").trim() === idPedido) {
          await tx.pagos.update({
            where: { id_pago: String(p.id_pago).trim() },
            data: { pag_estado: "ANULADO" }
          });
        }
      }

      for (const f of Array.isArray(facturas) ? facturas : []) {
        if (String(f.id_pedido || "").trim() === idPedido) {
          await tx.facturas.update({
            where: { id_factura: String(f.id_factura).trim() },
            data: { fac_estado: "ANULADA" }
          });
        }
      }

      for (const e of Array.isArray(envios) ? envios : []) {
        if (ordenIds.has(String(e.id_orden_salida || "").trim())) {
          await tx.envios.update({
            where: { id_envio: String(e.id_envio).trim() },
            data: { env_estado: "CANCELADO" }
          });
        }
      }
    });

    return {
      pedido: await this.findById(idPedido),
      unidades_devueltas: unidadesDevueltas
    };
  }

  #computeTotals(subtotalAccum, cuponData) {
    let discountAmt = 0;
    if (cuponData) {
      const val = toNum(cuponData.des_valor);
      discountAmt = String(cuponData.des_tipo || "").trim() === "PORCENTAJE"
        ? Number((subtotalAccum * (val / 100)).toFixed(2))
        : Math.min(subtotalAccum, val);
    }
    const netBase = Math.max(0, subtotalAccum - discountAmt);
    const ivaAmt = Number((netBase * 0.15).toFixed(2));
    const finalTotal = Number((netBase + ivaAmt).toFixed(2));
    return {
      subtotal: Number(subtotalAccum.toFixed(2)),
      discountAmt: Number(discountAmt.toFixed(2)),
      ivaAmt,
      finalTotal
    };
  }
}

module.exports = {
  PedidoModel,
  PedidoFactory,
  PedidoRepository,
  getPedidoRepository: () => PedidoRepository.getInstance()
};
