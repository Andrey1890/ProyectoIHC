-- =============================================================================
-- DERMAKOR E-COMMERCE - SCRIPT POSTGRESQL / SUPABASE
-- Para PostgreSQL standalone (fuera de Supabase): ejecutar primero:
--   CREATE DATABASE "BDDProductos";
--   \c "BDDProductos"
-- En Supabase SQL Editor usar directamente desde BEGIN; sobre la BD 'postgres'.
-- 9 Categorías x 10 Productos = 90 Productos | Stock = 25 por Producto
-- Sede activa actual: Matriz Quito (estructura lista para futuras sedes)
-- =============================================================================

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


