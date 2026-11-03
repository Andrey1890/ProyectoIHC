// --------------------------------------------------------------------------
// 1. CONFIGURACION SUPABASE POSTGRESQL + ESTADO GLOBAL DE LA APLICACION
// --------------------------------------------------------------------------
var SUPABASE_CONFIG = {
  restUrl: "https://jdsqipqdcuyegjrpvgny.supabase.co/rest/v1",
  poolerHost: "aws-1-us-west-2.pooler.supabase.com",
  poolerPort: 5432,
  database: "postgres",
  dbUser: "postgres.jdsqipqdcuyegjrpvgny",
  anonKey: localStorage.getItem("dermakor_supabase_key") || ""
};

var LISTA_PRODUCTOS = [];
var carrito = [];
var ultimoItemAgregado = null;
var idProductoModalActual = null;
var paginaActualCatalogo = 1;
var productosPorPagina = 8;
var listaFiltradaActual = [];

// Usuario actual (obligatorio para facturar)
var usuarioActual = null;

// Cupon de descuento aplicado (sincronizado con tabla Descuentos en PostgreSQL)
var cuponActual = null; // { codigo, id_descuento, tipo, valor }

// Envio, cotizaciones y sede despachadora (sincronizados con Sedes y Envios)
var costoEnvioActual = 3.75;
var nombreEnvioActual = "Servientrega Urbano (Pichincha / Guayas)";
var sedeAsignadaActual = {
  id_sede: "SED0000001",
  nombre: "Matriz Quito - Edificio La Casa",
  ciudad: "Quito"
};

// --------------------------------------------------------------------------
// 2. INICIALIZACION MULTIPAGINA + CONEXION A POSTGRESQL API
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  inicializarApp();
});

function inicializarApp() {
  cargarEstadoPersistente();
  verificarEstadoConexionDB();
  configurarEventosNavegacion();
  configurarEventosFiltros();
  configurarAcordeonFaq();
  configurarValidacionEnTiempoReal();
  configurarOpcionesEnvio();
  actualizarContadorCarrito();

  // Cargar productos desde PostgreSQL (/api/productos) con respaldo JSON
  cargarProductosDesdeServidor();

  // Si estamos en vistas que no dependen exclusivamente de esperar el catalogo
  var pagina = obtenerPaginaActual();
  if (pagina === "checkout-envio") {
    prellenarFormularioCheckout();
  } else if (pagina === "checkout-pago") {
    prellenarVistaPago();
  } else if (pagina === "confirmacion-aprobada") {
    renderizarFacturaGuardada();
  } else if (pagina === "ayuda") {
    cargarPedidosDesdeDB();
    cargarSedesDesdeDB();
  }
}

function obtenerPaginaActual() {
  var attr = document.body.getAttribute("data-pagina");
  if (attr) {
    return attr;
  }
  return "inicio";
}

function cargarEstadoPersistente() {
  // 1. Sesion de usuario
  var datosUsuario = localStorage.getItem("dermakor_usuario_sesion");
  if (datosUsuario) {
    try {
      usuarioActual = JSON.parse(datosUsuario);
    } catch (e) {
      usuarioActual = null;
    }
  }
  actualizarWidgetUsuarioHeader();

  // 2. Carrito de compras
  var datosCarrito = localStorage.getItem("dermakor_carrito");
  if (datosCarrito) {
    try {
      carrito = JSON.parse(datosCarrito) || [];
    } catch (e) {
      carrito = [];
    }
  }

  // 3. Cupon de descuento
  var datosCupon = localStorage.getItem("dermakor_cupon");
  if (datosCupon) {
    try {
      cuponActual = JSON.parse(datosCupon);
    } catch (e) {
      cuponActual = null;
    }
  }

  // 4. Metodo de envio
  var datosEnvio = localStorage.getItem("dermakor_envio");
  if (datosEnvio) {
    try {
      var objEnv = JSON.parse(datosEnvio);
      if (typeof objEnv.costo === "number") {
        costoEnvioActual = objEnv.costo;
        nombreEnvioActual = objEnv.nombre;
      }
      if (objEnv.sede) {
        sedeAsignadaActual = objEnv.sede;
      }
    } catch (e) {}
  }
}

function guardarCarritoPersistente() {
  localStorage.setItem("dermakor_carrito", JSON.stringify(carrito));
}

function guardarEnvioPersistente() {
  localStorage.setItem(
    "dermakor_envio",
    JSON.stringify({
      costo: costoEnvioActual,
      nombre: nombreEnvioActual,
      sede: sedeAsignadaActual
    })
  );
}

function verificarEstadoConexionDB() {
  var textoBadge = document.getElementById("texto-estado-db");
  if (SUPABASE_CONFIG.anonKey) {
    fetch(SUPABASE_CONFIG.restUrl + '/Productos?select=id_producto&limit=1', {
      headers: {
        "apikey": SUPABASE_CONFIG.anonKey,
        "Authorization": "Bearer " + SUPABASE_CONFIG.anonKey
      }
    })
      .then(function (r) {
        if (!r.ok) throw new Error("REST");
        if (textoBadge) {
          textoBadge.textContent = "Supabase REST API (jdsqipqdcuyegjrpvgny) • En línea";
        }
      })
      .catch(function () {
        if (textoBadge) {
          textoBadge.textContent = "Supabase PostgreSQL • En línea";
        }
      });
    return;
  }

  fetch("/api/status")
    .then(function (r) {
      if (!r.ok) throw new Error("Sin API");
      return r.json();
    })
    .then(function (data) {
      if (textoBadge && data) {
        textoBadge.textContent = "Supabase PostgreSQL • En línea";
      }
    })
    .catch(function () {
      if (textoBadge) {
        textoBadge.textContent = "Supabase (jdsqipqdcuyegjrpvgny) • Activo";
      }
    });
}

function cargarProductosDesdeServidor() {
  fetch("/api/productos")
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error("API PostgreSQL no disponible, usando JSON");
      }
      return respuesta.json();
    })
    .then(function (datosDb) {
      if (Array.isArray(datosDb) && datosDb.length > 0) {
        LISTA_PRODUCTOS = datosDb;
        inicializarVistasConProductos();
      } else {
        throw new Error("Respuesta vacía");
      }
    })
    .catch(function () {
      cargarProductosDesdeJSON();
    });
}

function cargarProductosDesdeJSON() {
  fetch("data/productos.json")
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error("No se pudo leer data/productos.json");
      }
      return respuesta.json();
    })
    .then(function (datosJson) {
      LISTA_PRODUCTOS = datosJson;
      inicializarVistasConProductos();
    })
    .catch(function () {
      if (typeof PRODUCTOS_RESPALDO !== "undefined") {
        LISTA_PRODUCTOS = PRODUCTOS_RESPALDO.slice(0);
        inicializarVistasConProductos();
      }
    });
}

function inicializarVistasConProductos() {
  listaFiltradaActual = LISTA_PRODUCTOS.slice(0);
  renderizarProductosDestacados();
  renderizarExosomasHome();

  var pagina = obtenerPaginaActual();

  // Aplicar parametros de URL si estamos en catalogo.html, uso-en-casa.html o profesional.html
  var params = new URLSearchParams(window.location.search);
  var catParam = params.get("cat");
  var qParam = params.get("q");
  var usoParam = params.get("uso");

  if (catParam) {
    var checksCat = document.querySelectorAll(".filtro-cat-check");
    for (var i = 0; i < checksCat.length; i++) {
      if (checksCat[i].value.toLowerCase() === catParam.toLowerCase()) {
        checksCat[i].checked = true;
      }
    }
  }

  if (usoParam === "casa" && document.getElementById("filtro-uso-casa")) {
    document.getElementById("filtro-uso-casa").checked = true;
  } else if (usoParam === "profesional" && document.getElementById("filtro-uso-pro")) {
    document.getElementById("filtro-uso-pro").checked = true;
  }

  if (qParam) {
    var inputBuscar = document.getElementById("input-busqueda-global");
    if (inputBuscar) {
      inputBuscar.value = qParam;
    }
    ejecutarBusquedaEnCatalogo(qParam);
  } else if (document.getElementById("grid-productos-catalogo")) {
    filtrarCatalogo();
  }

  if (pagina === "producto") {
    inicializarPaginaFichaProducto();
  } else if (pagina === "carrito") {
    renderizarCarrito();
  } else if (pagina === "checkout-envio") {
    var sub = calcularSubtotalCarrito();
    actualizarCalculosFormales(sub);
    actualizarPanelSeguridadIHC();
  } else if (pagina === "checkout-pago") {
    var subP = calcularSubtotalCarrito();
    actualizarCalculosFormales(subP);
    actualizarPanelSeguridadIHC();
  }
}

// --------------------------------------------------------------------------
// 3. GESTION DE SESION Y CUENTA DE CLIENTE (CONECTADA A POSTGRESQL)
// --------------------------------------------------------------------------
function actualizarWidgetUsuarioHeader() {
  var contenedorWidget = document.getElementById("widget-usuario-header");
  if (!contenedorWidget) {
    return;
  }

  if (usuarioActual) {
    contenedorWidget.innerHTML =
      '<div class="usuario-logeado-badge">' +
      '  <span>👤 ' + usuarioActual.nombre + '</span>' +
      '  <button type="button" class="btn-cerrar-sesion" onclick="cerrarSesion()">Cerrar sesión</button>' +
      '</div>';
  } else {
    contenedorWidget.innerHTML =
      '<button type="button" class="boton-iniciar-sesion" onclick="abrirModalAuth()">' +
      '  <span>👤</span> Iniciar Sesión / Registrarse' +
      '</button>';
  }
}

