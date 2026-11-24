const express = require("express");
const { getSupabaseSingleton } = require("../config/supabase.singleton");
const { ModelFactory } = require("../models/model.factory");
const { ENTITIES } = require("../config/entity.metadata");
const { loggerMiddleware } = require("../middlewares/logger.middleware");
const { sanitizeMiddleware } = require("../middlewares/sanitize.middleware");
const { paginationMiddleware } = require("../middlewares/pagination.middleware");
const { hashMiddleware } = require("../middlewares/hash.middleware");
const { authenticateJwt, authorizeRoles } = require("../middlewares/auth.middleware");
const {
  validateCheckoutChain,
  validateIdMiddleware
} = require("../middlewares/validate.middleware");

const pedidoController = require("../controllers/pedido.controller");
const productoRoutes = require("./producto.routes");
const authRoutes = require("./auth.routes");
const pedidoRoutes = require("./pedido.routes");
const cuponRoutes = require("./cupon.routes");
const sedeRoutes = require("./sede.routes");
const inventarioRoutes = require("./inventario.routes");

const ajusteDetalleController = require("../controllers/ajusteDetalle.controller");
const ajusteInventarioController = require("../controllers/ajusteInventario.controller");
const carritoDetalleController = require("../controllers/carritoDetalle.controller");
const carritoController = require("../controllers/carrito.controller");
const categoriaController = require("../controllers/categoria.controller");
const ciudadController = require("../controllers/ciudad.controller");
const clienteController = require("../controllers/cliente.controller");
const compraDetalleController = require("../controllers/compraDetalle.controller");
const compraController = require("../controllers/compra.controller");
const departamentoController = require("../controllers/departamento.controller");
const descuentoController = require("../controllers/descuento.controller");
const empleadoController = require("../controllers/empleado.controller");
const envioController = require("../controllers/envio.controller");
const facturaController = require("../controllers/factura.controller");
const logController = require("../controllers/log.controller");
const loteController = require("../controllers/lote.controller");
const ordenEntradaDetalleController = require("../controllers/ordenEntradaDetalle.controller");
const ordenSalidaDetalleController = require("../controllers/ordenSalidaDetalle.controller");
const ordenEntradaController = require("../controllers/ordenEntrada.controller");
const ordenSalidaController = require("../controllers/ordenSalida.controller");
const pagoController = require("../controllers/pago.controller");
const paisController = require("../controllers/pais.controller");
const pedidoDetalleController = require("../controllers/pedidoDetalle.controller");
const productoImagenController = require("../controllers/productoImagen.controller");
const proveedorController = require("../controllers/proveedor.controller");
const rolController = require("../controllers/rol.controller");
const usuarioController = require("../controllers/usuario.controller");

function createEntityRouter(controller, { publicRead = false, readRoles = ["admin"] } = {}) {
  const subRouter = express.Router();
  const readGuards = publicRead ? [] : [authenticateJwt, authorizeRoles(...readRoles)];
  const writeGuards = [authenticateJwt, authorizeRoles("admin")];

  subRouter.get("/", [loggerMiddleware, sanitizeMiddleware, ...readGuards, paginationMiddleware], controller.getAll);
  subRouter.get("/:id", [loggerMiddleware, sanitizeMiddleware, ...readGuards, validateIdMiddleware], controller.getById);
  subRouter.post("/", [loggerMiddleware, sanitizeMiddleware, ...writeGuards, hashMiddleware], controller.create);
  subRouter.put("/:id", [loggerMiddleware, sanitizeMiddleware, ...writeGuards, validateIdMiddleware, hashMiddleware], controller.update);
  subRouter.patch("/:id", [loggerMiddleware, sanitizeMiddleware, ...writeGuards, validateIdMiddleware, hashMiddleware], controller.update);
  subRouter.delete("/:id", [loggerMiddleware, sanitizeMiddleware, ...writeGuards, validateIdMiddleware], controller.delete);
  return subRouter;
}

const router = express.Router();

