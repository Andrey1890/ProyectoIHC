const { getProductoRepository } = require("./producto.repository");
const { ProductoFactory } = require("./producto.model");
const { getUsuarioRepository, UsuarioFactory } = require("./usuario.model");
const { getPedidoRepository, PedidoFactory } = require("./pedido.model");
const { AjusteDetalleFactory, getAjusteDetalleRepository } = require("./ajusteDetalle.model");
const { AjusteInventarioFactory, getAjusteInventarioRepository } = require("./ajusteInventario.model");
const { CarritoDetalleFactory, getCarritoDetalleRepository } = require("./carritoDetalle.model");
const { CarritoFactory, getCarritoRepository } = require("./carrito.model");
const { CategoriaFactory, getCategoriaRepository } = require("./categoria.model");
const { CiudadFactory, getCiudadRepository } = require("./ciudad.model");
const { ClienteFactory, getClienteRepository } = require("./cliente.model");
const { CompraDetalleFactory, getCompraDetalleRepository } = require("./compraDetalle.model");
const { CompraFactory, getCompraRepository } = require("./compra.model");
const { DepartamentoFactory, getDepartamentoRepository } = require("./departamento.model");
const { DescuentoFactory, getDescuentoRepository } = require("./descuento.model");
const { EmpleadoFactory, getEmpleadoRepository } = require("./empleado.model");
const { EnvioFactory, getEnvioRepository } = require("./envio.model");
const { FacturaFactory, getFacturaRepository } = require("./factura.model");
const { LogFactory, getLogRepository } = require("./log.model");
const { LoteFactory, getLoteRepository } = require("./lote.model");
const { OrdenEntradaDetalleFactory, getOrdenEntradaDetalleRepository } = require("./ordenEntradaDetalle.model");
const { OrdenSalidaDetalleFactory, getOrdenSalidaDetalleRepository } = require("./ordenSalidaDetalle.model");
const { OrdenEntradaFactory, getOrdenEntradaRepository } = require("./ordenEntrada.model");
const { OrdenSalidaFactory, getOrdenSalidaRepository } = require("./ordenSalida.model");
const { PagoFactory, getPagoRepository } = require("./pago.model");
const { PaisFactory, getPaisRepository } = require("./pais.model");
const { PedidoDetalleFactory, getPedidoDetalleRepository } = require("./pedidoDetalle.model");
const { ProductoImagenFactory, getProductoImagenRepository } = require("./productoImagen.model");
const { ProveedorFactory, getProveedorRepository } = require("./proveedor.model");
const { RolFactory, getRolRepository } = require("./rol.model");
const { SedeFactory, getSedeRepository } = require("./sede.model");

/**
 * Registro completo 1:1 de las 30 tablas de database.sql.
 */