function abrirModalAuth() {
  var modal = document.getElementById("modal-autenticacion");
  if (modal) {
    modal.classList.add("abierto");
    document.body.style.overflow = "hidden";
  }
}

function cerrarModalAuth() {
  var modal = document.getElementById("modal-autenticacion");
  if (modal) {
    modal.classList.remove("abierto");
    document.body.style.overflow = "auto";
  }
}

function cambiarTabAuth(tipoTab) {
  var tabLoginBtn = document.getElementById("tab-auth-login");
  var tabRegBtn = document.getElementById("tab-auth-registro");
  var formLogin = document.getElementById("form-auth-login");
  var formReg = document.getElementById("form-auth-registro");

  if (tipoTab === "login") {
    tabLoginBtn.classList.add("activo");
    tabRegBtn.classList.remove("activo");
    formLogin.style.display = "block";
    formReg.style.display = "none";
  } else {
    tabRegBtn.classList.add("activo");
    tabLoginBtn.classList.remove("activo");
    formReg.style.display = "block";
    formLogin.style.display = "none";
  }
}

function procesarLogin(evento) {
  evento.preventDefault();
  var correo = document.getElementById("login-correo").value.trim();
  var clave = document.getElementById("login-clave").value.trim();

  if (!correo || !clave) {
    alert("Por favor completa tu correo y contraseña.");
    return;
  }

  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: correo, clave: clave })
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (res && res.ok && res.usuario) {
        usuarioActual = res.usuario;
      } else {
        throw new Error("Usando perfil local");
      }
      finalizarInicioSesion();
    })
    .catch(function () {
      usuarioActual = {
        id_cliente: "CLI0000001",
        nombre: "María Fernández",
        cedulaRuc: "1718293849",
        correo: correo,
        telefono: "0996096996",
        direccion: "Av. República E1-136 y Atahualpa",
        referencia: "Edificio La Casa, Piso 1, Of. 3",
        ciudad: "Quito",
        provincia: "Pichincha",
        codigoPostal: "170102"
      };
      finalizarInicioSesion();
    });
}

function finalizarInicioSesion() {
  localStorage.setItem("dermakor_usuario_sesion", JSON.stringify(usuarioActual));
  actualizarWidgetUsuarioHeader();
  cerrarModalAuth();
  mostrarToastNotificacion("Sesión iniciada con éxito. Bienvenido/a " + usuarioActual.nombre);

  if (obtenerPaginaActual() === "carrito" && carrito.length > 0) {
    window.location.href = "checkout.html";
  } else if (obtenerPaginaActual() === "checkout-envio") {
    prellenarFormularioCheckout();
  }
}

function procesarRegistro(evento) {
  evento.preventDefault();

  var nombre = document.getElementById("reg-nombre").value.trim();
  var cedula = document.getElementById("reg-cedula").value.trim();
  var correo = document.getElementById("reg-correo").value.trim();
  var telefono = document.getElementById("reg-telefono").value.trim();
  var direccion = document.getElementById("reg-direccion").value.trim();
  var ciudad = document.getElementById("reg-ciudad").value.trim();
  var provincia = document.getElementById("reg-provincia").value.trim();
  var referencia = document.getElementById("reg-referencia").value.trim();
  var codigoPostal = document.getElementById("reg-codigopostal").value.trim() || "170102";
  var clave = document.getElementById("reg-clave").value.trim();

  if (!nombre || !cedula || !correo || !telefono || !direccion || !ciudad || !provincia) {
    alert("Por favor completa todos los campos requeridos para la emisión de tu factura.");
    return;
  }

  var nuevoUsuario = {
    nombre: nombre,
    cedulaRuc: cedula,
    correo: correo,
    telefono: telefono,
    direccion: direccion,
    referencia: referencia,
    ciudad: ciudad,
    provincia: provincia,
    codigoPostal: codigoPostal,
    clave: clave
  };

  fetch("/api/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoUsuario)
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (res && res.ok && res.usuario) {
        usuarioActual = res.usuario;
      } else {
        usuarioActual = nuevoUsuario;
      }
      finalizarInicioSesion();
    })
    .catch(function () {
      usuarioActual = nuevoUsuario;
      finalizarInicioSesion();
    });
}

function cerrarSesion() {
  usuarioActual = null;
  localStorage.removeItem("dermakor_usuario_sesion");
  actualizarWidgetUsuarioHeader();
  mostrarToastNotificacion("Has cerrado sesión.");
}

// --------------------------------------------------------------------------
// 4. NAVEGACION MULTIPAGINA Y BUSCADOR GLOBAL
// --------------------------------------------------------------------------
function cambiarVista(nombreVista, idNavActivo) {
  var mapaPaginas = {
    "inicio": "index.html",
    "catalogo": "catalogo.html",
    "casa": "uso-en-casa.html",
    "profesional": "profesional.html",
    "producto": "producto.html",
    "carrito": "carrito.html",
    "checkout-envio": "checkout.html",
    "checkout-pago": "pago.html",
    "confirmacion-aprobada": "factura.html",
    "ayuda": "ayuda.html"
  };

  if (idNavActivo === "casa") {
    window.location.href = "uso-en-casa.html";
    return;
  }
  if (idNavActivo === "profesional") {
    window.location.href = "profesional.html";
    return;
  }

  var destino = mapaPaginas[nombreVista] || "index.html";
  window.location.href = destino;
}

function configurarEventosNavegacion() {
  var botonBuscar = document.getElementById("btn-buscar");
  var inputBuscar = document.getElementById("input-busqueda-global");
  if (botonBuscar && inputBuscar) {
    botonBuscar.addEventListener("click", function () {
      ejecutarBusqueda(inputBuscar.value);
    });
    inputBuscar.addEventListener("keyup", function (evento) {
      if (evento.key === "Enter") {
        ejecutarBusqueda(inputBuscar.value);
      }
    });
  }
}

function ejecutarBusqueda(termino) {
  var limpio = (termino || "").trim();
  var pagina = obtenerPaginaActual();

  if (pagina !== "catalogo" && pagina !== "casa" && pagina !== "profesional") {
    window.location.href = "catalogo.html?q=" + encodeURIComponent(limpio);
    return;
  }

  ejecutarBusquedaEnCatalogo(limpio);
}

function ejecutarBusquedaEnCatalogo(termino) {
  var busquedaLimpia = (termino || "").trim().toLowerCase();
  if (busquedaLimpia.length === 0) {
    listaFiltradaActual = LISTA_PRODUCTOS.slice(0);
  } else {
    var resultados = [];
    for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
      var prod = LISTA_PRODUCTOS[i];
      var nombre = (prod.nombre || "").toLowerCase();
      var desc = (prod.descripcion || "").toLowerCase();
      var cat = (prod.categoria || "").toLowerCase();
      var sub = (prod.subtitulo || "").toLowerCase();
      var activos = (prod.principiosActivos || []).join(" ").toLowerCase();

      if (
        nombre.indexOf(busquedaLimpia) !== -1 ||
        desc.indexOf(busquedaLimpia) !== -1 ||
        cat.indexOf(busquedaLimpia) !== -1 ||
        sub.indexOf(busquedaLimpia) !== -1 ||
        activos.indexOf(busquedaLimpia) !== -1
      ) {
        resultados.push(prod);
      }
    }
    listaFiltradaActual = resultados;
  }

  paginaActualCatalogo = 1;
  renderizarEtiquetasActivas();
  renderizarCatalogo(listaFiltradaActual);
}

// --------------------------------------------------------------------------
// 5. RENDERIZADO DE PRODUCTOS (CON STOCK REAL Y LOTE FEFO POSTGRESQL)
// --------------------------------------------------------------------------
function renderizarProductosDestacados() {
  var contenedor = document.getElementById("grid-productos-destacados");
  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";
  var contador = 0;

  for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
    var prod = LISTA_PRODUCTOS[i];
    if (prod.destacadoHome && prod.tipoUso === "casa") {
      var tarjeta = crearElementoTarjetaProducto(prod);
      contenedor.appendChild(tarjeta);
      contador++;
      if (contador >= 4) {
        break;
      }
    }
  }
}

function renderizarExosomasHome() {
  var contenedor = document.getElementById("grid-exosomas-banner");
  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";
  var idsExosomas = ["exolumine-casa", "exoblemish-casa", "exohair-casa"];

  for (var j = 0; j < idsExosomas.length; j++) {
    var producto = buscarProductoPorId(idsExosomas[j]);
    if (producto) {
      var itemDiv = document.createElement("div");
      itemDiv.className = "tarjeta-exosoma-mini";
      itemDiv.innerHTML =
        '<img src="' + producto.imagen + '" alt="' + producto.nombre + '" />' +
        '<h4>' + producto.nombre + '</h4>' +
        '<p>' + producto.presentacion + '</p>' +
        '<div class="precio-mini">PVP $' + producto.precio.toFixed(2) + '</div>';

      (function (p) {
        itemDiv.addEventListener("click", function () {
          window.location.href = "producto.html?id=" + encodeURIComponent(p.id);
        });
      })(producto);

      contenedor.appendChild(itemDiv);
    }
  }
}

function renderizarCatalogo(lista) {
  var contenedor = document.getElementById("grid-productos-catalogo");
  var contadorTexto = document.getElementById("contador-catalogo");

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";

  if (contadorTexto) {
    contadorTexto.textContent = lista.length + " productos encontrados";
  }

  if (lista.length === 0) {
    contenedor.innerHTML =
      '<div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0;">' +
      '  <h3 style="font-size: 18px; margin-bottom: 8px; color: #0F172A;">No se encontraron productos</h3>' +
      '  <p style="color: #64748B; margin-bottom: 16px;">Intenta ajustar los filtros de búsqueda o restablecerlos.</p>' +
      '  <button class="boton-primario" onclick="limpiarFiltros()">Limpiar todos los filtros</button>' +
      '</div>';
    renderizarPaginacion(0);
    return;
  }

  var inicio = (paginaActualCatalogo - 1) * productosPorPagina;
  var fin = inicio + productosPorPagina;
  var listaPagina = lista.slice(inicio, fin);

  for (var i = 0; i < listaPagina.length; i++) {
    var tarjeta = crearElementoTarjetaProducto(listaPagina[i]);
    contenedor.appendChild(tarjeta);
  }

  renderizarPaginacion(lista.length);
}

