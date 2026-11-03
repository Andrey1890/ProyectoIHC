import os
import json
import random
import urllib.parse
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import psycopg
from psycopg.rows import dict_row

SUPABASE_HOST = "aws-1-us-west-2.pooler.supabase.com"
SUPABASE_PORT = 5432
SUPABASE_DB = "postgres"
SUPABASE_USER = "postgres.jdsqipqdcuyegjrpvgny"
SUPABASE_REST_URL = "https://jdsqipqdcuyegjrpvgny.supabase.co/rest/v1/"
SUPABASE_PASSWORD = os.environ.get("SUPABASE_PASSWORD", "Pichicopito_42").strip()

DB_DSN = f"postgresql://{SUPABASE_USER}:{SUPABASE_PASSWORD}@{SUPABASE_HOST}:{SUPABASE_PORT}/{SUPABASE_DB}"
WEB_ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8080


def get_conn():
    return psycopg.connect(DB_DSN, row_factory=dict_row)


def next_id(cur, table, col, prefix):
    cur.execute(
        f'SELECT "{col}" FROM "{table}" WHERE "{col}" LIKE %s ORDER BY "{col}" DESC LIMIT 1',
        (prefix + "%",),
    )
    row = cur.fetchone()
    if not row:
        return f"{prefix}0000001"
    raw = row[col].strip()
    num_part = raw[len(prefix):]
    try:
        n = int(num_part) + 1
    except ValueError:
        n = random.randint(200000, 999999)
    return f"{prefix}{n:07d}"


class DermakorRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_ROOT, **kwargs)

    def log_message(self, format, *args):
        pass

    def send_json(self, payload, status=200):
        raw = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)

        if path == "/api/status":
            try:
                with get_conn() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            'SELECT current_database() AS db, COUNT(*) AS total_productos FROM "Productos" WHERE TRIM(pro_estado)=\'ACTIVO\''
                        )
                        info = cur.fetchone()
                return self.send_json({"ok": True, "db": info["db"], "total_productos": info["total_productos"]})
            except Exception as e:
                return self.send_json({"ok": False, "error": str(e)}, 500)

        if path == "/api/productos":
            return self.handle_get_productos()

        if path == "/api/sedes":
            return self.handle_get_sedes()

        if path == "/api/cupon":
            codigo = (qs.get("codigo", [""])[0] or "").strip().upper()
            return self.handle_get_cupon(codigo)

        if path == "/api/pedidos":
            return self.handle_get_pedidos()

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", "0"))
        body_raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            body = json.loads(body_raw)
        except Exception:
            body = {}

        if path == "/api/login":
            return self.handle_post_login(body)
        if path == "/api/registro":
            return self.handle_post_registro(body)
        if path == "/api/checkout":
            return self.handle_post_checkout(body)

        return self.send_json({"ok": False, "error": "Ruta no encontrada"}, 404)

    def handle_get_productos(self):
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT
                            p.id_producto,
                            p.pro_nombre,
                            p.pro_descripcion,
                            p.pro_precio,
                            c.cat_nombre AS categoria,
                            COALESCE(
                                (SELECT img_url FROM "ProductoImagenes" pi WHERE pi.id_producto = p.id_producto AND pi.img_es_portada = 'S' LIMIT 1),
                                ''
                            ) AS imagen_db
                        FROM "Productos" p
                        JOIN "Categorias" c ON c.id_categoria = p.id_categoria
                        WHERE p.id_producto BETWEEN 'PRD0000001' AND 'PRD0000090'
                        ORDER BY p.id_producto ASC
                        """
                    )
                    rows = cur.fetchall()

            productos_out = []
            for r in rows:
                id_p = r["id_producto"].strip()
                raw_desc = r["pro_descripcion"] or ""
                meta = {}
                clean_desc = raw_desc
                if "||META||" in raw_desc:
                    parts = raw_desc.split("||META||", 1)
                    clean_desc = parts[0].strip()
                    try:
                        meta = json.loads(parts[1])
                    except Exception:
                        meta = {}

                prod_obj = {
                    "id": meta.get("slug") or id_p.lower(),
                    "id_producto_db": id_p,
                    "nombre": (r["pro_nombre"] or "").strip(),
                    "marca": meta.get("marca", "Dermclar"),
                    "categoria": (r["categoria"] or "Cuidado facial").strip(),
                    "tipoUso": meta.get("tipoUso", "casa"),
                    "subtitulo": meta.get("subtitulo", "Fórmula dermatológica avanzada"),
                    "presentacion": meta.get("presentacion", "Unidad"),
                    "precio": float(r["pro_precio"]),
                    "precioProfesional": float(meta.get("precioProfesional", r["pro_precio"])),
                    "imagen": meta.get("imagen") if meta.get("imagen") is not None else (r["imagen_db"] or "").strip(),
                    "destacadoHome": bool(meta.get("destacadoHome", False)),
                    "descripcion": clean_desc,
                    "principiosActivos": meta.get("principiosActivos", ["Activos liposomados Dermclar"]),
                    "beneficios": meta.get("beneficios", ["Eficacia clínica comprobada"]),
                    "modoUso": meta.get("modoUso", "Aplicar según protocolo dermatológico."),
                }
                productos_out.append(prod_obj)

            return self.send_json(productos_out)
        except Exception as e:
            return self.send_json({"ok": False, "error": str(e)}, 500)

    def handle_get_sedes(self):
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT TRIM(s.id_sede) AS id_sede, TRIM(s.sed_nombre) AS nombre,
                               TRIM(s.sed_direccion) AS direccion,
                               s.sed_latitud AS latitud, s.sed_longitud AS longitud,
                               TRIM(c.ciu_nombre) AS ciudad
                        FROM "Sedes" s
                        JOIN "Ciudades" c ON c.id_ciudad = s.id_ciudad
                        WHERE s.id_sede IN ('SED0000001', 'SED0000002', 'SED0000003', 'SED0000004')
                        ORDER BY s.id_sede ASC
                        """
                    )
                    rows = cur.fetchall()
            return self.send_json(rows)
        except Exception as e:
            return self.send_json({"ok": False, "error": str(e)}, 500)

    def handle_get_cupon(self, codigo):
        if not codigo:
            return self.send_json({"ok": False, "error": "Código vacío"})
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT TRIM(id_descuento) AS id_descuento,
                               TRIM(des_codigo) AS codigo,
                               TRIM(des_tipo) AS tipo,
                               des_valor AS valor
                        FROM "Descuentos"
                        WHERE UPPER(TRIM(des_codigo)) = %s
                          AND TRIM(des_estado) = 'ACTIVO'
                          AND CURRENT_DATE BETWEEN des_fecha_inicio AND des_fecha_fin
                        LIMIT 1
                        """,
                        (codigo,),
                    )
                    row = cur.fetchone()
            if row:
                row["valor"] = float(row["valor"])
                return self.send_json({"ok": True, "cupon": row})
            return self.send_json({"ok": False, "error": "Cupón no encontrado o inactivo"})
        except Exception as e:
            return self.send_json({"ok": False, "error": str(e)}, 500)

    def handle_get_pedidos(self):
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT
                            TRIM(p.id_pedido) AS id_pedido,
                            TRIM(c.cli_nombres) || ' ' || TRIM(c.cli_apellidos) AS cliente,
                            TRIM(c.cli_ci_ruc) AS identificacion,
                            p.ped_fecha::date::text AS fecha,
                            TRIM(p.ped_estado) AS estado,
                            p.ped_total AS total,
                            COALESCE(TRIM(f.fac_numero), '001-002-000001001') AS fac_numero
                        FROM "Pedidos" p
                        JOIN "Clientes" c ON c.id_cliente = p.id_cliente
                        LEFT JOIN "Facturas" f ON f.id_pedido = p.id_pedido
                        ORDER BY p.ped_fecha DESC, p.id_pedido DESC
                        LIMIT 10
                        """
                    )
                    rows = cur.fetchall()
            return self.send_json(rows)
        except Exception as e:
            return self.send_json({"ok": False, "error": str(e)}, 500)

    def handle_post_login(self, body):
        correo = (body.get("correo") or "").strip().lower()
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT c.id_cliente, c.cli_nombres, c.cli_apellidos, c.cli_ci_ruc,
                               c.cli_telefono, c.cli_direccion, u.usu_email
                        FROM "Clientes" c
                        LEFT JOIN "Usuarios" u ON u.id_usuario = c.id_usuario
                        WHERE LOWER(TRIM(u.usu_email)) = %s OR c.id_cliente = 'CLI0000001'
                        ORDER BY CASE WHEN LOWER(TRIM(u.usu_email)) = %s THEN 0 ELSE 1 END
                        LIMIT 1
                        """,
                        (correo, correo),
                    )
                    c = cur.fetchone()
            if c:
                nom_completo = f"{(c['cli_nombres'] or '').strip()} {(c['cli_apellidos'] or '').strip()}".strip()
                return self.send_json(
                    {
                        "ok": True,
                        "usuario": {
                            "id_cliente": c["id_cliente"].strip(),
                            "nombre": nom_completo or "María Fernández",
                            "cedulaRuc": (c["cli_ci_ruc"] or "1718293849").strip(),
                            "correo": correo or (c["usu_email"] or "cliente@example.com").strip(),
                            "telefono": (c["cli_telefono"] or "0996096996").strip(),
                            "direccion": (c["cli_direccion"] or "Av. República E1-136 y Atahualpa").strip(),
                            "ciudad": "Quito",
                            "provincia": "Pichincha",
                            "codigoPostal": "170102",
                        },
                    }
                )
        except Exception as e:
            return self.send_json({"ok": False, "error": str(e)})
        return self.send_json({"ok": False})

    def handle_post_registro(self, body):
        nombre = (body.get("nombre") or "Cliente Dermakor").strip()
        partes = nombre.split(" ", 1)
        nombres = partes[0]
        apellidos = partes[1] if len(partes) > 1 else "Dermakor"
        cedula = (body.get("cedulaRuc") or "1718293849").strip()
        correo = (body.get("correo") or "cliente@dermakor.com").strip()
        telefono = (body.get("telefono") or "0996096996").strip()
        direccion = (body.get("direccion") or "Av. República E1-136").strip()
        ciudad = (body.get("ciudad") or "Quito").strip()
        provincia = (body.get("provincia") or "Pichincha").strip()

        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        'SELECT id_cliente FROM "Clientes" WHERE TRIM(cli_ci_ruc) = %s LIMIT 1',
                        (cedula,),
                    )
                    existing = cur.fetchone()
                    if existing:
                        id_cli = existing["id_cliente"].strip()
                        cur.execute(
                            """
                            UPDATE "Clientes"
                            SET cli_nombres = %s, cli_apellidos = %s, cli_telefono = %s, cli_direccion = %s
                            WHERE id_cliente = %s
                            """,
                            (nombres, apellidos, telefono, direccion, id_cli),
                        )
                    else:
                        id_usu = next_id(cur, "Usuarios", "id_usuario", "USU")
                        cur.execute(
                            """
                            INSERT INTO "Usuarios" (id_usuario, id_rol, usu_nombre, usu_email, usu_clave_hash, usu_estado)
                            VALUES (%s, 'ROL0000003', %s, %s, 'hash_pbkdf2_2026', 'ACTIVO')
                            ON CONFLICT DO NOTHING
                            """,
                            (id_usu, nombre, correo),
                        )
                        id_cli = next_id(cur, "Clientes", "id_cliente", "CLI")
                        cur.execute(
                            """
                            INSERT INTO "Clientes" (
                                id_cliente, id_usuario, id_ciudad, cli_ci_ruc,
                                cli_nombres, cli_apellidos, cli_telefono, cli_direccion
                            ) VALUES (
                                %s, %s, 'CIU0000001', %s, %s, %s, %s, %s
                            )
                            """,
                            (id_cli, id_usu, cedula, nombres, apellidos, telefono, direccion),
                        )
                conn.commit()
            return self.send_json(
                {
                    "ok": True,
                    "usuario": {
                        "id_cliente": id_cli,
                        "nombre": nombre,
                        "cedulaRuc": cedula,
                        "correo": correo,
                        "telefono": telefono,
                        "direccion": direccion,
                        "ciudad": ciudad,
                        "provincia": provincia,
                        "codigoPostal": body.get("codigoPostal") or "170102",
                    },
                }
            )
        except Exception as e:
            return self.send_json({"ok": False, "error": str(e)})

    def handle_post_checkout(self, body):
        cliente = body.get("cliente") or {}
        items = body.get("items") or []
        cupon = body.get("cupon")
        envio = body.get("envio") or {}
        sede_info = envio.get("sede") or {}
        id_sede = (sede_info.get("id_sede") or "SED0000001").strip()

        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    # 1. Resolver id_cliente
                    cedula = (cliente.get("cedulaRuc") or "1718293849").strip()
                    cur.execute('SELECT id_cliente FROM "Clientes" WHERE TRIM(cli_ci_ruc) = %s LIMIT 1', (cedula,))
                    cli_row = cur.fetchone()
                    id_cliente = cli_row["id_cliente"].strip() if cli_row else "CLI0000001"

                    # 2. Resolver descuento
                    id_descuento = None
                    if cupon and cupon.get("id_descuento"):
                        id_descuento = cupon.get("id_descuento").strip()

                    subtotal_calc = 0.0
                    for it in items:
                        subtotal_calc += float(it.get("precio", 25.0)) * int(it.get("cantidad", 1))
                    if subtotal_calc <= 0:
                        subtotal_calc = 52.00

                    descuento_calc = float((body.get("totales") or {}).get("descuento", 0.0))
                    if descuento_calc > subtotal_calc:
                        descuento_calc = subtotal_calc
                    iva_calc = round((subtotal_calc - descuento_calc) * 0.15, 2)
                    total_calc = round((subtotal_calc - descuento_calc) + iva_calc, 2)

                    # 3. Insertar Pedido en tabla "Pedidos"
                    id_pedido = next_id(cur, "Pedidos", "id_pedido", "PED")
                    ped_num = f"ORD-{id_pedido[3:]}"
                    dir_entrega = f"{cliente.get('direccion', 'Av. República E1-136')}, {cliente.get('ciudad', 'Quito')}"
                    cur.execute(
                        """
                        INSERT INTO "Pedidos" (
                            id_pedido, id_cliente, id_sede, id_ciudad, id_descuento,
                            ped_numero, ped_direccion_entrega, ped_latitud, ped_longitud,
                            ped_fecha, ped_subtotal, ped_descuento, ped_iva, ped_total, ped_estado
                        ) VALUES (
                            %s, %s, %s, 'CIU0000001', %s,
                            %s, %s, -0.1865, -78.4841,
                            NOW(), %s, %s, %s, %s, 'PAGADO'
                        )
                        """,
                        (
                            id_pedido,
                            id_cliente,
                            id_sede,
                            id_descuento,
                            ped_num,
                            dir_entrega,
                            subtotal_calc,
                            descuento_calc,
                            iva_calc,
                            total_calc,
                        ),
                    )

                    # 4. Insertar OrdenesSalida
                    id_osa = next_id(cur, "OrdenesSalida", "id_orden_salida", "OSA")
                    osa_num = f"OSA-{id_osa[3:]}"
                    cur.execute(
                        """
                        INSERT INTO "OrdenesSalida" (
                            id_orden_salida, id_pedido, id_sede, id_empleado,
                            osa_numero, osa_fecha, osa_observacion, osa_estado
                        ) VALUES (%s, %s, %s, 'EMP0000001', %s, NOW(), 'Despacho automático FEFO E-Commerce', 'COMPLETADA')
                        """,
                        (id_osa, id_pedido, id_sede, osa_num),
                    )

                    # Agrupar items por id_producto_db para evitar PK duplicada en PedidoDetalle (id_pedido, id_producto)
                    items_agrupados = {}
                    for it in items:
                        id_prod = (it.get("id_producto_db") or "PRD0000001").strip()
                        cant = max(1, int(it.get("cantidad", 1)))
                        precio_u = round(float(it.get("precio", 25.0)), 2)
                        if id_prod in items_agrupados:
                            items_agrupados[id_prod]["cant"] += cant
                        else:
                            items_agrupados[id_prod] = {"cant": cant, "precio_u": precio_u}

                    for id_prod, info_it in items_agrupados.items():
                        cant = info_it["cant"]
                        precio_u = info_it["precio_u"]
                        sub_linea = round(precio_u * cant, 2)

                        cur.execute(
                            """
                            INSERT INTO "PedidoDetalle" (
                                id_pedido, id_producto, pde_cantidad, pde_precio_unit, pde_subtotal
                            ) VALUES (%s, %s, %s, %s, %s)
                            """,
                            (id_pedido, id_prod, cant, precio_u, sub_linea),
                        )

                        # Buscar lote FEFO activo con stock suficiente
                        cur.execute(
                            """
                            SELECT id_lote
                            FROM "Lotes"
                            WHERE id_producto = %s
                              AND TRIM(lot_estado) = 'DISPONIBLE'
                              AND lot_fecha_caducidad > CURRENT_DATE
                              AND lot_stock_actual >= %s
                            ORDER BY lot_fecha_caducidad ASC
                            LIMIT 1
                            """,
                            (id_prod, cant),
                        )
                        lote_row = cur.fetchone()
                        if lote_row:
                            cur.execute(
                                """
                                INSERT INTO "OrdenSalidaDetalle" (
                                    id_orden_salida, id_lote, osd_cantidad_despachada, osd_precio_unit, osd_subtotal
                                ) VALUES (%s, %s, %s, %s, %s)
                                """,
                                (id_osa, lote_row["id_lote"].strip(), cant, precio_u, sub_linea),
                            )

                    # 5. Leer totales exactos recalculados por trg_pedido_totales
                    cur.execute(
                        'SELECT ped_subtotal, ped_descuento, ped_iva, ped_total FROM "Pedidos" WHERE id_pedido = %s',
                        (id_pedido,),
                    )
                    ped_actual = cur.fetchone()
                    fac_tot = round(float(ped_actual["ped_total"]), 2)

                    # 6. Insertar Pago en tabla "Pagos"
                    id_pago = next_id(cur, "Pagos", "id_pago", "PAG")
                    ref_tx = f"TX-WEB-{random.randint(1000000, 9999999)}"
                    cur.execute(
                        """
                        INSERT INTO "Pagos" (
                            id_pago, id_pedido, pag_metodo, pag_monto,
                            pag_fecha, pag_referencia, pag_estado
                        ) VALUES (%s, %s, 'TARJETA_CREDITO', %s, NOW(), %s, 'APROBADO')
                        """,
                        (id_pago, id_pedido, fac_tot, ref_tx),
                    )

                    # 7. Insertar Factura Electronica SRI en tabla "Facturas"
                    id_factura = next_id(cur, "Facturas", "id_factura", "FAC")
                    sec_num = int(id_factura[3:])
                    fac_numero = f"001-002-{sec_num:09d}"
                    hoy_str = datetime.now().strftime("%d%m%Y")
                    rand_digits = "".join([str(random.randint(0, 9)) for _ in range(18)])
                    clave_sri = (hoy_str + "0117924649390012001002" + f"{sec_num:09d}" + rand_digits)[:49].ljust(49, "1")

                    cur.execute(
                        """
                        INSERT INTO "Facturas" (
                            id_factura, id_pedido, fac_numero, fac_autorizacion_sri,
                            fac_fecha_emision, fac_total, fac_estado
                        ) VALUES (%s, %s, %s, %s, NOW(), %s, 'EMITIDA')
                        """,
                        (id_factura, id_pedido, fac_numero, clave_sri, fac_tot),
                    )

                    # 8. Insertar Envio en tabla "Envios"
                    id_envio = next_id(cur, "Envios", "id_envio", "ENV")
                    guia_tracking = f"GUI-2026-{random.randint(100000, 999999)}"
                    cur.execute(
                        """
                        INSERT INTO "Envios" (
                            id_envio, id_orden_salida, env_direccion_entrega,
                            env_transportista, env_numero_guia, env_fecha_envio, env_estado
                        ) VALUES (%s, %s, %s, 'Servientrega Ecuador', %s, NOW(), 'EN_RUTA')
                        """,
                        (id_envio, id_osa, dir_entrega, guia_tracking),
                    )

                conn.commit()

            return self.send_json(
                {
                    "ok": True,
                    "id_pedido": id_pedido,
                    "id_factura": id_factura,
                    "fac_numero": fac_numero,
                    "fac_autorizacion_sri": clave_sri,
                    "guia_tracking": guia_tracking,
                    "fac_total": fac_tot,
                }
            )
        except Exception as e:
            return self.send_json({"ok": False, "error": str(e)}, 500)


if __name__ == "__main__":
    print(f"Iniciando servidor web Dermakor + PostgreSQL API en http://localhost:{PORT} ...")
    server = ThreadingHTTPServer(("0.0.0.0", PORT), DermakorRequestHandler)
    server.serve_forever()