router.get("/status", async (_req, res, next) => {
  try {
    const dbSingleton = getSupabaseSingleton();
    const health = await dbSingleton.healthCheck();
    return res.status(200).json({
      ok: true,
      db: health.db || "postgres",
      orm: health.orm || "prisma",
      transport: health.transport || "prisma-postgresql",
      total_productos: Number(health.total_productos || 0),
      total_tablas_mvc: ModelFactory.getRegisteredTables().length,
      arquitectura: "Full Stack MVC N-Capas",
      seguridad: ["JWT", "RBAC (admin/user)", "bcrypt", "CORS", "Helmet", "Sanitize", "Chain of Responsibility"],
      patrones: ["Singleton", "Factory", "Repository", "Chain of Responsibility"],
      instancia_db: dbSingleton.getInstanceId()
    });
  } catch (error) {
    return next(error);
  }
});

// Metadatos dinamicos de las 30 tablas Prisma para el CRUD del Panel Admin
router.get(
  "/meta/entidades",
  [loggerMiddleware, authenticateJwt, authorizeRoles("admin")],
  (_req, res) => {
    const entidades = ENTITIES.map((entity) => {
      let prefix = null;
      try {
        const repo = ModelFactory.getRepository(entity.slug);
        prefix = repo?.prefix || null;
      } catch (_err) {
        prefix = null;
      }
      return {
        ...entity,
        prefix
      };
    });
    return res.status(200).json({ ok: true, total: entidades.length, entidades });
  }
);

// Rutas especializadas
router.use("/productos", productoRoutes);
router.use("/sedes", sedeRoutes);
router.use("/pedidos", pedidoRoutes);
router.use("/inventario", inventarioRoutes);
router.use("/cupon", cuponRoutes);
router.use("/cupones", cuponRoutes);
router.post(
  "/checkout",
  [loggerMiddleware, sanitizeMiddleware, authenticateJwt, authorizeRoles("user", "admin"), validateCheckoutChain],
  pedidoController.procesarCheckout
);

// Tablas auxiliares de lectura publica para catalogo + escritura admin
router.use("/categorias", createEntityRouter(categoriaController, { publicRead: true }));
router.use("/lotes", createEntityRouter(loteController, { publicRead: true }));
router.use("/paises", createEntityRouter(paisController, { publicRead: true }));
router.use("/ciudades", createEntityRouter(ciudadController, { publicRead: true }));
router.use("/producto-imagenes", createEntityRouter(productoImagenController, { publicRead: true }));

// Carrito autenticado (user / admin)
router.use("/carritos", createEntityRouter(carritoController, { readRoles: ["user", "admin"] }));
router.use("/carrito-detalle", createEntityRouter(carritoDetalleController, { readRoles: ["user", "admin"] }));

// Tablas administrativas protegidas (solo rol admin)
router.use("/clientes", createEntityRouter(clienteController));
router.use("/usuarios", createEntityRouter(usuarioController));
router.use("/roles", createEntityRouter(rolController));
router.use("/departamentos", createEntityRouter(departamentoController));
router.use("/empleados", createEntityRouter(empleadoController));
router.use("/proveedores", createEntityRouter(proveedorController));
router.use("/compras", createEntityRouter(compraController));
router.use("/compra-detalle", createEntityRouter(compraDetalleController));
router.use("/ordenes-entrada", createEntityRouter(ordenEntradaController));
router.use("/orden-entrada-detalle", createEntityRouter(ordenEntradaDetalleController));
router.use("/ordenes-salida", createEntityRouter(ordenSalidaController));
router.use("/orden-salida-detalle", createEntityRouter(ordenSalidaDetalleController));
router.use("/ajustes-inventario", createEntityRouter(ajusteInventarioController));
router.use("/ajuste-detalle", createEntityRouter(ajusteDetalleController));
router.use("/descuentos", createEntityRouter(descuentoController));
router.use("/pedido-detalle", createEntityRouter(pedidoDetalleController));
router.use("/pagos", createEntityRouter(pagoController));
router.use("/facturas", createEntityRouter(facturaController));
router.use("/envios", createEntityRouter(envioController));
router.use("/logs", createEntityRouter(logController));

router.use("/", authRoutes);

module.exports = router;