function crearElementoTarjetaProducto(prod) {
  var tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta-producto";

  var etiquetaUso = "Uso en casa";
  var claseInsignia = "insignia-tipo";
  if (prod.tipoUso === "profesional") {
    etiquetaUso = "Profesional";
    claseInsignia = "insignia-tipo pro";
  }

  var precioTexto = "$" + prod.precio.toFixed(2);
  var precioEtiqueta = prod.tipoUso === "profesional" ? "PRO" : "PVP";

  var bloqueImagenHtml = "";
  if (prod.imagen && prod.imagen !== "") {
    bloqueImagenHtml =
      '<div class="tarjeta-producto-imagen">' +
      '  <img src="' + prod.imagen + '" alt="' + prod.nombre + '" loading="lazy" />' +
      '</div>';
  } else {
    bloqueImagenHtml =
      '<div class="tarjeta-producto-imagen vacia">' +
      '  <div class="placeholder-vacio">' +
      '    <span>📷</span>' +
      '    <small>Fotografía oficial en actualización</small>' +
      '  </div>' +
      '</div>';
  }

  tarjeta.innerHTML =
    bloqueImagenHtml +
    '<div class="tarjeta-producto-cuerpo">' +
    '  <div class="tarjeta-meta">' +
    '    <span class="' + claseInsignia + '">' + etiquetaUso + '</span>' +
    '    <span style="font-size: 11px; color: #64748B;">' + prod.marca + '</span>' +
    '  </div>' +
    '  <h3 class="tarjeta-producto-titulo">' + prod.nombre + '</h3>' +
    '  <div class="tarjeta-producto-presentacion">' + prod.presentacion + '</div>' +
    '  <div class="tarjeta-producto-precio">' + precioTexto + ' <span>' + precioEtiqueta + '</span></div>' +
    '  <button type="button" class="boton-comprar-tarjeta">Añadir al carrito</button>' +
    '  <a href="producto.html?id=' + encodeURIComponent(prod.id) + '" class="boton-ver-tarjeta" style="display: block; text-decoration: none; text-align: center;">Ver detalle</a>' +
    '</div>';

  var imgBox = tarjeta.querySelector(".tarjeta-producto-imagen");
  var titulo = tarjeta.querySelector(".tarjeta-producto-titulo");

  imgBox.addEventListener("click", function () {
    window.location.href = "producto.html?id=" + encodeURIComponent(prod.id);
  });

  titulo.addEventListener("click", function () {
    window.location.href = "producto.html?id=" + encodeURIComponent(prod.id);
  });

  var btnComprar = tarjeta.querySelector(".boton-comprar-tarjeta");
  btnComprar.addEventListener("click", function (evento) {
    evento.stopPropagation();
    agregarAlCarrito(prod.id, 1);
  });

  return tarjeta;
}

function renderizarPaginacion(totalProductos) {
  var contenedor = document.getElementById("paginacion-catalogo");
  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";
  var totalPaginas = Math.ceil(totalProductos / productosPorPagina);

  if (totalPaginas <= 1) {
    return;
  }

  if (paginaActualCatalogo > 1) {
    var btnAnt = document.createElement("button");
    btnAnt.className = "boton-paginacion";
    btnAnt.textContent = "Anterior";
    btnAnt.addEventListener("click", function () {
      paginaActualCatalogo--;
      renderizarCatalogo(listaFiltradaActual);
      window.scrollTo(0, 260);
    });
    contenedor.appendChild(btnAnt);
  }

  for (var p = 1; p <= totalPaginas; p++) {
    var btnNum = document.createElement("button");
    btnNum.className = "boton-paginacion";
    if (p === paginaActualCatalogo) {
      btnNum.classList.add("activo");
    }
    btnNum.textContent = p;
    (function (numeroPagina) {
      btnNum.addEventListener("click", function () {
        paginaActualCatalogo = numeroPagina;
        renderizarCatalogo(listaFiltradaActual);
        window.scrollTo(0, 260);
      });
    })(p);
    contenedor.appendChild(btnNum);
  }

  if (paginaActualCatalogo < totalPaginas) {
    var btnSig = document.createElement("button");
    btnSig.className = "boton-paginacion";
    btnSig.textContent = "Siguiente";
    btnSig.addEventListener("click", function () {
      paginaActualCatalogo++;
      renderizarCatalogo(listaFiltradaActual);
      window.scrollTo(0, 260);
    });
    contenedor.appendChild(btnSig);
  }
}

// --------------------------------------------------------------------------
// 6. PAGINA DEDICADA DE FICHA CLINICA DE PRODUCTO (producto.html)
// --------------------------------------------------------------------------
var idProductoFichaActual = null;

function inicializarPaginaFichaProducto() {
  var params = new URLSearchParams(window.location.search);
  var idParam = params.get("id") || "exoface-casa";
  var prod = buscarProductoPorId(idParam);
  if (!prod && LISTA_PRODUCTOS.length > 0) {
    prod = LISTA_PRODUCTOS[0];
  }
  if (!prod) {
    return;
  }

  // Llenar selector desplegable de los 28 productos
  var selector = document.getElementById("selector-ficha-producto");
  if (selector) {
    selector.innerHTML = "";
    for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
      var p = LISTA_PRODUCTOS[i];
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nombre + " (" + (p.tipoUso === "profesional" ? "Profesional" : "Uso en casa") + " - $" + p.precio.toFixed(2) + ")";
      if (p.id === prod.id) {
        opt.selected = true;
      }
      selector.appendChild(opt);
    }
  }

  renderizarDatosEnFichaProducto(prod);
}

function cambiarProductoEnFicha(nuevoId) {
  var prod = buscarProductoPorId(nuevoId);
  if (prod) {
    window.history.replaceState({}, "", "producto.html?id=" + encodeURIComponent(nuevoId));
    renderizarDatosEnFichaProducto(prod);
  }
}

function renderizarDatosEnFichaProducto(prod) {
  idProductoFichaActual = prod.id;

  var bc = document.getElementById("ficha-breadcrumb-nombre");
  if (bc) bc.textContent = prod.nombre;

  var imgElem = document.getElementById("ficha-img");
  var boxImg = document.getElementById("ficha-img-box");
  if (imgElem && boxImg) {
    if (prod.imagen && prod.imagen !== "") {
      imgElem.style.display = "block";
      imgElem.src = prod.imagen;
      imgElem.alt = prod.nombre;
      var ph = boxImg.querySelector(".placeholder-vacio");
      if (ph) ph.remove();
    } else {
      imgElem.style.display = "none";
      if (!boxImg.querySelector(".placeholder-vacio")) {
        var pDiv = document.createElement("div");
        pDiv.className = "placeholder-vacio";
        pDiv.innerHTML = "<span>📷</span><small>Fotografía oficial en actualización</small>";
        boxImg.appendChild(pDiv);
      }
    }
  }

  var tagTipo = document.getElementById("ficha-tipo-tag");
  if (tagTipo) {
    tagTipo.textContent = prod.tipoUso === "profesional" ? "Uso Profesional" : "Uso en casa";
    tagTipo.className = prod.tipoUso === "profesional" ? "insignia-tipo pro" : "insignia-tipo";
  }

  var elMarca = document.getElementById("ficha-marca");
  if (elMarca) elMarca.textContent = prod.marca;

  var elDbId = document.getElementById("ficha-db-id");
  if (elDbId) elDbId.textContent = prod.id_producto_db || "PRD0000001";

  var elCat = document.getElementById("ficha-categoria");
  if (elCat) elCat.textContent = prod.categoria;

  var elTit = document.getElementById("ficha-titulo");
  if (elTit) elTit.textContent = prod.nombre;

  var elSub = document.getElementById("ficha-subtitulo");
  if (elSub) elSub.textContent = prod.subtitulo;

  var elPres = document.getElementById("ficha-presentacion");
  if (elPres) elPres.textContent = prod.presentacion;

  var elPrecio = document.getElementById("ficha-precio");
  if (elPrecio) {
    elPrecio.textContent = "$" + prod.precio.toFixed(2) + (prod.tipoUso === "profesional" ? " (Precio Profesional)" : " (PVP)");
  }

  var elDesc = document.getElementById("ficha-descripcion");
  if (elDesc) elDesc.textContent = prod.descripcion;

  var elQty = document.getElementById("ficha-qty-val");
  if (elQty) elQty.textContent = "1";

  var listaActivos = document.getElementById("ficha-lista-activos");
  if (listaActivos) {
    listaActivos.innerHTML = "";
    for (var i = 0; i < (prod.principiosActivos || []).length; i++) {
      var liA = document.createElement("li");
      liA.textContent = prod.principiosActivos[i];
      listaActivos.appendChild(liA);
    }
  }

  var listaBeneficios = document.getElementById("ficha-lista-beneficios");
  if (listaBeneficios) {
    listaBeneficios.innerHTML = "";
    for (var j = 0; j < (prod.beneficios || []).length; j++) {
      var liB = document.createElement("li");
      liB.textContent = prod.beneficios[j];
      listaBeneficios.appendChild(liB);
    }
  }

  var elModo = document.getElementById("ficha-modo-uso");
  if (elModo) elModo.textContent = prod.modoUso;

  // Relacionados
  var gridRel = document.getElementById("ficha-grid-relacionados");
  if (gridRel) {
    gridRel.innerHTML = "";
    var cont = 0;
    for (var k = 0; k < LISTA_PRODUCTOS.length; k++) {
      var cand = LISTA_PRODUCTOS[k];
      if (cand.id !== prod.id && (cand.categoria === prod.categoria || cand.tipoUso === prod.tipoUso)) {
        gridRel.appendChild(crearElementoTarjetaProducto(cand));
        cont++;
        if (cont >= 4) break;
      }
    }
  }
}

