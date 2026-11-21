// ████████████████████████████████████████████████████████████████████████████
// ZONA A: PANEL DE CONTROL [EDITABLE]
// Cuando trabajes con el predio real del cliente, SOLO editas esta sección.
// ████████████████████████████████████████████████████████████████████████████

const CONFIG = {
  // 1. Archivo exportado desde QGIS (debe estar en la misma carpeta del repo)
  rutaGeoJSON: './lotes.geojson',

  // 2. Número de WhatsApp del cliente (sin +, con indicativo 57)
  whatsappNumero: '573000000000',

  // 3. Relieve 3D: 1.0 es real exacto, 1.25 resalta un poco las montañas
  exageracionRelieve: 1.25,

  // 4. Hacia dónde mira la cámara al pulsar "Simular Vista desde el Lote"
  //    (0 = Norte, 90 = Este, 180 = Sur, -90 = Oeste / hacia el embalse)
  anguloVistaEmbalse: -95,

  // 5. Colores de los polígonos (coinciden con tu style.css)
  colores: {
    disponible: '#4ade80',   // Verde
    reservado: '#888888',    // Gris
    seleccionado: '#c49a6c', // Cobre M&D
    mojonRelleno: '#ffffff',
    mojonBorde: '#c49a6c'
  }
};

// 6. Estaciones de cámara (Tarjeta 01 y Riel 3D)
//    center: [Longitud, Latitud] -> En Santander siempre es [-73.xxxx, 7.xxxx]
//    zoom:   13 (lejos) a 18 (muy cerca)
//    pitch:  0 (vista plana arriba) a 85 (casi a nivel del suelo)
//    bearing: Rotación de la brújula (-180 a 180)
const ESTACIONES_CAMARA = [
  {
    nombre: 'ESTACIÓN 01 — PANORAMA EMBALSE',
    center: [-73.329, 7.0585],
    zoom: 13.7,
    pitch: 62,
    bearing: -75
  },
  {
    nombre: 'ESTACIÓN 02 — APROXIMACIÓN Y LADERA',
    center: [-73.3238, 7.0584],
    zoom: 15.5,
    pitch: 68,
    bearing: 32
  },
  {
    nombre: 'ESTACIÓN 03 — PLANTA DE LOTES',
    center: [-73.3238, 7.0584],
    zoom: 16.3,
    pitch: 12,
    bearing: 0
  },
  {
    nombre: 'ESTACIÓN 04 — PERSPECTIVA MIRADOR',
    center: [-73.3238, 7.0584],
    zoom: 16.6,
    pitch: 74,
    bearing: -92
  }
];

// 7. Respaldo interno con tus 6 lotes de QGIS
//    Si aún no has subido lotes.geojson a GitHub, la página carga esto para no quedar vacía.
//    Apenas subas lotes.geojson a la carpeta, el código leerá ese archivo automáticamente.
const GEOJSON_RESPALDO = {
  "type": "FeatureCollection",
  "name": "lotes",
  "features": [
    {"type":"Feature","properties":{"fid":1,"id_lote":"LOTE 01","nombre":"Lote 01 — Mirador Norte","estado":"DISPONIBLE","precio":"$145.000.000 COP","area_m2":25371},"geometry":{"type":"Polygon","coordinates":[[[-73.326603924462603,7.059802514312489,0.0],[-73.325062751770076,7.060327660161301,0.0],[-73.324560051664349,7.059192031513986,0.0],[-73.325975549330465,7.058568419221491,0.0],[-73.326603924462603,7.059802514312489,0.0]]]}},
    {"type":"Feature","properties":{"fid":2,"id_lote":"LOTE 02","nombre":"Lote 02 — Mirador Norte","estado":"DISPONIBLE","precio":"$145.000.000 COP","area_m2":19642},"geometry":{"type":"Polygon","coordinates":[[[-73.325975549330465,7.058568419221491,0.0],[-73.324626196415096,7.057931677381986,0.0],[-73.323435590901553,7.058358360154784,0.0],[-73.324560051664349,7.059192031513986,0.0],[-73.325975549330465,7.058568419221491,0.0]]]}},
    {"type":"Feature","properties":{"fid":3,"id_lote":"LOTE 03","nombre":"Lote 03 — Mirador Norte","estado":"DISPONIBLE","precio":"$145.000.000 COP","area_m2":20617},"geometry":{"type":"Polygon","coordinates":[[[-73.324626196415096,7.057931677381986,0.0],[-73.325023064919606,7.057485301137064,0.0],[-73.325069366245131,7.057124261212262,0.0],[-73.324692341165843,7.056861686544591,0.0],[-73.32293289079584,7.05769536060007,0.0],[-73.323435590901553,7.058358360154784,0.0],[-73.324626196415096,7.057931677381986,0.0]]]}},
    {"type":"Feature","properties":{"fid":4,"id_lote":"LOTE 04","nombre":"Lote 04 — Mirador Norte","estado":"DISPONIBLE","precio":"$145.000.000 COP","area_m2":15386},"geometry":{"type":"Polygon","coordinates":[[[-73.32293289079584,7.05769536060007,0.0],[-73.321576923405402,7.058529033153745,0.0],[-73.32203332218559,7.059132952490738,0.0],[-73.323435590901553,7.058358360154784,0.0],[-73.32293289079584,7.05769536060007,0.0]]]}},
    {"type":"Feature","properties":{"fid":5,"id_lote":"LOTE 05","nombre":"Lote 05 — Mirador Norte","estado":"DISPONIBLE","precio":"$145.000.000 COP","area_m2":21777},"geometry":{"type":"Polygon","coordinates":[[[-73.32293289079584,7.05769536060007,0.0],[-73.322125924836669,7.056454695515323,0.0],[-73.321153597000588,7.057925113028563,0.0],[-73.321576923405402,7.058529033153745,0.0],[-73.32293289079584,7.05769536060007,0.0]]]}},
    {"type":"Feature","properties":{"fid":6,"id_lote":"LOTE 06","nombre":"Lote 06 — Mirador Norte","estado":"RESERVADO","precio":"$145.000.000 COP","area_m2":24059},"geometry":{"type":"Polygon","coordinates":[[[-73.32203332218559,7.059132952490738,0.0],[-73.322890723517276,7.059904261367255,0.0],[-73.324560051664349,7.059192031513986,0.0],[-73.323435590901553,7.058358360154784,0.0],[-73.32203332218559,7.059132952490738,0.0]]]}}
  ]
};


