-- =============================================================================
-- DERMAKOR E-COMMERCE (DERMCLAR & MEDICAL SKIN 2026) - POSTGRESQL & SUPABASE
-- Base de datos: postgres (Supabase: jdsqipqdcuyegjrpvgny) / dermakor_db
-- Incluye: DDL 30 Tablas, Hardening, Datos Semilla Completos (Inventario FEFO
-- + Pedidos + Facturas SRI + Envios) y Permisos API REST para GitHub Pages
-- =============================================================================
BEGIN;

CREATE TABLE IF NOT EXISTS "AjusteDetalle" (
"id_ajuste" CHAR(10) NOT NULL,
"id_lote" CHAR(10) NOT NULL,
"ade_cantidad" INTEGER NOT NULL,
"ade_observacion" VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_ajuste, id_lote)
);

CREATE TABLE IF NOT EXISTS "AjustesInventario" (
"id_ajuste" CHAR(10) NOT NULL,
"id_sede" CHAR(10) NOT NULL,
"id_empleado" CHAR(10) NOT NULL,
"aju_numero" CHAR(15) NOT NULL,
"aju_tipo" CHAR(10) NOT NULL,
"aju_motivo" CHAR(15) NOT NULL,
"aju_fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"aju_observacion" VARCHAR(150) NOT NULL,
    PRIMARY KEY (id_ajuste)
);

CREATE TABLE IF NOT EXISTS "CarritoDetalle" (
"id_carrito" CHAR(10) NOT NULL,
"id_producto" CHAR(10) NOT NULL,
"cad_cantidad" INTEGER NOT NULL,
    PRIMARY KEY (id_carrito, id_producto)
);

CREATE TABLE IF NOT EXISTS "Carritos" (
"id_carrito" CHAR(10) NOT NULL,
"id_cliente" CHAR(10) NOT NULL,
"car_fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"car_estado" CHAR(10) NOT NULL,
    PRIMARY KEY (id_carrito)
);

CREATE TABLE IF NOT EXISTS "Categorias" (
"id_categoria" CHAR(10) NOT NULL,
"cat_nombre" VARCHAR(50) NOT NULL,
"cat_descripcion" VARCHAR(150) NOT NULL,
"cat_estado" CHAR(10) NOT NULL,
    PRIMARY KEY (id_categoria)
);

CREATE TABLE IF NOT EXISTS "Ciudades" (
"id_ciudad" CHAR(10) NOT NULL,
"id_pais" CHAR(10) NOT NULL,
"ciu_nombre" VARCHAR(60) NOT NULL,
    PRIMARY KEY (id_ciudad)
);

CREATE TABLE IF NOT EXISTS "Clientes" (
"id_cliente" CHAR(10) NOT NULL,
"id_usuario" CHAR(10) NOT NULL,
"id_ciudad" CHAR(10) NOT NULL,
"cli_ci_ruc" CHAR(13) NOT NULL,
"cli_nombres" VARCHAR(60) NOT NULL,
"cli_apellidos" VARCHAR(60) NOT NULL,
"cli_telefono" CHAR(15) NOT NULL,
"cli_direccion" VARCHAR(120) NOT NULL,
    PRIMARY KEY (id_cliente)
);

CREATE TABLE IF NOT EXISTS "CompraDetalle" (
"id_compra" CHAR(10) NOT NULL,
"id_producto" CHAR(10) NOT NULL,
"cde_cantidad" INTEGER NOT NULL,
"cde_costo_unit" NUMERIC(10,2) NOT NULL,
"cde_subtotal" NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (id_compra, id_producto)
);

CREATE TABLE IF NOT EXISTS "Compras" (
"id_compra" CHAR(10) NOT NULL,
"id_proveedor" CHAR(10) NOT NULL,
"id_sede" CHAR(10) NOT NULL,
"com_numero" CHAR(15) NOT NULL,
"com_fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"com_total" NUMERIC(10,2) NOT NULL,
"com_estado" CHAR(12) NOT NULL,
    PRIMARY KEY (id_compra)
);

CREATE TABLE IF NOT EXISTS "Departamentos" (
"id_departamento" CHAR(10) NOT NULL,
"dep_nombre" VARCHAR(50) NOT NULL,
"dep_telefono" CHAR(15) NOT NULL,
"dep_estado" CHAR(10) NOT NULL,
    PRIMARY KEY (id_departamento)
);

CREATE TABLE IF NOT EXISTS "Descuentos" (
"id_descuento" CHAR(10) NOT NULL,
"des_codigo" CHAR(15) NOT NULL,
"des_nombre" VARCHAR(50) NOT NULL,
"des_tipo" CHAR(12) NOT NULL,
"des_valor" NUMERIC(10,2) NOT NULL,
"des_fecha_inicio" TIMESTAMP NOT NULL,
"des_fecha_fin" TIMESTAMP NOT NULL,
"des_uso_maximo" INTEGER NOT NULL,
"des_uso_actual" INTEGER NOT NULL DEFAULT 0,
"des_estado" CHAR(10) NOT NULL,
    PRIMARY KEY (id_descuento)
);

CREATE TABLE IF NOT EXISTS "Empleados" (
"id_empleado" CHAR(10) NOT NULL,
"id_usuario" CHAR(10) NOT NULL,
"id_departamento" CHAR(10) NOT NULL,
"id_sede" CHAR(10) NOT NULL,
"emp_ci" CHAR(10) NOT NULL,
"emp_nombres" VARCHAR(60) NOT NULL,
"emp_apellidos" VARCHAR(60) NOT NULL,
"emp_cargo" VARCHAR(50) NOT NULL,
"emp_sueldo" NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (id_empleado)
);

CREATE TABLE IF NOT EXISTS "Envios" (
"id_envio" CHAR(10) NOT NULL,
"id_orden_salida" CHAR(10) NOT NULL,
"env_direccion_entrega" VARCHAR(150) NOT NULL,
"env_transportista" VARCHAR(50) NOT NULL,
"env_numero_guia" CHAR(20) NOT NULL,
"env_fecha_envio" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"env_estado" CHAR(12) NOT NULL,
    PRIMARY KEY (id_envio)
);

CREATE TABLE IF NOT EXISTS "Facturas" (
"id_factura" CHAR(10) NOT NULL,
"id_pedido" CHAR(10) NOT NULL,
"fac_numero" CHAR(17) NOT NULL,
"fac_autorizacion_sri" CHAR(49) NOT NULL,
"fac_fecha_emision" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"fac_total" NUMERIC(10,2) NOT NULL,
"fac_estado" CHAR(10) NOT NULL,
    PRIMARY KEY (id_factura)
);

CREATE TABLE IF NOT EXISTS "LOG" (
"id_usuario" CHAR(10) NOT NULL,
"log_accion" CHAR(10) NOT NULL,
"log_tabla" VARCHAR(30) NOT NULL,
"log_ip" CHAR(45) NOT NULL,
"log_fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"log_datos_antes" TEXT NOT NULL,
"log_datos_despues" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Lotes" (
"id_lote" CHAR(10) NOT NULL,
"id_producto" CHAR(10) NOT NULL,
"id_sede" CHAR(10) NOT NULL,
"lot_numero" CHAR(20) NOT NULL,
"lot_fecha_fabricacion" DATE NOT NULL,
"lot_fecha_caducidad" DATE NOT NULL,
"lot_stock_actual" INTEGER NOT NULL,
"lot_estado" CHAR(12) NOT NULL,
    PRIMARY KEY (id_lote)
);

CREATE TABLE IF NOT EXISTS "OrdenEntradaDetalle" (
"id_orden_entrada" CHAR(10) NOT NULL,
"id_lote" CHAR(10) NOT NULL,
"oed_cantidad_recibida" INTEGER NOT NULL,
"oed_costo_unit" NUMERIC(10,2) NOT NULL,
"oed_subtotal" NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (id_orden_entrada, id_lote)
);

CREATE TABLE IF NOT EXISTS "OrdenSalidaDetalle" (
"id_orden_salida" CHAR(10) NOT NULL,
"id_lote" CHAR(10) NOT NULL,
"osd_cantidad_despachada" INTEGER NOT NULL,
"osd_precio_unit" NUMERIC(10,2) NOT NULL,
"osd_subtotal" NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (id_orden_salida, id_lote)
);