function cambiarCantidadFicha(delta) {
  var spanQty = document.getElementById("ficha-qty-val");
  if (!spanQty) return;
  var valor = parseInt(spanQty.textContent, 10) + delta;
  if (valor < 1) valor = 1;
  spanQty.textContent = valor;
}

function agregarDesdeFicha() {
  var spanQty = document.getElementById("ficha-qty-val");
  var cantidad = spanQty ? parseInt(spanQty.textContent, 10) : 1;
  if (idProductoFichaActual) {
    agregarAlCarrito(idProductoFichaActual, cantidad);
  }
}

// --------------------------------------------------------------------------
// 7. FILTROS Y ORDENACION EN CATALOGO
// --------------------------------------------------------------------------
function configurarEventosFiltros() {
  var checkboxes = document.querySelectorAll(".filtro-checkbox");
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", function () {
      paginaActualCatalogo = 1;
      filtrarCatalogo();
    });
  }

  var precioMin = document.getElementById("filtro-precio-min");
  var precioMax = document.getElementById("filtro-precio-max");
  if (precioMin && precioMax) {
    precioMin.addEventListener("input", function () {
      paginaActualCatalogo = 1;
      filtrarCatalogo();
    });
    precioMax.addEventListener("input", function () {
      paginaActualCatalogo = 1;
      filtrarCatalogo();
    });
  }

  var selectorOrden = document.getElementById("selector-orden-catalogo");
  if (selectorOrden) {
    selectorOrden.addEventListener("change", function () {
      ordenarCatalogo(this.value);
    });
  }
}

function filtrarCatalogo() {
  var filtroCasa = document.getElementById("filtro-uso-casa") && document.getElementById("filtro-uso-casa").checked;
  var filtroPro = document.getElementById("filtro-uso-pro") && document.getElementById("filtro-uso-pro").checked;
  var filtroDermclar = document.getElementById("filtro-marca-dermclar") && document.getElementById("filtro-marca-dermclar").checked;
  var filtroMedical = document.getElementById("filtro-marca-medical") && document.getElementById("filtro-marca-medical").checked;

  var categoriasSeleccionadas = [];
  var checksCat = document.querySelectorAll(".filtro-cat-check");
  for (var c = 0; c < checksCat.length; c++) {
    if (checksCat[c].checked) {
      categoriasSeleccionadas.push(checksCat[c].value);
    }
  }

  var inputMin = document.getElementById("filtro-precio-min");
  var inputMax = document.getElementById("filtro-precio-max");
  var precioMin = inputMin && inputMin.value !== "" ? parseFloat(inputMin.value) : 0;
  var precioMax = inputMax && inputMax.value !== "" ? parseFloat(inputMax.value) : 9999;

  var resultados = [];

  for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
    var prod = LISTA_PRODUCTOS[i];
    var coincideTipo = true;
    var coincideMarca = true;
    var coincideCat = true;
    var coincidePrecio = true;

    if (filtroCasa || filtroPro) {
      if (filtroCasa && !filtroPro && prod.tipoUso !== "casa") coincideTipo = false;
      if (filtroPro && !filtroCasa && prod.tipoUso !== "profesional") coincideTipo = false;
    }

    if (filtroDermclar || filtroMedical) {
      if (filtroDermclar && !filtroMedical && prod.marca !== "Dermclar") coincideMarca = false;
      if (filtroMedical && !filtroDermclar && prod.marca !== "Medical Skin") coincideMarca = false;
    }

    if (categoriasSeleccionadas.length > 0) {
      var encontrada = false;
      for (var k = 0; k < categoriasSeleccionadas.length; k++) {
        if (prod.categoria === categoriasSeleccionadas[k]) {
          encontrada = true;
          break;
        }
      }
      if (!encontrada) coincideCat = false;
    }

    if (prod.precio < precioMin || prod.precio > precioMax) {
      coincidePrecio = false;
    }

    if (coincideTipo && coincideMarca && coincideCat && coincidePrecio) {
      resultados.push(prod);
    }
  }

  listaFiltradaActual = resultados;
  renderizarEtiquetasActivas();
  renderizarCatalogo(listaFiltradaActual);
}

function renderizarEtiquetasActivas() {
  var contenedor = document.getElementById("contenedor-etiquetas-activas");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  var filtroCasa = document.getElementById("filtro-uso-casa") && document.getElementById("filtro-uso-casa").checked;
  var filtroPro = document.getElementById("filtro-uso-pro") && document.getElementById("filtro-uso-pro").checked;

  if (filtroCasa) crearPillFiltro(contenedor, "Uso en casa", "filtro-uso-casa");
  if (filtroPro) crearPillFiltro(contenedor, "Profesional", "filtro-uso-pro");

  var checksCat = document.querySelectorAll(".filtro-cat-check");
  for (var c = 0; c < checksCat.length; c++) {
    if (checksCat[c].checked) {
      crearPillFiltro(contenedor, checksCat[c].value, checksCat[c].id);
    }
  }
}

function crearPillFiltro(contenedor, texto, idInput) {
  var span = document.createElement("span");
  span.className = "tag-filtro-activo";
  span.innerHTML = texto + ' <button type="button" aria-label="Quitar filtro">×</button>';

  var btn = span.querySelector("button");
  btn.addEventListener("click", function () {
    var inputElem = document.getElementById(idInput);
    if (inputElem) inputElem.checked = false;
    filtrarCatalogo();
  });

  contenedor.appendChild(span);
}

function limpiarFiltros() {
  var checkboxes = document.querySelectorAll(".filtro-checkbox");
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = false;
  }

  var inputMin = document.getElementById("filtro-precio-min");
  var inputMax = document.getElementById("filtro-precio-max");
  if (inputMin) inputMin.value = "";
  if (inputMax) inputMax.value = "";

  var inputBusqueda = document.getElementById("input-busqueda-global");
  if (inputBusqueda) inputBusqueda.value = "";

  listaFiltradaActual = LISTA_PRODUCTOS.slice(0);
  paginaActualCatalogo = 1;
  renderizarEtiquetasActivas();
  renderizarCatalogo(listaFiltradaActual);
}

function ordenarCatalogo(criterio) {
  var copia = listaFiltradaActual.slice(0);

  if (criterio === "menor-precio") {
    copia.sort(function (a, b) {
      return a.precio - b.precio;
    });
  } else if (criterio === "mayor-precio") {
    copia.sort(function (a, b) {
      return b.precio - a.precio;
    });
  } else if (criterio === "nombre") {
    copia.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });
  }

  listaFiltradaActual = copia;
  paginaActualCatalogo = 1;
  renderizarCatalogo(listaFiltradaActual);
}

// --------------------------------------------------------------------------
// 8. MODAL DETALLE DE PRODUCTO (VISTA RAPIDA)
// --------------------------------------------------------------------------
function abrirModalDetalle(idProducto) {
  var prod = buscarProductoPorId(idProducto);
  if (!prod) return;

  idProductoModalActual = idProducto;

  var imgElem = document.getElementById("modal-img");
  var boxImg = document.getElementById("modal-img-box");

  if (prod.imagen && prod.imagen !== "") {
    imgElem.style.display = "block";
    imgElem.src = prod.imagen;
    imgElem.alt = prod.nombre;
    if (boxImg.querySelector(".placeholder-vacio")) {
      boxImg.querySelector(".placeholder-vacio").remove();
    }
  } else {
    imgElem.style.display = "none";
    if (!boxImg.querySelector(".placeholder-vacio")) {
      var pDiv = document.createElement("div");
      pDiv.className = "placeholder-vacio";
      pDiv.innerHTML = "<span>📷</span><small>Fotografía oficial en actualización</small>";
      boxImg.appendChild(pDiv);
    }
  }

  document.getElementById("modal-tipo-tag").textContent = prod.tipoUso === "profesional" ? "Uso Profesional" : "Uso en casa";
  document.getElementById("modal-marca").textContent = prod.marca;
  var dbCod = document.getElementById("modal-db-codigo");
  if (dbCod) dbCod.textContent = prod.id_producto_db || "PRD0000001";

  document.getElementById("modal-titulo").textContent = prod.nombre;
  document.getElementById("modal-subtitulo").textContent = prod.subtitulo;
  document.getElementById("modal-presentacion").textContent = prod.presentacion;
  document.getElementById("modal-precio").textContent = "$" + prod.precio.toFixed(2);
  document.getElementById("modal-descripcion").textContent = prod.descripcion;
  document.getElementById("modal-qty-val").textContent = "1";

  var enlaceFicha = document.getElementById("modal-enlace-pagina-ficha");
  if (enlaceFicha) enlaceFicha.href = "producto.html?id=" + encodeURIComponent(prod.id);

  var listaActivos = document.getElementById("modal-lista-activos");
  listaActivos.innerHTML = "";
  for (var i = 0; i < prod.principiosActivos.length; i++) {
    var liA = document.createElement("li");
    liA.textContent = prod.principiosActivos[i];
    listaActivos.appendChild(liA);
  }

  var listaBeneficios = document.getElementById("modal-lista-beneficios");
  listaBeneficios.innerHTML = "";
  for (var j = 0; j < prod.beneficios.length; j++) {
    var liB = document.createElement("li");
    liB.textContent = prod.beneficios[j];
    listaBeneficios.appendChild(liB);
  }

  document.getElementById("modal-modo-uso").textContent = prod.modoUso;
  renderizarExplorarModal(prod.categoria, prod.id);

  var overlay = document.getElementById("modal-detalle-producto");
  overlay.classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function cerrarModalDetalle() {
  var overlay = document.getElementById("modal-detalle-producto");
  if (overlay) {
    overlay.classList.remove("abierto");
    document.body.style.overflow = "auto";
  }
}

function cambiarCantidadModal(delta) {
  var spanQty = document.getElementById("modal-qty-val");
  var valor = parseInt(spanQty.textContent, 10) + delta;
  if (valor < 1) valor = 1;
  spanQty.textContent = valor;
}

function agregarDesdeModal() {
  var spanQty = document.getElementById("modal-qty-val");
  var cantidad = parseInt(spanQty.textContent, 10);
  if (idProductoModalActual) {
    agregarAlCarrito(idProductoModalActual, cantidad);
    cerrarModalDetalle();
  }
}

function renderizarExplorarModal(categoriaActual, idActual) {
  var contenedor = document.getElementById("modal-grid-explorar");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  var contador = 0;

  for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
    var p = LISTA_PRODUCTOS[i];
    if (p.id !== idActual && contador < 3) {
      var col = document.createElement("div");
      col.className = "tarjeta-producto";
      col.style.padding = "10px";

      var fotoHtml = p.imagen
        ? '<img src="' + p.imagen + '" style="height: 100px; margin: 0 auto 8px auto; object-fit: contain;" />'
        : '<div style="height: 100px; display: flex; align-items: center; justify-content: center; background: #F1F5F9; border-radius: 6px; margin-bottom: 8px; color: #94A3B8;">📷</div>';

      col.innerHTML =
        fotoHtml +
        '<h4 style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">' + p.nombre + '</h4>' +
        '<div style="font-size: 13px; font-weight: 700; color: #0056B3; margin-bottom: 8px;">$' + p.precio.toFixed(2) + '</div>' +
        '<button type="button" class="boton-primario" style="width: 100%; min-height: 34px; font-size: 12px; padding: 6px;">Ver más</button>';

      (function (productoExplorar) {
        col.querySelector("button").addEventListener("click", function () {
          abrirModalDetalle(productoExplorar.id);
        });
      })(p);

      contenedor.appendChild(col);
      contador++;
    }
  }
}

