# DERMAKOR - Proyecto de Interacción Humano-Computador (IHC)

Plataforma e-commerce y catálogo web de dermocosmética médica oficial para **Dermclar** y **Medical Skin 2026**.

Diseñada bajo los principios de usabilidad de **Jakob Nielsen**, estándares de accesibilidad **WCAG 2.2 AA** y código estructurado en **HTML5 semántico, CSS3 y JavaScript vanilla** (sin frameworks ni funciones flecha complejas).

---

## 🚀 Características Principales

1. **Cumplimiento de Heurísticas de Usabilidad (Nielsen):**
   - **Visibilidad del estado del sistema:** Panel lateral persistente que muestra en tiempo real la dirección de entrega digitada por el cliente, los artículos en el pedido y el desglose de costos con IVA (15%).
   - **Correspondencia con el mundo real:** Términos clínicos y comerciales claros, catálogo categorizado por necesidad dérmica y factura electrónica oficial con R.U.C./Cédula.
   - **Control y libertad del usuario:** Acción reversible con botón *"Deshacer"* inmediato al agregar productos al carrito y navegación fluida entre vistas sin recarga.
   - **Prevención de errores y validación en tiempo real:** Formularios con validación campo a campo mediante tipos HTML semánticos (`email`, `tel`, `pattern`), mostrando alertas visuales inmediatas.

2. **Gestión de Datos Desacoplada (JSON):**
   - Todos los productos se gestionan y cargan de forma centralizada desde [`data/productos.json`](data/productos.json).
   - Respaldo de seguridad en [`js/productos.js`](js/productos.js) para compatibilidad con aperturas directas en navegadores locales (`file:///`).

3. **Logística y Cotizaciones Realistas:**
   - Métodos de envío con tarifas y tiempos reales:
     - Servientrega Urbano (Pichincha / Guayas): `$3.75`
     - Servientrega Nacional (Provincias): `$6.50`
     - Envío Express Motorizado (Mismo día): `$5.25`
     - Retiro en Distribuidor Autorizado (Quito): `$0.00`

4. **Facturación Electrónica Formal:**
   - Generación de comprobante fiscal formal con desglose:
     - Subtotal 15% (Base imponible)
     - Flete de transporte
     - IVA 15%
     - Valor Total
   - Botón nativo optimizado para imprimir o guardar en PDF (`window.print()`).

---

## 📁 Estructura del Proyecto

```text
dermakor_web/
├── index.html          # Estructura semántica SPA (todas las vistas)
├── css/
│   └── styles.css      # Hoja de estilos, variables CSS y diseño responsive
├── data/
│   └── productos.json  # Catálogo centralizado en formato JSON
├── js/
│   ├── app.js          # Lógica de la aplicación, carrito, filtros y checkout
│   └── productos.js    # Respaldo seguro para modo sin servidor
├── images/             # Fotografías oficiales del catálogo
└── README.md           # Documentación del proyecto
```

---

## 🛠️ Cómo Ejecutar el Proyecto

1. **Directamente en el navegador:**
   - Haz doble clic en `index.html` para abrirlo en Chrome, Edge o Firefox.

2. **Con un servidor local (Recomendado para simular entorno web):**
   ```bash
   # Opción con Python:
   python -m http.server 8000

   # Opción con Node.js:
   npx serve .
   ```
   Abre tu navegador en `http://localhost:8000`.

---

## 📄 Licencia y Derechos
Desarrollado para el proyecto académico de Interacción Humano-Computador (IHC). Información y productos basados en el catálogo Dermclar & Medical Skin 2026.
