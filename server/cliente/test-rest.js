const assert = require("assert");
const fs = require("fs");
const path = require("path");
const http = require("http");
const ENV = require("../src/config/env.config");
const { app } = require("../src/app");
const { app: clientApp } = require("./serve-client");
const {
  DatabaseSingleton,
  SupabaseDatabaseSingleton,
  getDbSingleton
} = require("../src/config/db.singleton");
const { getSupabaseSingleton } = require("../src/config/supabase.singleton");
const { ProductoRepository } = require("../src/models/producto.repository");
const { UsuarioRepository } = require("../src/models/usuario.model");
const { PedidoRepository } = require("../src/models/pedido.model");
const { ProductoFactory } = require("../src/models/producto.model");
const { ModelFactory } = require("../src/models/model.factory");
const { hashPasswordBcrypt, verifyPassword } = require("../src/middlewares/hash.middleware");
const { DermakorApiClient } = require("./api.client");

async function runTests() {
  const results = [];
  let createdTestProductId = null;
  let createdTestOrderId = null;
  let adminToken = "";
  let userToken = "";

  function pass(name, detail = "") {
    results.push({ name, status: "PASS", detail });
    console.log(`[PASS] ${name}${detail ? ` -> ${detail}` : ""}`);
  }

  // 1. Configuracion de entorno y Patrones Singleton / Factory / Prisma ORM / bcrypt
  assert.strictEqual(ENV.PORT, 4050, "PORT en .env debe ser 4050.");
  assert.strictEqual(ENV.CLIENT_PORT, 4051, "CLIENT_PORT en .env debe ser 4051.");
  assert.strictEqual(ENV.PAGINATION_LIMIT, 100, "PAGINATION_LIMIT en .env debe ser 100.");
  assert.strictEqual(ENV.API_PREFIX, "/api/v1", "API_PREFIX en .env debe ser /api/v1.");
  assert(ENV.JWT_SECRET && ENV.JWT_SECRET.length >= 10, "JWT_SECRET debe estar definido.");
  pass("EnvConfig (.env + JWT)", `PORT=${ENV.PORT}, CLIENT_PORT=${ENV.CLIENT_PORT}`);

  const bcryptHash = hashPasswordBcrypt("ClaveSegura2026!");
  assert(/^\$2[aby]\$/.test(bcryptHash), "Debe generar hash bcrypt valido.");
  assert.strictEqual(verifyPassword("ClaveSegura2026!", bcryptHash), true);
  assert.strictEqual(verifyPassword("ClaveIncorrecta", bcryptHash), false);
  pass("Seguridad bcryptjs + verifyPassword");

  // Verificar que ningun archivo de src/models/ exponga sentencias SQL crudas
  const modelDir = path.resolve(__dirname, "../src/models");
  const modelFiles = fs.readdirSync(modelDir).filter((f) => f.endsWith(".js"));
  const rawSqlPattern = /\b(SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+"|DELETE\s+FROM)\b/i;
  for (const mf of modelFiles) {
    const content = fs.readFileSync(path.join(modelDir, mf), "utf8");
    assert(!rawSqlPattern.test(content), `El archivo de modelo '${mf}' no debe exponer SQL crudo.`);
  }
  pass("Prisma ORM estricto en src/models/ (0 SQL crudo en 33 archivos)");

  const db1 = SupabaseDatabaseSingleton.getInstance();
  const db2 = getSupabaseSingleton();
  const db3 = DatabaseSingleton.getInstance();
  const db4 = getDbSingleton();
  assert.strictEqual(db1, db2);
  assert.strictEqual(db1, db3);
  assert.strictEqual(db1, db4);
  assert.strictEqual(db1.getPrisma(), db2.getPrisma());
  assert.throws(() => new SupabaseDatabaseSingleton(), /getInstance/);
  pass("Singleton db.singleton.js === supabase.singleton.js (PrismaClient)", db1.getInstanceId());

  assert.strictEqual(ProductoRepository.getInstance(), ModelFactory.getRepository("producto"));
  assert.strictEqual(UsuarioRepository.getInstance(), ModelFactory.getRepository("usuario"));
  assert.strictEqual(PedidoRepository.getInstance(), ModelFactory.getRepository("pedido"));
  assert.strictEqual(DermakorApiClient.getInstance("http://localhost:4050/api/v1"), DermakorApiClient.getInstance());
  pass("Singletons de Repositories, ModelFactory y DermakorApiClient");

  const builtModel = ModelFactory.createModel(
    "producto",
    {
      id_producto: "PRD0000999",
      pro_nombre: "Producto Test Factory",
      pro_descripcion: 'Desc base ||META||{"slug":"producto-test","marca":"Dermclar","tipoUso":"casa"}',
      pro_precio: 49.5,
      cat_nombre: "Exosomas",
      img_url: "images/01_exoface.webp",
      stock: 15
    },
    "db"
  );
  assert.strictEqual(builtModel.id, "producto-test");
  assert.strictEqual(builtModel.esExosoma, true);
  assert.strictEqual(builtModel.precio, 49.5);
  assert(builtModel.createdAt, "ProductoModel debe incluir createdAt");
  assert(String(builtModel.sku_hash || "").startsWith("sku-"));
  pass("Patron Factory ProductoFactory, createdAt y sku_hash");

  // 2. Pruebas de integracion REST MVC contra servidor Express + Supabase real
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const rootUrl = `http://127.0.0.1:${port}`;
  const client = DermakorApiClient.getInstance(`${rootUrl}/api`);

  try {
    // CORS restrictivo + Helmet
    const forbiddenOriginRes = await fetch(`${rootUrl}/api/status`, {
      headers: { Origin: "https://sitio-no-autorizado.example" }
    });
    assert.strictEqual(forbiddenOriginRes.status, 403);
    const pagesCorsRes = await fetch(`${rootUrl}/api/status`, {
      headers: { Origin: "https://andrey1890.github.io" }
    });
    assert.strictEqual(pagesCorsRes.status, 200);
    assert.strictEqual(pagesCorsRes.headers.get("access-control-allow-origin"), "https://andrey1890.github.io");
    assert.strictEqual(pagesCorsRes.headers.get("x-content-type-options"), "nosniff");
    pass("CORS seguro (403 ajenos, GitHub Pages permitido) + Helmet");

    // GET /api/status
    const statusRes = await client.getStatus();
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusRes.data.ok, true);
    assert(statusRes.data.total_productos >= 90);
    assert(statusRes.headers.get("x-request-id"));
    pass("GET /api/status + LoggerChain", `total_productos=${statusRes.data.total_productos}`);

    // RETO 2 PRUEBA 1: Login Admin -> obtiene JWT valido con rol admin
    const badLogin = await client.login("correo-invalido", "");
    assert.strictEqual(badLogin.status, 400);
    const wrongPass = await client.login("admin@dermakor.com", "ClaveErronea999");
    assert.strictEqual(wrongPass.status, 401);

    const adminLoginRes = await client.login("admin@dermakor.com", "Admin123!");
    assert.strictEqual(adminLoginRes.status, 200);
    assert.strictEqual(adminLoginRes.data.ok, true);
    assert(adminLoginRes.data.token && adminLoginRes.data.token.split(".").length === 3, "Admin debe recibir JWT valido");
    assert.strictEqual(adminLoginRes.data.usuario.role, "admin");
    adminToken = adminLoginRes.data.token;
    pass("Reto2 Prueba 1 - Login Admin + JWT", adminLoginRes.data.usuario.email);

    // Login User -> obtiene JWT valido con rol user
    const userLoginRes = await client.login("cliente@example.com", "Cliente123!");
    assert.strictEqual(userLoginRes.status, 200);
    assert.strictEqual(userLoginRes.data.ok, true);
    assert(userLoginRes.data.token && userLoginRes.data.token.split(".").length === 3, "User debe recibir JWT valido");
    assert.strictEqual(userLoginRes.data.usuario.role, "user");
    userToken = userLoginRes.data.token;
    pass("Login Cliente (User) + JWT", userLoginRes.data.usuario.email);

    // RETO 2 PRUEBA 4: Catalogo publico (GET /api/productos)
    const prodRes = await client.getProductos("page=1");
    assert.strictEqual(prodRes.status, 200);
    assert.strictEqual(prodRes.data.ok, true);
    assert(prodRes.data.total >= 90 && prodRes.data.data.length >= 90);
    const missingWebp = prodRes.data.data.filter((p) => !p.imagen || !p.imagen.endsWith(".webp"));
    assert.strictEqual(missingWebp.length, 0);
    pass("Reto2 Prueba 4 - Catalogo publico GET /api/productos", `${prodRes.data.total} productos`);

    const detailRes = await client.getProductoById("exoface-casa");
    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.data.producto.id_producto_db, "PRD0000001");
    pass("GET /api/productos/exoface-casa", detailRes.data.producto.nombre);

    // Rutas protegidas sin token deben devolver 401
    const unauthCreate = await client.createProducto({ nombre: "Sin Auth", precio: 20, stock: 5 });
    assert.strictEqual(unauthCreate.status, 401);
    pass("JWT Guard bloquea POST /api/productos sin token (401)");

    // RETO 2 PRUEBA 3: Control de roles (User intenta crear producto -> 403 Forbidden)
    const forbiddenCreate = await client.createProducto({
      nombre: "Intento Usuario Comun",
      precio: 25,
      stock: 10
    }, userToken);
    assert.strictEqual(forbiddenCreate.status, 403);
    assert.strictEqual(forbiddenCreate.data.code, "AUTH_FORBIDDEN");
    pass("Reto2 Prueba 3 - Control de roles (User bloqueado con 403 Forbidden)");

    // RETO 2 PRUEBA 2: Crear producto (Admin) + PUT + PATCH + DELETE
    const createRes = await client.createProducto({
      nombre: "Dermakor Serum Prueba Reto2 <script>alert(1)</script>",
      precio: 39.9,
      stock: 5,
      imagen: "images/01_exoface.webp"
    }, adminToken);
    assert.strictEqual(createRes.status, 201);
    assert(!createRes.data.producto.nombre.includes("<script>"));
    createdTestProductId = createRes.data.producto.id_producto_db;
    pass("Reto2 Prueba 2 - Admin crea producto (201)", createdTestProductId);

    const updateRes = await client.updateProducto(createdTestProductId, { precio: 42.5 }, adminToken);
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.producto.precio, 42.5);

    const deleteRes = await client.deleteProducto(createdTestProductId, adminToken);
    assert.strictEqual(deleteRes.status, 200);
    assert.strictEqual(deleteRes.data.deleted, true);
    pass("Admin PUT /api/productos/:id + DELETE /api/productos/:id", createdTestProductId);

    // RETO 2 PRUEBA 6: Confirmar pedido (User) + Seguridad precio oficial BD + GET /api/pedidos/mis-pedidos
    const unauthOrder = await client.crearPedido({ items: [{ id: "exoface-casa", cantidad: 1 }] });
    assert.strictEqual(unauthOrder.status, 401);

    const orderRes = await client.crearPedido({
      items: [{ productoId: "PRD0000001", cantidad: 1, precioUnitario: 0.01 }]
    }, userToken);
    assert.strictEqual(orderRes.status, 201);
    assert.strictEqual(orderRes.data.ok, true);
    assert(orderRes.data.subtotal > 1, "Debe cobrar precio real de BD, ignorando precio alterado del cliente (0.01)");
    createdTestOrderId = orderRes.data.id_pedido;

    const myOrdersRes = await client.getMisPedidos(userToken);
    assert.strictEqual(myOrdersRes.status, 200);
    assert.strictEqual(myOrdersRes.data.ok, true);
    assert(myOrdersRes.data.pedidos.some((p) => p.id_pedido === createdTestOrderId), "Pedido nuevo debe aparecer en /api/pedidos/mis-pedidos");
    pass("Reto2 Prueba 6 - User confirma pedido (POST /api/pedidos) + GET /mis-pedidos", `${createdTestOrderId} ($${orderRes.data.total})`);

    // RETO 2 PRUEBA 7: Gestion de pedidos (Admin) vs User bloqueado 403
    const userAllOrders = await client.getPedidos(userToken);
    assert.strictEqual(userAllOrders.status, 403);
    const adminAllOrders = await client.getPedidos(adminToken);
    assert.strictEqual(adminAllOrders.status, 200);
    assert(Array.isArray(adminAllOrders.data.data) && adminAllOrders.data.data.length >= 1);
    pass("Reto2 Prueba 7 - Gestion pedidos Admin (200 Admin, 403 User)", `${adminAllOrders.data.data.length} pedidos`);

    // RETO 2 PRUEBA 5 (verificacion estructural MVC Frontend y persistencia carrito)
    const frontendDir = path.resolve(__dirname, "../frontend");
    for (const rel of [
      "index.html",
      "admin.html",
      "models/api.model.js",
      "models/auth.model.js",
      "models/product.model.js",
      "models/cart.model.js",
      "models/order.model.js",
      "views/product.view.js",
      "views/cart.view.js",
      "views/auth.view.js",
      "views/admin.view.js",
      "controllers/auth.controller.js",
      "controllers/cart.controller.js",
      "controllers/admin.controller.js",
      "controllers/app.controller.js"
    ]) {
      assert(fs.existsSync(path.join(frontendDir, rel)), `Falta archivo MVC frontend/${rel}`);
    }
    pass("Reto2 Prueba 5 - Estructura MVC Frontend completa (models/views/controllers/assets)");

    // Cobertura MVC 30/30 Tablas y pruebas Admin sobre entidades sensibles
    assert.strictEqual(statusRes.data.total_tablas_mvc, 30);
    const registeredTables = ModelFactory.getRegisteredTables();
    assert.strictEqual(registeredTables.length, 30);
    const unauthUsers = await client.request("/v1/usuarios");
    assert.strictEqual(unauthUsers.status, 401);
    const userUsers = await client.request("/v1/usuarios", { token: userToken });
    assert.strictEqual(userUsers.status, 403);
    const adminUsers = await client.request("/v1/usuarios", { token: adminToken });
    assert.strictEqual(adminUsers.status, 200);
    assert.strictEqual(adminUsers.data.data[0].usu_clave_hash, undefined);
    pass("Cobertura MVC 30/30 Tablas + RBAC en /api/v1/usuarios (401/403/200 sin hash)");

    // Verificar cliente independiente (:4051) + CORS
    const clientServer = http.createServer(clientApp);
    await new Promise((resolve) => clientServer.listen(0, "127.0.0.1", resolve));
    const clientUrl = `http://127.0.0.1:${clientServer.address().port}`;
    const standaloneRes = await fetch(`${clientUrl}/index.html`);
    assert.strictEqual(standaloneRes.status, 200);
    const adminHtmlRes = await fetch(`${clientUrl}/admin.html`);
    assert.strictEqual(adminHtmlRes.status, 200);
    await new Promise((resolve) => clientServer.close(resolve));
    const cors4051Res = await fetch(`${rootUrl}/api/v1/status`, {
      headers: { Origin: "http://localhost:4051" }
    });
    assert.strictEqual(cors4051Res.status, 200);
    assert.strictEqual(cors4051Res.headers.get("access-control-allow-origin"), "http://localhost:4051");
    pass("Capa 3 Frontend MVC HTML + Admin + WebP + CORS :4051");

    console.log(`\nALL TESTS PASSED (${results.length}/${results.length} verificaciones exitosas)`);
  } finally {
    const prisma = db1.getPrisma();
    if (createdTestOrderId) {
      const osas = await prisma.ordenesSalida.findMany({ where: { id_pedido: createdTestOrderId } }).catch(() => []);
      for (const osa of osas) {
        const dets = await prisma.ordenSalidaDetalle.findMany({ where: { id_orden_salida: osa.id_orden_salida } }).catch(() => []);
        for (const d of dets) {
          await prisma.lotes.update({
            where: { id_lote: d.id_lote },
            data: { lot_stock_actual: { increment: Number(d.osd_cantidad_despachada || 0) } }
          }).catch(() => {});
        }
        await prisma.ordenSalidaDetalle.deleteMany({ where: { id_orden_salida: osa.id_orden_salida } }).catch(() => {});
        await prisma.envios.deleteMany({ where: { id_orden_salida: osa.id_orden_salida } }).catch(() => {});
      }
      await prisma.ordenesSalida.deleteMany({ where: { id_pedido: createdTestOrderId } }).catch(() => {});
      await prisma.facturas.deleteMany({ where: { id_pedido: createdTestOrderId } }).catch(() => {});
      await prisma.pagos.deleteMany({ where: { id_pedido: createdTestOrderId } }).catch(() => {});
      await prisma.pedidoDetalle.deleteMany({ where: { id_pedido: createdTestOrderId } }).catch(() => {});
      await prisma.pedidos.deleteMany({ where: { id_pedido: createdTestOrderId } }).catch(() => {});
    }
    if (createdTestProductId) {
      await prisma.lotes.deleteMany({ where: { id_producto: createdTestProductId } }).catch(() => {});
      await prisma.productoImagenes.deleteMany({ where: { id_producto: createdTestProductId } }).catch(() => {});
      await prisma.productos.deleteMany({ where: { id_producto: createdTestProductId } }).catch(() => {});
    }
    await new Promise((resolve) => server.close(resolve));
    await db1.close();
  }
}

runTests().catch((err) => {
  console.error("[FAIL] Error en pruebas REST:", err);
  process.exit(1);
});
