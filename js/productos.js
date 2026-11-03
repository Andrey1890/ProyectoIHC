// Catálogo sincronizado con PostgreSQL (Supabase) - Stock controlado por producto desde tabla Lotes
var LISTA_PRODUCTOS = [
  {
    "id": "exoface-casa",
    "nombre": "ExoFace",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Exosomas",
    "subtitulo": "Sérum bioestimulante y reafirmante",
    "descripcion": "Terapia exosomal facial que revitaliza, regenera y redensifica la piel desde niveles profundos.",
    "presentacion": "Gotero 30 ml",
    "precio": 74.0,
    "precioProfesional": 62.0,
    "imagen": "images/01_exoface.png",
    "destacadoHome": true,
    "esExosoma": true,
    "principiosActivos": [
      "Centella Asiática Exosomes",
      "Exosomas de Cúrcuma Longa",
      "PDRN (Salmón DNA)",
      "Hylasome EG-10 (Ácido Hialurónico Reticulado)",
      "Péptidos Biomiméticos",
      "Niacinamida",
      "Silicio Orgánico",
      "Complejos de Aminoácidos"
    ],
    "beneficios": [
      "Mejora la firmeza visible desde la segunda sesión.",
      "Aumento significativo de la densidad dérmica.",
      "Efecto tensor inmediato y piel más compacta.",
      "Reestructuración progresiva de la arquitectura cutánea."
    ],
    "modoUso": "Aplicar de 4 a 6 gotas sobre el rostro limpio por la mañana y noche con suaves movimientos circulares.",
    "stock": 25
  },
  {
    "id": "exolumine-casa",
    "nombre": "ExoLumine",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Exosomas",
    "subtitulo": "Exosomas Despigmentantes y Antioxidantes",
    "descripcion": "Regula la actividad de los melanocitos y disminuye notablemente la inflamación cutánea y las manchas.",
    "presentacion": "Gotero 30 ml",
    "precio": 58.0,
    "precioProfesional": 48.0,
    "imagen": "images/02_exolumine.png",
    "destacadoHome": false,
    "esExosoma": true,
    "principiosActivos": [
      "Exosomas Centella Reversa",
      "Ácido Tranexámico",
      "Niacinamida",
      "Neurolight 61 G°",
      "Alfa-Arbutina",
      "Ácido Hialurónico de mediano peso molecular",
      "Silicio Orgánico",
      "Complejo Antioxidante"
    ],
    "beneficios": [
      "Disminución visible del tono irregular desde la 3ra semana.",
      "Reducción de citocinas inflamatorias en la piel tratada.",
      "Aumento de la tolerancia cutánea en pieles muy sensibles."
    ],
    "modoUso": "Aplicar sobre el rostro limpio antes de la crema hidratante. Usar protector solar de día.",
    "stock": 25
  },
  {
    "id": "exoblemish-casa",
    "nombre": "ExoBlemish",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Exosomas",
    "subtitulo": "Bioactivo seborregulador y calmante",
    "descripcion": "Ayuda a la regulación sebácea, tiene acción queratolítica, calmante y potente acción regeneradora.",
    "presentacion": "Gotero 30 ml",
    "precio": 58.0,
    "precioProfesional": 48.0,
    "imagen": "images/03_exoblemish.png",
    "destacadoHome": false,
    "esExosoma": true,
    "principiosActivos": [
      "Exosomas de Cúrcuma Longa",
      "Ácido Succínico",
      "Niacinamida y Biotina",
      "Zinc Sebum",
      "Cobre II Sulfato pentahidratado",
      "Pore Reductyl",
      "Factor de Crecimiento Epidermal"
    ],
    "beneficios": [
      "Reducción visible de comedones y pápulas.",
      "Disminución duradera de la seborrea y brillo facial.",
      "Alivio de la inflamación e irritación en brotes de acné."
    ],
    "modoUso": "Aplicar sobre las zonas con tendencia grasa o brotes dos veces al día después de la limpieza.",
    "stock": 25
  },
  {
    "id": "exohair-casa",
    "nombre": "ExoHair",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Exosomas",
    "subtitulo": "Reactivación folicular desde la raíz",
    "descripcion": "Exosomas que reactivan el ciclo de vida capilar, regeneran folículos pilosos y mejoran la vascularización.",
    "presentacion": "Gotero 30 ml",
    "precio": 56.0,
    "precioProfesional": 46.0,
    "imagen": "images/04_exohair.png",
    "destacadoHome": false,
    "esExosoma": true,
    "principiosActivos": [
      "Exosomas de Cúrcuma Longa",
      "Biocenta Capilar",
      "Bio Capigen PT",
      "Hyaceramidyl (Ácido Hialurónico + Ceramidas)",
      "D-Pantenol",
      "Biotina y Vitamina B12",
      "Silicio Orgánico"
    ],
    "beneficios": [
      "Disminuye la caída progresiva del cabello.",
      "Estimula el nacimiento de cabello nuevo y denso.",
      "Engrosa visiblemente el tallo piloso.",
      "Reequilibra el ecosistema del cuero cabelludo."
    ],
    "modoUso": "Aplicar en el cuero cabelludo seco por la noche y masajear suavemente con la yema de los dedos.",
    "stock": 25
  },
  {
    "id": "exoneck-tensor-cuello-y-escote",
    "nombre": "ExoNeck Tensor Cuello y Escote",
    "marca": "Dermclar",
    "categoria": "Exosomas",
    "tipoUso": "casa",
    "subtitulo": "Sérum de exosomas reafirmante cervical",
    "presentacion": "Frasco airless 30 ml",
    "precio": 62.0,
    "precioProfesional": 52.7,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Sérum de exosomas reafirmante cervical. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en exosomas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de exosomas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "exoeyes-contorno-ocular-avanzado",
    "nombre": "ExoEyes Contorno Ocular Avanzado",
    "marca": "Dermclar",
    "categoria": "Exosomas",
    "tipoUso": "casa",
    "subtitulo": "Concentrado periocular con exosomas y péptidos",
    "presentacion": "Frasco gotero 15 ml",
    "precio": 54.0,
    "precioProfesional": 45.9,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Concentrado periocular con exosomas y péptidos. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en exosomas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de exosomas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "exorepair-crema-nocturna-celular",
    "nombre": "ExoRepair Crema Nocturna Celular",
    "marca": "Dermclar",
    "categoria": "Exosomas",
    "tipoUso": "casa",
    "subtitulo": "Regenerador intensivo nocturno con exosomas",
    "presentacion": "Pote 50 g",
    "precio": 68.0,
    "precioProfesional": 57.8,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Regenerador intensivo nocturno con exosomas. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en exosomas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de exosomas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "exovial-cabina-regeneracion-total",
    "nombre": "ExoVial Cabina Regeneración Total",
    "marca": "Dermclar",
    "categoria": "Exosomas",
    "tipoUso": "profesional",
    "subtitulo": "Viales estériles de exosomas concentrados",
    "presentacion": "Caja 5 viales x 5 ml",
    "precio": 115.0,
    "precioProfesional": 97.75,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Viales estériles de exosomas concentrados. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en exosomas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de exosomas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "exobooster-post-laser-calmante",
    "nombre": "ExoBooster Post-Láser Calmante",
    "marca": "Dermclar",
    "categoria": "Exosomas",
    "tipoUso": "casa",
    "subtitulo": "Fluido reparador dérmico con exosomas puros",
    "presentacion": "Frasco 30 ml",
    "precio": 64.0,
    "precioProfesional": 54.4,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Fluido reparador dérmico con exosomas puros. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en exosomas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de exosomas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "exohands-rejuvenecimiento-manos",
    "nombre": "ExoHands Rejuvenecimiento Manos",
    "marca": "Dermclar",
    "categoria": "Exosomas",
    "tipoUso": "casa",
    "subtitulo": "Emulsión despigmentante y regeneradora con exosomas",
    "presentacion": "Tubo 50 ml",
    "precio": 39.0,
    "precioProfesional": 33.15,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Emulsión despigmentante y regeneradora con exosomas. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en exosomas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de exosomas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "aqua-piel-3ah",
    "nombre": "Aqua piel 3AH",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Hidratación",
    "subtitulo": "Sérum Hidratante Intenso",
    "descripcion": "Sérum restitutivo de agua y nutrientes. Su film molecular con liposomas y ácido hialurónico reticulado aporta lozanía e hidratación inmediata.",
    "presentacion": "Frasco 50 ml",
    "precio": 42.0,
    "precioProfesional": 35.0,
    "imagen": "",
    "destacadoHome": true,
    "esExosoma": false,
    "principiosActivos": [
      "3 Tipos de Ácido Hialurónico Reticulado",
      "Liposomas Hidratantes",
      "Complejo Osmoprotector",
      "Pantenol y Minerales Esenciales"
    ],
    "beneficios": [
      "Hidratación multicapa hasta por 72 horas.",
      "Textura ultraligera de rápida absorción.",
      "Piel visiblemente más rellena, suave y elástica."
    ],
    "modoUso": "Aplicar 1 o 2 pulsaciones en la piel limpia del rostro, cuello y escote mañana y noche.",
    "stock": 25
  },
  {
    "id": "hydragel-acido-hialuronico-puro-2",
    "nombre": "HydraGel Ácido Hialurónico Puro 2%",
    "marca": "Dermclar",
    "categoria": "Hidratación",
    "tipoUso": "casa",
    "subtitulo": "Gel biomimético de hidratación multicapa",
    "presentacion": "Frasco 50 ml",
    "precio": 44.0,
    "precioProfesional": 37.4,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Gel biomimético de hidratación multicapa. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en hidratación.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de hidratación clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "aquacream-barrera-ceramidas",
    "nombre": "AquaCream Barrera Ceramidas",
    "marca": "Dermclar",
    "categoria": "Hidratación",
    "tipoUso": "casa",
    "subtitulo": "Crema restauradora del manto hidrolipídico",
    "presentacion": "Pote 50 g",
    "precio": 46.0,
    "precioProfesional": 39.1,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Crema restauradora del manto hidrolipídico. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en hidratación.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de hidratación clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "hydralips-balsamo-hialuronico",
    "nombre": "HydraLips Bálsamo Hialurónico",
    "marca": "Dermclar",
    "categoria": "Hidratación",
    "tipoUso": "casa",
    "subtitulo": "Hidratante reparador labial clínico",
    "presentacion": "Tubo 15 ml",
    "precio": 22.0,
    "precioProfesional": 18.7,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Hidratante reparador labial clínico. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en hidratación.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de hidratación clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "serum-b5-hialuronico-ultra",
    "nombre": "Sérum B5 + Hialurónico Ultra",
    "marca": "Dermclar",
    "categoria": "Hidratación",
    "tipoUso": "casa",
    "subtitulo": "Concentrado calmante e hidratante profundo",
    "presentacion": "Gotero 30 ml",
    "precio": 48.0,
    "precioProfesional": 40.8,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Concentrado calmante e hidratante profundo. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en hidratación.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de hidratación clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "emulsion-hidratante-piel-grasa",
    "nombre": "Emulsión Hidratante Piel Grasa",
    "marca": "Dermclar",
    "categoria": "Hidratación",
    "tipoUso": "casa",
    "subtitulo": "Hidratación oil-free matificante 24h",
    "presentacion": "Frasco 50 ml",
    "precio": 38.0,
    "precioProfesional": 32.3,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Hidratación oil-free matificante 24h. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en hidratación.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de hidratación clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "viales-hydramesotherapy-ha",
    "nombre": "Viales HydraMesotherapy HA",
    "marca": "Dermclar",
    "categoria": "Hidratación",
    "tipoUso": "profesional",
    "subtitulo": "Ácido hialurónico no reticulado para cabina",
    "presentacion": "Caja 5 viales x 10 ml",
    "precio": 82.0,
    "precioProfesional": 69.7,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Ácido hialurónico no reticulado para cabina. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en hidratación.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de hidratación clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "bruma-termal-calmante-azuleno",
    "nombre": "Bruma Termal Calmante Azuleno",
    "marca": "Dermclar",
    "categoria": "Hidratación",
    "tipoUso": "casa",
    "subtitulo": "Loción hidro-calmante para piel reactiva",
    "presentacion": "Spray 120 ml",
    "precio": 28.0,
    "precioProfesional": 23.8,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Loción hidro-calmante para piel reactiva. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en hidratación.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de hidratación clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "crema-nutritiva-peptidos-y-colageno",
    "nombre": "Crema Nutritiva Péptidos y Colágeno",
    "marca": "Dermclar",
    "categoria": "Hidratación",
    "tipoUso": "casa",
    "subtitulo": "Hidratación estructural para piel seca",
    "presentacion": "Pote 50 g",
    "precio": 49.0,
    "precioProfesional": 41.65,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Hidratación estructural para piel seca. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en hidratación.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de hidratación clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "dermclar-hidratacion-formula-10",
    "nombre": "Dermclar Hidratación Fórmula 10",
    "marca": "Dermclar",
    "categoria": "Hidratación",
    "tipoUso": "casa",
    "subtitulo": "Tratamiento especializado de hidratación",
    "presentacion": "Envase clínico 50 ml",
    "precio": 40.0,
    "precioProfesional": 34.0,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Tratamiento especializado de hidratación. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en hidratación.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de hidratación clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "agua-micelar-sensible",
    "nombre": "Agua micelar piel sensible",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Limpieza",
    "subtitulo": "Limpieza y desmaquillante respetuoso",
    "descripcion": "Diseñada para piel sensible con macromoléculas de Ácido Hialurónico y complejo AMC con 6 activos hidratantes.",
    "presentacion": "Frasco 260 ml",
    "precio": 27.0,
    "precioProfesional": 22.0,
    "imagen": "",
    "destacadoHome": true,
    "esExosoma": false,
    "principiosActivos": [
      "Micelas biocompatibles",
      "Macromoléculas de Ácido Hialurónico",
      "Complejo Hidratante AMC con 6 activos",
      "Extracto Botánico Calmante"
    ],
    "beneficios": [
      "Retira impurezas y maquillaje waterproof sin irritar.",
      "Protege la barrera cutánea frente a la deshidratación.",
      "Apta para contorno de ojos y pieles reactivas."
    ],
    "modoUso": "Humedecer un disco de algodón y pasar suavemente por rostro, ojos y labios sin frotar.",
    "stock": 25
  },
  {
    "id": "luminescence-cleanser",
    "nombre": "Dermclar Luminescence Cleanser",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Limpieza",
    "subtitulo": "Loción pre-peeling limpiadora profunda",
    "descripcion": "Limpiador profundo exfoliante con acción astringente que potencializa la penetración de tratamientos aclarantes.",
    "presentacion": "Frasco 250 ml",
    "precio": 40.0,
    "precioProfesional": 33.0,
    "imagen": "",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Ácido Salicílico",
      "Ácido Glicólico y Láctico",
      "Zinc Sebum con 16 aminoácidos libres",
      "Vitamina F"
    ],
    "beneficios": [
      "Exfoliación microquímica diaria suave.",
      "Equilibra la producción de sebo y reduce bacterias.",
      "Prepara la piel para recibir peelings y sérums."
    ],
    "modoUso": "Aplicar sobre el rostro húmedo, masajear en círculos y enjuagar con abundante agua tibia.",
    "stock": 25
  },
  {
    "id": "gel-limpiador-purificante-aha-bha",
    "nombre": "Gel Limpiador Purificante AHA/BHA",
    "marca": "Dermclar",
    "categoria": "Limpieza",
    "tipoUso": "casa",
    "subtitulo": "Limpieza profunda para piel mixta a grasa",
    "presentacion": "Frasco 150 ml",
    "precio": 29.0,
    "precioProfesional": 24.65,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Limpieza profunda para piel mixta a grasa. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en limpieza.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de limpieza clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "leche-limpiadora-calmante-manzanilla",
    "nombre": "Leche Limpiadora Calmante Manzanilla",
    "marca": "Dermclar",
    "categoria": "Limpieza",
    "tipoUso": "casa",
    "subtitulo": "Desmaquillante suave para piel sensible",
    "presentacion": "Frasco 200 ml",
    "precio": 28.0,
    "precioProfesional": 23.8,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Desmaquillante suave para piel sensible. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en limpieza.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de limpieza clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "tonico-equilibrante-ph-niacinamida",
    "nombre": "Tónico Equilibrante pH Niacinamida",
    "marca": "Dermclar",
    "categoria": "Limpieza",
    "tipoUso": "casa",
    "subtitulo": "Loción tónica cerradora de poros",
    "presentacion": "Frasco 150 ml",
    "precio": 26.0,
    "precioProfesional": 22.1,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Loción tónica cerradora de poros. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en limpieza.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de limpieza clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "aceite-desmaquillante-dermo-lipidico",
    "nombre": "Aceite Desmaquillante Dermo-Lipídico",
    "marca": "Dermclar",
    "categoria": "Limpieza",
    "tipoUso": "casa",
    "subtitulo": "Limpiador oleoso emulsionable sin residuos",
    "presentacion": "Frasco 120 ml",
    "precio": 34.0,
    "precioProfesional": 28.9,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Limpiador oleoso emulsionable sin residuos. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en limpieza.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de limpieza clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "exfoliante-enzimatico-papaya-y-avena",
    "nombre": "Exfoliante Enzimático Papaya y Avena",
    "marca": "Dermclar",
    "categoria": "Limpieza",
    "tipoUso": "casa",
    "subtitulo": "Renovador celular suave sin gránulos abrasivos",
    "presentacion": "Tubo 100 g",
    "precio": 35.0,
    "precioProfesional": 29.75,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Renovador celular suave sin gránulos abrasivos. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en limpieza.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de limpieza clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "solucion-desengransante-pre-peeling",
    "nombre": "Solución Desengransante Pre-Peeling",
    "marca": "Dermclar",
    "categoria": "Limpieza",
    "tipoUso": "profesional",
    "subtitulo": "Loción preparadora clínica de cabina",
    "presentacion": "Frasco 250 ml",
    "precio": 32.0,
    "precioProfesional": 27.2,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Loción preparadora clínica de cabina. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en limpieza.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de limpieza clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "agua-micelar-bifasica-ojos-y-labios",
    "nombre": "Agua Micelar Bifásica Ojos y Labios",
    "marca": "Dermclar",
    "categoria": "Limpieza",
    "tipoUso": "casa",
    "subtitulo": "Desmaquillante de alta tolerancia oftalmológica",
    "presentacion": "Frasco 150 ml",
    "precio": 27.0,
    "precioProfesional": 22.95,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Desmaquillante de alta tolerancia oftalmológica. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en limpieza.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de limpieza clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "espuma-limpiadora-acido-mandelico",
    "nombre": "Espuma Limpiadora Ácido Mandélico",
    "marca": "Dermclar",
    "categoria": "Limpieza",
    "tipoUso": "casa",
    "subtitulo": "Higiene diaria renovadora y antibacteriana",
    "presentacion": "Frasco 160 ml",
    "precio": 31.0,
    "precioProfesional": 26.35,
    "imagen": "images/03_hydrabrume.png",
    "destacadoHome": false,
    "descripcion": "Higiene diaria renovadora y antibacteriana. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en limpieza.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de limpieza clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "dd-cream-color",
    "nombre": "Protector solar DD Cream con color",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Protección solar",
    "subtitulo": "Protege y unifica sin sensación grasa",
    "descripcion": "Crema de defensa diaria multifuncional contra el fotoenvejecimiento y las manchas gracias a Neurolight 61.G SPF 30.",
    "presentacion": "Tubo 50 g",
    "precio": 48.0,
    "precioProfesional": 40.0,
    "imagen": "",
    "destacadoHome": true,
    "esExosoma": false,
    "principiosActivos": [
      "Filtros Solares UVA/UVB SPF 30",
      "Neurolight 61.G Despigmentante",
      "Pigmentos Microencapsulados de Color Adaptable",
      "Vitamina E Antioxidante"
    ],
    "beneficios": [
      "Unifica el tono de la piel con acabado mate natural.",
      "Reduce manchas oscuras existentes.",
      "Fórmula no comedogénica libre de aceites pesados."
    ],
    "modoUso": "Aplicar uniformemente como último paso de la rutina facial cada mañana antes de salir.",
    "stock": 25
  },
  {
    "id": "sunblock-gel-invisible-spf-50",
    "nombre": "SunBlock Gel Invisible SPF 50+",
    "marca": "Dermclar",
    "categoria": "Protección solar",
    "tipoUso": "casa",
    "subtitulo": "Fotoprotector toque seco para piel grasa",
    "presentacion": "Tubo 60 g",
    "precio": 38.0,
    "precioProfesional": 32.3,
    "imagen": "images/04_solar_dd_cream.png",
    "destacadoHome": false,
    "descripcion": "Fotoprotector toque seco para piel grasa. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en protección solar.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de protección solar clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "solar-fluid-mineral-pediatrico-spf-50",
    "nombre": "Solar Fluid Mineral Pediátrico SPF 50+",
    "marca": "Dermclar",
    "categoria": "Protección solar",
    "tipoUso": "casa",
    "subtitulo": "Pantalla 100% mineral para piel intolerante",
    "presentacion": "Frasco 50 ml",
    "precio": 42.0,
    "precioProfesional": 35.7,
    "imagen": "images/04_solar_dd_cream.png",
    "destacadoHome": false,
    "descripcion": "Pantalla 100% mineral para piel intolerante. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en protección solar.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de protección solar clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "compacto-solar-dermclar-spf-50-tono-claro",
    "nombre": "Compacto Solar Dermclar SPF 50+ Tono Claro",
    "marca": "Dermclar",
    "categoria": "Protección solar",
    "tipoUso": "casa",
    "subtitulo": "Maquillaje dermatológico fotoprotector",
    "presentacion": "Estuche 12 g",
    "precio": 45.0,
    "precioProfesional": 38.25,
    "imagen": "images/04_solar_dd_cream.png",
    "destacadoHome": false,
    "descripcion": "Maquillaje dermatológico fotoprotector. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en protección solar.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de protección solar clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "compacto-solar-dermclar-spf-50-tono-medio",
    "nombre": "Compacto Solar Dermclar SPF 50+ Tono Medio",
    "marca": "Dermclar",
    "categoria": "Protección solar",
    "tipoUso": "casa",
    "subtitulo": "Cobertura correctora con filtros UV/IR",
    "presentacion": "Estuche 12 g",
    "precio": 45.0,
    "precioProfesional": 38.25,
    "imagen": "images/04_solar_dd_cream.png",
    "destacadoHome": false,
    "descripcion": "Cobertura correctora con filtros UV/IR. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en protección solar.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de protección solar clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "bruma-solar-reaplicacion-facial-spf-50",
    "nombre": "Bruma Solar Reaplicación Facial SPF 50",
    "marca": "Dermclar",
    "categoria": "Protección solar",
    "tipoUso": "casa",
    "subtitulo": "Spray fotoprotector invisible sobre maquillaje",
    "presentacion": "Aerosol 75 ml",
    "precio": 39.0,
    "precioProfesional": 33.15,
    "imagen": "images/04_solar_dd_cream.png",
    "destacadoHome": false,
    "descripcion": "Spray fotoprotector invisible sobre maquillaje. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en protección solar.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de protección solar clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "solar-corporal-familiar-spf-50-resistente",
    "nombre": "Solar Corporal Familiar SPF 50+ Resistente",
    "marca": "Dermclar",
    "categoria": "Protección solar",
    "tipoUso": "casa",
    "subtitulo": "Loción fotoprotectora resistente al agua",
    "presentacion": "Frasco 200 ml",
    "precio": 48.0,
    "precioProfesional": 40.8,
    "imagen": "images/04_solar_dd_cream.png",
    "destacadoHome": false,
    "descripcion": "Loción fotoprotectora resistente al agua. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en protección solar.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de protección solar clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "stick-solar-zonas-sensibles-spf-50",
    "nombre": "Stick Solar Zonas Sensibles SPF 50+",
    "marca": "Dermclar",
    "categoria": "Protección solar",
    "tipoUso": "casa",
    "subtitulo": "Barra fotoprotectora para manchas y cicatrices",
    "presentacion": "Stick 15 g",
    "precio": 32.0,
    "precioProfesional": 27.2,
    "imagen": "images/04_solar_dd_cream.png",
    "destacadoHome": false,
    "descripcion": "Barra fotoprotectora para manchas y cicatrices. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en protección solar.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de protección solar clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "emulsion-post-solar-reparadora-adn",
    "nombre": "Emulsión Post-Solar Reparadora ADN",
    "marca": "Dermclar",
    "categoria": "Protección solar",
    "tipoUso": "casa",
    "subtitulo": "Loción descongestiva con Aloe y Pantenol",
    "presentacion": "Frasco 150 ml",
    "precio": 30.0,
    "precioProfesional": 25.5,
    "imagen": "images/04_solar_dd_cream.png",
    "destacadoHome": false,
    "descripcion": "Loción descongestiva con Aloe y Pantenol. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en protección solar.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de protección solar clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "fluido-solar-antimanchas-acido-tranexamico",
    "nombre": "Fluido Solar Antimanchas Ácido Tranexámico",
    "marca": "Dermclar",
    "categoria": "Protección solar",
    "tipoUso": "casa",
    "subtitulo": "Fotoprotección despigmentante diaria SPF 50+",
    "presentacion": "Frasco 50 ml",
    "precio": 46.0,
    "precioProfesional": 39.1,
    "imagen": "images/04_solar_dd_cream.png",
    "destacadoHome": false,
    "descripcion": "Fotoprotección despigmentante diaria SPF 50+. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en protección solar.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de protección solar clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "derm-face-serum",
    "nombre": "Derm face serum",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Cuidado facial",
    "subtitulo": "Gel facial seguro en pieles sensibles",
    "descripcion": "Contiene ácido hialurónico, péptidos y extractos naturales que hidratan a profundidad hasta por 48 horas sin sensación pegajosa.",
    "presentacion": "Frasco 30 ml",
    "precio": 41.0,
    "precioProfesional": 34.0,
    "imagen": "",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Ácido Hialurónico Puro",
      "Péptidos Reafirmantes",
      "Extractos Botánicos Regeneradores",
      "Pantenol Calmante"
    ],
    "beneficios": [
      "Hidratación prolongada por 48 horas.",
      "Devuelve la firmeza y volumen natural de las facciones.",
      "Dermatológicamente comprobado y no comedogénico."
    ],
    "modoUso": "Distribuir en rostro y cuello con masajes ascendentes hasta que se absorba por completo.",
    "stock": 25
  },
  {
    "id": "contorno-ojos-frio",
    "nombre": "Contorno de ojos",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Cuidado facial",
    "subtitulo": "Aplicador metálico con efecto frío",
    "descripcion": "Sérum sensorial sedoso y descongestionante formulado con extracto de meliloto, 3 tipos de AH y péptidos Eyeseryl y Argireline.",
    "presentacion": "Frasco 15 ml",
    "precio": 48.0,
    "precioProfesional": 40.0,
    "imagen": "",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Extracto de Meliloto",
      "3 Tipos de Ácido Hialurónico",
      "Péptido Eyeseryl (Drenante antibolsas)",
      "Argireline & Leuphasyl (Relajantes musculares)"
    ],
    "beneficios": [
      "Atenúa bolsas y ojeras oscuras rápidamente.",
      "Relaja las líneas de expresión perioculares.",
      "Aplicador de aleación metálica que potencia el drenaje por efecto térmico."
    ],
    "modoUso": "Presionar suavemente y deslizar la punta metálica sobre el contorno del ojo desde el interior hacia afuera.",
    "stock": 25
  },
  {
    "id": "proteoglycans-serum",
    "nombre": "Proteoglycans Serum",
    "marca": "Dermclar",
    "tipoUso": "casa",
    "categoria": "Cuidado facial",
    "subtitulo": "Serum de Proteoglicanos y Vitamina C",
    "descripcion": "Actúa sobre la raíz del envejecimiento celular regenerando las capas más profundas de la piel y aportando firmeza.",
    "presentacion": "Frasco 15 ml",
    "precio": 40.0,
    "precioProfesional": 32.0,
    "imagen": "",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Proteoglicanos Puros",
      "Vitamina C Estabilizada",
      "Ácido Hialurónico",
      "Antioxidantes de Alta Potencia"
    ],
    "beneficios": [
      "Regenera las estructuras de sostén dérmico.",
      "Neutraliza radicales libres generados por la polución.",
      "Aporta luminosidad radiante a pieles apagadas."
    ],
    "modoUso": "Aplicar 3 gotas por la mañana antes de la crema de día.",
    "stock": 25
  },
  {
    "id": "dermclar-plasmavit-pro",
    "nombre": "DermclarPlasmaVit",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Cuidado facial",
    "subtitulo": "Booster Tisular Revitalizante Celular",
    "descripcion": "Revitalizante que nutre intensamente los tejidos mejorando la elasticidad y acelerando los procesos celulares.",
    "presentacion": "Caja 5 viales X 10ml",
    "precio": 78.0,
    "precioProfesional": 78.0,
    "imagen": "images/05_dermclar_plasmavit.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Complejo de Aminoácidos Esenciales",
      "Vitamina C Pura",
      "Sinadol Antioxidante"
    ],
    "beneficios": [
      "Aumenta el grosor y consistencia de la piel madura.",
      "Atenúa arrugas finas y líneas de expresión.",
      "Gran poder iluminador y despigmentante."
    ],
    "modoUso": "Aplicación profesional facial mediante técnicas de microneedling o electroporación.",
    "stock": 25
  },
  {
    "id": "dermclar-hair-pro",
    "nombre": "DermclarHair",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Cuidado facial",
    "subtitulo": "Previene la caída y aumenta la densidad capilar",
    "descripcion": "Retarda la caída, mejora la calidad y resistencia del folículo y favorece la actividad biológica en receso.",
    "presentacion": "Caja 5 viales X 10ml",
    "precio": 85.0,
    "precioProfesional": 85.0,
    "imagen": "images/09_dermclar_hair.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Ácido Hialurónico",
      "D-Pantenol",
      "Silicio Orgánico",
      "Rutina",
      "Oligoelementos"
    ],
    "beneficios": [
      "Disminuye la fragilidad capilar.",
      "Aporta brillo y nutrición profunda a la fibra.",
      "Estimula el crecimiento del cabello nuevo."
    ],
    "modoUso": "Protocolo clínico capilar aplicado en cabina.",
    "stock": 25
  },
  {
    "id": "dermclar-face-pro",
    "nombre": "DermclarFace",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Cuidado facial",
    "subtitulo": "Redensifica y rejuvenece el rostro",
    "descripcion": "Solución integral para combatir el envejecimiento del rostro. Hidrata, nutre, reafirma y aclara.",
    "presentacion": "Caja 5 viales X 10ml",
    "precio": 94.0,
    "precioProfesional": 94.0,
    "imagen": "images/10_dermclar_face.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Ácido Hialurónico",
      "Glutatión",
      "Argireline y Leuphasyl",
      "DMAE",
      "Vitamina C y E"
    ],
    "beneficios": [
      "Mejora arrugas y líneas de expresión.",
      "Genera efecto tensor y lifting evidente.",
      "Alisado y homogeneización de la tez."
    ],
    "modoUso": "Aplicación profesional con técnicas de electroporación.",
    "stock": 25
  },
  {
    "id": "dermclar-face-v-pro",
    "nombre": "DermclarFace V",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Cuidado facial",
    "subtitulo": "Reafirma y tonifica la Zona V del rostro",
    "descripcion": "Ayuda a esculpir, retensar y redefinir el contorno del rostro, doble mentón y zona V.",
    "presentacion": "Caja 5 viales X 5ml",
    "precio": 105.0,
    "precioProfesional": 105.0,
    "imagen": "images/11_dermclar_face_v.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Hidrolizado de Algas Rojas",
      "Ampelopsina",
      "Péptidos Biomiméticos",
      "Silicio Orgánico",
      "DMAE"
    ],
    "beneficios": [
      "Remodelación visible del óvalo facial.",
      "Disminuye grasa localizada en papada.",
      "Aumenta la firmeza y fibras colágenas."
    ],
    "modoUso": "Tratamiento en cabina médica para perfilamiento facial.",
    "stock": 25
  },
  {
    "id": "dermclar-face-ob-pro",
    "nombre": "DermclarFace OB",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Cuidado facial",
    "subtitulo": "Reduce la papada y perfila el rostro",
    "descripcion": "Fórmula de alta tecnología que disminuye el volumen adiposo de mejillas y doble mentón.",
    "presentacion": "Caja 5 viales X 5ml",
    "precio": 110.0,
    "precioProfesional": 110.0,
    "imagen": "images/12_dermclar_face_ob.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "L-Carnitina",
      "Silicio Orgánico",
      "Fosfatidilcolina",
      "Cafeína",
      "Troxerutina"
    ],
    "beneficios": [
      "Desprende cúmulos grasos submentonianos.",
      "Acción drenante para evacuar ácidos grasos.",
      "Mejora sustancialmente el ángulo de la barbilla."
    ],
    "modoUso": "Uso profesional en reducción submentoniana.",
    "stock": 25
  },
  {
    "id": "metodo-3r-pro",
    "nombre": "Método +3R",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Cuidado facial",
    "subtitulo": "Revitaliza + Redensifica + Rejuvenece",
    "descripcion": "Protocolo clínico completo con Ácido Hialurónico de mediano y bajo peso molecular y micronutrientes antiedad.",
    "presentacion": "Kit Clínico Completo",
    "precio": 150.0,
    "precioProfesional": 150.0,
    "imagen": "images/16_metodo_3r.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "+ Plendor S: 2 viales X 10ml",
      "Plasmavit: 1 vial X 10ml",
      "Dermface: 1 vial X 10ml",
      "Silicio Orgánico: 2 ampollas X 5ml",
      "Hidraderm: 2 ampollas X 2ml"
    ],
    "beneficios": [
      "Kit integral formulado para 5 sesiones completas.",
      "Reversión visible de signos de crono y fotoenvejecimiento.",
      "Máxima redensificación dérmica probada clínicamente."
    ],
    "modoUso": "Protocolo exclusivo para médicos y profesionales de la estética médica.",
    "stock": 25
  },
  {
    "id": "metodo-hair-pro",
    "nombre": "Método Hair",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Cuidado facial",
    "subtitulo": "Hair Active A.H. Protocolo Capilar",
    "descripcion": "Combinación de ácido hialurónico, aminoácidos y oligoelementos para reactivar folículos en receso.",
    "presentacion": "Kit Clínico Capilar",
    "precio": 79.0,
    "precioProfesional": 79.0,
    "imagen": "images/17_metodo_hair.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Dermhair: 2 viales X 10ml",
      "Plasmavit: 2 viales X 10ml",
      "Silicio Orgánico: 2 ampollas X 5ml",
      "Meliloto: 2 ampollas X 2ml"
    ],
    "beneficios": [
      "Estimulación capilar completa.",
      "Revitalización del folículo debilitado.",
      "Aumenta la fuerza de anclaje de la raíz."
    ],
    "modoUso": "Uso en cabina médica capilar.",
    "stock": 25
  },
  {
    "id": "dermclar-firm-pro",
    "nombre": "DermclarFirm",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Corporal",
    "subtitulo": "Reafirmante y tensor intensivo de la piel",
    "descripcion": "Tratamiento clínico para combatir la flacidez y las estrías. Devuelve elasticidad firme a la arquitectura cutánea.",
    "presentacion": "Caja 5 viales X 10ml",
    "precio": 79.0,
    "precioProfesional": 79.0,
    "imagen": "images/08_dermclar_firm.png",
    "destacadoHome": true,
    "esExosoma": false,
    "principiosActivos": [
      "DMAE Concentrado",
      "Glucosaminoglicanos",
      "Silicio Orgánico",
      "D-Pantenol",
      "Centella Asiática Pura"
    ],
    "beneficios": [
      "Efecto lifting tisular visible y sostenido.",
      "Estimulación masiva de colágeno y elastina.",
      "Disminuye profundidad y coloración de estrías."
    ],
    "modoUso": "Uso exclusivo por profesionales capacitados mediante técnicas de mesoterapia o aparatología estética.",
    "stock": 25
  },
  {
    "id": "dermclar-obes-pro",
    "nombre": "DermclarObes",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Corporal",
    "subtitulo": "Reductor de medidas y grasa rebelde",
    "descripcion": "Fórmula #1 para reducir el volumen corporal, adiposidades localizadas rebeldes y contornear la silueta.",
    "presentacion": "Caja 5 viales X 10ml",
    "precio": 98.0,
    "precioProfesional": 98.0,
    "imagen": "images/06_dermclar_obes.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Fosfatidilcolina Lipolítica",
      "Desoxicolato de Sodio",
      "L-Carnitina Biológica",
      "Rutina Vasoactiva"
    ],
    "beneficios": [
      "Potente liporeductor en tiempo récord.",
      "Disuelve adiposidades en abdomen, flancos y muslos.",
      "Limita la retención hídrica en tejido adiposo."
    ],
    "modoUso": "Protocolo clínico profesional con técnica de electroporación o mesoterapia.",
    "stock": 25
  },
  {
    "id": "dermclar-celu-pro",
    "nombre": "DermclarCelu",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Corporal",
    "subtitulo": "Anticelulítico y desintoxicante de tejido",
    "descripcion": "Disminuye el tamaño de los nódulos grasos celulíticos y estimula el drenaje de toxinas acumuladas.",
    "presentacion": "Caja 5 viales X 10ml",
    "precio": 70.0,
    "precioProfesional": 70.0,
    "imagen": "images/07_dermclar_celu.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "L-Carnitina",
      "Cafeína Pura",
      "Silicio Orgánico",
      "Centella Asiática",
      "Extracto de Meliloto"
    ],
    "beneficios": [
      "Ideal para celulitis edematosa, compacta y flácida.",
      "Alisa la piel de naranja y reafirma el tejido.",
      "Activa la microcirculación de retorno venolinfático."
    ],
    "modoUso": "Uso profesional en cabina estética con aparatología o técnica tópica avanzada.",
    "stock": 25
  },
  {
    "id": "dermclar-bump-up-pro",
    "nombre": "Dermclar Bump UP",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Corporal",
    "subtitulo": "Proyecta la curvatura de los glúteos",
    "descripcion": "Péptidos biomiméticos Adifyline y Factor de Crecimiento Epidermal (EGF PLUS) para remodelar y aportar firmeza glútea.",
    "presentacion": "Caja 10 ampollas X 5ml",
    "precio": 95.0,
    "precioProfesional": 95.0,
    "imagen": "images/13_dermclar_bump_up.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Ácido Hialurónico de alto peso molecular",
      "EGF PLUS (Factor de Crecimiento Epidermal)",
      "Péptido Biomimético Adifyline",
      "Vitamina C y 15 Aminoácidos",
      "Silicio Orgánico y DMAE"
    ],
    "beneficios": [
      "Aporta volumen y definición a la zona glútea.",
      "Estimula la síntesis de colágeno estructural.",
      "Efecto reafirmante y tensor duradero."
    ],
    "modoUso": "Uso profesional en protocolos corporales de elevación y tonificación glútea.",
    "stock": 25
  },
  {
    "id": "dermclar-ice-up-pro",
    "nombre": "Dermclar Ice UP",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Corporal",
    "subtitulo": "Tonifica la curvatura de las Nalgas",
    "descripcion": "Biopéptidos programados tensores y nutritivos que ayudan a reducir celulitis y flacidez.",
    "presentacion": "Caja 10 ampollas X 5ml",
    "precio": 87.0,
    "precioProfesional": 87.0,
    "imagen": "images/14_dermclar_ice_up.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Biopéptidos Programados",
      "Hidrolizado de Colágeno y Elastina",
      "Laureth-9 y Piruvato de Sodio",
      "Centella Asiática y DMAE"
    ],
    "beneficios": [
      "Tonifica y reafirma la piel glútea.",
      "Reduce la apariencia de celulitis flácida.",
      "Estimula colágeno dérmico."
    ],
    "modoUso": "Protocolo en cabina corporal.",
    "stock": 25
  },
  {
    "id": "dermclar-golden-up-pro",
    "nombre": "Dermclar Golden UP",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Corporal",
    "subtitulo": "Realza la curvatura de las Nalgas",
    "descripcion": "Tratamiento estético con ácido hialurónico y aminoácidos ramificados para devolver turgencia y grosor dérmico.",
    "presentacion": "Caja 10 ampollas X 5ml",
    "precio": 65.0,
    "precioProfesional": 65.0,
    "imagen": "images/15_dermclar_golden_up.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Ácido Hialurónico mediano peso",
      "Aminoácidos Ramificados",
      "Vitamina C",
      "Silicio Orgánico y DMAE"
    ],
    "beneficios": [
      "Efecto lifting y soporte tensor.",
      "Devuelve la turgencia y textura suave.",
      "Reestructura el tejido dérmico glúteo."
    ],
    "modoUso": "Protocolo profesional.",
    "stock": 25
  },
  {
    "id": "metodo-obooster-pro",
    "nombre": "Método OBooster",
    "marca": "Dermclar",
    "tipoUso": "profesional",
    "categoria": "Corporal",
    "subtitulo": "Remodelador Corporal y Reposicionador Tisular",
    "descripcion": "Reducción de grasa localizada con armonización bioenergética y reposicionamiento de la piel luego del adelgazamiento.",
    "presentacion": "Kit Clínico Completo",
    "precio": 95.0,
    "precioProfesional": 95.0,
    "imagen": "images/18_metodo_obooster.png",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Dermobes: 2 viales X 10ml",
      "Obooster: 2 ampollas X 5ml",
      "Ampelopsina: 2 ampollas X 5ml",
      "L-Carnitina: 2 ampollas X 5ml",
      "Fosfatidilcolina: 1 ampolla X 5ml",
      "Silicio Orgánico: 1 ampolla X 5ml"
    ],
    "beneficios": [
      "Actúa en todos los biotipos corporales.",
      "Evita el descolgamiento cutáneo post-reducción.",
      "Remodela el contorno corporal integral."
    ],
    "modoUso": "Protocolo clínico para reducción y firmeza corporal.",
    "stock": 25
  },
  {
    "id": "gel-criogenico-reafirmante-corporal",
    "nombre": "Gel Criogénico Reafirmante Corporal",
    "marca": "Dermclar",
    "categoria": "Corporal",
    "tipoUso": "casa",
    "subtitulo": "Efecto frío tonificante para flacidez",
    "presentacion": "Pote 500 g",
    "precio": 45.0,
    "precioProfesional": 38.25,
    "imagen": "images/06_dermclar_obes.png",
    "destacadoHome": false,
    "descripcion": "Efecto frío tonificante para flacidez. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en corporal.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de corporal clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "crema-anticelulitica-cafeina-y-centella",
    "nombre": "Crema Anticelulítica Cafeína y Centella",
    "marca": "Dermclar",
    "categoria": "Corporal",
    "tipoUso": "casa",
    "subtitulo": "Emulsión reductora de piel de naranja",
    "presentacion": "Frasco 250 ml",
    "precio": 42.0,
    "precioProfesional": 35.7,
    "imagen": "images/06_dermclar_obes.png",
    "destacadoHome": false,
    "descripcion": "Emulsión reductora de piel de naranja. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en corporal.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de corporal clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "crema-prevencion-estrias-rosa-mosqueta",
    "nombre": "Crema Prevención Estrías Rosa Mosqueta",
    "marca": "Dermclar",
    "categoria": "Corporal",
    "tipoUso": "casa",
    "subtitulo": "Elasticidad dérmica intensiva corporal",
    "presentacion": "Tubo 200 ml",
    "precio": 38.0,
    "precioProfesional": 32.3,
    "imagen": "images/06_dermclar_obes.png",
    "destacadoHome": false,
    "descripcion": "Elasticidad dérmica intensiva corporal. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en corporal.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de corporal clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "copa-sueca-mini",
    "nombre": "Copa Sueca Mini",
    "marca": "Medical Skin",
    "tipoUso": "profesional",
    "categoria": "Metaloterapia",
    "subtitulo": "Herramienta facial de acero quirúrgico",
    "descripcion": "Facilita el drenaje linfático, disminuye líneas de expresión y redefine el óvalo facial mediante succión al vacío suave.",
    "presentacion": "Unidad individual en acero médico",
    "precio": 25.0,
    "precioProfesional": 25.0,
    "imagen": "",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Aleación de acero médico antialérgico",
      "Borde pulido de alta precisión",
      "Mango ergonómico antideslizante"
    ],
    "beneficios": [
      "Efecto succión que moviliza el líquido estancado.",
      "Relaja la tensión muscular nasogeniana y frontal.",
      "Máxima durabilidad y fácil esterilización."
    ],
    "modoUso": "Aplicar aceite facial o sérum antes del uso. Deslizar suavemente siguiendo los canales de drenaje linfático.",
    "stock": 25
  },
  {
    "id": "copa-sueca-metaloterapia-corporal",
    "nombre": "Copa Sueca Metaloterapia Corporal",
    "marca": "Medical Skin",
    "categoria": "Metaloterapia",
    "tipoUso": "profesional",
    "subtitulo": "Succión y vacumterapia manual ergonómica",
    "presentacion": "Unidad",
    "precio": 48.0,
    "precioProfesional": 40.8,
    "imagen": "images/11_kit_metaloterapia_facial.png",
    "destacadoHome": false,
    "descripcion": "Succión y vacumterapia manual ergonómica. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en metaloterapia.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de metaloterapia clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "tabla-moldeadora-corporal-metal",
    "nombre": "Tabla Moldeadora Corporal Metal",
    "marca": "Medical Skin",
    "categoria": "Metaloterapia",
    "tipoUso": "profesional",
    "subtitulo": "Perfilado y drenaje linfático de cintura",
    "presentacion": "Unidad",
    "precio": 52.0,
    "precioProfesional": 44.2,
    "imagen": "images/11_kit_metaloterapia_facial.png",
    "destacadoHome": false,
    "descripcion": "Perfilado y drenaje linfático de cintura. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en metaloterapia.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de metaloterapia clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "rodillo-estriado-activador-circulatorio",
    "nombre": "Rodillo Estriado Activador Circulatorio",
    "marca": "Medical Skin",
    "categoria": "Metaloterapia",
    "tipoUso": "profesional",
    "subtitulo": "Hiperemia controlada y preparación adiposa",
    "presentacion": "Unidad",
    "precio": 49.0,
    "precioProfesional": 41.65,
    "imagen": "images/11_kit_metaloterapia_facial.png",
    "destacadoHome": false,
    "descripcion": "Hiperemia controlada y preparación adiposa. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en metaloterapia.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de metaloterapia clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "hongo-reductor-metaloterapia-corporal",
    "nombre": "Hongo Reductor Metaloterapia Corporal",
    "marca": "Medical Skin",
    "categoria": "Metaloterapia",
    "tipoUso": "profesional",
    "subtitulo": "Combate celulitis compacta y adiposidad",
    "presentacion": "Unidad",
    "precio": 46.0,
    "precioProfesional": 39.1,
    "imagen": "images/11_kit_metaloterapia_facial.png",
    "destacadoHome": false,
    "descripcion": "Combate celulitis compacta y adiposidad. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en metaloterapia.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de metaloterapia clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "cinturon-masajeador-articulado-metal",
    "nombre": "Cinturón Masajeador Articulado Metal",
    "marca": "Medical Skin",
    "categoria": "Metaloterapia",
    "tipoUso": "profesional",
    "subtitulo": "Masaje simétrico en espalda, muslos y glúteos",
    "presentacion": "Unidad",
    "precio": 64.0,
    "precioProfesional": 54.4,
    "imagen": "images/11_kit_metaloterapia_facial.png",
    "destacadoHome": false,
    "descripcion": "Masaje simétrico en espalda, muslos y glúteos. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en metaloterapia.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de metaloterapia clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "copa-facial-lift-contorno-ocular",
    "nombre": "Copa Facial Lift Contorno Ocular",
    "marca": "Medical Skin",
    "categoria": "Metaloterapia",
    "tipoUso": "profesional",
    "subtitulo": "Drenaje periocular y elevación de pómulos",
    "presentacion": "Unidad",
    "precio": 35.0,
    "precioProfesional": 29.75,
    "imagen": "images/11_kit_metaloterapia_facial.png",
    "destacadoHome": false,
    "descripcion": "Drenaje periocular y elevación de pómulos. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en metaloterapia.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de metaloterapia clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "espatula-escultora-mandibular-metal",
    "nombre": "Espátula Escultora Mandibular Metal",
    "marca": "Medical Skin",
    "categoria": "Metaloterapia",
    "tipoUso": "profesional",
    "subtitulo": "Definición del óvalo facial y papada",
    "presentacion": "Unidad",
    "precio": 36.0,
    "precioProfesional": 30.6,
    "imagen": "images/11_kit_metaloterapia_facial.png",
    "destacadoHome": false,
    "descripcion": "Definición del óvalo facial y papada. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en metaloterapia.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de metaloterapia clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "esferas-criogenicas-faciales-par",
    "nombre": "Esferas Criogénicas Faciales Par",
    "marca": "Medical Skin",
    "categoria": "Metaloterapia",
    "tipoUso": "profesional",
    "subtitulo": "Crioterapia reafirmante y descongestiva",
    "presentacion": "Caja x 2 unidades",
    "precio": 44.0,
    "precioProfesional": 37.4,
    "imagen": "images/11_kit_metaloterapia_facial.png",
    "destacadoHome": false,
    "descripcion": "Crioterapia reafirmante y descongestiva. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en metaloterapia.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de metaloterapia clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "medical-skin-metaloterapia-formula-10",
    "nombre": "Medical Skin Metaloterapia Fórmula 10",
    "marca": "Medical Skin",
    "categoria": "Metaloterapia",
    "tipoUso": "profesional",
    "subtitulo": "Tratamiento especializado de metaloterapia",
    "presentacion": "Envase clínico 50 ml",
    "precio": 40.0,
    "precioProfesional": 34.0,
    "imagen": "images/11_kit_metaloterapia_facial.png",
    "destacadoHome": false,
    "descripcion": "Tratamiento especializado de metaloterapia. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en metaloterapia.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de metaloterapia clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "mascarilla-colageno",
    "nombre": "Mascarilla Hidroplástica Colágeno",
    "marca": "Medical Skin",
    "tipoUso": "casa",
    "categoria": "Mascarillas",
    "subtitulo": "Antienvejecimiento para piel seca y desvitalizada",
    "descripcion": "Aporta elasticidad y firmeza intensa a pieles cansadas gracias al colágeno hidrolizado y alginatos marinos.",
    "presentacion": "Sobre 250 g",
    "precio": 19.0,
    "precioProfesional": 19.0,
    "imagen": "",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Colágeno Hidrolizado",
      "Extracto de Flor de Regaliz",
      "Algina Natural",
      "Tierra de Diatomeas"
    ],
    "beneficios": [
      "Forma una capa elástica que sella activos en la piel.",
      "Efecto refrescante y descongestivo inmediato.",
      "Nutre y suaviza visiblemente la textura cutánea."
    ],
    "modoUso": "Mezclar el polvo con agua hasta formar una pasta cremosa. Aplicar en rostro y retirar tras 20 minutos de una sola pieza.",
    "stock": 25
  },
  {
    "id": "mascarilla-hidroplastica-oro-24k",
    "nombre": "Mascarilla Hidroplástica Oro 24K",
    "marca": "Medical Skin",
    "categoria": "Mascarillas",
    "tipoUso": "profesional",
    "subtitulo": "Nutrición luminosa y efecto tensor inmediato",
    "presentacion": "Sobre 100 g",
    "precio": 26.0,
    "precioProfesional": 22.1,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Nutrición luminosa y efecto tensor inmediato. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en mascarillas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de mascarillas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "mascarilla-alginato-carbon-activado",
    "nombre": "Mascarilla Alginato Carbón Activado",
    "marca": "Medical Skin",
    "categoria": "Mascarillas",
    "tipoUso": "profesional",
    "subtitulo": "Detoxificante profunda para piel acneica",
    "presentacion": "Sobre 100 g",
    "precio": 24.0,
    "precioProfesional": 20.4,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Detoxificante profunda para piel acneica. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en mascarillas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de mascarillas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "mascarilla-calmante-azuleno-y-avena",
    "nombre": "Mascarilla Calmante Azuleno y Avena",
    "marca": "Medical Skin",
    "categoria": "Mascarillas",
    "tipoUso": "profesional",
    "subtitulo": "Descongestión post-peeling o micropunción",
    "presentacion": "Pote 200 g",
    "precio": 34.0,
    "precioProfesional": 28.9,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Descongestión post-peeling o micropunción. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en mascarillas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de mascarillas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "mascarilla-vitamina-c-iluminadora",
    "nombre": "Mascarilla Vitamina C Iluminadora",
    "marca": "Medical Skin",
    "categoria": "Mascarillas",
    "tipoUso": "profesional",
    "subtitulo": "Antioxidante intensiva para pieles apagadas",
    "presentacion": "Pote 200 g",
    "precio": 36.0,
    "precioProfesional": 30.6,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Antioxidante intensiva para pieles apagadas. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en mascarillas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de mascarillas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "velo-de-colageno-nativo-hidrogel",
    "nombre": "Velo de Colágeno Nativo Hidrogel",
    "marca": "Medical Skin",
    "categoria": "Mascarillas",
    "tipoUso": "profesional",
    "subtitulo": "Lámina facial bio-activa reestructurante",
    "presentacion": "Caja x 5 velos",
    "precio": 42.0,
    "precioProfesional": 35.7,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Lámina facial bio-activa reestructurante. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en mascarillas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de mascarillas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "mascarilla-arcilla-blanca-seborreguladora",
    "nombre": "Mascarilla Arcilla Blanca Seborreguladora",
    "marca": "Medical Skin",
    "categoria": "Mascarillas",
    "tipoUso": "casa",
    "subtitulo": "Control de brillo y cierre de poros dilatados",
    "presentacion": "Tubo 150 g",
    "precio": 28.0,
    "precioProfesional": 23.8,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Control de brillo y cierre de poros dilatados. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en mascarillas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de mascarillas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "mascarilla-nocturna-acido-hialuronico",
    "nombre": "Mascarilla Nocturna Ácido Hialurónico",
    "marca": "Medical Skin",
    "categoria": "Mascarillas",
    "tipoUso": "casa",
    "subtitulo": "Sleeping mask de recuperación hídrica",
    "presentacion": "Pote 60 g",
    "precio": 35.0,
    "precioProfesional": 29.75,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Sleeping mask de recuperación hídrica. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en mascarillas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de mascarillas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "mascarilla-enzimatica-renovadora",
    "nombre": "Mascarilla Enzimática Renovadora",
    "marca": "Medical Skin",
    "categoria": "Mascarillas",
    "tipoUso": "casa",
    "subtitulo": "Micro-exfoliación biológica iluminadora",
    "presentacion": "Tubo 100 g",
    "precio": 32.0,
    "precioProfesional": 27.2,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Micro-exfoliación biológica iluminadora. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en mascarillas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de mascarillas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "medical-skin-mascarillas-formula-10",
    "nombre": "Medical Skin Mascarillas Fórmula 10",
    "marca": "Medical Skin",
    "categoria": "Mascarillas",
    "tipoUso": "profesional",
    "subtitulo": "Tratamiento especializado de mascarillas",
    "presentacion": "Envase clínico 50 ml",
    "precio": 40.0,
    "precioProfesional": 34.0,
    "imagen": "images/02_exoface_serum.png",
    "destacadoHome": false,
    "descripcion": "Tratamiento especializado de mascarillas. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en mascarillas.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de mascarillas clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "guantes-nitrilo",
    "nombre": "Guantes de Nitrilo Quirúrgico",
    "marca": "Medical Skin",
    "tipoUso": "profesional",
    "categoria": "Insumos",
    "subtitulo": "Caja de 100 unidades grado médico",
    "descripcion": "Guantes sin polvo, alta resistencia elástica y gran sensibilidad táctil para procedimientos estéticos y médicos.",
    "presentacion": "Caja de 100 unidades",
    "precio": 5.0,
    "precioProfesional": 5.0,
    "imagen": "",
    "destacadoHome": false,
    "esExosoma": false,
    "principiosActivos": [
      "Nitrilo libre de látex",
      "Puntas de dedos microtexturizadas",
      "Certificación médica hospitalaria"
    ],
    "beneficios": [
      "Sin riesgo de alergias al látex.",
      "Excelente agarre de jeringas e instrumental metálico.",
      "Barrera biológica segura y confortable."
    ],
    "modoUso": "Descartar luego de cada paciente conforme a las normas de bioseguridad.",
    "stock": 25
  },
  {
    "id": "canulas-flexibles-dermatologicas-25g-x-50mm",
    "nombre": "Cánulas Flexibles Dermatológicas 25G x 50mm",
    "marca": "Medical Skin",
    "categoria": "Insumos",
    "tipoUso": "profesional",
    "subtitulo": "Microcánulas de punta roma atraumática",
    "presentacion": "Caja x 20 unidades",
    "precio": 65.0,
    "precioProfesional": 55.25,
    "imagen": "images/13_agujas_mesoterapia.png",
    "destacadoHome": false,
    "descripcion": "Microcánulas de punta roma atraumática. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en insumos.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de insumos clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "jeringas-luer-lock-precision-3-ml",
    "nombre": "Jeringas Luer-Lock Precisión 3 ml",
    "marca": "Medical Skin",
    "categoria": "Insumos",
    "tipoUso": "profesional",
    "subtitulo": "Jeringas estériles sin espacio muerto",
    "presentacion": "Caja x 100 unidades",
    "precio": 28.0,
    "precioProfesional": 23.8,
    "imagen": "images/13_agujas_mesoterapia.png",
    "destacadoHome": false,
    "descripcion": "Jeringas estériles sin espacio muerto. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en insumos.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de insumos clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "cartuchos-nanopore-dermapen-36-pines",
    "nombre": "Cartuchos Nanopore / Dermapen 36 Pines",
    "marca": "Medical Skin",
    "categoria": "Insumos",
    "tipoUso": "profesional",
    "subtitulo": "Repuestos estériles para micropunción eléctrica",
    "presentacion": "Caja x 10 unidades",
    "precio": 35.0,
    "precioProfesional": 29.75,
    "imagen": "images/13_agujas_mesoterapia.png",
    "destacadoHome": false,
    "descripcion": "Repuestos estériles para micropunción eléctrica. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en insumos.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de insumos clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "cartuchos-nanopore-dermapen-12-pines",
    "nombre": "Cartuchos Nanopore / Dermapen 12 Pines",
    "marca": "Medical Skin",
    "categoria": "Insumos",
    "tipoUso": "profesional",
    "subtitulo": "Inducción de colágeno cicatrizal y estrías",
    "presentacion": "Caja x 10 unidades",
    "precio": 35.0,
    "precioProfesional": 29.75,
    "imagen": "images/13_agujas_mesoterapia.png",
    "destacadoHome": false,
    "descripcion": "Inducción de colágeno cicatrizal y estrías. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en insumos.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de insumos clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "dispositivo-dermapen-inalambrico-pro",
    "nombre": "Dispositivo Dermapen Inalámbrico Pro",
    "marca": "Medical Skin",
    "categoria": "Insumos",
    "tipoUso": "profesional",
    "subtitulo": "Equipo médico de micropunción regulable",
    "presentacion": "Kit maletín",
    "precio": 145.0,
    "precioProfesional": 123.25,
    "imagen": "images/13_agujas_mesoterapia.png",
    "destacadoHome": false,
    "descripcion": "Equipo médico de micropunción regulable. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en insumos.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de insumos clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "rodillo-dermaroller-titanio-0-5-mm",
    "nombre": "Rodillo Dermaroller Titanio 0.5 mm",
    "marca": "Medical Skin",
    "categoria": "Insumos",
    "tipoUso": "profesional",
    "subtitulo": "Terapia de inducción percutánea de activos",
    "presentacion": "Unidad estéril",
    "precio": 22.0,
    "precioProfesional": 18.7,
    "imagen": "images/13_agujas_mesoterapia.png",
    "destacadoHome": false,
    "descripcion": "Terapia de inducción percutánea de activos. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en insumos.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de insumos clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "gasas-no-tejidas-esteriles-cabina",
    "nombre": "Gasas No Tejidas Estériles Cabina",
    "marca": "Medical Skin",
    "categoria": "Insumos",
    "tipoUso": "profesional",
    "subtitulo": "Compresas suaves sin pelusa uso clínico",
    "presentacion": "Paquete x 200 uds",
    "precio": 14.0,
    "precioProfesional": 11.9,
    "imagen": "images/13_agujas_mesoterapia.png",
    "destacadoHome": false,
    "descripcion": "Compresas suaves sin pelusa uso clínico. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en insumos.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de insumos clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "guantes-nitrilo-quirurgico-sin-polvo",
    "nombre": "Guantes Nitrilo Quirúrgico Sin Polvo",
    "marca": "Medical Skin",
    "categoria": "Insumos",
    "tipoUso": "profesional",
    "subtitulo": "Protección clínica hipoalergénica talla M",
    "presentacion": "Caja x 100 uds",
    "precio": 16.0,
    "precioProfesional": 13.6,
    "imagen": "images/13_agujas_mesoterapia.png",
    "destacadoHome": false,
    "descripcion": "Protección clínica hipoalergénica talla M. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en insumos.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de insumos clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  },
  {
    "id": "banda-elastica-clinica-sujecion-facial",
    "nombre": "Banda Elástica Clínica Sujeción Facial",
    "marca": "Medical Skin",
    "categoria": "Insumos",
    "tipoUso": "profesional",
    "subtitulo": "Vincha ajustable lavable para cabina estética",
    "presentacion": "Paquete x 3 uds",
    "precio": 15.0,
    "precioProfesional": 12.75,
    "imagen": "images/13_agujas_mesoterapia.png",
    "destacadoHome": false,
    "descripcion": "Vincha ajustable lavable para cabina estética. Desarrollado bajo estándares dermatológicos para resultados visibles y seguros en insumos.",
    "principiosActivos": [
      "Complejo Dermclar Bio-Active",
      "Péptidos biomiméticos de alta pureza",
      "Vehículo liposomado de absorción profunda"
    ],
    "beneficios": [
      "Acción específica de insumos clínicamente probada",
      "Alta tolerancia cutánea dermatológicamente testeada",
      "Resultados progresivos desde las primeras aplicaciones"
    ],
    "modoUso": "Aplicar sobre la zona limpia y seca siguiendo el protocolo recomendado por el especialista.",
    "stock": 25
  }
];