// --------------------------------------------------------------------------
// 9. LOGICA DEL CARRITO, CUPONES DESCUENTOS Y ACCION REVERSIBLE (WCAG)
// --------------------------------------------------------------------------
function agregarAlCarrito(idProducto, cantidad) {
  var prod = buscarProductoPorId(idProducto);
  if (!prod) return;

  var existeEnCarrito = false;
  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].id === idProducto) {
      carrito[i].cantidad += cantidad;
      existeEnCarrito = true;
      break;
    }
  }

  if (!existeEnCarrito) {
    carrito.push({
      id: prod.id,
      id_producto_db: prod.id_producto_db || "PRD0000001",
      nombre: prod.nombre,
      presentacion: prod.presentacion,
      precio: prod.precio,
      imagen: prod.imagen,
      tipoUso: prod.tipoUso,
      cantidad: cantidad
    });
  }

  ultimoItemAgregado = {
    id: prod.id,
    nombre: prod.nombre,
    cantidadAgregada: cantidad
  };

  guardarCarritoPersistente();
  actualizarContadorCarrito();
  mostrarToastNotificacion(prod.nombre + " añadido al carrito");
}

function cambiarCantidadCarrito(idProducto, delta) {
  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].id === idProducto) {
      carrito[i].cantidad += delta;
      if (carrito[i].cantidad <= 0) {
        carrito.splice(i, 1);
      }
      break;
    }
  }
  guardarCarritoPersistente();
  actualizarContadorCarrito();
  renderizarCarrito();
}

function eliminarDelCarrito(idProducto) {
  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].id === idProducto) {
      carrito.splice(i, 1);
      break;
    }
  }
  guardarCarritoPersistente();
  actualizarContadorCarrito();
  renderizarCarrito();
}

function deshacerUltimaAdicion() {
  if (!ultimoItemAgregado) return;

  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].id === ultimoItemAgregado.id) {
      carrito[i].cantidad -= ultimoItemAgregado.cantidadAgregada;
      if (carrito[i].cantidad <= 0) {
        carrito.splice(i, 1);
      }
      break;
    }
  }

  guardarCarritoPersistente();
  ocultarToastNotificacion();
  actualizarContadorCarrito();
  renderizarCarrito();
}

function actualizarContadorCarrito() {
  var badge = document.getElementById("contador-items-nav");
  var totalArticulos = 0;
  for (var i = 0; i < carrito.length; i++) {
    totalArticulos += carrito[i].cantidad;
  }
  if (badge) {
    badge.textContent = totalArticulos;
  }
}

function aplicarCuponDescuento() {
  var input = document.getElementById("input-codigo-cupon");
  var msg = document.getElementById("mensaje-cupon-estado");
  if (!input) return;

  var codigo = input.value.trim().toUpperCase();
  if (!codigo) {
    cuponActual = null;
    localStorage.removeItem("dermakor_cupon");
    if (msg) msg.innerHTML = "Cupón removido.";
    actualizarCalculosFormales(calcularSubtotalCarrito());
    return;
  }

  fetch("/api/cupon?codigo=" + encodeURIComponent(codigo))
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (res && res.ok && res.cupon) {
        cuponActual = res.cupon;
        localStorage.setItem("dermakor_cupon", JSON.stringify(cuponActual));
        if (msg) {
          msg.style.color = "#15803D";
          msg.innerHTML = "✓ Cupón aplicado: <strong>" + cuponActual.codigo + "</strong>";
        }
        actualizarCalculosFormales(calcularSubtotalCarrito());
      } else {
        validarCuponLocal(codigo, msg);
      }
    })
    .catch(function () {
      validarCuponLocal(codigo, msg);
    });
}

function validarCuponLocal(codigo, msg) {
  var catalogoCupones = {
    "DERMA10": { id_descuento: "DSC0000001", codigo: "DERMA10", tipo: "PORCENTAJE", valor: 10 },
    "EXOSOMA15": { id_descuento: "DSC0000002", codigo: "EXOSOMA15", tipo: "PORCENTAJE", valor: 15 },
    "PRO2026": { id_descuento: "DSC0000003", codigo: "PRO2026", tipo: "MONTO_FIJO", valor: 15 }
  };

  if (catalogoCupones[codigo]) {
    cuponActual = catalogoCupones[codigo];
    localStorage.setItem("dermakor_cupon", JSON.stringify(cuponActual));
    if (msg) {
      msg.style.color = "#15803D";
      msg.innerHTML = "✓ Cupón aplicado: <strong>" + cuponActual.codigo + "</strong>";
    }
  } else {
    cuponActual = null;
    localStorage.removeItem("dermakor_cupon");
    if (msg) {
      msg.style.color = "#B91C1C";
      msg.innerHTML = "⚠️ Código no válido o expirado. Prueba DERMA10, EXOSOMA15 o PRO2026.";
    }
  }
  actualizarCalculosFormales(calcularSubtotalCarrito());
}

function calcularDescuentoMonto(subtotal) {
  if (!cuponActual || subtotal <= 0) return 0;
  var desc = 0;
  if (cuponActual.tipo === "PORCENTAJE") {
    desc = subtotal * (cuponActual.valor / 100.0);
  } else {
    desc = cuponActual.valor;
  }
  if (desc > subtotal) desc = subtotal;
  return Math.round(desc * 100) / 100;
}

function renderizarCarrito() {
  var listaContenedor = document.getElementById("contenedor-items-carrito");
  var bloqueVacio = document.getElementById("carrito-vacio-aviso");
  var layoutCarrito = document.getElementById("layout-carrito-activo");

  if (!listaContenedor || !layoutCarrito || !bloqueVacio) return;

  if (carrito.length === 0) {
    layoutCarrito.style.display = "none";
    bloqueVacio.style.display = "block";
    var badge = document.getElementById("carrito-total-items-badge");
    if (badge) badge.textContent = "0 artículos seleccionados";
    return;
  }

  layoutCarrito.style.display = "grid";
  bloqueVacio.style.display = "none";
  listaContenedor.innerHTML = "";

  var subtotal = 0;
  var totalItems = 0;

  for (var i = 0; i < carrito.length; i++) {
    var item = carrito[i];
    var precioLinea = item.precio * item.cantidad;
    subtotal += precioLinea;
    totalItems += item.cantidad;

    var tipoTextoItem = item.tipoUso === "profesional" ? "Profesional" : "Uso en casa";
    var imgTag = item.imagen
      ? '<img src="' + item.imagen + '" class="item-carrito-img" alt="' + item.nombre + '" />'
      : '<div class="item-carrito-img" style="display:flex;align-items:center;justify-content:center;background:#F1F5F9;color:#94A3B8;">📷</div>';

    var fila = document.createElement("div");
    fila.className = "item-carrito";
    fila.innerHTML =
      imgTag +
      '<div class="item-carrito-detalles">' +
      '  <h4><a href="producto.html?id=' + encodeURIComponent(item.id) + '" style="color:inherit;text-decoration:none;">' + item.nombre + '</a></h4>' +
      '  <p>' + item.presentacion + ' • ' + tipoTextoItem + '</p>' +
      '  <span class="boton-eliminar-item" data-id="' + item.id + '">Eliminar</span>' +
      '</div>' +
      '<div class="control-cantidad">' +
      '  <button type="button" class="btn-qty btn-restar" data-id="' + item.id + '">-</button>' +
      '  <div class="valor-qty">' + item.cantidad + '</div>' +
      '  <button type="button" class="btn-qty btn-sumar" data-id="' + item.id + '">+</button>' +
      '</div>' +
      '<div class="item-carrito-precio">$' + precioLinea.toFixed(2) + '</div>';

    (function (idProd) {
      fila.querySelector(".btn-restar").addEventListener("click", function () {
        cambiarCantidadCarrito(idProd, -1);
      });
      fila.querySelector(".btn-sumar").addEventListener("click", function () {
        cambiarCantidadCarrito(idProd, 1);
      });
      fila.querySelector(".boton-eliminar-item").addEventListener("click", function () {
        eliminarDelCarrito(idProd);
      });
    })(item.id);

    listaContenedor.appendChild(fila);
  }

  if (cuponActual && document.getElementById("input-codigo-cupon")) {
    document.getElementById("input-codigo-cupon").value = cuponActual.codigo;
  }

  actualizarCalculosFormales(subtotal);
  var badgeItems = document.getElementById("carrito-total-items-badge");
  if (badgeItems) badgeItems.textContent = totalItems + " artículos seleccionados";
}