// ████████████████████████████████████████████████████████████████████████████
// ZONA B: MOTOR DEL VISOR SATELITAL 3D (No necesitas modificar salvo ajustes avanzados)
// ████████████████████████████████████████████████████████████████████████████

// ----------------------------------------------------------------------------
// BLOQUE 1: CREACIÓN DEL MAPA (Satélite Esri + Google Híbrido + Relieve 3D)
// ----------------------------------------------------------------------------
const map = new maplibregl.Map({
  container: 'map',
  center: ESTACIONES_CAMARA[0].center,
  zoom: ESTACIONES_CAMARA[0].zoom,
  pitch: ESTACIONES_CAMARA[0].pitch,
  bearing: ESTACIONES_CAMARA[0].bearing,
  maxPitch: 85,
  antialias: true,
  style: {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      // Satélite 1: Esri (limpio, sin textos)
      'sat-esri': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        maxzoom: 18
      },
      // Satélite 2: Google Híbrido (el mismo que cargaste en QGIS)
      'sat-google': {
        type: 'raster',
        tiles: [
          'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        ],
        tileSize: 256,
        maxzoom: 20
      },
      // Relieve 3D del terreno (datos de elevación abiertos)
      'terrain-dem': {
        type: 'raster-dem',
        tiles: [
          'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
        ],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 15
      }
    },
    layers: [
      {
        id: 'capa-esri',
        type: 'raster',
        source: 'sat-esri',
        layout: { visibility: 'visible' }
      },
      {
        id: 'capa-google',
        type: 'raster',
        source: 'sat-google',
        layout: { visibility: 'none' }
      }
    ],
    terrain: {
      source: 'terrain-dem',
      exaggeration: CONFIG.exageracionRelieve
    }
  }
});

// Controles de zoom y brújula en la esquina superior derecha
map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

// Variables de estado interno
let geojsonActual = null;
let loteSeleccionado = null;
let terreno3DActivo = true;
let mojonesVisibles = true;
let usandoGoogleSat = false;


// ----------------------------------------------------------------------------
// BLOQUE 2: UTILIDADES GEOGRÁFICAS (Polígonos, Centroides, Mojones y Colores)
// ----------------------------------------------------------------------------
function obtenerAnilloExterior(feature) {
  const geom = feature.geometry;
  if (geom.type === 'MultiPolygon') return geom.coordinates[0][0];
  return geom.coordinates[0];
}

function calcularCentroide(feature) {
  const coords = obtenerAnilloExterior(feature);
  const total = coords.length > 1 ? coords.length - 1 : coords.length;
  let sumLng = 0;
  let sumLat = 0;

  for (let i = 0; i < total; i++) {
    sumLng += coords[i][0];
    sumLat += coords[i][1];
  }
  return [sumLng / total, sumLat / total];
}