CREATE TABLE IF NOT EXISTS "OrdenesEntrada" (
"id_orden_entrada" CHAR(10) NOT NULL,
"id_compra" CHAR(10) NOT NULL,
"id_sede" CHAR(10) NOT NULL,
"id_empleado" CHAR(10) NOT NULL,
"oen_numero" CHAR(15) NOT NULL,
"oen_fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"oen_observacion" VARCHAR(150) NOT NULL,
"oen_estado" CHAR(12) NOT NULL,
    PRIMARY KEY (id_orden_entrada)
);

CREATE TABLE IF NOT EXISTS "OrdenesSalida" (
"id_orden_salida" CHAR(10) NOT NULL,
"id_pedido" CHAR(10) NOT NULL,
"id_sede" CHAR(10) NOT NULL,
"id_empleado" CHAR(10) NOT NULL,
"osa_numero" CHAR(15) NOT NULL,
"osa_fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"osa_observacion" VARCHAR(150) NOT NULL,
"osa_estado" CHAR(12) NOT NULL,
    PRIMARY KEY (id_orden_salida)
);

CREATE TABLE IF NOT EXISTS "Pagos" (
"id_pago" CHAR(10) NOT NULL,
"id_pedido" CHAR(10) NOT NULL,
"pag_metodo" CHAR(15) NOT NULL,
"pag_monto" NUMERIC(10,2) NOT NULL,
"pag_fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"pag_referencia" VARCHAR(80) NOT NULL,
"pag_estado" CHAR(10) NOT NULL,
    PRIMARY KEY (id_pago)
);

CREATE TABLE IF NOT EXISTS "Paises" (
"id_pais" CHAR(10) NOT NULL,
"pai_codigo" CHAR(3) NOT NULL,
"pai_nombre" VARCHAR(60) NOT NULL,
    PRIMARY KEY (id_pais)
);

CREATE TABLE IF NOT EXISTS "PedidoDetalle" (
"id_pedido" CHAR(10) NOT NULL,
"id_producto" CHAR(10) NOT NULL,
"pde_cantidad" INTEGER NOT NULL,
"pde_precio_unit" NUMERIC(10,2) NOT NULL,
"pde_subtotal" NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (id_pedido, id_producto)
);

CREATE TABLE IF NOT EXISTS "Pedidos" (
"id_pedido" CHAR(10) NOT NULL,
"id_cliente" CHAR(10) NOT NULL,
"id_sede" CHAR(10) NOT NULL,
"id_ciudad" CHAR(10) NOT NULL,
"id_descuento" CHAR(10),
"ped_numero" CHAR(15) NOT NULL,
"ped_direccion_entrega" VARCHAR(150) NOT NULL,
"ped_latitud" NUMERIC(10,8) NOT NULL,
"ped_longitud" NUMERIC(11,8) NOT NULL,
"ped_fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
"ped_subtotal" NUMERIC(10,2) NOT NULL,
"ped_descuento" NUMERIC(10,2) NOT NULL DEFAULT 0.00,
"ped_iva" NUMERIC(10,2) NOT NULL,
"ped_total" NUMERIC(10,2) NOT NULL,
"ped_estado" CHAR(12) NOT NULL,
    PRIMARY KEY (id_pedido)
);

CREATE TABLE IF NOT EXISTS "ProductoImagenes" (
"id_imagen" CHAR(10) NOT NULL,
"id_producto" CHAR(10) NOT NULL,
"img_url" VARCHAR(255) NOT NULL,
"img_orden" INTEGER NOT NULL DEFAULT 1,
"img_es_portada" CHAR(1) NOT NULL DEFAULT '0'::bpchar,
    PRIMARY KEY (id_imagen)
);

CREATE TABLE IF NOT EXISTS "Productos" (
"id_producto" CHAR(10) NOT NULL,
"id_categoria" CHAR(10) NOT NULL,
"pro_codigo" CHAR(15) NOT NULL,
"pro_nombre" VARCHAR(100) NOT NULL,
"pro_descripcion" TEXT NOT NULL,
"pro_precio" NUMERIC(10,2) NOT NULL,
"pro_estado" CHAR(10) NOT NULL,
    PRIMARY KEY (id_producto)
);

CREATE TABLE IF NOT EXISTS "Proveedores" (
"id_proveedor" CHAR(10) NOT NULL,
"id_ciudad" CHAR(10) NOT NULL,
"prv_ruc" CHAR(13) NOT NULL,
"prv_razon_social" VARCHAR(100) NOT NULL,
"prv_telefono" CHAR(15) NOT NULL,
"prv_email" VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_proveedor)
);

CREATE TABLE IF NOT EXISTS "Roles" (
"id_rol" CHAR(10) NOT NULL,
"rol_nombre" VARCHAR(30) NOT NULL,
"rol_descripcion" VARCHAR(100) NOT NULL,
"rol_estado" CHAR(10) NOT NULL,
    PRIMARY KEY (id_rol)
);

CREATE TABLE IF NOT EXISTS "Sedes" (
"id_sede" CHAR(10) NOT NULL,
"id_ciudad" CHAR(10) NOT NULL,
"sed_nombre" VARCHAR(60) NOT NULL,
"sed_direccion" VARCHAR(120) NOT NULL,
"sed_telefono" CHAR(15) NOT NULL,
"sed_tipo" CHAR(12) NOT NULL,
"sed_latitud" NUMERIC(10,8) NOT NULL,
"sed_longitud" NUMERIC(11,8) NOT NULL,
    PRIMARY KEY (id_sede)
);

CREATE TABLE IF NOT EXISTS "Usuarios" (
"id_usuario" CHAR(10) NOT NULL,
"id_rol" CHAR(10) NOT NULL,
"usu_nombre" VARCHAR(50) NOT NULL,
"usu_email" VARCHAR(100) NOT NULL,
"usu_clave_hash" CHAR(60) NOT NULL,
"usu_estado" CHAR(10) NOT NULL,
    PRIMARY KEY (id_usuario)
);

-- =============================================================================
-- 2. DATOS BASE: PAISES, CIUDADES, SEDES, ROLES, USUARIOS, CLIENTES, EMPLEADOS
-- =============================================================================

INSERT INTO "Paises" ("id_pais", "pai_codigo", "pai_nombre")
VALUES ('PAI0000001', 'EC', 'Ecuador')
ON CONFLICT ("id_pais") DO UPDATE SET "pai_nombre" = EXCLUDED."pai_nombre";

INSERT INTO "Ciudades" ("id_ciudad", "id_pais", "ciu_nombre") VALUES
('CIU0000001', 'PAI0000001', 'Quito'),
('CIU0000002', 'PAI0000001', 'Guayaquil'),
('CIU0000003', 'PAI0000001', 'Cuenca'),
('CIU0000004', 'PAI0000001', 'Ambato')
ON CONFLICT ("id_ciudad") DO UPDATE SET "ciu_nombre" = EXCLUDED."ciu_nombre";

INSERT INTO "Sedes" ("id_sede", "id_ciudad", "sed_nombre", "sed_direccion", "sed_telefono", "sed_tipo", "sed_latitud", "sed_longitud") VALUES
('SED0000001', 'CIU0000001', 'Matriz Quito - Edificio La Casa', 'Av. República E1-136 y Atahualpa, Of. 3', '0996096996', 'MATRIZ', -0.186590, -78.484120),
('SED0000002', 'CIU0000002', 'Bodega Guayaquil - Kennedy Norte', 'Av. Francisco de Orellana y Justino Cornejo', '0996096997', 'BODEGA', -2.164890, -79.897450),
('SED0000003', 'CIU0000003', 'Centro Distribución Cuenca', 'Av. Solano y Remigio Crespo', '0996096998', 'SUCURSAL', -2.900120, -79.005890),
('SED0000004', 'CIU0000004', 'Sede Logística Ambato', 'Av. Cevallos y Montalvo', '0996096999', 'SUCURSAL', -1.241670, -78.619720)
ON CONFLICT ("id_sede") DO UPDATE SET
  "sed_nombre" = EXCLUDED."sed_nombre",
  "sed_direccion" = EXCLUDED."sed_direccion",
  "sed_latitud" = EXCLUDED."sed_latitud",
  "sed_longitud" = EXCLUDED."sed_longitud";

INSERT INTO "Roles" ("id_rol", "rol_nombre", "rol_descripcion", "rol_estado") VALUES
('ROL0000001', 'ADMIN', 'Administrador general Dermakor', 'ACTIVO'),
('ROL0000002', 'OPERADOR', 'Operador logístico de bodega FEFO', 'ACTIVO'),
('ROL0000003', 'CLIENTE', 'Cliente registrado E-Commerce Dermakor', 'ACTIVO')
ON CONFLICT ("id_rol") DO NOTHING;