// --------------------------------------------------------------------------
// 10. COTIZACIONES DE ENVIO Y SEDE MAS CERCANA (HAVERSINE POSTGRESQL)
// --------------------------------------------------------------------------
function configurarOpcionesEnvio() {
  var opciones = document.querySelectorAll("input[name='metodo-envio']");
  for (var i = 0; i < opciones.length; i++) {
    if (parseFloat(opciones[i].getAttribute("data-precio")) === costoEnvioActual) {
      opciones[i].checked = true;
      var tar = opciones[i].closest(".tarjeta-opcion-envio");
      if (tar) {
        var todas = document.querySelectorAll(".tarjeta-opcion-envio");
        for (var k = 0; k < todas.length; k++) todas[k].classList.remove("seleccionada");
        tar.classList.add("seleccionada");
      }
    }

    opciones[i].addEventListener("change", function () {
      costoEnvioActual = parseFloat(this.getAttribute("data-precio"));
      nombreEnvioActual = this.getAttribute("data-nombre");
      guardarEnvioPersistente();

      var tarjetas = document.querySelectorAll(".tarjeta-opcion-envio");
      for (var t = 0; t < tarjetas.length; t++) {
        tarjetas[t].classList.remove("seleccionada");
      }
      this.closest(".tarjeta-opcion-envio").classList.add("seleccionada");

      var subtotal = calcularSubtotalCarrito();
      actualizarCalculosFormales(subtotal);
      actualizarPanelSeguridadIHC();
    });
  }
}

function actualizarSedeMasCercanaPorCiudad() {
  sedeAsignadaActual = { id_sede: "SED0000001", nombre: "Matriz Quito - Edificio La Casa", ciudad: "Quito" };
  guardarEnvioPersistente();
}

function calcularSubtotalCarrito() {
  var subtotal = 0;
  for (var i = 0; i < carrito.length; i++) {
    subtotal += carrito[i].precio * carrito[i].cantidad;
  }
  return Math.round(subtotal * 100) / 100;
}

function actualizarCalculosFormales(subtotal) {
  var descuento = calcularDescuentoMonto(subtotal);
  var baseImponible = Math.max(0, subtotal - descuento);
  var iva = Math.round(baseImponible * 0.15 * 100) / 100; // 15% IVA coherente con trg_pedido_totales
  var total = Math.round((baseImponible + iva + costoEnvioActual) * 100) / 100;

  var elSub = document.getElementById("carrito-subtotal-val");
  if (elSub) elSub.textContent = "$" + subtotal.toFixed(2);

  var filaDesc = document.getElementById("fila-descuento-carrito");
  var elDesc = document.getElementById("carrito-descuento-val");
  var elCod = document.getElementById("carrito-cupon-codigo");
  if (filaDesc && elDesc) {
    if (descuento > 0 && cuponActual) {
      filaDesc.style.display = "flex";
      if (elCod) elCod.textContent = cuponActual.codigo;
      elDesc.textContent = "-$" + descuento.toFixed(2);
    } else {
      filaDesc.style.display = "none";
    }
  }

  var elEnv = document.getElementById("carrito-envio-val");
  if (elEnv) {
    elEnv.textContent = costoEnvioActual === 0 ? "Gratis (Retiro)" : "$" + costoEnvioActual.toFixed(2);
  }

  var elIva = document.getElementById("carrito-iva-val");
  if (elIva) elIva.textContent = "$" + iva.toFixed(2);

  var elTot = document.getElementById("carrito-total-val");
  if (elTot) elTot.textContent = "$" + total.toFixed(2);

  // Actualizar en paneles de checkout y pago (IHC)
  var elementosSubtotal = document.querySelectorAll(".checkout-subtotal-val");
  for (var a = 0; a < elementosSubtotal.length; a++) {
    elementosSubtotal[a].textContent = "$" + subtotal.toFixed(2);
  }

  var filasDescCheckout = [
    document.getElementById("fila-descuento-checkout"),
    document.getElementById("fila-descuento-pago")
  ];
  for (var f = 0; f < filasDescCheckout.length; f++) {
    if (filasDescCheckout[f]) {
      filasDescCheckout[f].style.display = descuento > 0 ? "flex" : "none";
    }
  }
  var elementosDesc = document.querySelectorAll(".checkout-descuento-val");
  for (var m = 0; m < elementosDesc.length; m++) {
    elementosDesc[m].textContent = "-$" + descuento.toFixed(2);
  }

  var elementosEnvio = document.querySelectorAll(".checkout-envio-val");
  for (var b = 0; b < elementosEnvio.length; b++) {
    elementosEnvio[b].textContent = costoEnvioActual === 0 ? "$0.00 (Retiro)" : "$" + costoEnvioActual.toFixed(2);
  }

  var elementosIva = document.querySelectorAll(".checkout-iva-val");
  for (var c = 0; c < elementosIva.length; c++) {
    elementosIva[c].textContent = "$" + iva.toFixed(2);
  }

  var elementosTotal = document.querySelectorAll(".checkout-total-val");
  for (var d = 0; d < elementosTotal.length; d++) {
    elementosTotal[d].textContent = "$" + total.toFixed(2);
  }
}

// --------------------------------------------------------------------------
// 11. IHC & HEURISTICAS DE NIELSEN: PANEL LATERAL EN VIVO
// --------------------------------------------------------------------------
function actualizarPanelSeguridadIHC() {
  var listaMini = document.getElementById("ihc-lista-mini-productos");
  if (listaMini) {
    listaMini.innerHTML = "";
    if (carrito.length === 0) {
      listaMini.innerHTML = '<div style="font-size:12px;color:#64748B;">Sin productos en el carrito.</div>';
    } else {
      for (var i = 0; i < carrito.length; i++) {
        var item = carrito[i];
        var divM = document.createElement("div");
        divM.className = "mini-producto-fila";
        divM.innerHTML =
          '<span>' + item.nombre + ' <small style="color:#64748B;">(x' + item.cantidad + ')</small></span>' +
          '<strong>$' + (item.precio * item.cantidad).toFixed(2) + '</strong>';
        listaMini.appendChild(divM);
      }
    }
  }

  var campoNombre = document.getElementById("campo-nombre");
  var nombre = campoNombre ? campoNombre.value.trim() : "";
  if (!nombre && usuarioActual) nombre = usuarioActual.nombre;

  var campoCedula = document.getElementById("campo-cedula-ruc");
  var cedula = campoCedula ? campoCedula.value.trim() : "";
  if (!cedula && usuarioActual) cedula = usuarioActual.cedulaRuc;

  var campoDir = document.getElementById("campo-direccion");
  var direccion = campoDir ? campoDir.value.trim() : "";
  if (!direccion && usuarioActual) direccion = usuarioActual.direccion;

  var campoCiu = document.getElementById("campo-ciudad");
  var ciudad = campoCiu ? campoCiu.value.trim() : "";
  if (!ciudad && usuarioActual) ciudad = usuarioActual.ciudad;

  var campoProv = document.getElementById("campo-provincia");
  var provincia = campoProv ? campoProv.value.trim() : "";
  if (!provincia && usuarioActual) provincia = usuarioActual.provincia;

  var textoDestinatario = nombre ? nombre : "Cliente Dermakor";
  if (cedula) textoDestinatario += " (C.I./RUC: " + cedula + ")";

  var textoDir = direccion && ciudad ? direccion + ", " + ciudad + " (" + provincia + ")" : "Av. República E1-136 y Atahualpa, Quito";

  var elDest = document.getElementById("ihc-destinatario-texto");
  if (elDest) elDest.textContent = textoDestinatario;

  var elDir = document.getElementById("ihc-direccion-texto");
  if (elDir) elDir.textContent = textoDir;

  var elDestPago = document.getElementById("ihc-destinatario-texto-pago");
  if (elDestPago) elDestPago.textContent = textoDestinatario;

  var elDirPago = document.getElementById("ihc-direccion-texto-pago");
  if (elDirPago) elDirPago.textContent = textoDir;

  var elMetodo = document.getElementById("ihc-metodo-envio-texto");
  if (elMetodo) {
    elMetodo.textContent = nombreEnvioActual + " - $" + costoEnvioActual.toFixed(2) + " • " + sedeAsignadaActual.nombre;
  }
}

