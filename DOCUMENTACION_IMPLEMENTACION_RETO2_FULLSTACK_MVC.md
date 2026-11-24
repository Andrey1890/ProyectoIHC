# Documentación Técnica de Implementación — Reto 2 Plataforma Full Stack MVC (DERMAKOR)

- **Repositorio GitHub (Estructura Separada + CI/CD):** `https://github.com/Andrey1890/ProyectoIHC`
- **Capa 3 — Frontend MVC (GitHub Pages):** `https://andrey1890.github.io/ProyectoIHC/` (publicado desde `frontend/`)
- **Capa 2 — Backend API REST MVC (Vercel Hobby):** `https://dermakorbackendapi.vercel.app/` (desplegado desde `server/`, Root Directory = `server`)
- **Capa 1 — Base de Datos Relacional:** Supabase PostgreSQL + Prisma ORM (`30` tablas, `90` productos verificados en `/api/status`)
- **Fecha de actualización:** `2026-11-23`

---

## 1. Organización Separada en Dos Carpetas Principales

Para que la separación entre cliente y servidor sea totalmente visible y auditable en GitHub, la raíz de `ProyectoIHC` contiene exclusivamente `.github/`, `.gitignore`, `README.md`, este documento y las dos carpetas autocontenidas (**sin archivos duplicados ni acoplados en la raíz**):

1. **`frontend/`**:
   - `assets/`: copia organizada de `css/styles.css`, los `182` activos `.webp` estandarizados con fondo blanco `#FFFFFF` (`91` bases + `91` variantes responsive) y `data/productos.json` (`90` productos).
   - `models/`: `api.model.js` (cliente HTTP `fetch` con inyección automática de JWT y resolución de URL Vercel/local), `auth.model.js`, `product.model.js`, `cart.model.js` (`localStorage` + `sessionStorage`) y `order.model.js`.
   - `views/`: `product.view.js`, `cart.view.js`, `auth.view.js` (widget con insignia `ADMIN`/`USER` y acceso exclusivo al panel admin), `admin.view.js`.
   - `controllers/`: `app.controller.js`, `auth.controller.js`, `cart.controller.js` (guardia obligatorio de sesión para confirmar pedidos), `admin.controller.js`.
   - Vistas HTML5 accesibles (`index.html`, `admin.html`, `catalogo.html`, `uso-en-casa.html`, `profesional.html`, `producto.html`, `carrito.html`, `checkout.html`, `pago.html`, `factura.html`, `ayuda.html`).

2. **`server/`**:
   - `src/config/`: `env.config.js`, `supabase.singleton.js`, `db.singleton.js`.
   - `src/middlewares/`: `auth.middleware.js` (JWT + `AuthorizeRolesHandler`), `hash.middleware.js` (`bcryptjs` + HMAC `sku_hash`), `cors.middleware.js`, `sanitize.middleware.js`, `validate.middleware.js`, `pagination.middleware.js`, `logger.middleware.js`, `error.middleware.js`.
   - `src/models/`: `model.factory.js`, `base.repository.js`, `producto.repository.js`, `usuario.model.js`, `pedido.model.js` y `30` modelos de tabla Prisma (`0` SQL crudo).
   - `src/controllers/` y `src/routes/`: `34` controladores y `7` módulos de rutas REST cubriendo Auth, Productos, Pedidos y las `30` entidades.
   - `prisma/`: `schema.prisma` (con `binaryTargets = ["native", "rhel-openssl-3.0.x"]` para compatibilidad Linux Serverless en Vercel), `migrations/0001_init_reto2_mvc/migration.sql` y `seed.js`.
   - `api/index.js` y `vercel.json`: adaptación serverless gratuita en Vercel.
   - Carpetas puente `controllers/`, `middleware/`, `models/` y `routes/` alineadas a la rúbrica.

---

## 2. Seguridad JWT, RBAC, `bcryptjs` y Correcciones Críticas Implementadas

1. **Autenticación con `bcryptjs` y JWT (`jsonwebtoken`):**
   - `HashChainHandler` y `prisma/seed.js` encriptan contraseñas con factor de costo `10` (`$2a$10$...`, 60 caracteres para `CHAR(60)` en Supabase).
   - Se sembraron en vivo en Supabase las cuentas `admin@dermakor.com` (`ROL0000001` $\rightarrow$ `role: "admin"`) y `cliente@example.com` (`ROL0000003` $\rightarrow$ `role: "user"`).
   - `POST /api/auth/login` y `POST /api/auth/register` devuelven `{ ok: true, token, usuario }` sin exponer `usu_clave_hash`. El registro público fuerza siempre `ROL0000003` (`user`), impidiendo escalación de privilegios.
2. **Autorización por Roles (RBAC):**
   - `POST /api/productos`, `PUT /api/productos/:id`, `PATCH /api/productos/:id` y `DELETE /api/productos/:id` requieren `authenticateJwt` + `authorizeRoles("admin")`.
   - `GET /api/pedidos` y las tablas administrativas (`/api/v1/usuarios`, `/api/v1/clientes`, `/api/v1/facturas`, `/api/v1/pagos`, etc.) exigen rol `admin` (`403 Forbidden` para `user`, `401 Unauthorized` sin token).
   - `POST /api/pedidos` y `GET /api/pedidos/mis-pedidos` exigen usuario autenticado (`user` o `admin`), y `GET /api/pedidos/:id` verifica propiedad del pedido (`userId`).