function generarCapaMojones(geojson) {
  const puntos = [];
  geojson.features.forEach((f) => {
    const coords = obtenerAnilloExterior(f);
    for (let i = 0; i < coords.length - 1; i++) {
      puntos.push({
        type: 'Feature',
        properties: { id_lote: f.properties.id_lote },
        geometry: { type: 'Point', coordinates: [coords[i][0], coords[i][1]] }
      });
    }
  });
  return { type: 'FeatureCollection', features: puntos };
}

function generarCapaEtiquetas(geojson) {
  return {
    type: 'FeatureCollection',
    features: geojson.features.map((f) => ({
      type: 'Feature',
      properties: { id_lote: f.properties.id_lote || 'LOTE' },
      geometry: { type: 'Point', coordinates: calcularCentroide(f) }
    }))
  };
}

function expresionColorLotes(idActivo) {
  return [
    'case',
    ['==', ['get', 'id_lote'], idActivo || ''], CONFIG.colores.seleccionado,
    ['==', ['get', 'estado'], 'RESERVADO'], CONFIG.colores.reservado,
    CONFIG.colores.disponible
  ];
}


// ----------------------------------------------------------------------------
// BLOQUE 3: CARGA DE LOTES GEOJSON SOBRE LA MONTAÑA 3D
// ----------------------------------------------------------------------------
async function obtenerGeoJSONInicial() {
  try {
    const resp = await fetch(CONFIG.rutaGeoJSON);
    if (!resp.ok) throw new Error('Archivo lotes.geojson no encontrado en el repo');
    return await resp.json();
  } catch (err) {
    console.warn('Usando respaldo interno mientras subes lotes.geojson:', err.message);
    return GEOJSON_RESPALDO;
  }
}

function cargarLotesEnMapa(geojson, ajustarVista = false) {
  geojsonActual = geojson;
  const mojones = generarCapaMojones(geojson);
  const etiquetas = generarCapaEtiquetas(geojson);

  if (map.getSource('lotes-source')) {
    map.getSource('lotes-source').setData(geojson);
    map.getSource('mojones-source').setData(mojones);
    map.getSource('etiquetas-source').setData(etiquetas);
  } else {
    map.addSource('lotes-source', { type: 'geojson', data: geojson });
    map.addSource('mojones-source', { type: 'geojson', data: mojones });
    map.addSource('etiquetas-source', { type: 'geojson', data: etiquetas });

    // Capa 1: Relleno translúcido pegado al relieve
    map.addLayer({
      id: 'lotes-fill',
      type: 'fill',
      source: 'lotes-source',
      paint: {
        'fill-color': expresionColorLotes(''),
        'fill-opacity': 0.28
      }
    });

    // Capa 2: Líneas de lindero
    map.addLayer({
      id: 'lotes-line',
      type: 'line',
      source: 'lotes-source',
      paint: {
        'line-color': expresionColorLotes(''),
        'line-width': 2.5
      }
    });

    // Capa 3: Puntos de mojones en cada esquina
    map.addLayer({
      id: 'lotes-mojones',
      type: 'circle',
      source: 'mojones-source',
      paint: {
        'circle-radius': 4,
        'circle-color': CONFIG.colores.mojonRelleno,
        'circle-stroke-color': CONFIG.colores.mojonBorde,
        'circle-stroke-width': 2
      }
    });

    // Capa 4: Texto identificador en el centro de cada lote
    map.addLayer({
      id: 'lotes-labels',
      type: 'symbol',
      source: 'etiquetas-source',
      layout: {
        'text-field': ['get', 'id_lote'],
        'text-font': ['Open Sans Semibold', 'Open Sans Regular'],
        'text-size': 12,
        'text-allow-overlap': true
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#050505',
        'text-halo-width': 2
      }
    });

    // Evento: tocar un polígono en el mapa selecciona ese lote
    map.on('click', 'lotes-fill', (e) => {
      if (!e.features || !e.features.length) return;
      const idTocado = e.features[0].properties.id_lote;
      const featureReal = geojsonActual.features.find(
        (f) => f.properties.id_lote === idTocado
      );
      if (featureReal) seleccionarLote(featureReal, true);
    });

    map.on('mouseenter', 'lotes-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'lotes-fill', () => {
      map.getCanvas().style.cursor = '';
    });
  }

  construirBotonesLotes(geojson);

  if (geojson.features.length > 0) {
    seleccionarLote(geojson.features[0], false);
  }

  // Si cargaste un .geojson nuevo con el botón superior, encuadra la cámara en el nuevo predio
  if (ajustarVista && geojson.features.length > 0) {
    const bounds = new maplibregl.LngLatBounds();
    geojson.features.forEach((f) => {
      obtenerAnilloExterior(f).forEach((c) => bounds.extend([c[0], c[1]]));
    });
    map.fitBounds(bounds, { padding: 80, pitch: 55, duration: 1800 });
  }
}