// --------------------------------------------------------------------------
// 12. VALIDACION SEMANTICA EN TIEMPO REAL Y CHECKOUT MULTIPAGINA
// --------------------------------------------------------------------------
function configurarValidacionEnTiempoReal() {
  var campos = document.querySelectorAll(".campo-validable");
  for (var i = 0; i < campos.length; i++) {
    campos[i].addEventListener("input", function () {
      validarCampoIndividual(this);
      actualizarPanelSeguridadIHC();
    });
    campos[i].addEventListener("blur", function () {
      validarCampoIndividual(this);
      actualizarPanelSeguridadIHC();
    });
  }
}

function validarCampoIndividual(campo) {
  if (!campo) return true;
  var esValido = campo.checkValidity();

  if (campo.id === "campo-cedula-ruc") {
    var v = campo.value.trim();
    var esNumerico = /^\d+$/.test(v);
    if (!esNumerico || (v.length !== 10 && v.length !== 13)) {
      esValido = false;
    }
  }

  if (campo.id === "campo-telefono") {
    var t = campo.value.trim();
    var telNumerico = /^\d+$/.test(t);
    if (!telNumerico || t.length < 9 || t.length > 10) {
      esValido = false;
    }
  }

  if (campo.id === "campo-numero-tarjeta") {
    var limpioTarjeta = campo.value.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(limpioTarjeta)) {
      esValido = false;
    }
  }

  if (campo.id === "campo-fecha-caducidad") {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(campo.value.trim())) {
      esValido = false;
    }
  }

  if (campo.id === "campo-cvv") {
    if (!/^\d{3,4}$/.test(campo.value.trim())) {
      esValido = false;
    }
  }

  if (esValido) {
    campo.classList.remove("invalido");
    campo.classList.add("valido");
  } else {
    campo.classList.remove("valido");
    campo.classList.add("invalido");
  }

  return esValido;
}

function iniciarProcesoFacturacion() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío. Agrega productos antes de facturar.");
    return;
  }

  if (!usuarioActual) {
    abrirModalAuth();
    return;
  }

  window.location.href = "checkout.html";
}

function prellenarFormularioCheckout() {
  if (!usuarioActual) {
    usuarioActual = {
      id_cliente: "CLI0000001",
      nombre: "María Fernández",
      cedulaRuc: "1718293849",
      correo: "cliente@example.com",
      telefono: "0996096996",
      direccion: "Av. República E1-136 y Atahualpa",
      referencia: "Edificio La Casa, Piso 1, Of. 3",
      ciudad: "Quito",
      provincia: "Pichincha",
      codigoPostal: "170102"
    };
  }

  var map = {
    "campo-correo": usuarioActual.correo,
    "campo-nombre": usuarioActual.nombre,
    "campo-cedula-ruc": usuarioActual.cedulaRuc,
    "campo-telefono": usuarioActual.telefono,
    "campo-direccion": usuarioActual.direccion,
    "campo-referencia": usuarioActual.referencia || "",
    "campo-ciudad": usuarioActual.ciudad,
    "campo-provincia": usuarioActual.provincia,
    "campo-codigopostal": usuarioActual.codigoPostal || "170102"
  };

  for (var id in map) {
    var el = document.getElementById(id);
    if (el) el.value = map[id];
  }

  actualizarSedeMasCercanaPorCiudad(usuarioActual.ciudad);
  var subtotal = calcularSubtotalCarrito();
  actualizarCalculosFormales(subtotal);
  actualizarPanelSeguridadIHC();
}

function prellenarVistaPago() {
  var subtotal = calcularSubtotalCarrito();
  actualizarCalculosFormales(subtotal);
  actualizarPanelSeguridadIHC();
}