INSERT INTO "Usuarios" ("id_usuario", "id_rol", "usu_nombre", "usu_email", "usu_clave_hash", "usu_estado") VALUES
('USU0000001', 'ROL0000003', 'María Fernández', 'cliente@example.com', 'pbkdf2_sha256$2026$dermakor', 'ACTIVO'),
('USU0000002', 'ROL0000003', 'Dr. Carlos Andrade', 'carlos.andrade@clinica.ec', 'pbkdf2_sha256$2026$dermakor', 'ACTIVO'),
('USU0000003', 'ROL0000003', 'Dra. Valeria Salazar', 'valeria.salazar@derma.ec', 'pbkdf2_sha256$2026$dermakor', 'ACTIVO'),
('USU0000004', 'ROL0000002', 'Andrés Villavicencio', 'bodega@dermakor.com', 'pbkdf2_sha256$2026$dermakor', 'ACTIVO')
ON CONFLICT ("id_usuario") DO UPDATE SET "usu_nombre" = EXCLUDED."usu_nombre", "usu_email" = EXCLUDED."usu_email";

INSERT INTO "Clientes" ("id_cliente", "id_usuario", "id_ciudad", "cli_ci_ruc", "cli_nombres", "cli_apellidos", "cli_telefono", "cli_direccion") VALUES
('CLI0000001', 'USU0000001', 'CIU0000001', '1718293849', 'María', 'Fernández', '0996096996', 'Av. República E1-136 y Atahualpa, Edif. La Casa, Piso 1, Of. 3'),
('CLI0000002', 'USU0000002', 'CIU0000002', '0918273645001', 'Dr. Carlos', 'Andrade', '0987654321', 'Av. Francisco de Orellana, Torre Médica II, Of. 402'),
('CLI0000003', 'USU0000003', 'CIU0000003', '0102938475001', 'Dra. Valeria', 'Salazar', '0991122334', 'Av. Solano 4-55 y Doce de Abril, Consultorio 105')
ON CONFLICT ("id_cliente") DO UPDATE SET "cli_nombres" = EXCLUDED."cli_nombres", "cli_apellidos" = EXCLUDED."cli_apellidos", "cli_ci_ruc" = EXCLUDED."cli_ci_ruc";

INSERT INTO "Departamentos" ("id_departamento", "dep_nombre", "dep_telefono", "dep_estado") VALUES
('DEP0000001', 'Logística y Despacho FEFO', '0996096996', 'ACTIVO')
ON CONFLICT ("id_departamento") DO NOTHING;

INSERT INTO "Empleados" ("id_empleado", "id_usuario", "id_departamento", "id_sede", "emp_ci", "emp_nombres", "emp_apellidos", "emp_cargo", "emp_sueldo") VALUES
('EMP0000001', 'USU0000004', 'DEP0000001', 'SED0000001', '1712345678', 'Andrés', 'Villavicencio', 'Jefe de Despacho FEFO Quito', 1250.00),
('EMP0000002', 'USU0000004', 'DEP0000001', 'SED0000002', '0912345678', 'Luis', 'Mendoza', 'Jefe de Despacho FEFO Guayaquil', 1200.00),
('EMP0000003', 'USU0000004', 'DEP0000001', 'SED0000003', '0112345678', 'Sofía', 'Crespo', 'Jefe de Despacho FEFO Cuenca', 1150.00),
('EMP0000004', 'USU0000004', 'DEP0000001', 'SED0000004', '1812345678', 'Diego', 'Naranjo', 'Jefe de Despacho FEFO Ambato', 1150.00)
ON CONFLICT ("id_empleado") DO UPDATE SET "id_sede" = EXCLUDED."id_sede";

INSERT INTO "Descuentos" ("id_descuento", "des_codigo", "des_nombre", "des_tipo", "des_valor", "des_fecha_inicio", "des_fecha_fin", "des_uso_maximo", "des_uso_actual", "des_estado") VALUES
('DSC0000001', 'DERMA10', 'Descuento Bienvenida Dermakor 10%', 'PORCENTAJE', 10.00, '2025-01-01', '2027-12-31', 5000, 12, 'ACTIVO'),
('DSC0000002', 'EXOSOMA15', 'Promoción Línea Exosomas 15%', 'PORCENTAJE', 15.00, '2025-01-01', '2027-12-31', 2000, 5, 'ACTIVO'),
('DSC0000003', 'PRO2026', 'Bono Especialistas Cabina $15', 'MONTO_FIJO', 15.00, '2025-01-01', '2027-12-31', 1000, 8, 'ACTIVO')
ON CONFLICT ("id_descuento") DO UPDATE SET "des_codigo" = EXCLUDED."des_codigo", "des_valor" = EXCLUDED."des_valor", "des_estado" = 'ACTIVO';

