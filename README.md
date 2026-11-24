# DERMAKOR — Plataforma Full Stack MVC (Reto 2)

Plataforma e-commerce dermocosmética con **separación estricta de capas y repositorios/despliegues** en dos carpetas independientes en la raíz (`frontend/` y `server/`), conectada a **Supabase PostgreSQL** mediante **Prisma ORM**, con autenticación **JWT**, encriptación **`bcryptjs`**, autorización basada en roles (**RBAC: `admin` / `user`**), seguridad alineada a **OWASP Top 10** y flujo **CI/CD con GitHub Actions**.

### Despliegues en Producción (Planes Gratuitos)

| Capa | Tecnología | Plataforma | URL Pública | Carpeta Fuente |
| :--- | :--- | :--- | :--- | :--- |
| **Capa 3 — Frontend MVC** | HTML5 + CSS3 + Vanilla JS (MVC) | **GitHub Pages** (CI/CD Actions) | [https://andrey1890.github.io/ProyectoIHC/](https://andrey1890.github.io/ProyectoIHC/) | `frontend/` |
| **Capa 2 — Backend REST MVC** | Node.js + Express + Prisma Client | **Vercel** (Plan Hobby, Root `server`) | [https://dermakorbackendapi.vercel.app/](https://dermakorbackendapi.vercel.app/) | `server/` |
| **Capa 1 — Base de Datos** | PostgreSQL (`30` tablas relacionales) | **Supabase** (Pooler + Prisma ORM) | Conectada exclusivamente desde Vercel (`/api/status`) | `server/prisma/` |

---

## Enlaces Directos para Probar Todo (GitHub, Vercel y Base de Datos)

### 1. GitHub (Código Fuente, CI/CD y Frontend en GitHub Pages)
- **Repositorio GitHub:** https://github.com/Andrey1890/ProyectoIHC
- **Pipeline CI/CD (GitHub Actions):** https://github.com/Andrey1890/ProyectoIHC/actions
- **Tienda Principal (Frontend MVC):** https://andrey1890.github.io/ProyectoIHC/
- **Catálogo Completo (`90` productos WebP):** https://andrey1890.github.io/ProyectoIHC/catalogo.html
- **Panel Admin y Visor en Vivo de las `30` Tablas de BD:** https://andrey1890.github.io/ProyectoIHC/admin.html
- **Carrito de Compras:** https://andrey1890.github.io/ProyectoIHC/carrito.html

### 2. Vercel (Backend REST API MVC — Capa 2)
- **Raíz del Backend (info de arquitectura y endpoints):** https://dermakorbackendapi.vercel.app/
- **Healthcheck y Verificación de BD (`30` tablas / `90` productos):** https://dermakorbackendapi.vercel.app/api/status

### 3. Base de Datos Supabase PostgreSQL + Prisma ORM (Pruebas en Vivo)

**A. Consultas públicas directas en el navegador (`GET` sin token):**
- **Productos (`Productos` + `Categorias` + `Lotes`):** https://dermakorbackendapi.vercel.app/api/productos
- **Categorías (`Categorias`):** https://dermakorbackendapi.vercel.app/api/v1/categorias
- **Sedes (`Sedes`):** https://dermakorbackendapi.vercel.app/api/sedes
- **Lotes de inventario (`Lotes`):** https://dermakorbackendapi.vercel.app/api/v1/lotes
- **Imágenes de productos (`ProductoImagenes`):** https://dermakorbackendapi.vercel.app/api/v1/producto-imagenes
- **Países (`Paises`):** https://dermakorbackendapi.vercel.app/api/v1/paises
- **Ciudades (`Ciudades`):** https://dermakorbackendapi.vercel.app/api/v1/ciudades

**B. Tablas administrativas protegidas por JWT + RBAC (`admin`):**
*(Si se abren directamente en el navegador sin token devuelven `401 Unauthorized` verificando seguridad OWASP; para explorarlas con sesión activa usar [admin.html](https://andrey1890.github.io/ProyectoIHC/admin.html) o enviar `Authorization: Bearer <token>`)*
- **Pedidos:** https://dermakorbackendapi.vercel.app/api/pedidos
- **Usuarios (sin `usu_clave_hash`):** https://dermakorbackendapi.vercel.app/api/v1/usuarios
- **Clientes:** https://dermakorbackendapi.vercel.app/api/v1/clientes
- **Facturas:** https://dermakorbackendapi.vercel.app/api/v1/facturas
- **Pagos:** https://dermakorbackendapi.vercel.app/api/v1/pagos
- **Roles:** https://dermakorbackendapi.vercel.app/api/v1/roles
- **Descuentos:** https://dermakorbackendapi.vercel.app/api/v1/descuentos
- **Envíos:** https://dermakorbackendapi.vercel.app/api/v1/envios
- **Otras entidades (`/api/v1/<entidad>`):** `empleados`, `departamentos`, `proveedores`, `compras`, `compra-detalle`, `ordenes-entrada`, `orden-entrada-detalle`, `ordenes-salida`, `orden-salida-detalle`, `ajustes-inventario`, `ajuste-detalle`, `pedido-detalle`, `carritos`, `carrito-detalle`, `logs`.

**C. Esquema de Base de Datos y Credenciales de Prueba:**
- **Esquema Prisma (`30` tablas):** https://github.com/Andrey1890/ProyectoIHC/blob/main/server/prisma/schema.prisma
- **Migración SQL inicial:** https://github.com/Andrey1890/ProyectoIHC/blob/main/server/prisma/migrations/0001_init_reto2_mvc/migration.sql
- **Usuario Administrador (`admin`):** `admin@dermakor.com` / `Admin123!`
- **Usuario Cliente (`user`):** `cliente@example.com` / `Cliente123!`

---

## 1. Descripción General del Sistema

**DERMAKOR** permite a clientes navegar por un catálogo de **90 productos dermatológicos** en formato `.webp` (9 categorías, Sede Quito), gestionar un carrito persistente (`localStorage` + `sessionStorage`), autenticarse con **JWT**, confirmar pedidos protegidos con cálculo oficial de precios, IVA (`15%`), facturación SRI y lotes FEFO en PostgreSQL, y administrar catálogo, pedidos, arquitectura desacoplada y entidades desde un **Panel Administrativo exclusivo para el rol `admin`** (`admin.html`).

---

## 2. Arquitectura MVC Separada (`frontend/` y `server/`)

La raíz del repositorio mantiene únicamente el flujo CI/CD (`.github/workflows/ci-cd.yml`), la documentación y las dos carpetas independientes:

```text
ProyectoIHC/
├── .github/workflows/ci-cd.yml                        # Pipeline CI Backend + CD Frontend Pages
├── frontend/                                          # Desplegado en GitHub Pages
├── server/                                            # Desplegado en Vercel (Root Directory = server)
├── README.md
└── DOCUMENTACION_IMPLEMENTACION_RETO2_FULLSTACK_MVC.md
```

### 2.1 Frontend MVC (`/frontend/`)
```text
frontend/
├── assets/                 # Estilos CSS, imágenes .webp y datos de respaldo JSON
├── controllers/            # Orquestación de eventos, flujo de compra y Panel Admin
│   ├── admin.controller.js
│   ├── app.controller.js
│   ├── auth.controller.js
│   └── cart.controller.js
├── models/                 # Consumo API (fetch + async/await + JWT) y estado del carrito
│   ├── api.model.js
│   ├── auth.model.js
│   ├── cart.model.js
│   ├── order.model.js
│   └── product.model.js
├── views/                  # Renderizado seguro DOM y alertas ARIA accesibles
│   ├── admin.view.js
│   ├── auth.view.js
│   ├── cart.view.js
│   └── product.view.js
├── index.html              # Tienda principal semántica y accesible (WCAG 2.2 AA)
└── admin.html              # Panel de Administración (rol admin) y Mis Pedidos (user/admin)
```

### 2.2 Backend MVC N-Capas (`/server/`)
```text
server/
├── api/index.js            # Entrypoint Serverless para Vercel
├── controllers/            # Controladores HTTP MVC (auth, productos, pedidos, 30 tablas)
├── middleware/             # Puente hacia Chain of Responsibility (JWT, RBAC, bcrypt, CORS, Helmet)
├── models/                 # Capa de acceso a datos estricta con Prisma ORM (0 SQL crudo)
├── prisma/
│   ├── schema.prisma       # 30 modelos relacionales mapeados a Supabase PostgreSQL
│   ├── migrations/         # DDL inicial 0001_init_reto2_mvc
│   └── seed.js             # Semilla idempotente con admin y cliente usando bcrypt
├── routes/                 # Endpoints REST públicos y protegidos por rol
└── src/                    # Núcleo modular Express + Singleton + Factory + Repository
```

---

## 3. Instrucciones Paso a Paso para Ejecutar

### A. Base de Datos Supabase + Prisma ORM
1. Configurar las variables en `server/.env` tomando como plantilla `server/.env.example` (sin versionar `.env` en Git):
   ```env
   NODE_ENV=development
   PORT=4050
   CLIENT_PORT=4051
   CORS_ORIGIN=http://localhost:4050,http://127.0.0.1:4050,http://localhost:4051,http://127.0.0.1:4051,https://andrey1890.github.io
   JWT_SECRET=clave_jwt_segura
   DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:5432/postgres?sslmode=require&pgbouncer=true"
   ```
2. Generar el cliente Prisma y ejecutar la semilla inicial de usuarios (`admin@dermakor.com` / `Admin123!` y `cliente@example.com` / `Cliente123!`):
   ```bash
   cd server
   npm install
   npx prisma generate
   node prisma/seed.js
   ```

### B. Servidor Backend (puerto `4050`)
```bash
cd server
npm test      # Ejecuta la suite completa (21/21 verificaciones y las 7 pruebas del Reto 2)
npm start     # Inicia API REST + servidor integrado en http://localhost:4050
```

### C. Frontend MVC desacoplado (puerto `4051`)
```bash
cd server
npm run start:client   # Sirve frontend/ en http://localhost:4051 consumiendo http://localhost:4050/api
```

---

## 4. Listado de Endpoints y Roles Requeridos

| Módulo | Método | Endpoint | Acceso / Rol requerido | Descripción |
| :--- | :---: | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Público | Registra un cliente (`role: "user"`), encripta con `bcryptjs` y devuelve JWT. |
| **Auth** | `POST` | `/api/auth/login` | Público | Valida credenciales reales con `bcryptjs` y emite JWT firmado. |
| **Productos** | `GET` | `/api/productos` | Público | Lista el catálogo activo con stock agregado de `Lotes` (`createdAt`, `precio`, `stock`). |
| **Productos** | `GET` | `/api/productos/:id` | Público | Obtiene detalle completo de un producto por ID o slug. |
| **Productos** | `POST` | `/api/productos` | **JWT (`admin`)** | Crea producto, imagen y lote inicial (401 sin token, 403 si es `user`). |
| **Productos** | `PUT` / `PATCH` | `/api/productos/:id` | **JWT (`admin`)** | Actualiza producto existente. |
| **Productos** | `DELETE` | `/api/productos/:id` | **JWT (`admin`)** | Desactiva lógicamente el producto. |
| **Pedidos** | `POST` | `/api/pedidos` | **JWT (`user` / `admin`)** | Registra pedido transaccional, detalles y factura SRI usando precios reales de BD. |
| **Pedidos** | `GET` | `/api/pedidos/mis-pedidos` | **JWT (`user` / `admin`)** | Lista exclusivamente los pedidos del usuario autenticado. |
| **Pedidos** | `GET` | `/api/pedidos` | **JWT (`admin`)** | Lista todos los pedidos del sistema para administración (403 a `user`). |
| **Sistema / Tablas** | `GET` | `/api/status` y `/api/v1/<entidad>` | Público (`status`) / **JWT (`admin`)** | Estado del sistema y visor CRUD sobre las 30 tablas Prisma. |

### Panel Admin: Kárdex, Lotes, Compras, Ajustes y CRUD

El panel [admin.html](https://andrey1890.github.io/ProyectoIHC/admin.html) incorpora gestión operativa completa protegida con **JWT (`admin`)**:

- **Kárdex y Lotes FEFO:**
  - `GET /api/v1/inventario/kardex?id_producto=&id_lote=&id_sede=`: movimientos cronológicos (`ENTRADA`, `SALIDA`, `AJUSTE_INGRESO`, `AJUSTE_EGRESO`) con `saldo_inicial` y saldo acumulado.
  - `GET /api/v1/inventario/lotes?estado=VENCIDO|POR_VENCER|VIGENTE&id_producto=`: lotes ordenados por caducidad ascendente (FEFO) y semáforo de vencimiento.
  - `GET /api/v1/inventario/resumen`: resumen de stock total, lotes y próxima caducidad por producto.
- **Compras a Proveedores y Ajustes de Inventario:**
  - `POST /api/v1/inventario/compras`: crea orden de compra en estado `PENDIENTE` (`Compras` + `CompraDetalle`).
  - `POST /api/v1/inventario/compras/:id/recepcion`: genera `OrdenesEntrada`, crea los nuevos `Lotes` con fechas de fabricación/caducidad, registra `OrdenEntradaDetalle` y marca la compra `RECIBIDA`.
  - `POST /api/v1/inventario/compras/:id/anular`: anula compras en estado `PENDIENTE`.
  - `POST /api/v1/inventario/ajustes`: registra `AjustesInventario` + `AjusteDetalle` (`INGRESO`/`EGRESO`) y actualiza `lot_stock_actual` (rechaza con `409` si el egreso supera el stock).
- **CRUD Completo de Tablas:**
  - `GET /api/v1/meta/entidades`: metadatos de las 30 tablas Prisma (PKs, tipos, longitudes máximas, claves foráneas) para formularios dinámicos en **CRUD Tablas BD**.

---

## 5. Seguridad Aplicada (Mitigación de Riesgos OWASP Top 10)

1. **OWASP A01:2021 – Broken Access Control (API1 BOLA & API5 BFLA):**
   - Implementación de `AuthenticateJwtHandler` (`Authorization: Bearer <token>`) y `AuthorizeRolesHandler("admin")` en `server/src/middlewares/auth.middleware.js`.
   - Bloqueo con HTTP `401` ante ausencia/invalidez de token y HTTP `403 Forbidden` cuando un usuario con rol `user` intenta crear/editar/eliminar productos o listar pedidos globales (`GET /api/pedidos`, `/api/v1/usuarios`), además de validación de propiedad en `GET /api/pedidos/:id` y `/api/pedidos/mis-pedidos`.
   - En `POST /api/pedidos`, los precios se resuelven desde `Productos.pro_precio` en base de datos ignorando montos manipulados enviados por el cliente.
2. **OWASP A02:2021 – Cryptographic Failures:**
   - Contraseñas encriptadas con **`bcryptjs`** (factor de costo `10`, hash `$2a$10$...` de `60` caracteres) en `server/src/middlewares/hash.middleware.js` y `prisma/seed.js`, nunca almacenadas ni devueltas en respuestas DTO (`hiddenFields: ["usu_clave_hash"]`).
   - Credenciales de PostgreSQL/Supabase y `JWT_SECRET` aisladas en `.env` (ignorado en `.gitignore`) y retiradas completamente del código fuente del navegador.
3. **OWASP A03:2021 – Injection & XSS (y A05 Security Misconfiguration):**
   - **Zero SQL crudo en modelos:** Acceso 100% tipado con **Prisma ORM** sobre las 30 tablas de Supabase (`0` sentencias SQL en `server/src/models/`).
   - **Sanitización y Validación:** Cadena `SanitizeChainHandler` (elimina `<script>`, etiquetas HTML, bytes nulos `\0` y claves `__proto__`/`constructor`/`prototype`) + validadores por tipo en `validate.middleware.js` + `escapeHtml()` en las vistas MVC del cliente.
   - **Cabeceras y CORS estricto:** Middleware `helmet()` activo en `src/app.js`, `app.disable("x-powered-by")`, manejo global de errores sin exponer *stacktrace* en respuestas `4xx`/`5xx`, y `CorsChainHandler` validando `CORS_ORIGIN` (sin `*` en producción).

---

## 6. Evidencias de Ejecución y Pruebas Obligatorias

Resultado verificado ejecutando `npm test` (`server/cliente/test-rest.js`) contra el servidor Express MVC + Supabase en vivo:

- **Login Admin (`POST /api/auth/login`):** `[PASS] Reto2 Prueba 1 - Login Admin + JWT -> admin@dermakor.com` (`200 OK`, token JWT con `role: "admin"`).
- **Crear / Editar / Eliminar producto (Admin):** `[PASS] Reto2 Prueba 2 - Admin crea producto (201) -> PRD0000091`, seguido de `PUT` (`200`) y `DELETE` (`200`).
- **Control de roles (`user` bloqueado):** `[PASS] Reto2 Prueba 3 - Control de roles (User bloqueado con 403 Forbidden)` al intentar `POST /api/productos` con JWT de `cliente@example.com`.
- **Catálogo público (`GET /api/productos`):** `[PASS] Reto2 Prueba 4 - Catalogo publico GET /api/productos -> 90 productos` con imágenes `.webp` y fondo blanco.
- **Carrito MVC persistente:** `[PASS] Reto2 Prueba 5 - Estructura MVC Frontend completa (models/views/controllers/assets)`.
- **Confirmar pedido (`user`) y Mis Pedidos:** `[PASS] Reto2 Prueba 6 - User confirma pedido (POST /api/pedidos) + GET /mis-pedidos` (`201 Created`, precio validado en BD ignorando precio manipulado `0.01`, visible en `GET /api/pedidos/mis-pedidos`).
- **Gestión de pedidos (`admin`):** `[PASS] Reto2 Prueba 7 - Gestion pedidos Admin (200 Admin, 403 User)` y `Cobertura MVC 30/30 Tablas + RBAC en /api/v1/usuarios (401/403/200 sin hash)`.
- **Entorno productivo verificado en la nube:**
  - Frontend publicado vía GitHub Actions en **`https://andrey1890.github.io/ProyectoIHC/`** (`HTTP 200 OK`).
  - Backend REST MVC en Vercel **`https://dermakorbackendapi.vercel.app/`** (`HTTP 200 OK` en `/`, `/api/status` con `30` tablas y `90` productos, y `/api/productos` leyendo Supabase vía Prisma).