map.on('load', async () => {
  const data = await obtenerGeoJSONInicial();
  cargarLotesEnMapa(data, false);
});


// ----------------------------------------------------------------------------
// BLOQUE 4: CONEXIÓN CON LAS TARJETAS DERECHAS (02 y 03)
// ----------------------------------------------------------------------------
function construirBotonesLotes(geojson) {
  const lotGrid = document.getElementById('lot-grid');
  lotGrid.innerHTML = '';

  geojson.features.forEach((feature) => {
    const p = feature.properties;
    const areaTexto = p.area_m2
      ? Number(p.area_m2).toLocaleString('es-CO') + ' m²'
      : '—';

    const btn = document.createElement('button');
    btn.className = 'lot-item-btn';
    btn.dataset.id = p.id_lote;
    const dotClass = p.estado === 'RESERVADO' ? 'reserved' : 'available';
    btn.innerHTML = `<span><i class="dot ${dotClass}"></i>${p.id_lote}</span><span>${areaTexto}</span>`;

    btn.addEventListener('click', () => seleccionarLote(feature, true));
    lotGrid.appendChild(btn);
  });
}

function actualizarAltitudEnTarjeta(centro) {
  const cotaEl = document.getElementById('lot-cota');
  const elevacion = map.queryTerrainElevation(centro);
  if (elevacion !== null && !isNaN(elevacion)) {
    cotaEl.textContent = `${Math.round(elevacion)} m.s.n.m.`;
  } else {
    cotaEl.textContent = 'Calculando relieve...';
  }
}

function seleccionarLote(feature, volarCamara = true) {
  loteSeleccionado = feature;
  const p = feature.properties;
  const centro = calcularCentroide(feature);
  const vertices = obtenerAnilloExterior(feature).length - 1;

  // Ilumina el lote activo en color cobre
  if (map.getLayer('lotes-fill')) {
    map.setPaintProperty('lotes-fill', 'fill-color', expresionColorLotes(p.id_lote));
    map.setPaintProperty('lotes-line', 'line-color', expresionColorLotes(p.id_lote));
    map.setPaintProperty('lotes-fill', 'fill-opacity', [
      'case',
      ['==', ['get', 'id_lote'], p.id_lote], 0.45,
      0.22
    ]);
  }

  // Actualiza datos de la Tarjeta 03
  document.getElementById('lot-title').textContent = p.nombre || p.id_lote;
  const badge = document.getElementById('lot-badge');
  badge.textContent = p.estado || 'DISPONIBLE';
  badge.style.borderColor =
    p.estado === 'RESERVADO' ? CONFIG.colores.reservado : CONFIG.colores.disponible;
  badge.style.color =
    p.estado === 'RESERVADO' ? CONFIG.colores.reservado : CONFIG.colores.disponible;

  document.getElementById('lot-area').textContent = p.area_m2
    ? `${Number(p.area_m2).toLocaleString('es-CO')} m²`
    : 'Por confirmar';
  document.getElementById('lot-coords').textContent =
    `${centro[1].toFixed(5)}, ${centro[0].toFixed(5)}`;
  document.getElementById('lot-vertices').textContent = `${vertices} esquinas`;
  document.getElementById('lot-price').textContent = p.precio || 'Consultar';

  actualizarAltitudEnTarjeta(centro);

  // Enlace personalizado de WhatsApp
  const mensaje = `Hola M&D Topografía, me interesa recibir la cartera técnica del ${p.nombre || p.id_lote} (${p.area_m2 || ''} m²) en Topocoro.`;
  document.getElementById('btn-whatsapp-lot').href =
    `https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(mensaje)}`;

  // Marca el botón seleccionado en Tarjeta 02
  document.querySelectorAll('.lot-item-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.id === p.id_lote);
  });

  if (volarCamara) {
    document.getElementById('camera-status').textContent = `ENFOQUE PREDIAL — ${p.id_lote}`;
    map.flyTo({
      center: centro,
      zoom: 16.9,
      pitch: 62,
      bearing: -55,
      duration: 1600,
      essential: true
    });
  }
}

map.on('idle', () => {
  if (loteSeleccionado) {
    actualizarAltitudEnTarjeta(calcularCentroide(loteSeleccionado));
  }
});