3. **Integridad de precios en servidor y `helmet`:**
   - `PedidoRepository.createCheckoutTransaction()` calcula los totales usando exclusivamente `Productos.pro_precio` de la base de datos e ignora precios manipulados recibidos desde el cliente.
   - `src/app.js` monta `helmet()` y `CorsChainHandler` permite únicamente orígenes autorizados (`localhost`, `https://andrey1890.github.io` y el subdominio `.vercel.app` del proyecto, sin `*` en producción).
   - Timeout de `$transaction` en `SupabaseDatabaseSingleton` ampliado a `30000 ms` (`maxWait: 15000`) para soportar latencia remota contra Supabase PgBouncer.

---

## 3. Panel de Administración y Flujo Frontend MVC

- El encabezado de todas las páginas muestra dinámicamente el nombre del usuario, su insignia de rol (`ADMIN` o `USER`), el enlace a **Mis Pedidos** (`admin.html#mis-pedidos`) y, exclusivamente para `role === "admin"`, el botón **⚙️ Panel Admin** (`admin.html`).
- En `admin.html`, el administrador puede:
  - Crear, editar y eliminar productos (`POST`/`PUT`/`DELETE /api/productos`).
  - Visualizar todos los pedidos registrados en Supabase (`GET /api/pedidos`).
  - Inspeccionar en vivo cualquiera de las **30 tablas** de Supabase (`/api/v1/<entidad>`).
- Si un comprador intenta confirmar un pedido (`carrito.html`, `checkout.html`, `pago.html`) sin token JWT activo, el controlador bloquea el envío, muestra una alerta accesible (`role="alert"`, `aria-live="polite"`) y abre el modal de inicio de sesión.
- En CSS se añadió `@media (prefers-reduced-motion: reduce)` (WCAG 2.3.3) y fondo `#FFFFFF` para `.hero-imagen-box`.

---

## 4. Flujo CI/CD con GitHub Actions y Despliegue Gratuito en Producción

Se creó [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) con dos trabajos encadenados:
1. **`ci-fullstack-mvc`**: verifica la integridad estructural de `frontend/` y `server/`, instala dependencias en `server/` (`npm ci`), valida el esquema Prisma (`npx prisma validate`), genera el cliente (`npx prisma generate`) y audita sintaxis (`node --check`) en todos los `.js` de backend y frontend MVC.
2. **`cd-github-pages`**: empaqueta `./frontend` (`actions/upload-pages-artifact@v3`) y lo publica en GitHub Pages (`actions/deploy-pages@v4`) en `https://andrey1890.github.io/ProyectoIHC/`.

Para Vercel (plan gratuito Hobby, proyecto `dermakorbackendapi` con **Root Directory = `server`**), se configuraron `vercel.json`, `api/index.js`, `binaryTargets = ["native", "rhel-openssl-3.0.x"]` en Prisma y 16 variables de entorno conectadas a Supabase PostgreSQL:
- `GET https://dermakorbackendapi.vercel.app/` -> JSON de identificación (`"capa": "Capa 2 - Backend REST MVC (Desacoplado en Vercel)"`).
- `GET https://dermakorbackendapi.vercel.app/api/status` -> `ok: true`, `orm: "prisma"`, `total_tablas_mvc: 30`, `total_productos: 90`.
- `GET https://dermakorbackendapi.vercel.app/api/productos` -> catálogo completo (`90` productos) leído desde Supabase.
- `frontend/admin.html` incluye el panel visual **Arquitectura Full Stack Separada** que consulta `/api/status` e informa en tiempo real la separación entre Capa 3 (GitHub Pages), Capa 2 (Vercel) y Capa 1 (Supabase + Prisma).

---

## 5. Resultados de Verificación Local y Entregables

- **Validación sintáctica:** todos los archivos `.js` de Backend MVC (`server/src/`) y Frontend MVC (`frontend/models/`, `views/`, `controllers/`) verificados sin errores mediante `node --check`.
- **Suite automatizada (`npm test`):** ejecutada contra Express MVC + Supabase en vivo cubriendo las `7` pruebas mínimas obligatorias del Reto 2 (Login Admin JWT, Crear/Editar/Eliminar producto Admin, Bloqueo `403` a User, Catálogo 90 productos WebP, Estructura MVC Frontend, Confirmar Pedido autenticado con precio oficial BD + `/mis-pedidos`, y Gestión de Pedidos Admin) además de `30/30` modelos Prisma sin SQL crudo.
- **Entregable comprimido:** `C:\Users\Andre\.gemini\antigravity\scratch\Reto2_Morejon_Andres.zip` (incluye únicamente `frontend/`, `server/`, `.github/`, `README.md` y documentación, con `0` archivos `.env` y `0` carpetas `node_modules`).