const TABLE_REGISTRY = Object.freeze({
  ajustesinventario: { table: "AjustesInventario", getRepository: getAjusteInventarioRepository, factory: AjusteInventarioFactory },
  ajustedetalle: { table: "AjusteDetalle", getRepository: getAjusteDetalleRepository, factory: AjusteDetalleFactory },
  carritos: { table: "Carritos", getRepository: getCarritoRepository, factory: CarritoFactory },
  carritodetalle: { table: "CarritoDetalle", getRepository: getCarritoDetalleRepository, factory: CarritoDetalleFactory },
  categorias: { table: "Categorias", getRepository: getCategoriaRepository, factory: CategoriaFactory },
  ciudades: { table: "Ciudades", getRepository: getCiudadRepository, factory: CiudadFactory },
  clientes: { table: "Clientes", getRepository: getClienteRepository, factory: ClienteFactory },
  compras: { table: "Compras", getRepository: getCompraRepository, factory: CompraFactory },
  compradetalle: { table: "CompraDetalle", getRepository: getCompraDetalleRepository, factory: CompraDetalleFactory },
  departamentos: { table: "Departamentos", getRepository: getDepartamentoRepository, factory: DepartamentoFactory },
  descuentos: { table: "Descuentos", getRepository: getDescuentoRepository, factory: DescuentoFactory },
  empleados: { table: "Empleados", getRepository: getEmpleadoRepository, factory: EmpleadoFactory },
  envios: { table: "Envios", getRepository: getEnvioRepository, factory: EnvioFactory },
  facturas: { table: "Facturas", getRepository: getFacturaRepository, factory: FacturaFactory },
  log: { table: "LOG", getRepository: getLogRepository, factory: LogFactory },
  lotes: { table: "Lotes", getRepository: getLoteRepository, factory: LoteFactory },
  ordenesentrada: { table: "OrdenesEntrada", getRepository: getOrdenEntradaRepository, factory: OrdenEntradaFactory },
  ordenentradadetalle: { table: "OrdenEntradaDetalle", getRepository: getOrdenEntradaDetalleRepository, factory: OrdenEntradaDetalleFactory },
  ordenessalida: { table: "OrdenesSalida", getRepository: getOrdenSalidaRepository, factory: OrdenSalidaFactory },
  ordensalidadetalle: { table: "OrdenSalidaDetalle", getRepository: getOrdenSalidaDetalleRepository, factory: OrdenSalidaDetalleFactory },
  pagos: { table: "Pagos", getRepository: getPagoRepository, factory: PagoFactory },
  paises: { table: "Paises", getRepository: getPaisRepository, factory: PaisFactory },
  pedidos: { table: "Pedidos", getRepository: getPedidoRepository, factory: PedidoFactory },
  pedidodetalle: { table: "PedidoDetalle", getRepository: getPedidoDetalleRepository, factory: PedidoDetalleFactory },
  productoimagenes: { table: "ProductoImagenes", getRepository: getProductoImagenRepository, factory: ProductoImagenFactory },
  productos: { table: "Productos", getRepository: getProductoRepository, factory: ProductoFactory },
  proveedores: { table: "Proveedores", getRepository: getProveedorRepository, factory: ProveedorFactory },
  roles: { table: "Roles", getRepository: getRolRepository, factory: RolFactory },
  sedes: { table: "Sedes", getRepository: getSedeRepository, factory: SedeFactory },
  usuarios: { table: "Usuarios", getRepository: getUsuarioRepository, factory: UsuarioFactory }
});

const ALIAS_MAP = Object.freeze({
  ajuste: "ajustesinventario",
  ajustedetalles: "ajustedetalle",
  carrito: "carritos",
  carritodetalles: "carritodetalle",
  categoria: "categorias",
  ciudad: "ciudades",
  cliente: "clientes",
  compra: "compras",
  compradetalles: "compradetalle",
  departamento: "departamentos",
  descuento: "descuentos",
  cupon: "descuentos",
  cupones: "descuentos",
  empleado: "empleados",
  envio: "envios",
  factura: "facturas",
  logs: "log",
  lote: "lotes",
  ordenentrada: "ordenesentrada",
  ordenentradadetalles: "ordenentradadetalle",
  ordensalida: "ordenessalida",
  ordensalidadetalles: "ordensalidadetalle",
  pago: "pagos",
  pais: "paises",
  pedido: "pedidos",
  pedidodetalles: "pedidodetalle",
  productoimagen: "productoimagenes",
  producto: "productos",
  proveedor: "proveedores",
  rol: "roles",
  sede: "sedes",
  usuario: "usuarios"
});

function resolveRegistryEntry(type) {
  const cleanKey = String(type || "").toLowerCase().replace(/[-_\s]/g, "");
  const canonical = TABLE_REGISTRY[cleanKey] ? cleanKey : ALIAS_MAP[cleanKey];
  if (!canonical || !TABLE_REGISTRY[canonical]) {
    throw new Error(`Entidad o tabla desconocida en ModelFactory: '${type}'`);
  }
  return TABLE_REGISTRY[canonical];
}

/**
 * Patron Abstract Factory / ModelFactory: centraliza la obtencion de
 * repositorios Singleton y la construccion de modelos MVC para todas las tablas.
 */
class ModelFactory {
  static getRegisteredTables() {
    return Object.values(TABLE_REGISTRY).map((entry) => entry.table);
  }

  static getRepository(type) {
    return resolveRegistryEntry(type).getRepository();
  }

  static createModel(type, data = {}, source = "json") {
    const { factory } = resolveRegistryEntry(type);
    if (source === "db" || typeof factory.createFromJson !== "function") {
      return factory.createFromDbRow(data);
    }
    return factory.createFromJson(data);
  }
}

module.exports = {
  ModelFactory,
  TABLE_REGISTRY
};