// ----------------------------------------------------------------------------
// BLOQUE 5: CONTROLES DE CÁMARA, RIEL Y BOTONES DE LA BARRA SUPERIOR
// ----------------------------------------------------------------------------

// Estaciones de la Tarjeta 01
document.querySelectorAll('.station-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.station-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const idx = Number(btn.dataset.step);
    const est = ESTACIONES_CAMARA[idx];
    const pct = Math.round((idx / (ESTACIONES_CAMARA.length - 1)) * 100);
    document.getElementById('flight-slider').value = pct;
    document.getElementById('flight-percent').textContent = `${pct}%`;
    document.getElementById('camera-status').textContent = est.nombre;

    map.flyTo({
      center: est.center,
      zoom: est.zoom,
      pitch: est.pitch,
      bearing: est.bearing,
      duration: 1800
    });
  });
});

// Riel deslizante de cámara 3D
document.getElementById('flight-slider').addEventListener('input', (e) => {
  const pct = Number(e.target.value) / 100;
  document.getElementById('flight-percent').textContent = `${e.target.value}%`;
  document.getElementById('camera-status').textContent = `VUELO EN RIEL (${e.target.value}%)`;

  const tramos = ESTACIONES_CAMARA.length - 1;
  const posExacta = pct * tramos;
  const i = Math.min(Math.floor(posExacta), tramos - 1);
  const t = posExacta - i;

  const A = ESTACIONES_CAMARA[i];
  const B = ESTACIONES_CAMARA[i + 1];
  const lerp = (a, b, f) => a + (b - a) * f;

  map.jumpTo({
    center: [lerp(A.center[0], B.center[0], t), lerp(A.center[1], B.center[1], t)],
    zoom: lerp(A.zoom, B.zoom, t),
    pitch: lerp(A.pitch, B.pitch, t),
    bearing: lerp(A.bearing, B.bearing, t)
  });
});

// Botón "Simular Vista desde el Lote hacia el Embalse"
document.getElementById('btn-pov').addEventListener('click', () => {
  if (!loteSeleccionado) return;
  const centro = calcularCentroide(loteSeleccionado);
  document.getElementById('camera-status').textContent =
    `VISTA MIRADOR — ${loteSeleccionado.properties.id_lote}`;

  map.flyTo({
    center: centro,
    zoom: 17.6,
    pitch: 82,
    bearing: CONFIG.anguloVistaEmbalse,
    duration: 2000
  });
});

// Botón "Centrar Predio"
document.getElementById('btn-reset-cam').addEventListener('click', () => {
  const est = ESTACIONES_CAMARA[0];
  document.getElementById('camera-status').textContent = est.nombre;
  map.flyTo({
    center: est.center,
    zoom: est.zoom,
    pitch: est.pitch,
    bearing: est.bearing,
    duration: 1600
  });
});

// Botón superior: Relieve 3D
document.getElementById('btn-terrain').addEventListener('click', (e) => {
  terreno3DActivo = !terreno3DActivo;
  map.setTerrain(
    terreno3DActivo ? { source: 'terrain-dem', exaggeration: CONFIG.exageracionRelieve } : null
  );
  e.currentTarget.classList.toggle('active', terreno3DActivo);
});

// Botón superior: Mojones
document.getElementById('btn-mojones').addEventListener('click', (e) => {
  mojonesVisibles = !mojonesVisibles;
  if (map.getLayer('lotes-mojones')) {
    map.setLayoutProperty('lotes-mojones', 'visibility', mojonesVisibles ? 'visible' : 'none');
  }
  e.currentTarget.classList.toggle('active', mojonesVisibles);
});

// Botón superior: Cambiar Satélite (Esri / Google)
document.getElementById('btn-sat').addEventListener('click', (e) => {
  usandoGoogleSat = !usandoGoogleSat;
  map.setLayoutProperty('capa-esri', 'visibility', usandoGoogleSat ? 'none' : 'visible');
  map.setLayoutProperty('capa-google', 'visibility', usandoGoogleSat ? 'visible' : 'none');
  e.currentTarget.textContent = usandoGoogleSat ? 'Satélite: Google' : 'Satélite: Esri';
});

// Botón superior: Cargar cualquier .GeoJSON en vivo
document.getElementById('geojson-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const nuevoGeoJSON = JSON.parse(ev.target.result);
      cargarLotesEnMapa(nuevoGeoJSON, true);
      document.getElementById('camera-status').textContent = `ARCHIVO CARGADO: ${file.name}`;
    } catch (err) {
      alert('El archivo seleccionado no es un GeoJSON válido.');
    }
  };
  reader.readAsText(file);
});