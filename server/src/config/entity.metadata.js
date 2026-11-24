// Archivo generado automaticamente por server/scripts/generate-entity-metadata.js
// No editar manualmente.

const ENTITIES = [
  {
    "table": "AjusteDetalle",
    "slug": "ajuste-detalle",
    "pk": [
      "id_ajuste",
      "id_lote"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_ajuste",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "AjustesInventario",
          "slug": "ajustes-inventario",
          "ref": "id_ajuste"
        }
      },
      {
        "name": "id_lote",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Lotes",
          "slug": "lotes",
          "ref": "id_lote"
        }
      },
      {
        "name": "ade_cantidad",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "ade_observacion",
        "type": "String",
        "kind": "string",
        "maxLength": 100,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "AjustesInventario",
    "slug": "ajustes-inventario",
    "pk": [
      "id_ajuste"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_ajuste",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_sede",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Sedes",
          "slug": "sedes",
          "ref": "id_sede"
        }
      },
      {
        "name": "id_empleado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Empleados",
          "slug": "empleados",
          "ref": "id_empleado"
        }
      },
      {
        "name": "aju_numero",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "aju_tipo",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "aju_motivo",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "aju_fecha",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "aju_observacion",
        "type": "String",
        "kind": "string",
        "maxLength": 150,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "CarritoDetalle",
    "slug": "carrito-detalle",
    "pk": [
      "id_carrito",
      "id_producto"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_carrito",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Carritos",
          "slug": "carritos",
          "ref": "id_carrito"
        }
      },
      {
        "name": "id_producto",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Productos",
          "slug": "productos",
          "ref": "id_producto"
        }
      },
      {
        "name": "cad_cantidad",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Carritos",
    "slug": "carritos",
    "pk": [
      "id_carrito"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_carrito",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_cliente",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Clientes",
          "slug": "clientes",
          "ref": "id_cliente"
        }
      },
      {
        "name": "car_fecha",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "car_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Categorias",
    "slug": "categorias",
    "pk": [
      "id_categoria"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_categoria",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "cat_nombre",
        "type": "String",
        "kind": "string",
        "maxLength": 50,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "cat_descripcion",
        "type": "String",
        "kind": "string",
        "maxLength": 150,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "cat_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Ciudades",
    "slug": "ciudades",
    "pk": [
      "id_ciudad"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_ciudad",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_pais",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Paises",
          "slug": "paises",
          "ref": "id_pais"
        }
      },
      {
        "name": "ciu_nombre",
        "type": "String",
        "kind": "string",
        "maxLength": 60,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Clientes",
    "slug": "clientes",
    "pk": [
      "id_cliente"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_cliente",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_usuario",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Usuarios",
          "slug": "usuarios",
          "ref": "id_usuario"
        }
      },
      {
        "name": "id_ciudad",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Ciudades",
          "slug": "ciudades",
          "ref": "id_ciudad"
        }
      },
      {
        "name": "cli_ci_ruc",
        "type": "String",
        "kind": "string",
        "maxLength": 13,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "cli_nombres",
        "type": "String",
        "kind": "string",
        "maxLength": 60,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "cli_apellidos",
        "type": "String",
        "kind": "string",
        "maxLength": 60,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "cli_telefono",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "cli_direccion",
        "type": "String",
        "kind": "string",
        "maxLength": 120,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "CompraDetalle",
    "slug": "compra-detalle",
    "pk": [
      "id_compra",
      "id_producto"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_compra",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Compras",
          "slug": "compras",
          "ref": "id_compra"
        }
      },
      {
        "name": "id_producto",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Productos",
          "slug": "productos",
          "ref": "id_producto"
        }
      },
      {
        "name": "cde_cantidad",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "cde_costo_unit",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "cde_subtotal",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Compras",
    "slug": "compras",
    "pk": [
      "id_compra"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_compra",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_proveedor",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Proveedores",
          "slug": "proveedores",
          "ref": "id_proveedor"
        }
      },
      {
        "name": "id_sede",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Sedes",
          "slug": "sedes",
          "ref": "id_sede"
        }
      },
      {
        "name": "com_numero",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "com_fecha",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "com_total",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "com_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 12,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Departamentos",
    "slug": "departamentos",
    "pk": [
      "id_departamento"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_departamento",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "dep_nombre",
        "type": "String",
        "kind": "string",
        "maxLength": 50,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "dep_telefono",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "dep_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Descuentos",
    "slug": "descuentos",
    "pk": [
      "id_descuento"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_descuento",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "des_codigo",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "des_nombre",
        "type": "String",
        "kind": "string",
        "maxLength": 50,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "des_tipo",
        "type": "String",
        "kind": "string",
        "maxLength": 12,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "des_valor",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "des_fecha_inicio",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "des_fecha_fin",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "des_uso_maximo",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "des_uso_actual",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "des_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Empleados",
    "slug": "empleados",
    "pk": [
      "id_empleado"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_empleado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_usuario",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Usuarios",
          "slug": "usuarios",
          "ref": "id_usuario"
        }
      },
      {
        "name": "id_departamento",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Departamentos",
          "slug": "departamentos",
          "ref": "id_departamento"
        }
      },
      {
        "name": "id_sede",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Sedes",
          "slug": "sedes",
          "ref": "id_sede"
        }
      },
      {
        "name": "emp_ci",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "emp_nombres",
        "type": "String",
        "kind": "string",
        "maxLength": 60,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "emp_apellidos",
        "type": "String",
        "kind": "string",
        "maxLength": 60,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "emp_cargo",
        "type": "String",
        "kind": "string",
        "maxLength": 50,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "emp_sueldo",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Envios",
    "slug": "envios",
    "pk": [
      "id_envio"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_envio",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_orden_salida",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "OrdenesSalida",
          "slug": "ordenes-salida",
          "ref": "id_orden_salida"
        }
      },
      {
        "name": "env_direccion_entrega",
        "type": "String",
        "kind": "string",
        "maxLength": 150,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "env_transportista",
        "type": "String",
        "kind": "string",
        "maxLength": 50,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "env_numero_guia",
        "type": "String",
        "kind": "string",
        "maxLength": 20,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "env_fecha_envio",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "env_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 12,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Facturas",
    "slug": "facturas",
    "pk": [
      "id_factura"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_factura",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_pedido",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Pedidos",
          "slug": "pedidos",
          "ref": "id_pedido"
        }
      },
      {
        "name": "fac_numero",
        "type": "String",
        "kind": "string",
        "maxLength": 17,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "fac_autorizacion_sri",
        "type": "String",
        "kind": "string",
        "maxLength": 49,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "fac_fecha_emision",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "fac_total",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "fac_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "LOG",
    "slug": "logs",
    "pk": [
      "id_usuario",
      "log_fecha"
    ],
    "mode": "readonly",
    "fields": [
      {
        "name": "id_usuario",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "log_accion",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "log_tabla",
        "type": "String",
        "kind": "string",
        "maxLength": 30,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "log_ip",
        "type": "String",
        "kind": "string",
        "maxLength": 45,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "log_fecha",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "log_datos_antes",
        "type": "String",
        "kind": "string",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "log_datos_despues",
        "type": "String",
        "kind": "string",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Lotes",
    "slug": "lotes",
    "pk": [
      "id_lote"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_lote",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_producto",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Productos",
          "slug": "productos",
          "ref": "id_producto"
        }
      },
      {
        "name": "id_sede",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Sedes",
          "slug": "sedes",
          "ref": "id_sede"
        }
      },
      {
        "name": "lot_numero",
        "type": "String",
        "kind": "string",
        "maxLength": 20,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "lot_fecha_fabricacion",
        "type": "DateTime",
        "kind": "date",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "lot_fecha_caducidad",
        "type": "DateTime",
        "kind": "date",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "lot_stock_actual",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "lot_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 12,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "OrdenEntradaDetalle",
    "slug": "orden-entrada-detalle",
    "pk": [
      "id_orden_entrada",
      "id_lote"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_orden_entrada",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "OrdenesEntrada",
          "slug": "ordenes-entrada",
          "ref": "id_orden_entrada"
        }
      },
      {
        "name": "id_lote",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Lotes",
          "slug": "lotes",
          "ref": "id_lote"
        }
      },
      {
        "name": "oed_cantidad_recibida",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "oed_costo_unit",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "oed_subtotal",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "OrdenSalidaDetalle",
    "slug": "orden-salida-detalle",
    "pk": [
      "id_orden_salida",
      "id_lote"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_orden_salida",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "OrdenesSalida",
          "slug": "ordenes-salida",
          "ref": "id_orden_salida"
        }
      },
      {
        "name": "id_lote",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Lotes",
          "slug": "lotes",
          "ref": "id_lote"
        }
      },
      {
        "name": "osd_cantidad_despachada",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "osd_precio_unit",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "osd_subtotal",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "OrdenesEntrada",
    "slug": "ordenes-entrada",
    "pk": [
      "id_orden_entrada"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_orden_entrada",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_compra",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Compras",
          "slug": "compras",
          "ref": "id_compra"
        }
      },
      {
        "name": "id_sede",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Sedes",
          "slug": "sedes",
          "ref": "id_sede"
        }
      },
      {
        "name": "id_empleado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Empleados",
          "slug": "empleados",
          "ref": "id_empleado"
        }
      },
      {
        "name": "oen_numero",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "oen_fecha",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "oen_observacion",
        "type": "String",
        "kind": "string",
        "maxLength": 150,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "oen_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 12,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "OrdenesSalida",
    "slug": "ordenes-salida",
    "pk": [
      "id_orden_salida"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_orden_salida",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_pedido",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Pedidos",
          "slug": "pedidos",
          "ref": "id_pedido"
        }
      },
      {
        "name": "id_sede",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Sedes",
          "slug": "sedes",
          "ref": "id_sede"
        }
      },
      {
        "name": "id_empleado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Empleados",
          "slug": "empleados",
          "ref": "id_empleado"
        }
      },
      {
        "name": "osa_numero",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "osa_fecha",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "osa_observacion",
        "type": "String",
        "kind": "string",
        "maxLength": 150,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "osa_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 12,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Pagos",
    "slug": "pagos",
    "pk": [
      "id_pago"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_pago",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_pedido",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Pedidos",
          "slug": "pedidos",
          "ref": "id_pedido"
        }
      },
      {
        "name": "pag_metodo",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pag_monto",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pag_fecha",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "pag_referencia",
        "type": "String",
        "kind": "string",
        "maxLength": 80,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pag_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Paises",
    "slug": "paises",
    "pk": [
      "id_pais"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_pais",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pai_codigo",
        "type": "String",
        "kind": "string",
        "maxLength": 3,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pai_nombre",
        "type": "String",
        "kind": "string",
        "maxLength": 60,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "PedidoDetalle",
    "slug": "pedido-detalle",
    "pk": [
      "id_pedido",
      "id_producto"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_pedido",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Pedidos",
          "slug": "pedidos",
          "ref": "id_pedido"
        }
      },
      {
        "name": "id_producto",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Productos",
          "slug": "productos",
          "ref": "id_producto"
        }
      },
      {
        "name": "pde_cantidad",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pde_precio_unit",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pde_subtotal",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Pedidos",
    "slug": "pedidos",
    "pk": [
      "id_pedido"
    ],
    "mode": "readonly",
    "fields": [
      {
        "name": "id_pedido",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_cliente",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Clientes",
          "slug": "clientes",
          "ref": "id_cliente"
        }
      },
      {
        "name": "id_sede",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Sedes",
          "slug": "sedes",
          "ref": "id_sede"
        }
      },
      {
        "name": "id_ciudad",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Ciudades",
          "slug": "ciudades",
          "ref": "id_ciudad"
        }
      },
      {
        "name": "id_descuento",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": true,
        "hasDefault": false,
        "fk": {
          "table": "Descuentos",
          "slug": "descuentos",
          "ref": "id_descuento"
        }
      },
      {
        "name": "ped_numero",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "ped_direccion_entrega",
        "type": "String",
        "kind": "string",
        "maxLength": 150,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "ped_latitud",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "ped_longitud",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "ped_fecha",
        "type": "DateTime",
        "kind": "datetime",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "ped_subtotal",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "ped_descuento",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "ped_iva",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "ped_total",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "ped_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 12,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "ProductoImagenes",
    "slug": "producto-imagenes",
    "pk": [
      "id_imagen"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_imagen",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_producto",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Productos",
          "slug": "productos",
          "ref": "id_producto"
        }
      },
      {
        "name": "img_url",
        "type": "String",
        "kind": "string",
        "maxLength": 255,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "img_orden",
        "type": "Int",
        "kind": "int",
        "maxLength": null,
        "optional": false,
        "hasDefault": true,
        "fk": null
      },
      {
        "name": "img_es_portada",
        "type": "String",
        "kind": "string",
        "maxLength": 1,
        "optional": false,
        "hasDefault": true,
        "fk": null
      }
    ]
  },
  {
    "table": "Productos",
    "slug": "productos",
    "pk": [
      "id_producto"
    ],
    "mode": "readonly",
    "fields": [
      {
        "name": "id_producto",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_categoria",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Categorias",
          "slug": "categorias",
          "ref": "id_categoria"
        }
      },
      {
        "name": "pro_codigo",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pro_nombre",
        "type": "String",
        "kind": "string",
        "maxLength": 100,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pro_descripcion",
        "type": "String",
        "kind": "string",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pro_precio",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "pro_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Proveedores",
    "slug": "proveedores",
    "pk": [
      "id_proveedor"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_proveedor",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_ciudad",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Ciudades",
          "slug": "ciudades",
          "ref": "id_ciudad"
        }
      },
      {
        "name": "prv_ruc",
        "type": "String",
        "kind": "string",
        "maxLength": 13,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "prv_razon_social",
        "type": "String",
        "kind": "string",
        "maxLength": 100,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "prv_telefono",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "prv_email",
        "type": "String",
        "kind": "string",
        "maxLength": 100,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Roles",
    "slug": "roles",
    "pk": [
      "id_rol"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_rol",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "rol_nombre",
        "type": "String",
        "kind": "string",
        "maxLength": 30,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "rol_descripcion",
        "type": "String",
        "kind": "string",
        "maxLength": 100,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "rol_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Sedes",
    "slug": "sedes",
    "pk": [
      "id_sede"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_sede",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_ciudad",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Ciudades",
          "slug": "ciudades",
          "ref": "id_ciudad"
        }
      },
      {
        "name": "sed_nombre",
        "type": "String",
        "kind": "string",
        "maxLength": 60,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "sed_direccion",
        "type": "String",
        "kind": "string",
        "maxLength": 120,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "sed_telefono",
        "type": "String",
        "kind": "string",
        "maxLength": 15,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "sed_tipo",
        "type": "String",
        "kind": "string",
        "maxLength": 12,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "sed_latitud",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "sed_longitud",
        "type": "Decimal",
        "kind": "decimal",
        "maxLength": null,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  },
  {
    "table": "Usuarios",
    "slug": "usuarios",
    "pk": [
      "id_usuario"
    ],
    "mode": "crud",
    "fields": [
      {
        "name": "id_usuario",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "id_rol",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": {
          "table": "Roles",
          "slug": "roles",
          "ref": "id_rol"
        }
      },
      {
        "name": "usu_nombre",
        "type": "String",
        "kind": "string",
        "maxLength": 50,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "usu_email",
        "type": "String",
        "kind": "string",
        "maxLength": 100,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "usu_clave_hash",
        "type": "String",
        "kind": "string",
        "maxLength": 60,
        "optional": false,
        "hasDefault": false,
        "fk": null
      },
      {
        "name": "usu_estado",
        "type": "String",
        "kind": "string",
        "maxLength": 10,
        "optional": false,
        "hasDefault": false,
        "fk": null
      }
    ]
  }
];

const BY_TABLE = Object.freeze(Object.fromEntries(ENTITIES.map((e) => [e.table, e])));
const BY_SLUG = Object.freeze(Object.fromEntries(ENTITIES.map((e) => [e.slug, e])));

module.exports = {
  ENTITIES,
  BY_TABLE,
  BY_SLUG
};
