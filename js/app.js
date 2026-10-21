/* ==========================================================================
   DERMAKOR - LOGICA PRINCIPAL DE LA APLICACION (app.js)
   - Codigo legible, clásico y sin expresiones complejas ni funciones flecha.
   - Cumple con Heuristicas de Nielsen y estandares de IHC.
   - Validacion de formularios semanticos en tiempo real.
   - Inicio de sesion obligatorio para facturacion.
   - Cotizaciones de envio realistas (Servientrega / Express / Retiro).
   - Desglose formal estilo factura electronica con datos completos y sumatorias.
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. ESTADO GLOBAL DE LA APLICACION
// --------------------------------------------------------------------------
var LISTA_PRODUCTOS = [];
var carrito = [];
var ultimoItemAgregado = null;
var idProductoModalActual = null;
var paginaActualCatalogo = 1;
var productosPorPagina = 8;
var listaFiltradaActual = [];

// Usuario actual (obligatorio para facturar)
var usuarioActual = null;

// Envio y cotizaciones
var costoEnvioActual = 3.75;
var nombreEnvioActual = "Servientrega Urbano (Pichincha / Guayas)";

// --------------------------------------------------------------------------
// 2. INICIALIZACION Y CARGA DESDE ARCHIVO JSON
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  inicializarApp();
});

function inicializarApp() {
  verificarSesionGuardada();
  configurarEventosNavegacion();
  configurarEventosFiltros();
  configurarAcordeonFaq();
  configurarValidacionEnTiempoReal();
  configurarOpcionesEnvio();
  actualizarContadorCarrito();

  // Cargamos los datos de los productos directamente desde data/productos.json
  cargarProductosDesdeJSON();
}

function inicializarVistasConProductos() {
  listaFiltradaActual = LISTA_PRODUCTOS.slice(0);
  renderizarProductosDestacados();
  renderizarExosomasHome();
  renderizarCatalogo(listaFiltradaActual);
}

function cargarProductosDesdeJSON() {
  // Peticion HTTP estandar para cargar el archivo JSON
  fetch("data/productos.json")
    .then(function (respuesta) {
      if (!respuesta.ok) {
        throw new Error("No se pudo leer el archivo data/productos.json");
      }
      return respuesta.json();
    })
    .then(function (datosJson) {
      console.log("Productos cargados exitosamente desde data/productos.json:", datosJson.length);
      LISTA_PRODUCTOS = datosJson;
      inicializarVistasConProductos();
    })
    .catch(function (error) {
      console.warn("Aviso al cargar data/productos.json:", error);
      // En caso de abrir como archivo local file:/// donde algunos navegadores bloquean peticiones fetch
      if (typeof PRODUCTOS_RESPALDO !== "undefined") {
        console.log("Cargando lista de productos desde respaldo de seguridad.");
        LISTA_PRODUCTOS = PRODUCTOS_RESPALDO.slice(0);
        inicializarVistasConProductos();
      }
    });
}

// --------------------------------------------------------------------------
// 3. GESTION DE SESION Y CUENTA DE CLIENTE (OBLIGATORIA PARA FACTURAR)
// --------------------------------------------------------------------------
function verificarSesionGuardada() {
  var datosGuardados = localStorage.getItem("dermakor_usuario_sesion");
  if (datosGuardados) {
    try {
      usuarioActual = JSON.parse(datosGuardados);
      actualizarWidgetUsuarioHeader();
    } catch (e) {
      usuarioActual = null;
    }
  }
}

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

  // Si no hay datos registrados previos, crear sesion con ese correo
  if (!usuarioActual) {
    usuarioActual = {
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
  }

  localStorage.setItem("dermakor_usuario_sesion", JSON.stringify(usuarioActual));
  actualizarWidgetUsuarioHeader();
  cerrarModalAuth();
  mostrarToastNotificacion("Sesión iniciada con éxito. Bienvenido " + usuarioActual.nombre);

  // Si el usuario intentaba pagar, redirigir al checkout
  if (carrito.length > 0) {
    irACheckoutConUsuario();
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

  if (!nombre || !cedula || !correo || !telefono || !direccion || !ciudad || !provincia) {
    alert("Por favor completa todos los campos requeridos para la emisión de tu factura.");
    return;
  }

  usuarioActual = {
    nombre: nombre,
    cedulaRuc: cedula,
    correo: correo,
    telefono: telefono,
    direccion: direccion,
    referencia: document.getElementById("reg-referencia").value.trim(),
    ciudad: ciudad,
    provincia: provincia,
    codigoPostal: document.getElementById("reg-codigopostal").value.trim() || "170102"
  };

  localStorage.setItem("dermakor_usuario_sesion", JSON.stringify(usuarioActual));
  actualizarWidgetUsuarioHeader();
  cerrarModalAuth();
  mostrarToastNotificacion("Cuenta creada y verificada con éxito.");

  // Redirigir directamente al paso de facturacion
  if (carrito.length > 0) {
    irACheckoutConUsuario();
  }
}

function cerrarSesion() {
  usuarioActual = null;
  localStorage.removeItem("dermakor_usuario_sesion");
  actualizarWidgetUsuarioHeader();
  mostrarToastNotificacion("Has cerrado sesión.");
}

// --------------------------------------------------------------------------
// 4. NAVEGACION (CORRECCION: SOLO UN ENLACE ACTIVO A LA VEZ)
// --------------------------------------------------------------------------
function activarEnlaceNav(idNav) {
  var enlaces = document.querySelectorAll(".enlace-nav");
  for (var i = 0; i < enlaces.length; i++) {
    enlaces[i].classList.remove("activo");
    var atributoId = enlaces[i].getAttribute("data-nav-id");
    if (atributoId === idNav) {
      enlaces[i].classList.add("activo");
    }
  }
}

function cambiarVista(nombreVista, idNavActivo) {
  var vistas = document.querySelectorAll(".vista-pagina");
  for (var i = 0; i < vistas.length; i++) {
    vistas[i].style.display = "none";
  }

  var vistaDestino = document.getElementById("vista-" + nombreVista);
  if (vistaDestino) {
    vistaDestino.style.display = "block";
  }

  // Activar exactamente el nav seleccionado
  if (idNavActivo) {
    activarEnlaceNav(idNavActivo);
  } else {
    if (nombreVista === "inicio") {
      activarEnlaceNav("inicio");
    } else if (nombreVista === "catalogo") {
      activarEnlaceNav("catalogo");
    } else {
      activarEnlaceNav(""); // Ninguno en checkout o carrito
    }
  }

  window.scrollTo(0, 0);

  if (nombreVista === "carrito") {
    renderizarCarrito();
  }
}

function configurarEventosNavegacion() {
  var enlaces = document.querySelectorAll("[data-nav-id]");
  for (var i = 0; i < enlaces.length; i++) {
    enlaces[i].addEventListener("click", function (evento) {
      evento.preventDefault();
      var idNav = this.getAttribute("data-nav-id");

      if (idNav === "inicio") {
        cambiarVista("inicio", "inicio");
      } else if (idNav === "catalogo") {
        limpiarFiltros();
        cambiarVista("catalogo", "catalogo");
      } else if (idNav === "casa") {
        limpiarFiltros();
        var checkCasa = document.getElementById("filtro-uso-casa");
        if (checkCasa) {
          checkCasa.checked = true;
        }
        filtrarCatalogo();
        cambiarVista("catalogo", "casa");
      } else if (idNav === "profesional") {
        limpiarFiltros();
        var checkPro = document.getElementById("filtro-uso-pro");
        if (checkPro) {
          checkPro.checked = true;
        }
        filtrarCatalogo();
        cambiarVista("catalogo", "profesional");
      }
    });
  }

  // Buscador
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
  var busquedaLimpia = termino.trim().toLowerCase();
  if (busquedaLimpia.length === 0) {
    listaFiltradaActual = LISTA_PRODUCTOS.slice(0);
  } else {
    var resultados = [];
    for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
      var prod = LISTA_PRODUCTOS[i];
      var nombre = prod.nombre.toLowerCase();
      var desc = prod.descripcion.toLowerCase();
      var cat = prod.categoria.toLowerCase();
      var sub = prod.subtitulo.toLowerCase();

      if (
        nombre.indexOf(busquedaLimpia) !== -1 ||
        desc.indexOf(busquedaLimpia) !== -1 ||
        cat.indexOf(busquedaLimpia) !== -1 ||
        sub.indexOf(busquedaLimpia) !== -1
      ) {
        resultados.push(prod);
      }
    }
    listaFiltradaActual = resultados;
  }

  cambiarVista("catalogo", "catalogo");
  paginaActualCatalogo = 1;
  renderizarCatalogo(listaFiltradaActual);
}

// --------------------------------------------------------------------------
// 5. RENDERIZADO DE PRODUCTOS (FOTOS REALES O ESPACIO VACIO NEUTRAL)
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
          abrirModalDetalle(p.id);
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
  var precioEtiqueta = "PVP";
  if (prod.tipoUso === "profesional") {
    precioEtiqueta = "PRO";
  }

  // Generar HTML de imagen: si no tiene foto del catalogo, dejar espacio vacio neutral (sin inventar fotos)
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
    '  <button type="button" class="boton-ver-tarjeta">Ver detalle</button>' +
    '</div>';

  var btnVer = tarjeta.querySelector(".boton-ver-tarjeta");
  var imgBox = tarjeta.querySelector(".tarjeta-producto-imagen");
  var titulo = tarjeta.querySelector(".tarjeta-producto-titulo");

  function abrirDetalle() {
    abrirModalDetalle(prod.id);
  }

  btnVer.addEventListener("click", abrirDetalle);
  imgBox.addEventListener("click", abrirDetalle);
  titulo.addEventListener("click", abrirDetalle);

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
      window.scrollTo(0, 300);
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
        window.scrollTo(0, 300);
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
      window.scrollTo(0, 300);
    });
    contenedor.appendChild(btnSig);
  }
}

// --------------------------------------------------------------------------
// 6. FILTROS Y ORDENACION
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
  var precioMin = 0;
  var precioMax = 9999;

  if (inputMin && inputMin.value !== "") {
    precioMin = parseFloat(inputMin.value);
  }
  if (inputMax && inputMax.value !== "") {
    precioMax = parseFloat(inputMax.value);
  }

  var resultados = [];

  for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
    var prod = LISTA_PRODUCTOS[i];
    var coincideTipo = true;
    var coincideMarca = true;
    var coincideCat = true;
    var coincidePrecio = true;

    if (filtroCasa || filtroPro) {
      if (filtroCasa && !filtroPro && prod.tipoUso !== "casa") {
        coincideTipo = false;
      }
      if (filtroPro && !filtroCasa && prod.tipoUso !== "profesional") {
        coincideTipo = false;
      }
    }

    if (filtroDermclar || filtroMedical) {
      if (filtroDermclar && !filtroMedical && prod.marca !== "Dermclar") {
        coincideMarca = false;
      }
      if (filtroMedical && !filtroDermclar && prod.marca !== "Medical Skin") {
        coincideMarca = false;
      }
    }

    if (categoriasSeleccionadas.length > 0) {
      var encontrada = false;
      for (var k = 0; k < categoriasSeleccionadas.length; k++) {
        if (prod.categoria === categoriasSeleccionadas[k]) {
          encontrada = true;
          break;
        }
      }
      if (!encontrada) {
        coincideCat = false;
      }
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
  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";
  var filtroCasa = document.getElementById("filtro-uso-casa") && document.getElementById("filtro-uso-casa").checked;
  var filtroPro = document.getElementById("filtro-uso-pro") && document.getElementById("filtro-uso-pro").checked;

  if (filtroCasa) {
    crearPillFiltro(contenedor, "Uso en casa", "filtro-uso-casa");
  }
  if (filtroPro) {
    crearPillFiltro(contenedor, "Profesional", "filtro-uso-pro");
  }

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
    if (inputElem) {
      inputElem.checked = false;
    }
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
  if (inputMin) {
    inputMin.value = "";
  }
  if (inputMax) {
    inputMax.value = "";
  }

  var inputBusqueda = document.getElementById("input-busqueda-global");
  if (inputBusqueda) {
    inputBusqueda.value = "";
  }

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
  } else {
    copia = listaFiltradaActual.slice(0);
  }

  listaFiltradaActual = copia;
  paginaActualCatalogo = 1;
  renderizarCatalogo(listaFiltradaActual);
}

// --------------------------------------------------------------------------
// 7. MODAL DETALLE DE PRODUCTO
// --------------------------------------------------------------------------
function abrirModalDetalle(idProducto) {
  var prod = buscarProductoPorId(idProducto);
  if (!prod) {
    return;
  }

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

  var textoTipo = "Uso en casa";
  if (prod.tipoUso === "profesional") {
    textoTipo = "Uso Profesional";
  }
  document.getElementById("modal-tipo-tag").textContent = textoTipo;
  document.getElementById("modal-marca").textContent = prod.marca;
  document.getElementById("modal-titulo").textContent = prod.nombre;
  document.getElementById("modal-subtitulo").textContent = prod.subtitulo;
  document.getElementById("modal-presentacion").textContent = prod.presentacion;
  document.getElementById("modal-precio").textContent = "$" + prod.precio.toFixed(2);
  document.getElementById("modal-descripcion").textContent = prod.descripcion;
  document.getElementById("modal-qty-val").textContent = "1";

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
  overlay.classList.remove("abierto");
  document.body.style.overflow = "auto";
}

function cambiarCantidadModal(delta) {
  var spanQty = document.getElementById("modal-qty-val");
  var valor = parseInt(spanQty.textContent, 10);
  valor = valor + delta;
  if (valor < 1) {
    valor = 1;
  }
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
  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";
  var contador = 0;

  for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
    var p = LISTA_PRODUCTOS[i];
    if (p.id !== idActual && contador < 3) {
      var col = document.createElement("div");
      col.className = "tarjeta-producto";
      col.style.padding = "10px";

      var fotoHtml = "";
      if (p.imagen && p.imagen !== "") {
        fotoHtml = '<img src="' + p.imagen + '" style="height: 100px; margin: 0 auto 8px auto; object-fit: contain;" />';
      } else {
        fotoHtml = '<div style="height: 100px; display: flex; align-items: center; justify-content: center; background: #F1F5F9; border-radius: 6px; margin-bottom: 8px; color: #94A3B8;">📷</div>';
      }

      col.innerHTML =
        fotoHtml +
        '<h4 style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">' + p.nombre + '</h4>' +
        '<div style="font-size: 13px; font-weight: 700; color: #0056B3; margin-bottom: 8px;">$' + p.precio.toFixed(2) + '</div>' +
        '<button type="button" class="boton-primario" style="width: 100%; min-height: 34px; font-size: 12px; padding: 6px;">Ver más</button>';

      (function (productoExplorar) {
        var btn = col.querySelector("button");
        btn.addEventListener("click", function () {
          abrirModalDetalle(productoExplorar.id);
        });
      })(p);

      contenedor.appendChild(col);
      contador++;
    }
  }
}

// --------------------------------------------------------------------------
// 8. LOGICA DEL CARRITO Y ACCION REVERSIBLE
// --------------------------------------------------------------------------
function agregarAlCarrito(idProducto, cantidad) {
  var prod = buscarProductoPorId(idProducto);
  if (!prod) {
    return;
  }

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
  actualizarContadorCarrito();
  renderizarCarrito();
}

function deshacerUltimaAdicion() {
  if (!ultimoItemAgregado) {
    return;
  }

  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].id === ultimoItemAgregado.id) {
      carrito[i].cantidad -= ultimoItemAgregado.cantidadAgregada;
      if (carrito[i].cantidad <= 0) {
        carrito.splice(i, 1);
      }
      break;
    }
  }

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

function renderizarCarrito() {
  var listaContenedor = document.getElementById("contenedor-items-carrito");
  var bloqueVacio = document.getElementById("carrito-vacio-aviso");
  var layoutCarrito = document.getElementById("layout-carrito-activo");

  if (!listaContenedor || !layoutCarrito || !bloqueVacio) {
    return;
  }

  if (carrito.length === 0) {
    layoutCarrito.style.display = "none";
    bloqueVacio.style.display = "block";
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

    var tipoTextoItem = "Uso en casa";
    if (item.tipoUso === "profesional") {
      tipoTextoItem = "Profesional";
    }

    var imgTag = "";
    if (item.imagen && item.imagen !== "") {
      imgTag = '<img src="' + item.imagen + '" class="item-carrito-img" alt="' + item.nombre + '" />';
    } else {
      imgTag = '<div class="item-carrito-img" style="display:flex;align-items:center;justify-content:center;background:#F1F5F9;color:#94A3B8;">📷</div>';
    }

    var fila = document.createElement("div");
    fila.className = "item-carrito";
    fila.innerHTML =
      imgTag +
      '<div class="item-carrito-detalles">' +
      '  <h4>' + item.nombre + '</h4>' +
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

  // Calculos formales con IVA 15% y envio cotizado
  actualizarCalculosFormales(subtotal);
  document.getElementById("carrito-total-items-badge").textContent = totalItems + " artículos seleccionados";
}

// --------------------------------------------------------------------------
// 9. COTIZACIONES DE ENVIO REALISTAS
// --------------------------------------------------------------------------
function configurarOpcionesEnvio() {
  var opciones = document.querySelectorAll("input[name='metodo-envio']");
  for (var i = 0; i < opciones.length; i++) {
    opciones[i].addEventListener("change", function () {
      costoEnvioActual = parseFloat(this.getAttribute("data-precio"));
      nombreEnvioActual = this.getAttribute("data-nombre");

      // Marcar visualmente la tarjeta seleccionada
      var tarjetas = document.querySelectorAll(".tarjeta-opcion-envio");
      for (var t = 0; t < tarjetas.length; t++) {
        tarjetas[t].classList.remove("seleccionada");
      }
      this.closest(".tarjeta-opcion-envio").classList.add("seleccionada");

      // Recalcular
      var subtotal = calcularSubtotalCarrito();
      actualizarCalculosFormales(subtotal);
      actualizarPanelSeguridadIHC();
    });
  }
}

function calcularSubtotalCarrito() {
  var subtotal = 0;
  for (var i = 0; i < carrito.length; i++) {
    subtotal += carrito[i].precio * carrito[i].cantidad;
  }
  return subtotal;
}

function actualizarCalculosFormales(subtotal) {
  var iva = subtotal * 0.15; // 15% IVA Ecuador
  var total = subtotal + costoEnvioActual + iva;

  // Actualizar textos en carrito
  var elSub = document.getElementById("carrito-subtotal-val");
  if (elSub) {
    elSub.textContent = "$" + subtotal.toFixed(2);
  }

  var elEnv = document.getElementById("carrito-envio-val");
  if (elEnv) {
    var txtEnv = "$" + costoEnvioActual.toFixed(2);
    if (costoEnvioActual === 0) {
      txtEnv = "Gratis (Retiro)";
    }
    elEnv.textContent = txtEnv;
  }

  var elIva = document.getElementById("carrito-iva-val");
  if (elIva) {
    elIva.textContent = "$" + iva.toFixed(2);
  }

  var elTot = document.getElementById("carrito-total-val");
  if (elTot) {
    elTot.textContent = "$" + total.toFixed(2);
  }

  // Actualizar en panel de checkout (IHC)
  var elementosSubtotal = document.querySelectorAll(".checkout-subtotal-val");
  for (var a = 0; a < elementosSubtotal.length; a++) {
    elementosSubtotal[a].textContent = "$" + subtotal.toFixed(2);
  }

  var elementosEnvio = document.querySelectorAll(".checkout-envio-val");
  for (var b = 0; b < elementosEnvio.length; b++) {
    var tE = "$" + costoEnvioActual.toFixed(2);
    if (costoEnvioActual === 0) {
      tE = "$0.00 (Retiro)";
    }
    elementosEnvio[b].textContent = tE;
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
// 10. IHC & HEURISTICAS DE NIELSEN: PANEL VISIBLE EN TODO MOMENTO
// --------------------------------------------------------------------------
function actualizarPanelSeguridadIHC() {
  // 1. Lista de productos compacta siempre visible
  var listaMini = document.getElementById("ihc-lista-mini-productos");
  if (listaMini) {
    listaMini.innerHTML = "";
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

  // 2. Direccion y datos en tiempo real para que el cliente se sienta 100% seguro
  var nombre = document.getElementById("campo-nombre").value.trim();
  if (nombre === "" && usuarioActual) {
    nombre = usuarioActual.nombre;
  }

  var cedula = document.getElementById("campo-cedula-ruc").value.trim();
  if (cedula === "" && usuarioActual) {
    cedula = usuarioActual.cedulaRuc;
  }

  var direccion = document.getElementById("campo-direccion").value.trim();
  if (direccion === "" && usuarioActual) {
    direccion = usuarioActual.direccion;
  }

  var ciudad = document.getElementById("campo-ciudad").value.trim();
  if (ciudad === "" && usuarioActual) {
    ciudad = usuarioActual.ciudad;
  }

  var provincia = document.getElementById("campo-provincia").value.trim();
  if (provincia === "" && usuarioActual) {
    provincia = usuarioActual.provincia;
  }

  var textoDestinatario = "Pendiente de ingresar";
  if (nombre !== "") {
    textoDestinatario = nombre;
  }
  if (cedula !== "") {
    textoDestinatario += " (C.I./RUC: " + cedula + ")";
  }

  var textoDir = "Ingresa tu dirección para confirmar";
  if (direccion !== "" && ciudad !== "") {
    textoDir = direccion + ", " + ciudad + " (" + provincia + ")";
  }

  var elDest = document.getElementById("ihc-destinatario-texto");
  if (elDest) {
    elDest.textContent = textoDestinatario;
  }

  var elDir = document.getElementById("ihc-direccion-texto");
  if (elDir) {
    elDir.textContent = textoDir;
  }

  var elMetodo = document.getElementById("ihc-metodo-envio-texto");
  if (elMetodo) {
    elMetodo.textContent = nombreEnvioActual + " - $" + costoEnvioActual.toFixed(2);
  }
}

// --------------------------------------------------------------------------
// 11. VALIDACION EN TIEMPO REAL CON TIPOS SEMANTICOS (IHC & PREVENCION DE ERRORES)
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
  var esValido = campo.checkValidity();

  // Validaciones semanticas especiales
  if (campo.id === "campo-cedula-ruc") {
    var v = campo.value.trim();
    // En Ecuador, cedula tiene 10 digitos y RUC 13 digitos numericos
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

// --------------------------------------------------------------------------
// 12. FLUJO DE CHECKOUT CON INICIO DE SESION OBLIGATORIO
// --------------------------------------------------------------------------
function iniciarProcesoFacturacion() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío. Agrega productos antes de facturar.");
    return;
  }

  // Obligatorio: si no ha iniciado sesión, exigir login / registro
  if (!usuarioActual) {
    abrirModalAuth();
    return;
  }

  irACheckoutConUsuario();
}

function irACheckoutConUsuario() {
  // Prellenar los campos con los datos del usuario registrado
  if (usuarioActual) {
    document.getElementById("campo-correo").value = usuarioActual.correo;
    document.getElementById("campo-nombre").value = usuarioActual.nombre;
    document.getElementById("campo-cedula-ruc").value = usuarioActual.cedulaRuc;
    document.getElementById("campo-telefono").value = usuarioActual.telefono;
    document.getElementById("campo-direccion").value = usuarioActual.direccion;
    document.getElementById("campo-referencia").value = usuarioActual.referencia || "";
    document.getElementById("campo-ciudad").value = usuarioActual.ciudad;
    document.getElementById("campo-provincia").value = usuarioActual.provincia;
    document.getElementById("campo-codigopostal").value = usuarioActual.codigoPostal || "";
  }

  var subtotal = calcularSubtotalCarrito();
  actualizarCalculosFormales(subtotal);
  actualizarPanelSeguridadIHC();
  cambiarVista("checkout-envio");
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
    var resultado = validarCampoIndividual(camposRequeridos[i]);
    if (!resultado) {
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

  if (alertaError) {
    alertaError.style.display = "none";
  }

  // Guardar datos actualizados en la sesion
  if (usuarioActual) {
    usuarioActual.nombre = document.getElementById("campo-nombre").value.trim();
    usuarioActual.cedulaRuc = document.getElementById("campo-cedula-ruc").value.trim();
    usuarioActual.correo = document.getElementById("campo-correo").value.trim();
    usuarioActual.telefono = document.getElementById("campo-telefono").value.trim();
    usuarioActual.direccion = document.getElementById("campo-direccion").value.trim();
    usuarioActual.ciudad = document.getElementById("campo-ciudad").value.trim();
    usuarioActual.provincia = document.getElementById("campo-provincia").value.trim();
    localStorage.setItem("dermakor_usuario_sesion", JSON.stringify(usuarioActual));
  }

  actualizarPanelSeguridadIHC();
  cambiarVista("checkout-pago");
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

  if (alertaError) {
    alertaError.style.display = "none";
  }

  // Generar datos de factura electronica
  generarFacturaElectronicaFormal();

  // Vaciar carrito
  carrito = [];
  actualizarContadorCarrito();

  // Ir a confirmacion con la factura formal
  cambiarVista("confirmacion-aprobada");
}

// --------------------------------------------------------------------------
// 13. GENERACION DE FACTURA FORMAL CON DESGLOSE Y DATOS DE CLIENTE
// --------------------------------------------------------------------------
function generarFacturaElectronicaFormal() {
  var fechaActual = new Date();
  var dia = ("0" + fechaActual.getDate()).slice(-2);
  var mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  var anio = fechaActual.getFullYear();
  var hora = ("0" + fechaActual.getHours()).slice(-2);
  var minuto = ("0" + fechaActual.getMinutes()).slice(-2);
  var fechaHoraStr = dia + "/" + mes + "/" + anio + " " + hora + ":" + minuto;

  var secFactura = "001-002-0000" + Math.floor(1000 + Math.random() * 9000);
  var claveAcceso = dia + mes + anio + "0117924649390012001002" + Math.floor(100000000 + Math.random() * 900000000) + "123456781";

  // Llenar cabecera factura
  document.getElementById("fac-numero").textContent = secFactura;
  document.getElementById("fac-fecha").textContent = fechaHoraStr;
  document.getElementById("fac-clave-sri").textContent = claveAcceso;

  // Llenar datos cliente
  var facNombre = "Cliente Dermakor";
  var facRuc = "9999999999999";
  var facCorreo = "cliente@correo.com";
  var facTelefono = "0996096996";
  var facDireccion = "Quito - Ecuador";

  if (usuarioActual) {
    facNombre = usuarioActual.nombre;
    facRuc = usuarioActual.cedulaRuc;
    facCorreo = usuarioActual.correo;
    facTelefono = usuarioActual.telefono;
    facDireccion = usuarioActual.direccion + ", " + usuarioActual.ciudad + " - " + usuarioActual.provincia;
  }

  document.getElementById("fac-cliente-nombre").textContent = facNombre;
  document.getElementById("fac-cliente-ruc").textContent = facRuc;
  document.getElementById("fac-cliente-correo").textContent = facCorreo;
  document.getElementById("fac-cliente-telefono").textContent = facTelefono;
  document.getElementById("fac-cliente-direccion").textContent = facDireccion;
  document.getElementById("fac-cliente-envio").textContent = nombreEnvioActual;

  // Llenar tabla de items
  var tablaCuerpo = document.getElementById("fac-tabla-items-cuerpo");
  tablaCuerpo.innerHTML = "";

  var subtotal = 0;

  for (var i = 0; i < carrito.length; i++) {
    var item = carrito[i];
    var precioFila = item.precio * item.cantidad;
    subtotal += precioFila;

    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td style="text-align: center;">' + item.cantidad + '</td>' +
      '<td><strong>' + item.nombre + '</strong></td>' +
      '<td>' + item.presentacion + '</td>' +
      '<td style="text-align: right;">$' + item.precio.toFixed(2) + '</td>' +
      '<td style="text-align: right;"><strong>$' + precioFila.toFixed(2) + '</strong></td>';
    tablaCuerpo.appendChild(tr);
  }

  // Sumatorias formales
  var iva = subtotal * 0.15;
  var total = subtotal + costoEnvioActual + iva;

  document.getElementById("fac-subtotal-val").textContent = "$" + subtotal.toFixed(2);
  document.getElementById("fac-flete-val").textContent = "$" + costoEnvioActual.toFixed(2);
  document.getElementById("fac-iva-val").textContent = "$" + iva.toFixed(2);
  document.getElementById("fac-total-val").textContent = "$" + total.toFixed(2);
}

// --------------------------------------------------------------------------
// 14. UTILIDADES GENERALES
// --------------------------------------------------------------------------
function buscarProductoPorId(id) {
  for (var i = 0; i < LISTA_PRODUCTOS.length; i++) {
    if (LISTA_PRODUCTOS[i].id === id) {
      return LISTA_PRODUCTOS[i];
    }
  }
  return null;
}

var temporizadorToast = null;
function mostrarToastNotificacion(mensaje) {
  var toast = document.getElementById("toast-notificacion");
  var texto = document.getElementById("toast-mensaje-texto");
  if (!toast || !texto) {
    return;
  }

  texto.textContent = mensaje;
  toast.classList.add("visible");

  if (temporizadorToast) {
    clearTimeout(temporizadorToast);
  }

  temporizadorToast = setTimeout(function () {
    ocultarToastNotificacion();
  }, 4500);
}

function ocultarToastNotificacion() {
  var toast = document.getElementById("toast-notificacion");
  if (toast) {
    toast.classList.remove("visible");
  }
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