-- =============================================================================
-- 3. CATEGORIAS, 28 PRODUCTOS DERMCLAR 2026, IMAGENES Y LOTES FEFO
-- =============================================================================
DELETE FROM "Lotes" WHERE "lot_numero" LIKE 'L26-%' AND "id_lote" NOT BETWEEN 'LOT0000001' AND 'LOT0000056';
INSERT INTO "Categorias" ("id_categoria", "cat_nombre", "cat_descripcion", "cat_estado")
VALUES ('CAT0000001', 'Exosomas', 'Línea nanotecnológica regenerativa con exosomas vegetales', 'ACTIVO')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre", "cat_descripcion" = EXCLUDED."cat_descripcion", "cat_estado" = 'ACTIVO';
INSERT INTO "Categorias" ("id_categoria", "cat_nombre", "cat_descripcion", "cat_estado")
VALUES ('CAT0000002', 'Hidratación', 'Sistemas de hidratación profunda y brumas termales', 'ACTIVO')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre", "cat_descripcion" = EXCLUDED."cat_descripcion", "cat_estado" = 'ACTIVO';
INSERT INTO "Categorias" ("id_categoria", "cat_nombre", "cat_descripcion", "cat_estado")
VALUES ('CAT0000003', 'Limpieza', 'Espumas, geles y soluciones limpiadoras dermo-protectoras', 'ACTIVO')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre", "cat_descripcion" = EXCLUDED."cat_descripcion", "cat_estado" = 'ACTIVO';
INSERT INTO "Categorias" ("id_categoria", "cat_nombre", "cat_descripcion", "cat_estado")
VALUES ('CAT0000004', 'Protección solar', 'Fotoprotección clínica de amplio espectro SPF 50+', 'ACTIVO')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre", "cat_descripcion" = EXCLUDED."cat_descripcion", "cat_estado" = 'ACTIVO';
INSERT INTO "Categorias" ("id_categoria", "cat_nombre", "cat_descripcion", "cat_estado")
VALUES ('CAT0000005', 'Cuidado facial', 'Sérums, despigmentantes, contornos y cuidado facial diario', 'ACTIVO')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre", "cat_descripcion" = EXCLUDED."cat_descripcion", "cat_estado" = 'ACTIVO';
INSERT INTO "Categorias" ("id_categoria", "cat_nombre", "cat_descripcion", "cat_estado")
VALUES ('CAT0000006', 'Corporal', 'Liporeductores, reafirmantes, anticelulíticos y enzimas', 'ACTIVO')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre", "cat_descripcion" = EXCLUDED."cat_descripcion", "cat_estado" = 'ACTIVO';
INSERT INTO "Categorias" ("id_categoria", "cat_nombre", "cat_descripcion", "cat_estado")
VALUES ('CAT0000007', 'Metaloterapia', ' Instrumental ergonómico de aleación ligera para cabina', 'ACTIVO')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre", "cat_descripcion" = EXCLUDED."cat_descripcion", "cat_estado" = 'ACTIVO';
INSERT INTO "Categorias" ("id_categoria", "cat_nombre", "cat_descripcion", "cat_estado")
VALUES ('CAT0000008', 'Mascarillas', 'Mascarillas hidroplásticas y velos descongestivos', 'ACTIVO')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre", "cat_descripcion" = EXCLUDED."cat_descripcion", "cat_estado" = 'ACTIVO';
INSERT INTO "Categorias" ("id_categoria", "cat_nombre", "cat_descripcion", "cat_estado")
VALUES ('CAT0000009', 'Insumos', 'Agujas hipodérmicas y dispositivos médicos estériles', 'ACTIVO')
ON CONFLICT ("id_categoria") DO UPDATE SET "cat_nombre" = EXCLUDED."cat_nombre", "cat_descripcion" = EXCLUDED."cat_descripcion", "cat_estado" = 'ACTIVO';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000001', 'CAT0000001', 'DRM-2026-001', 'ExoFace', 'Terapia exosomal facial que revitaliza, regenera y redensifica la piel desde niveles profundos. ||META||{"slug": "exoface-casa", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Sérum bioestimulante y reafirmante", "presentacion": "Gotero 30 ml", "precioProfesional": 62.0, "imagen": "images/01_exoface.png", "destacadoHome": true, "principiosActivos": ["Centella Asiática Exosomes", "Exosomas de Cúrcuma Longa", "PDRN (Salmón DNA)", "Hylasome EG-10 (Ácido Hialurónico Reticulado)", "Péptidos Biomiméticos", "Niacinamida", "Silicio Orgánico", "Complejos de Aminoácidos"], "beneficios": ["Mejora la firmeza visible desde la segunda sesión.", "Aumento significativo de la densidad dérmica.", "Efecto tensor inmediato y piel más compacta.", "Reestructuración progresiva de la arquitectura cutánea."], "modoUso": "Aplicar de 4 a 6 gotas sobre el rostro limpio por la mañana y noche con suaves movimientos circulares."}', 74.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000001', 'PRD0000001', 'images/01_exoface.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000001', 'PRD0000001', 'SED0000001', 'L26-QTO-001A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000002', 'PRD0000001', 'SED0000002', 'L26-GYE-001B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000002', 'CAT0000001', 'DRM-2026-002', 'ExoLumine', 'Regula la actividad de los melanocitos y disminuye notablemente la inflamación cutánea y las manchas. ||META||{"slug": "exolumine-casa", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Exosomas Despigmentantes y Antioxidantes", "presentacion": "Gotero 30 ml", "precioProfesional": 48.0, "imagen": "images/02_exolumine.png", "destacadoHome": false, "principiosActivos": ["Exosomas Centella Reversa", "Ácido Tranexámico", "Niacinamida", "Neurolight 61 G°", "Alfa-Arbutina", "Ácido Hialurónico de mediano peso molecular", "Silicio Orgánico", "Complejo Antioxidante"], "beneficios": ["Disminución visible del tono irregular desde la 3ra semana.", "Reducción de citocinas inflamatorias en la piel tratada.", "Aumento de la tolerancia cutánea en pieles muy sensibles."], "modoUso": "Aplicar sobre el rostro limpio antes de la crema hidratante. Usar protector solar de día."}', 58.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000002', 'PRD0000002', 'images/02_exolumine.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000003', 'PRD0000002', 'SED0000001', 'L26-QTO-002A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000004', 'PRD0000002', 'SED0000002', 'L26-GYE-002B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000003', 'CAT0000001', 'DRM-2026-003', 'ExoBlemish', 'Ayuda a la regulación sebácea, tiene acción queratolítica, calmante y potente acción regeneradora. ||META||{"slug": "exoblemish-casa", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Bioactivo seborregulador y calmante", "presentacion": "Gotero 30 ml", "precioProfesional": 48.0, "imagen": "images/03_exoblemish.png", "destacadoHome": false, "principiosActivos": ["Exosomas de Cúrcuma Longa", "Ácido Succínico", "Niacinamida y Biotina", "Zinc Sebum", "Cobre II Sulfato pentahidratado", "Pore Reductyl", "Factor de Crecimiento Epidermal"], "beneficios": ["Reducción visible de comedones y pápulas.", "Disminución duradera de la seborrea y brillo facial.", "Alivio de la inflamación e irritación en brotes de acné."], "modoUso": "Aplicar sobre las zonas con tendencia grasa o brotes dos veces al día después de la limpieza."}', 58.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000003', 'PRD0000003', 'images/03_exoblemish.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000005', 'PRD0000003', 'SED0000001', 'L26-QTO-003A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000006', 'PRD0000003', 'SED0000002', 'L26-GYE-003B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000004', 'CAT0000001', 'DRM-2026-004', 'ExoHair', 'Exosomas que reactivan el ciclo de vida capilar, regeneran folículos pilosos y mejoran la vascularización. ||META||{"slug": "exohair-casa", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Reactivación folicular desde la raíz", "presentacion": "Gotero 30 ml", "precioProfesional": 46.0, "imagen": "images/04_exohair.png", "destacadoHome": false, "principiosActivos": ["Exosomas de Cúrcuma Longa", "Biocenta Capilar", "Bio Capigen PT", "Hyaceramidyl (Ácido Hialurónico + Ceramidas)", "D-Pantenol", "Biotina y Vitamina B12", "Silicio Orgánico"], "beneficios": ["Disminuye la caída progresiva del cabello.", "Estimula el nacimiento de cabello nuevo y denso.", "Engrosa visiblemente el tallo piloso.", "Reequilibra el ecosistema del cuero cabelludo."], "modoUso": "Aplicar en el cuero cabelludo seco por la noche y masajear suavemente con la yema de los dedos."}', 56.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000004', 'PRD0000004', 'images/04_exohair.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000007', 'PRD0000004', 'SED0000001', 'L26-QTO-004A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000008', 'PRD0000004', 'SED0000002', 'L26-GYE-004B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000005', 'CAT0000002', 'DRM-2026-005', 'Aqua piel 3AH', 'Sérum restitutivo de agua y nutrientes. Su film molecular con liposomas y ácido hialurónico reticulado aporta lozanía e hidratación inmediata. ||META||{"slug": "aqua-piel-3ah", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Sérum Hidratante Intenso", "presentacion": "Frasco 50 ml", "precioProfesional": 35.0, "imagen": "", "destacadoHome": true, "principiosActivos": ["3 Tipos de Ácido Hialurónico Reticulado", "Liposomas Hidratantes", "Complejo Osmoprotector", "Pantenol y Minerales Esenciales"], "beneficios": ["Hidratación multicapa hasta por 72 horas.", "Textura ultraligera de rápida absorción.", "Piel visiblemente más rellena, suave y elástica."], "modoUso": "Aplicar 1 o 2 pulsaciones en la piel limpia del rostro, cuello y escote mañana y noche."}', 42.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000005', 'PRD0000005', 'images/placeholder_05.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000009', 'PRD0000005', 'SED0000001', 'L26-QTO-005A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000010', 'PRD0000005', 'SED0000002', 'L26-GYE-005B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000006', 'CAT0000003', 'DRM-2026-006', 'Agua micelar piel sensible', 'Diseñada para piel sensible con macromoléculas de Ácido Hialurónico y complejo AMC con 6 activos hidratantes. ||META||{"slug": "agua-micelar-sensible", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Limpieza y desmaquillante respetuoso", "presentacion": "Frasco 260 ml", "precioProfesional": 22.0, "imagen": "", "destacadoHome": true, "principiosActivos": ["Micelas biocompatibles", "Macromoléculas de Ácido Hialurónico", "Complejo Hidratante AMC con 6 activos", "Extracto Botánico Calmante"], "beneficios": ["Retira impurezas y maquillaje waterproof sin irritar.", "Protege la barrera cutánea frente a la deshidratación.", "Apta para contorno de ojos y pieles reactivas."], "modoUso": "Humedecer un disco de algodón y pasar suavemente por rostro, ojos y labios sin frotar."}', 27.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000006', 'PRD0000006', 'images/placeholder_06.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000011', 'PRD0000006', 'SED0000001', 'L26-QTO-006A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000012', 'PRD0000006', 'SED0000002', 'L26-GYE-006B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000007', 'CAT0000004', 'DRM-2026-007', 'Protector solar DD Cream con color', 'Crema de defensa diaria multifuncional contra el fotoenvejecimiento y las manchas gracias a Neurolight 61.G SPF 30. ||META||{"slug": "dd-cream-color", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Protege y unifica sin sensación grasa", "presentacion": "Tubo 50 g", "precioProfesional": 40.0, "imagen": "", "destacadoHome": true, "principiosActivos": ["Filtros Solares UVA/UVB SPF 30", "Neurolight 61.G Despigmentante", "Pigmentos Microencapsulados de Color Adaptable", "Vitamina E Antioxidante"], "beneficios": ["Unifica el tono de la piel con acabado mate natural.", "Reduce manchas oscuras existentes.", "Fórmula no comedogénica libre de aceites pesados."], "modoUso": "Aplicar uniformemente como último paso de la rutina facial cada mañana antes de salir."}', 48.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000007', 'PRD0000007', 'images/placeholder_07.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000013', 'PRD0000007', 'SED0000001', 'L26-QTO-007A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000014', 'PRD0000007', 'SED0000002', 'L26-GYE-007B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000008', 'CAT0000005', 'DRM-2026-008', 'Derm face serum', 'Contiene ácido hialurónico, péptidos y extractos naturales que hidratan a profundidad hasta por 48 horas sin sensación pegajosa. ||META||{"slug": "derm-face-serum", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Gel facial seguro en pieles sensibles", "presentacion": "Frasco 30 ml", "precioProfesional": 34.0, "imagen": "", "destacadoHome": false, "principiosActivos": ["Ácido Hialurónico Puro", "Péptidos Reafirmantes", "Extractos Botánicos Regeneradores", "Pantenol Calmante"], "beneficios": ["Hidratación prolongada por 48 horas.", "Devuelve la firmeza y volumen natural de las facciones.", "Dermatológicamente comprobado y no comedogénico."], "modoUso": "Distribuir en rostro y cuello con masajes ascendentes hasta que se absorba por completo."}', 41.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000008', 'PRD0000008', 'images/placeholder_08.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000015', 'PRD0000008', 'SED0000001', 'L26-QTO-008A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000016', 'PRD0000008', 'SED0000002', 'L26-GYE-008B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000009', 'CAT0000005', 'DRM-2026-009', 'Contorno de ojos', 'Sérum sensorial sedoso y descongestionante formulado con extracto de meliloto, 3 tipos de AH y péptidos Eyeseryl y Argireline. ||META||{"slug": "contorno-ojos-frio", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Aplicador metálico con efecto frío", "presentacion": "Frasco 15 ml", "precioProfesional": 40.0, "imagen": "", "destacadoHome": false, "principiosActivos": ["Extracto de Meliloto", "3 Tipos de Ácido Hialurónico", "Péptido Eyeseryl (Drenante antibolsas)", "Argireline & Leuphasyl (Relajantes musculares)"], "beneficios": ["Atenúa bolsas y ojeras oscuras rápidamente.", "Relaja las líneas de expresión perioculares.", "Aplicador de aleación metálica que potencia el drenaje por efecto térmico."], "modoUso": "Presionar suavemente y deslizar la punta metálica sobre el contorno del ojo desde el interior hacia afuera."}', 48.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000009', 'PRD0000009', 'images/placeholder_09.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000017', 'PRD0000009', 'SED0000001', 'L26-QTO-009A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000018', 'PRD0000009', 'SED0000002', 'L26-GYE-009B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000010', 'CAT0000003', 'DRM-2026-010', 'Dermclar Luminescence Cleanser', 'Limpiador profundo exfoliante con acción astringente que potencializa la penetración de tratamientos aclarantes. ||META||{"slug": "luminescence-cleanser", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Loción pre-peeling limpiadora profunda", "presentacion": "Frasco 250 ml", "precioProfesional": 33.0, "imagen": "", "destacadoHome": false, "principiosActivos": ["Ácido Salicílico", "Ácido Glicólico y Láctico", "Zinc Sebum con 16 aminoácidos libres", "Vitamina F"], "beneficios": ["Exfoliación microquímica diaria suave.", "Equilibra la producción de sebo y reduce bacterias.", "Prepara la piel para recibir peelings y sérums."], "modoUso": "Aplicar sobre el rostro húmedo, masajear en círculos y enjuagar con abundante agua tibia."}', 40.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000010', 'PRD0000010', 'images/placeholder_10.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000019', 'PRD0000010', 'SED0000001', 'L26-QTO-010A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000020', 'PRD0000010', 'SED0000002', 'L26-GYE-010B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000011', 'CAT0000005', 'DRM-2026-011', 'Proteoglycans Serum', 'Actúa sobre la raíz del envejecimiento celular regenerando las capas más profundas de la piel y aportando firmeza. ||META||{"slug": "proteoglycans-serum", "marca": "Dermclar", "tipoUso": "casa", "subtitulo": "Serum de Proteoglicanos y Vitamina C", "presentacion": "Frasco 15 ml", "precioProfesional": 32.0, "imagen": "", "destacadoHome": false, "principiosActivos": ["Proteoglicanos Puros", "Vitamina C Estabilizada", "Ácido Hialurónico", "Antioxidantes de Alta Potencia"], "beneficios": ["Regenera las estructuras de sostén dérmico.", "Neutraliza radicales libres generados por la polución.", "Aporta luminosidad radiante a pieles apagadas."], "modoUso": "Aplicar 3 gotas por la mañana antes de la crema de día."}', 40.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000011', 'PRD0000011', 'images/placeholder_11.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000021', 'PRD0000011', 'SED0000001', 'L26-QTO-011A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000022', 'PRD0000011', 'SED0000002', 'L26-GYE-011B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000012', 'CAT0000006', 'DRM-2026-012', 'DermclarFirm', 'Tratamiento clínico para combatir la flacidez y las estrías. Devuelve elasticidad firme a la arquitectura cutánea. ||META||{"slug": "dermclar-firm-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Reafirmante y tensor intensivo de la piel", "presentacion": "Caja 5 viales X 10ml", "precioProfesional": 79.0, "imagen": "images/08_dermclar_firm.png", "destacadoHome": true, "principiosActivos": ["DMAE Concentrado", "Glucosaminoglicanos", "Silicio Orgánico", "D-Pantenol", "Centella Asiática Pura"], "beneficios": ["Efecto lifting tisular visible y sostenido.", "Estimulación masiva de colágeno y elastina.", "Disminuye profundidad y coloración de estrías."], "modoUso": "Uso exclusivo por profesionales capacitados mediante técnicas de mesoterapia o aparatología estética."}', 79.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000012', 'PRD0000012', 'images/08_dermclar_firm.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000023', 'PRD0000012', 'SED0000001', 'L26-QTO-012A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000024', 'PRD0000012', 'SED0000002', 'L26-GYE-012B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000013', 'CAT0000006', 'DRM-2026-013', 'DermclarObes', 'Fórmula #1 para reducir el volumen corporal, adiposidades localizadas rebeldes y contornear la silueta. ||META||{"slug": "dermclar-obes-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Reductor de medidas y grasa rebelde", "presentacion": "Caja 5 viales X 10ml", "precioProfesional": 98.0, "imagen": "images/06_dermclar_obes.png", "destacadoHome": false, "principiosActivos": ["Fosfatidilcolina Lipolítica", "Desoxicolato de Sodio", "L-Carnitina Biológica", "Rutina Vasoactiva"], "beneficios": ["Potente liporeductor en tiempo récord.", "Disuelve adiposidades en abdomen, flancos y muslos.", "Limita la retención hídrica en tejido adiposo."], "modoUso": "Protocolo clínico profesional con técnica de electroporación o mesoterapia."}', 98.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000013', 'PRD0000013', 'images/06_dermclar_obes.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000025', 'PRD0000013', 'SED0000001', 'L26-QTO-013A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000026', 'PRD0000013', 'SED0000002', 'L26-GYE-013B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000014', 'CAT0000006', 'DRM-2026-014', 'DermclarCelu', 'Disminuye el tamaño de los nódulos grasos celulíticos y estimula el drenaje de toxinas acumuladas. ||META||{"slug": "dermclar-celu-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Anticelulítico y desintoxicante de tejido", "presentacion": "Caja 5 viales X 10ml", "precioProfesional": 70.0, "imagen": "images/07_dermclar_celu.png", "destacadoHome": false, "principiosActivos": ["L-Carnitina", "Cafeína Pura", "Silicio Orgánico", "Centella Asiática", "Extracto de Meliloto"], "beneficios": ["Ideal para celulitis edematosa, compacta y flácida.", "Alisa la piel de naranja y reafirma el tejido.", "Activa la microcirculación de retorno venolinfático."], "modoUso": "Uso profesional en cabina estética con aparatología o técnica tópica avanzada."}', 70.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000014', 'PRD0000014', 'images/07_dermclar_celu.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000027', 'PRD0000014', 'SED0000001', 'L26-QTO-014A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000028', 'PRD0000014', 'SED0000002', 'L26-GYE-014B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000015', 'CAT0000005', 'DRM-2026-015', 'DermclarPlasmaVit', 'Revitalizante que nutre intensamente los tejidos mejorando la elasticidad y acelerando los procesos celulares. ||META||{"slug": "dermclar-plasmavit-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Booster Tisular Revitalizante Celular", "presentacion": "Caja 5 viales X 10ml", "precioProfesional": 78.0, "imagen": "images/05_dermclar_plasmavit.png", "destacadoHome": false, "principiosActivos": ["Complejo de Aminoácidos Esenciales", "Vitamina C Pura", "Sinadol Antioxidante"], "beneficios": ["Aumenta el grosor y consistencia de la piel madura.", "Atenúa arrugas finas y líneas de expresión.", "Gran poder iluminador y despigmentante."], "modoUso": "Aplicación profesional facial mediante técnicas de microneedling o electroporación."}', 78.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000015', 'PRD0000015', 'images/05_dermclar_plasmavit.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000029', 'PRD0000015', 'SED0000001', 'L26-QTO-015A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000030', 'PRD0000015', 'SED0000002', 'L26-GYE-015B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000016', 'CAT0000005', 'DRM-2026-016', 'DermclarHair', 'Retarda la caída, mejora la calidad y resistencia del folículo y favorece la actividad biológica en receso. ||META||{"slug": "dermclar-hair-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Previene la caída y aumenta la densidad capilar", "presentacion": "Caja 5 viales X 10ml", "precioProfesional": 85.0, "imagen": "images/09_dermclar_hair.png", "destacadoHome": false, "principiosActivos": ["Ácido Hialurónico", "D-Pantenol", "Silicio Orgánico", "Rutina", "Oligoelementos"], "beneficios": ["Disminuye la fragilidad capilar.", "Aporta brillo y nutrición profunda a la fibra.", "Estimula el crecimiento del cabello nuevo."], "modoUso": "Protocolo clínico capilar aplicado en cabina."}', 85.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000016', 'PRD0000016', 'images/09_dermclar_hair.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000031', 'PRD0000016', 'SED0000001', 'L26-QTO-016A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000032', 'PRD0000016', 'SED0000002', 'L26-GYE-016B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000017', 'CAT0000005', 'DRM-2026-017', 'DermclarFace', 'Solución integral para combatir el envejecimiento del rostro. Hidrata, nutre, reafirma y aclara. ||META||{"slug": "dermclar-face-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Redensifica y rejuvenece el rostro", "presentacion": "Caja 5 viales X 10ml", "precioProfesional": 94.0, "imagen": "images/10_dermclar_face.png", "destacadoHome": false, "principiosActivos": ["Ácido Hialurónico", "Glutatión", "Argireline y Leuphasyl", "DMAE", "Vitamina C y E"], "beneficios": ["Mejora arrugas y líneas de expresión.", "Genera efecto tensor y lifting evidente.", "Alisado y homogeneización de la tez."], "modoUso": "Aplicación profesional con técnicas de electroporación."}', 94.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000017', 'PRD0000017', 'images/10_dermclar_face.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000033', 'PRD0000017', 'SED0000001', 'L26-QTO-017A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000034', 'PRD0000017', 'SED0000002', 'L26-GYE-017B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000018', 'CAT0000005', 'DRM-2026-018', 'DermclarFace V', 'Ayuda a esculpir, retensar y redefinir el contorno del rostro, doble mentón y zona V. ||META||{"slug": "dermclar-face-v-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Reafirma y tonifica la Zona V del rostro", "presentacion": "Caja 5 viales X 5ml", "precioProfesional": 105.0, "imagen": "images/11_dermclar_face_v.png", "destacadoHome": false, "principiosActivos": ["Hidrolizado de Algas Rojas", "Ampelopsina", "Péptidos Biomiméticos", "Silicio Orgánico", "DMAE"], "beneficios": ["Remodelación visible del óvalo facial.", "Disminuye grasa localizada en papada.", "Aumenta la firmeza y fibras colágenas."], "modoUso": "Tratamiento en cabina médica para perfilamiento facial."}', 105.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000018', 'PRD0000018', 'images/11_dermclar_face_v.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000035', 'PRD0000018', 'SED0000001', 'L26-QTO-018A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000036', 'PRD0000018', 'SED0000002', 'L26-GYE-018B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000019', 'CAT0000005', 'DRM-2026-019', 'DermclarFace OB', 'Fórmula de alta tecnología que disminuye el volumen adiposo de mejillas y doble mentón. ||META||{"slug": "dermclar-face-ob-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Reduce la papada y perfila el rostro", "presentacion": "Caja 5 viales X 5ml", "precioProfesional": 110.0, "imagen": "images/12_dermclar_face_ob.png", "destacadoHome": false, "principiosActivos": ["L-Carnitina", "Silicio Orgánico", "Fosfatidilcolina", "Cafeína", "Troxerutina"], "beneficios": ["Desprende cúmulos grasos submentonianos.", "Acción drenante para evacuar ácidos grasos.", "Mejora sustancialmente el ángulo de la barbilla."], "modoUso": "Uso profesional en reducción submentoniana."}', 110.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000019', 'PRD0000019', 'images/12_dermclar_face_ob.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000037', 'PRD0000019', 'SED0000001', 'L26-QTO-019A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000038', 'PRD0000019', 'SED0000002', 'L26-GYE-019B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000020', 'CAT0000006', 'DRM-2026-020', 'Dermclar Bump UP', 'Péptidos biomiméticos Adifyline y Factor de Crecimiento Epidermal (EGF PLUS) para remodelar y aportar firmeza glútea. ||META||{"slug": "dermclar-bump-up-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Proyecta la curvatura de los glúteos", "presentacion": "Caja 10 ampollas X 5ml", "precioProfesional": 95.0, "imagen": "images/13_dermclar_bump_up.png", "destacadoHome": false, "principiosActivos": ["Ácido Hialurónico de alto peso molecular", "EGF PLUS (Factor de Crecimiento Epidermal)", "Péptido Biomimético Adifyline", "Vitamina C y 15 Aminoácidos", "Silicio Orgánico y DMAE"], "beneficios": ["Aporta volumen y definición a la zona glútea.", "Estimula la síntesis de colágeno estructural.", "Efecto reafirmante y tensor duradero."], "modoUso": "Uso profesional en protocolos corporales de elevación y tonificación glútea."}', 95.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000020', 'PRD0000020', 'images/13_dermclar_bump_up.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000039', 'PRD0000020', 'SED0000001', 'L26-QTO-020A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000040', 'PRD0000020', 'SED0000002', 'L26-GYE-020B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000021', 'CAT0000006', 'DRM-2026-021', 'Dermclar Ice UP', 'Biopéptidos programados tensores y nutritivos que ayudan a reducir celulitis y flacidez. ||META||{"slug": "dermclar-ice-up-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Tonifica la curvatura de las Nalgas", "presentacion": "Caja 10 ampollas X 5ml", "precioProfesional": 87.0, "imagen": "images/14_dermclar_ice_up.png", "destacadoHome": false, "principiosActivos": ["Biopéptidos Programados", "Hidrolizado de Colágeno y Elastina", "Laureth-9 y Piruvato de Sodio", "Centella Asiática y DMAE"], "beneficios": ["Tonifica y reafirma la piel glútea.", "Reduce la apariencia de celulitis flácida.", "Estimula colágeno dérmico."], "modoUso": "Protocolo en cabina corporal."}', 87.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000021', 'PRD0000021', 'images/14_dermclar_ice_up.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000041', 'PRD0000021', 'SED0000001', 'L26-QTO-021A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000042', 'PRD0000021', 'SED0000002', 'L26-GYE-021B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000022', 'CAT0000006', 'DRM-2026-022', 'Dermclar Golden UP', 'Tratamiento estético con ácido hialurónico y aminoácidos ramificados para devolver turgencia y grosor dérmico. ||META||{"slug": "dermclar-golden-up-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Realza la curvatura de las Nalgas", "presentacion": "Caja 10 ampollas X 5ml", "precioProfesional": 65.0, "imagen": "images/15_dermclar_golden_up.png", "destacadoHome": false, "principiosActivos": ["Ácido Hialurónico mediano peso", "Aminoácidos Ramificados", "Vitamina C", "Silicio Orgánico y DMAE"], "beneficios": ["Efecto lifting y soporte tensor.", "Devuelve la turgencia y textura suave.", "Reestructura el tejido dérmico glúteo."], "modoUso": "Protocolo profesional."}', 65.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000022', 'PRD0000022', 'images/15_dermclar_golden_up.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000043', 'PRD0000022', 'SED0000001', 'L26-QTO-022A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000044', 'PRD0000022', 'SED0000002', 'L26-GYE-022B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000023', 'CAT0000005', 'DRM-2026-023', 'Método +3R', 'Protocolo clínico completo con Ácido Hialurónico de mediano y bajo peso molecular y micronutrientes antiedad. ||META||{"slug": "metodo-3r-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Revitaliza + Redensifica + Rejuvenece", "presentacion": "Kit Clínico Completo", "precioProfesional": 150.0, "imagen": "images/16_metodo_3r.png", "destacadoHome": false, "principiosActivos": ["+ Plendor S: 2 viales X 10ml", "Plasmavit: 1 vial X 10ml", "Dermface: 1 vial X 10ml", "Silicio Orgánico: 2 ampollas X 5ml", "Hidraderm: 2 ampollas X 2ml"], "beneficios": ["Kit integral formulado para 5 sesiones completas.", "Reversión visible de signos de crono y fotoenvejecimiento.", "Máxima redensificación dérmica probada clínicamente."], "modoUso": "Protocolo exclusivo para médicos y profesionales de la estética médica."}', 150.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000023', 'PRD0000023', 'images/16_metodo_3r.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000045', 'PRD0000023', 'SED0000001', 'L26-QTO-023A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000046', 'PRD0000023', 'SED0000002', 'L26-GYE-023B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000024', 'CAT0000005', 'DRM-2026-024', 'Método Hair', 'Combinación de ácido hialurónico, aminoácidos y oligoelementos para reactivar folículos en receso. ||META||{"slug": "metodo-hair-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Hair Active A.H. Protocolo Capilar", "presentacion": "Kit Clínico Capilar", "precioProfesional": 79.0, "imagen": "images/17_metodo_hair.png", "destacadoHome": false, "principiosActivos": ["Dermhair: 2 viales X 10ml", "Plasmavit: 2 viales X 10ml", "Silicio Orgánico: 2 ampollas X 5ml", "Meliloto: 2 ampollas X 2ml"], "beneficios": ["Estimulación capilar completa.", "Revitalización del folículo debilitado.", "Aumenta la fuerza de anclaje de la raíz."], "modoUso": "Uso en cabina médica capilar."}', 79.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000024', 'PRD0000024', 'images/17_metodo_hair.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000047', 'PRD0000024', 'SED0000001', 'L26-QTO-024A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000048', 'PRD0000024', 'SED0000002', 'L26-GYE-024B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000025', 'CAT0000006', 'DRM-2026-025', 'Método OBooster', 'Reducción de grasa localizada con armonización bioenergética y reposicionamiento de la piel luego del adelgazamiento. ||META||{"slug": "metodo-obooster-pro", "marca": "Dermclar", "tipoUso": "profesional", "subtitulo": "Remodelador Corporal y Reposicionador Tisular", "presentacion": "Kit Clínico Completo", "precioProfesional": 95.0, "imagen": "images/18_metodo_obooster.png", "destacadoHome": false, "principiosActivos": ["Dermobes: 2 viales X 10ml", "Obooster: 2 ampollas X 5ml", "Ampelopsina: 2 ampollas X 5ml", "L-Carnitina: 2 ampollas X 5ml", "Fosfatidilcolina: 1 ampolla X 5ml", "Silicio Orgánico: 1 ampolla X 5ml"], "beneficios": ["Actúa en todos los biotipos corporales.", "Evita el descolgamiento cutáneo post-reducción.", "Remodela el contorno corporal integral."], "modoUso": "Protocolo clínico para reducción y firmeza corporal."}', 95.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000025', 'PRD0000025', 'images/18_metodo_obooster.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000049', 'PRD0000025', 'SED0000001', 'L26-QTO-025A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000050', 'PRD0000025', 'SED0000002', 'L26-GYE-025B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000026', 'CAT0000007', 'DRM-2026-026', 'Copa Sueca Mini', 'Facilita el drenaje linfático, disminuye líneas de expresión y redefine el óvalo facial mediante succión al vacío suave. ||META||{"slug": "copa-sueca-mini", "marca": "Medical Skin", "tipoUso": "profesional", "subtitulo": "Herramienta facial de acero quirúrgico", "presentacion": "Unidad individual en acero médico", "precioProfesional": 25.0, "imagen": "", "destacadoHome": false, "principiosActivos": ["Aleación de acero médico antialérgico", "Borde pulido de alta precisión", "Mango ergonómico antideslizante"], "beneficios": ["Efecto succión que moviliza el líquido estancado.", "Relaja la tensión muscular nasogeniana y frontal.", "Máxima durabilidad y fácil esterilización."], "modoUso": "Aplicar aceite facial o sérum antes del uso. Deslizar suavemente siguiendo los canales de drenaje linfático."}', 25.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000026', 'PRD0000026', 'images/placeholder_26.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000051', 'PRD0000026', 'SED0000001', 'L26-QTO-026A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000052', 'PRD0000026', 'SED0000002', 'L26-GYE-026B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000027', 'CAT0000008', 'DRM-2026-027', 'Mascarilla Hidroplástica Colágeno', 'Aporta elasticidad y firmeza intensa a pieles cansadas gracias al colágeno hidrolizado y alginatos marinos. ||META||{"slug": "mascarilla-colageno", "marca": "Medical Skin", "tipoUso": "casa", "subtitulo": "Antienvejecimiento para piel seca y desvitalizada", "presentacion": "Sobre 250 g", "precioProfesional": 19.0, "imagen": "", "destacadoHome": false, "principiosActivos": ["Colágeno Hidrolizado", "Extracto de Flor de Regaliz", "Algina Natural", "Tierra de Diatomeas"], "beneficios": ["Forma una capa elástica que sella activos en la piel.", "Efecto refrescante y descongestivo inmediato.", "Nutre y suaviza visiblemente la textura cutánea."], "modoUso": "Mezclar el polvo con agua hasta formar una pasta cremosa. Aplicar en rostro y retirar tras 20 minutos de una sola pieza."}', 19.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000027', 'PRD0000027', 'images/placeholder_27.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000053', 'PRD0000027', 'SED0000001', 'L26-QTO-027A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000054', 'PRD0000027', 'SED0000002', 'L26-GYE-027B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

INSERT INTO "Productos" ("id_producto", "id_categoria", "pro_codigo", "pro_nombre", "pro_descripcion", "pro_precio", "pro_estado")
VALUES ('PRD0000028', 'CAT0000009', 'DRM-2026-028', 'Guantes de Nitrilo Quirúrgico', 'Guantes sin polvo, alta resistencia elástica y gran sensibilidad táctil para procedimientos estéticos y médicos. ||META||{"slug": "guantes-nitrilo", "marca": "Medical Skin", "tipoUso": "profesional", "subtitulo": "Caja de 100 unidades grado médico", "presentacion": "Caja de 100 unidades", "precioProfesional": 5.0, "imagen": "", "destacadoHome": false, "principiosActivos": ["Nitrilo libre de látex", "Puntas de dedos microtexturizadas", "Certificación médica hospitalaria"], "beneficios": ["Sin riesgo de alergias al látex.", "Excelente agarre de jeringas e instrumental metálico.", "Barrera biológica segura y confortable."], "modoUso": "Descartar luego de cada paciente conforme a las normas de bioseguridad."}', 5.00, 'ACTIVO')
ON CONFLICT ("id_producto") DO UPDATE SET
  "id_categoria" = EXCLUDED."id_categoria",
  "pro_codigo" = EXCLUDED."pro_codigo",
  "pro_nombre" = EXCLUDED."pro_nombre",
  "pro_descripcion" = EXCLUDED."pro_descripcion",
  "pro_precio" = EXCLUDED."pro_precio",
  "pro_estado" = 'ACTIVO';

INSERT INTO "ProductoImagenes" ("id_imagen", "id_producto", "img_url", "img_orden", "img_es_portada")
VALUES ('IMG0000028', 'PRD0000028', 'images/placeholder_28.png', 1, 'S')
ON CONFLICT ("id_imagen") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "img_url" = EXCLUDED."img_url",
  "img_es_portada" = 'S';

INSERT INTO "Lotes" ("id_lote", "id_producto", "id_sede", "lot_numero", "lot_fecha_fabricacion", "lot_fecha_caducidad", "lot_stock_actual", "lot_estado")
VALUES
  ('LOT0000055', 'PRD0000028', 'SED0000001', 'L26-QTO-028A', '2026-01-15', '2027-08-30', 80, 'DISPONIBLE'),
  ('LOT0000056', 'PRD0000028', 'SED0000002', 'L26-GYE-028B', '2026-02-10', '2027-11-30', 65, 'DISPONIBLE')
ON CONFLICT ("id_lote") DO UPDATE SET
  "id_producto" = EXCLUDED."id_producto",
  "id_sede" = EXCLUDED."id_sede",
  "lot_numero" = EXCLUDED."lot_numero",
  "lot_fecha_caducidad" = EXCLUDED."lot_fecha_caducidad",
  "lot_stock_actual" = EXCLUDED."lot_stock_actual",
  "lot_estado" = 'DISPONIBLE';

-- =============================================================================
-- 4. PEDIDOS, DETALLES, ORDENES DE SALIDA FEFO, PAGOS, FACTURAS SRI Y ENVIOS
-- =============================================================================
INSERT INTO "Pedidos" ("id_pedido", "id_cliente", "id_sede", "id_ciudad", "id_descuento", "ped_numero", "ped_direccion_entrega", "ped_latitud", "ped_longitud", "ped_fecha", "ped_subtotal", "ped_descuento", "ped_iva", "ped_total", "ped_estado") VALUES
('PED0002001', 'CLI0000001', 'SED0000001', 'CIU0000001', 'DSC0000001', 'ORD-0002001', 'Av. República E1-136 y Atahualpa, Quito', -0.186590, -78.484120, '2026-11-01 10:30:00', 77.00, 7.70, 10.40, 79.70, 'ENTREGADO'),
('PED0002002', 'CLI0000002', 'SED0000001', 'CIU0000002', NULL,         'ORD-0002002', 'Av. Francisco de Orellana, Guayaquil', -2.164890, -79.897450, '2026-11-02 14:15:00', 177.00, 0.00, 26.55, 203.55, 'ENVIADO'),
('PED0002003', 'CLI0000003', 'SED0000001', 'CIU0000003', 'DSC0000003', 'ORD-0002003', 'Av. Solano 4-55, Cuenca', -2.900120, -79.005890, '2026-11-02 18:45:00', 110.00, 15.00, 14.25, 109.25, 'PAGADO')
ON CONFLICT ("id_pedido") DO NOTHING;

INSERT INTO "PedidoDetalle" ("id_pedido", "id_producto", "pde_cantidad", "pde_precio_unit", "pde_subtotal") VALUES
('PED0002001', 'PRD0000001', 1, 52.00, 52.00),
('PED0002001', 'PRD0000005', 1, 25.00, 25.00),
('PED0002002', 'PRD0000019', 1, 79.00, 79.00),
('PED0002002', 'PRD0000020', 1, 98.00, 98.00),
('PED0002003', 'PRD0000002', 2, 55.00, 110.00)
ON CONFLICT ("id_pedido", "id_producto") DO NOTHING;

INSERT INTO "OrdenesSalida" ("id_orden_salida", "id_pedido", "id_sede", "id_empleado", "osa_numero", "osa_fecha", "osa_observacion", "osa_estado") VALUES
('OSA0002001', 'PED0002001', 'SED0000001', 'EMP0000001', 'OSA-0002001', '2026-11-01 11:00:00', 'Despacho FEFO Matriz Quito', 'COMPLETADA'),
('OSA0002002', 'PED0002002', 'SED0000001', 'EMP0000001', 'OSA-0002002', '2026-11-02 15:00:00', 'Despacho FEFO Matriz Quito', 'COMPLETADA'),
('OSA0002003', 'PED0002003', 'SED0000001', 'EMP0000001', 'OSA-0002003', '2026-11-02 19:00:00', 'Despacho FEFO Matriz Quito', 'COMPLETADA')
ON CONFLICT ("id_orden_salida") DO NOTHING;

INSERT INTO "OrdenSalidaDetalle" ("id_orden_salida", "id_lote", "osd_cantidad_despachada", "osd_precio_unit", "osd_subtotal") VALUES
('OSA0002001', 'LOT0000001', 1, 52.00, 52.00),
('OSA0002001', 'LOT0000009', 1, 25.00, 25.00),
('OSA0002002', 'LOT0000037', 1, 79.00, 79.00),
('OSA0002002', 'LOT0000039', 1, 98.00, 98.00),
('OSA0002003', 'LOT0000003', 2, 55.00, 110.00)
ON CONFLICT ("id_orden_salida", "id_lote") DO NOTHING;

INSERT INTO "Pagos" ("id_pago", "id_pedido", "pag_metodo", "pag_monto", "pag_fecha", "pag_referencia", "pag_estado") VALUES
('PAG0002001', 'PED0002001', 'TARJETA_CREDITO', 79.70, '2026-11-01 10:31:00', 'TX-WEB-902001', 'APROBADO'),
('PAG0002002', 'PED0002002', 'TARJETA_CREDITO', 203.55, '2026-11-02 14:16:00', 'TX-WEB-902002', 'APROBADO'),
('PAG0002003', 'PED0002003', 'TARJETA_CREDITO', 109.25, '2026-11-02 18:46:00', 'TX-WEB-902003', 'APROBADO')
ON CONFLICT ("id_pago") DO NOTHING;

INSERT INTO "Facturas" ("id_factura", "id_pedido", "fac_numero", "fac_autorizacion_sri", "fac_fecha_emision", "fac_total", "fac_estado") VALUES
('FAC0002001', 'PED0002001', '001-002-000002001', '0111202601179246493900120010020000020011234567819', '2026-11-01 10:32:00', 79.70, 'EMITIDA'),
('FAC0002002', 'PED0002002', '001-002-000002002', '0211202601179246493900120010020000020021234567819', '2026-11-02 14:17:00', 203.55, 'EMITIDA'),
('FAC0002003', 'PED0002003', '001-002-000002003', '0211202601179246493900120010020000020031234567819', '2026-11-02 18:47:00', 109.25, 'EMITIDA')
ON CONFLICT ("id_factura") DO NOTHING;

INSERT INTO "Envios" ("id_envio", "id_orden_salida", "env_direccion_entrega", "env_transportista", "env_numero_guia", "env_fecha_envio", "env_estado") VALUES
('ENV0002001', 'OSA0002001', 'Av. República E1-136 y Atahualpa, Quito', 'Servientrega Urbano', 'GUI-2026-200001', '2026-11-01 12:00:00', 'ENTREGADO'),
('ENV0002002', 'OSA0002002', 'Av. Francisco de Orellana, Guayaquil', 'Servientrega Nacional', 'GUI-2026-200002', '2026-11-02 16:00:00', 'EN_RUTA'),
('ENV0002003', 'OSA0002003', 'Av. Solano 4-55, Cuenca', 'Servientrega Nacional', 'GUI-2026-200003', '2026-11-02 19:30:00', 'EN_RUTA')
ON CONFLICT ("id_envio") DO NOTHING;

-- =============================================================================
-- 5. PERMISOS PARA SUPABASE REST API (PERMITE CONEXION DESDE GITHUB PAGES)
-- =============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        EXECUTE 'GRANT USAGE ON SCHEMA public TO anon, authenticated';
        EXECUTE 'GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon, authenticated';
    END IF;
END $$;

COMMIT;

-- =============================================================================
-- 6. CONSULTA FINAL DE VERIFICACION DE INVENTARIO FEFO Y CATALOGO (28 PRODUCTOS)
-- (Nota: en pgAdmin se muestra la salida del último SELECT ejecutado)
-- =============================================================================
SELECT
    p.id_producto,
    p.pro_codigo AS sku,
    p.pro_nombre AS producto,
    c.cat_nombre AS categoria,
    p.pro_precio AS precio_usd,
    COALESCE(SUM(l.lot_stock_actual), 0) AS stock_total_fefo,
    MIN(l.lot_numero) AS lote_fefo_prioritario,
    MIN(l.lot_fecha_caducidad) AS vencimiento_mas_proximo
FROM "Productos" p
JOIN "Categorias" c ON c.id_categoria = p.id_categoria
LEFT JOIN "Lotes" l ON l.id_producto = p.id_producto AND TRIM(l.lot_estado) = 'DISPONIBLE'
WHERE p.id_producto BETWEEN 'PRD0000001' AND 'PRD0000028'
GROUP BY p.id_producto, p.pro_codigo, p.pro_nombre, c.cat_nombre, p.pro_precio
ORDER BY p.id_producto ASC;