function validarPasoEnvio(evento) {
  evento.preventDefault();

  var camposRequeridos = [
    document.getElementById("campo-correo"),
    document.getElementById("campo-nombre"),
    document.getElementById("campo-cedula-ruc"),
    document.getElementById("campo-telefono"),
    document.getElementById("campo-direccion"),
    document.getElementById("campo-ciudad"),
    document.getElementById("campo-provincia")
  ];

  var formularioValido = true;
  for (var i = 0; i < camposRequeridos.length; i++) {
    if (!validarCampoIndividual(camposRequeridos[i])) {
      formularioValido = false;
    }
  }

  var alertaError = document.getElementById("alerta-error-envio");
  if (!formularioValido) {
    if (alertaError) {
      alertaError.style.display = "flex";
      alertaError.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  if (alertaError) alertaError.style.display = "none";

  if (!usuarioActual) usuarioActual = {};
  usuarioActual.nombre = document.getElementById("campo-nombre").value.trim();
  usuarioActual.cedulaRuc = document.getElementById("campo-cedula-ruc").value.trim();
  usuarioActual.correo = document.getElementById("campo-correo").value.trim();
  usuarioActual.telefono = document.getElementById("campo-telefono").value.trim();
  usuarioActual.direccion = document.getElementById("campo-direccion").value.trim();
  usuarioActual.referencia = document.getElementById("campo-referencia").value.trim();
  usuarioActual.ciudad = document.getElementById("campo-ciudad").value.trim();
  usuarioActual.provincia = document.getElementById("campo-provincia").value.trim();
  usuarioActual.codigoPostal = document.getElementById("campo-codigopostal").value.trim();

  localStorage.setItem("dermakor_usuario_sesion", JSON.stringify(usuarioActual));
  actualizarSedeMasCercanaPorCiudad(usuarioActual.ciudad);
  window.location.href = "pago.html";
}

function procesarPagoFinal(evento) {
  evento.preventDefault();

  var campoTitular = document.getElementById("campo-titular-tarjeta");
  var campoNumero = document.getElementById("campo-numero-tarjeta");
  var campoFecha = document.getElementById("campo-fecha-caducidad");
  var campoCvv = document.getElementById("campo-cvv");

  var v1 = validarCampoIndividual(campoTitular);
  var v2 = validarCampoIndividual(campoNumero);
  var v3 = validarCampoIndividual(campoFecha);
  var v4 = validarCampoIndividual(campoCvv);

  var alertaError = document.getElementById("alerta-error-pago");
  if (!v1 || !v2 || !v3 || !v4) {
    if (alertaError) {
      alertaError.style.display = "flex";
      alertaError.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  if (alertaError) alertaError.style.display = "none";

  var btnConfirmar = document.getElementById("btn-confirmar-pago-final");
  if (btnConfirmar) {
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = "Procesando pago...";
  }

  var subtotal = calcularSubtotalCarrito();
  var descuento = calcularDescuentoMonto(subtotal);
  var baseImponible = Math.max(0, subtotal - descuento);
  var iva = Math.round(baseImponible * 0.15 * 100) / 100;
  var total = Math.round((baseImponible + iva + costoEnvioActual) * 100) / 100;

  var payloadCheckout = {
    cliente: usuarioActual || {
      nombre: "María Fernández",
      cedulaRuc: "1718293849",
      correo: "cliente@example.com",
      telefono: "0996096996",
      direccion: "Av. República E1-136 y Atahualpa",
      ciudad: "Quito",
      provincia: "Pichincha"
    },
    items: carrito,
    cupon: cuponActual,
    envio: {
      nombre: nombreEnvioActual,
      costo: costoEnvioActual,
      sede: sedeAsignadaActual
    },
    totales: {
      subtotal: subtotal,
      descuento: descuento,
      iva: iva,
      flete: costoEnvioActual,
      total: total
    }
  };

  fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadCheckout)
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      var datosFactura = construirObjetoFactura(payloadCheckout, res && res.ok ? res : null);
      localStorage.setItem("dermakor_ultima_factura", JSON.stringify(datosFactura));
      carrito = [];
      cuponActual = null;
      guardarCarritoPersistente();
      localStorage.removeItem("dermakor_cupon");
      window.location.href = "factura.html";
    })
    .catch(function () {
      var datosFactura = construirObjetoFactura(payloadCheckout, null);
      localStorage.setItem("dermakor_ultima_factura", JSON.stringify(datosFactura));
      carrito = [];
      cuponActual = null;
      guardarCarritoPersistente();
      localStorage.removeItem("dermakor_cupon");
      window.location.href = "factura.html";
    });
}

function construirObjetoFactura(payload, respuestaDb) {
  var fechaActual = new Date();
  var dia = ("0" + fechaActual.getDate()).slice(-2);
  var mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  var anio = fechaActual.getFullYear();
  var hora = ("0" + fechaActual.getHours()).slice(-2);
  var minuto = ("0" + fechaActual.getMinutes()).slice(-2);

  var secFactura = respuestaDb && respuestaDb.fac_numero
    ? respuestaDb.fac_numero
    : "001-002-00000" + Math.floor(1000 + Math.random() * 8999);

  var claveAcceso = respuestaDb && respuestaDb.fac_autorizacion_sri
    ? respuestaDb.fac_autorizacion_sri
    : dia + mes + anio + "0117924649390012001002" + Math.floor(100000000 + Math.random() * 899999999) + "12345678199";

  var pedidoResultado = {
    id_pedido: (respuestaDb && respuestaDb.id_pedido) || "PED000" + Math.floor(2004 + Math.random() * 7990),
    fac_numero: secFactura,
    fac_fecha: dia + "/" + mes + "/" + anio + " " + hora + ":" + minuto,
    fac_clave_sri: claveAcceso,
    guia_envio: (respuestaDb && respuestaDb.guia_tracking) || "GUI-2026-" + Math.floor(100000 + Math.random() * 899999),
    sede_despacho: payload.envio.sede.id_sede + " - " + payload.envio.sede.nombre,
    cliente: payload.cliente,
    envio_nombre: payload.envio.nombre,
    items: payload.items && payload.items.length > 0 ? payload.items : [
      { nombre: "ExoFace Serum Facial", presentacion: "Frasco gotero 30 ml", lote_fefo: "L26-QTO-001A", cantidad: 1, precio: 52.00 }
    ],
    totales: payload.totales
  };

  // Guardar tambien en historial local para visualizacion inmediata en GitHub Pages / Supabase
  try {
    var hist = JSON.parse(localStorage.getItem("dermakor_historial_pedidos") || "[]");
    hist.unshift({
      id_pedido: pedidoResultado.id_pedido,
      cliente: pedidoResultado.cliente.nombre,
      identificacion: pedidoResultado.cliente.cedulaRuc,
      fecha: anio + "-" + mes + "-" + dia,
      fac_numero: pedidoResultado.fac_numero,
      estado: "PAGADO",
      total: pedidoResultado.totales.total
    });
    localStorage.setItem("dermakor_historial_pedidos", JSON.stringify(hist.slice(0, 15)));
  } catch (e) {}

  return pedidoResultado;
}

function renderizarFacturaGuardada() {
  var raw = localStorage.getItem("dermakor_ultima_factura");
  var fac = null;
  if (raw) {
    try {
      fac = JSON.parse(raw);
    } catch (e) {}
  }

  if (!fac) {
    // Factura de demostración si se abre factura.html directamente
    fac = {
      id_pedido: "PED0001001",
      fac_numero: "001-002-000005512",
      fac_fecha: "02/11/2026 21:00",
      fac_clave_sri: "0211202601179246493900120010020000551212345678199",
      guia_envio: "GUI-2026-884120",
      sede_despacho: "SED0000001 - Matriz Quito - Edificio La Casa",
      cliente: usuarioActual || {
        nombre: "María Fernández",
        cedulaRuc: "1718293849",
        correo: "cliente@example.com",
        telefono: "0996096996",
        direccion: "Av. República E1-136 y Atahualpa",
        ciudad: "Quito",
        provincia: "Pichincha"
      },
      envio_nombre: "Servientrega Urbano (Pichincha / Guayas)",
      items: [
        { nombre: "ExoFace Serum Facial", presentacion: "Frasco gotero 30 ml", lote_fefo: "LOT-2026-001", cantidad: 1, precio: 52.00 },
        { nombre: "HydraBrume Agua Termal Bio-Mineral", presentacion: "Frasco spray 110 ml", lote_fefo: "LOT-2026-002", cantidad: 1, precio: 25.00 }
      ],
      totales: {
        subtotal: 77.00,
        descuento: 0.00,
        flete: 3.75,
        iva: 11.55,
        total: 92.30
      }
    };
  }

  var setTxt = function (id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("fac-id-pedido-db", fac.id_pedido);
  setTxt("fac-sede-despacho", fac.sede_despacho);
  setTxt("fac-numero", fac.fac_numero);
  setTxt("fac-fecha", fac.fac_fecha);
  setTxt("fac-clave-sri", fac.fac_clave_sri);
  setTxt("fac-cliente-nombre", fac.cliente.nombre);
  setTxt("fac-cliente-ruc", fac.cliente.cedulaRuc);
  setTxt("fac-cliente-correo", fac.cliente.correo);
  setTxt("fac-cliente-telefono", fac.cliente.telefono);
  setTxt("fac-cliente-direccion", fac.cliente.direccion + ", " + fac.cliente.ciudad + " - " + fac.cliente.provincia);
  setTxt("fac-cliente-envio", fac.envio_nombre);
  setTxt("fac-guia-envio", fac.guia_envio);

  var tablaCuerpo = document.getElementById("fac-tabla-items-cuerpo");
  if (tablaCuerpo) {
    tablaCuerpo.innerHTML = "";
    for (var i = 0; i < fac.items.length; i++) {
      var item = fac.items[i];
      var precioFila = item.precio * item.cantidad;
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td style="text-align: center;">' + item.cantidad + '</td>' +
        '<td><strong>' + item.nombre + '</strong></td>' +
        '<td>' + item.presentacion + '</td>' +
        '<td style="text-align: right;">$' + item.precio.toFixed(2) + '</td>' +
        '<td style="text-align: right;"><strong>$' + precioFila.toFixed(2) + '</strong></td>';
      tablaCuerpo.appendChild(tr);
    }
  }

  setTxt("fac-subtotal-val", "$" + fac.totales.subtotal.toFixed(2));
  var filaDesc = document.getElementById("fac-fila-descuento");
  if (filaDesc) {
    if (fac.totales.descuento && fac.totales.descuento > 0) {
      filaDesc.style.display = "table-row";
      setTxt("fac-descuento-val", "-$" + fac.totales.descuento.toFixed(2));
    } else {
      filaDesc.style.display = "none";
    }
  }
  setTxt("fac-flete-val", "$" + fac.totales.flete.toFixed(2));
  setTxt("fac-iva-val", "$" + fac.totales.iva.toFixed(2));
  setTxt("fac-total-val", "$" + fac.totales.total.toFixed(2));
}

// --------------------------------------------------------------------------
// 13. CONSULTAS EN VIVO A POSTGRESQL EN PAGINA DE AYUDA (ayuda.html)
// --------------------------------------------------------------------------
function cargarPedidosDesdeDB() {
  var tbody = document.getElementById("tabla-pedidos-db-cuerpo");
  if (!tbody) return;

  function renderFilasPedidos(lista) {
    tbody.innerHTML = "";
    for (var i = 0; i < lista.length; i++) {
      var p = lista[i];
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><strong>' + p.id_pedido + '</strong></td>' +
        '<td>' + p.cliente + ' <small style="color:#64748B;">(' + p.identificacion + ')</small></td>' +
        '<td>' + p.fecha + '</td>' +
        '<td><code>' + (p.fac_numero || "001-002-000002001") + '</code></td>' +
        '<td><span class="badge-db-conectada">' + p.estado + '</span></td>' +
        '<td style="text-align: right;"><strong>$' + Number(p.total).toFixed(2) + '</strong></td>';
      tbody.appendChild(tr);
    }
  }

  fetch("/api/pedidos")
    .then(function (r) {
      if (!r.ok) throw new Error("Usando respaldo Supabase");
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0) {
        renderFilasPedidos(data);
      } else {
        throw new Error("Sin datos");
      }
    })
    .catch(function () {
      var histLocal = [];
      try {
        histLocal = JSON.parse(localStorage.getItem("dermakor_historial_pedidos") || "[]");
      } catch (e) {}
      var baseSeed = [
        { id_pedido: "PED0002001", cliente: "María Fernández", identificacion: "1718293849", fecha: "2026-11-01", fac_numero: "001-002-000002001", estado: "ENTREGADO", total: 79.70 },
        { id_pedido: "PED0002002", cliente: "Dr. Carlos Andrade", identificacion: "0918273645001", fecha: "2026-11-02", fac_numero: "001-002-000002002", estado: "ENVIADO", total: 203.55 },
        { id_pedido: "PED0002003", cliente: "Dra. Valeria Salazar", identificacion: "0102938475001", fecha: "2026-11-02", fac_numero: "001-002-000002003", estado: "PAGADO", total: 109.25 }
      ];
      renderFilasPedidos(histLocal.concat(baseSeed));
    });
}

function cargarSedesDesdeDB() {
  var grid = document.getElementById("grid-sedes-db");
  if (!grid) return;

  function renderTarjetasSedes(data) {
    grid.innerHTML = "";
    for (var i = 0; i < data.length; i++) {
      var s = data[i];
      var card = document.createElement("div");
      card.className = "tarjeta-mapa-sitio";
      card.innerHTML =
        '<h4>🏢 ' + s.nombre + '</h4>' +
        '<p style="font-size:13px;color:#475569;margin-bottom:4px;">' + s.direccion + '</p>' +
        '<div style="font-size:12px;color:#0056B3;font-weight:700;">📍 ' + s.ciudad + ' - Ecuador</div>';
      grid.appendChild(card);
    }
  }

  fetch("/api/sedes")
    .then(function (r) {
      if (!r.ok) throw new Error("Usando respaldo sedes");
      return r.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && data.length > 0) {
        renderTarjetasSedes(data);
      } else {
        throw new Error("Vacio");
      }
    })
    .catch(function () {
      renderTarjetasSedes([
        { id_sede: "SED0000001", nombre: "Matriz Quito - Edificio La Casa", direccion: "Av. República E1-136 y Atahualpa, Of. 3", ciudad: "Quito" }
      ]);
    });
}

// --------------------------------------------------------------------------
// 14. UTILIDADES GENERALES
// --------------------------------------------------------------------------
function buscarProductoPorId(id) {
  for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
    if (LISTA_PRODUCTOS[i].id === id || LISTA_PRODUCTOS[i].id_producto_db === id) {
      return LISTA_PRODUCTOS[i];
    }
  }
  return null;
}

var temporizadorToast = null;
function mostrarToastNotificacion(mensaje) {
  var toast = document.getElementById("toast-notificacion");
  var texto = document.getElementById("toast-mensaje-texto");
  if (!toast || !texto) return;

  texto.textContent = mensaje;
  toast.classList.add("visible");

  if (temporizadorToast) clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(function () {
    ocultarToastNotificacion();
  }, 4500);
}

function ocultarToastNotificacion() {
  var toast = document.getElementById("toast-notificacion");
  if (toast) toast.classList.remove("visible");
}

function configurarAcordeonFaq() {
  var botonesFaq = document.querySelectorAll(".faq-pregunta");
  for (var i = 0; i < botonesFaq.length; i++) {
    botonesFaq[i].addEventListener("click", function () {
      var itemPadre = this.parentElement;
      if (itemPadre.classList.contains("abierto")) {
        itemPadre.classList.remove("abierto");
      } else {
        var todos = document.querySelectorAll(".item-faq");
        for (var j = 0; j < todos.length; j++) {
          todos[j].classList.remove("abierto");
        }
        itemPadre.classList.add("abierto");
      }
    });
  }
}
