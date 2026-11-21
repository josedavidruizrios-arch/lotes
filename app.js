import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================================================
// BLOQUE 1: DATOS DE LOS LOTES Y RUTA DEL ARCHIVO 3D (.GLB)
// -> Edita aquí áreas, precios, pendientes o coordenadas cuando quieras.
// ============================================================================

// Si guardas un archivo 3D en tu carpeta, pon su nombre aquí:
const RUTA_ARCHIVO_GLB = './montana.glb';

const LOTES_DATA = [
  {
    id: 'LOTE 01',
    nombre: 'Lote 01 — Mirador Norte',
    area: '2.500 m²',
    cota: '945 m.s.n.m.',
    pendiente: '14% (Suave)',
    coords: 'N 1.278.410 / E 1.082.190',
    precio: '$145.000.000 COP',
    estado: 'DISPONIBLE',
    pos: [-24, 12, -14], // Posición X, Y, Z sobre la montaña
    size: [15, 13]       // Ancho y largo del polígono del lote
  },
  {
    id: 'LOTE 02',
    nombre: 'Lote 02 — Terraza Central',
    area: '2.850 m²',
    cota: '936 m.s.n.m.',
    pendiente: '11% (Semi-plano)',
    coords: 'N 1.278.385 / E 1.082.215',
    precio: '$165.000.000 COP',
    estado: 'DISPONIBLE',
    pos: [0, 10, -10],
    size: [16, 14]
  },
  {
    id: 'LOTE 03',
    nombre: 'Lote 03 — Balcón del Embalse',
    area: '3.200 m²',
    cota: '928 m.s.n.m.',
    pendiente: '16% (Inclinación media)',
    coords: 'N 1.278.360 / E 1.082.245',
    precio: '$190.000.000 COP',
    estado: 'DISPONIBLE',
    pos: [24, 9, -4],
    size: [16, 14]
  },
  {
    id: 'LOTE 04',
    nombre: 'Lote 04 — Ladera del Bosque',
    area: '2.600 m²',
    cota: '918 m.s.n.m.',
    pendiente: '13% (Suave)',
    coords: 'N 1.278.330 / E 1.082.180',
    precio: '$152.000.000 COP',
    estado: 'RESERVADO',
    pos: [-18, 6, 12],
    size: [15, 13]
  },
  {
    id: 'LOTE 05',
    nombre: 'Lote 05 — Punta Topocoro',
    area: '3.500 m²',
    cota: '910 m.s.n.m.',
    pendiente: '10% (Terraza natural)',
    coords: 'N 1.278.310 / E 1.082.210',
    precio: '$210.000.000 COP',
    estado: 'DISPONIBLE',
    pos: [8, 5, 16],
    size: [17, 14]
  },
  {
    id: 'LOTE 06',
    nombre: 'Lote 06 — Rincón del Agua',
    area: '2.900 m²',
    cota: '904 m.s.n.m.',
    pendiente: '15% (Vista directa)',
    coords: 'N 1.278.295 / E 1.082.255',
    precio: '$175.000.000 COP',
    estado: 'DISPONIBLE',
    pos: [30, 4, 18],
    size: [15, 13]
  }
];

// ============================================================================
// BLOQUE 2: ESTACIONES DEL VIAJE DE CÁMARA
// -> Define desde dónde mira la cámara (pos) y hacia qué punto apunta (target)
// ============================================================================
const ESTACIONES_CAMARA = [
  {
    nombre: 'ESTACIÓN 01 — PANORAMA EMBALSE',
    pos: new THREE.Vector3(0, 62, 105),
    target: new THREE.Vector3(0, 4, 8)
  },
  {
    nombre: 'ESTACIÓN 02 — VÍA Y RELIEVE',
    pos: new THREE.Vector3(-62, 36, 48),
    target: new THREE.Vector3(-4, 8, 0)
  },
  {
    nombre: 'ESTACIÓN 03 — PLANTA DE LOTES',
    pos: new THREE.Vector3(0, 52, 38),
    target: new THREE.Vector3(2, 7, 2)
  },
  {
    nombre: 'ESTACIÓN 04 — TERRAZAS MIRADOR',
    pos: new THREE.Vector3(34, 24, 36),
    target: new THREE.Vector3(6, 7, 4)
  }
];

// ============================================================================
// BLOQUE 3: CONFIGURACIÓN DE LA ESCENA 3D, LUCES Y CONTROLES
// ============================================================================
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090a0c);
scene.fog = new THREE.FogExp2(0x090a0c, 0.0035);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.copy(ESTACIONES_CAMARA[0].pos);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Control orbital para rotar con mouse o dedo en tablet
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.47; // Evita que la cámara baje por debajo de la tierra
controls.target.copy(ESTACIONES_CAMARA[0].target);

// Iluminación del terreno
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffe6c7, 1.3);
sunLight.position.set(70, 95, 45);
scene.add(sunLight);

// Grilla técnica de referencia (Estilo CAD)
const cadGrid = new THREE.GridHelper(180, 45, 0xc49a6c, 0x1d1f24);
cadGrid.position.y = -2;
scene.add(cadGrid);

// ============================================================================
// BLOQUE 4: TERRENO DE PRUEBA + CURVAS DE NIVEL + CARGADOR .GLB
// ============================================================================
let terrenoGroup = new THREE.Group();
scene.add(terrenoGroup);

let superficieMesh = null;   // Malla principal donde se apoyan los lotes
let curvasGroup = null;      // Grupo de líneas de curvas de nivel
let modoOscuro3D = true;

// Función matemática de altura para el terreno de prueba (simula ladera de Topocoro)
function calcularAlturaMontaña(x, z) {
  const pendientePrincipal = Math.max(0, (32 - z) * 0.28);
  const colinas = Math.sin(x * 0.045) * Math.cos(z * 0.045) * 6.5;
  const detalle = Math.sin(x * 0.11 + z * 0.08) * 1.4;
  return pendientePrincipal + colinas + detalle;
}

// Genera la montaña de prueba + espejo de agua del Embalse + curvas de nivel
function generarTerrenoProcedural() {
  terrenoGroup.clear();

  // 1. Geometría de la montaña
  const geo = new THREE.PlaneGeometry(120, 95, 110, 110);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, calcularAlturaMontaña(x, z));
  }
  geo.computeVertexNormals();

  const matTerreno = new THREE.MeshStandardMaterial({
    color: modoOscuro3D ? 0x181a1f : 0xeae6df,
    roughness: 0.88,
    metalness: 0.08,
    polygonOffset: true,
    polygonOffsetFactor: 1
  });

  superficieMesh = new THREE.Mesh(geo, matTerreno);
  terrenoGroup.add(superficieMesh);

  // 2. Curvas de nivel topográficas (Extraídas por altura)
  curvasGroup = new THREE.Group();
  for (let h = 2; h <= 24; h += 2) {
    const esMaestra = h % 6 === 0;
    const puntos = [];
    for (let x = -58; x <= 58; x += 2) {
      for (let z = -45; z <= 45; z += 2) {
        const y = calcularAlturaMontaña(x, z);
        if (Math.abs(y - h) < 0.28) {
          puntos.push(new THREE.Vector3(x, h + 0.08, z));
        }
      }
    }
    if (puntos.length > 1) {
      const dotGeo = new THREE.BufferGeometry().setFromPoints(puntos);
      const dotMat = new THREE.PointsMaterial({
        color: esMaestra ? 0xc49a6c : 0x555b66,
        size: esMaestra ? 0.45 : 0.25
      });
      curvasGroup.add(new THREE.Points(dotGeo, dotMat));
    }
  }
  terrenoGroup.add(curvasGroup);

  // 3. Espejo de agua (Simulación del Embalse de Topocoro al frente)
  const aguaGeo = new THREE.PlaneGeometry(160, 55);
  aguaGeo.rotateX(-Math.PI / 2);
  const aguaMat = new THREE.MeshStandardMaterial({
    color: 0x0d2b3e,
    roughness: 0.2,
    metalness: 0.6,
    transparent: true,
    opacity: 0.85
  });
  const aguaMesh = new THREE.Mesh(aguaGeo, aguaMat);
  aguaMesh.position.set(0, 0.2, 58);
  terrenoGroup.add(aguaMesh);

  crearLotes3D();
}

// Cargador de archivos .GLB (Para usar con modelos descargados o de Blender/Civil 3D)
const gltfLoader = new GLTFLoader();

function cargarArchivoGLB(url) {
  gltfLoader.load(
    url,
    (gltf) => {
      terrenoGroup.clear();
      const model = gltf.scene;

      // Centrar y escalar automáticamente cualquier montaña .GLB que subas
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 110 / Math.max(size.x, size.z);

      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

      superficieMesh = model;
      terrenoGroup.add(model);

      // Re-proyectar los lotes encima del nuevo archivo .GLB
      crearLotes3D();
      document.getElementById('camera-status').textContent = 'MODELO .GLB EXTERNO ACTIVO';
    },
    undefined,
    () => {
      // Si no hay archivo montana.glb en la carpeta, crea el terreno procedural
      generarTerrenoProcedural();
    }
  );
}

// Intenta cargar montana.glb al abrir; si no existe, muestra la montaña de prueba
cargarArchivoGLB(RUTA_ARCHIVO_GLB);

// Evento para el botón "↑ Cargar .GLB de prueba" en la barra superior
document.getElementById('glb-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const urlLocal = URL.createObjectURL(file);
  cargarArchivoGLB(urlLocal);
});

// ============================================================================
// BLOQUE 5: CREACIÓN DE LOTES 3D, MOJONES Y DETECCIÓN DE CLIC (RAYCASTER)
// ============================================================================
const lotes3DGroup = new THREE.Group();
scene.add(lotes3DGroup);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let loteSeleccionado = LOTES_DATA[0];

// Función que mide la altura exacta del terreno (sea procedural o .GLB) en (x, z)
function obtenerAlturaTerrenoEn(x, z) {
  if (!superficieMesh) return 5;
  superficieMesh.updateMatrixWorld(true);
  const rayoVertical = new THREE.Raycaster(
    new THREE.Vector3(x, 150, z),
    new THREE.Vector3(0, -1, 0)
  );
  const impactos = rayoVertical.intersectObject(superficieMesh, true);
  return impactos.length > 0 ? impactos[0].point.y : calcularAlturaMontaña(x, z);
}

function crearLotes3D() {
  lotes3DGroup.clear();

  LOTES_DATA.forEach((lote) => {
    const [x, , z] = lote.pos;
    const [w, d] = lote.size;
    const yCentro = obtenerAlturaTerrenoEn(x, z);
    lote.pos[1] = yCentro; // Guardamos la altura real

    const singleLotGroup = new THREE.Group();

    // 1. Polígono de linderos adaptado a la inclinación de las 4 esquinas
    const esquinas = [
      new THREE.Vector3(x - w / 2, obtenerAlturaTerrenoEn(x - w / 2, z - d / 2) + 0.25, z - d / 2),
      new THREE.Vector3(x + w / 2, obtenerAlturaTerrenoEn(x + w / 2, z - d / 2) + 0.25, z - d / 2),
      new THREE.Vector3(x + w / 2, obtenerAlturaTerrenoEn(x + w / 2, z + d / 2) + 0.25, z + d / 2),
      new THREE.Vector3(x - w / 2, obtenerAlturaTerrenoEn(x - w / 2, z + d / 2) + 0.25, z + d / 2)
    ];

    const lineaGeo = new THREE.BufferGeometry().setFromPoints([...esquinas, esquinas[0]]);
    const esActivo = lote.id === loteSeleccionado.id;
    const colorLindero = esActivo
      ? 0xc49a6c
      : lote.estado === 'DISPONIBLE'
      ? 0x4ade80
      : 0x777777;

    const lineaLindero = new THREE.Line(
      lineaGeo,
      new THREE.LineBasicMaterial({ color: colorLindero })
    );
    singleLotGroup.add(lineaLindero);

    // 2. Mojones rojos/cobre en las 4 esquinas (Detalle para tu amigo topógrafo)
    esquinas.forEach((p) => {
      const mojon = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.9, 0.45),
        new THREE.MeshBasicMaterial({ color: esActivo ? 0xc49a6c : 0xffffff })
      );
      mojon.position.copy(p);
      singleLotGroup.add(mojon);
    });

    // 3. Estaca central clicable para seleccionar el lote en el 3D
    const estacaMat = new THREE.MeshBasicMaterial({ color: colorLindero });
    const estaca = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 5, 8), estacaMat);
    estaca.position.set(x, yCentro + 2.5, z);

    const cabeza = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 3.4), estacaMat);
    cabeza.position.set(x, yCentro + 5.5, z);
    cabeza.userData = { lote }; // Guardamos la referencia del lote para el clic

    singleLotGroup.add(estaca, cabeza);
    lotes3DGroup.add(singleLotGroup);
  });
}

// Detectar clic sobre cualquiera de los lotes en el visor 3D
canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(lotes3DGroup.children, true);
  const hitLote = hits.find((h) => h.object.userData && h.object.userData.lote);

  if (hitLote) {
    seleccionarLote(hitLote.object.userData.lote, true);
  }
});

// ============================================================================
// BLOQUE 6: INTERFAZ DERECHA, MOVIMIENTO DE CÁMARA Y LOOP DE RENDER
// ============================================================================
let animandoCamara = false;
const camPosDestino = new THREE.Vector3();
const camTargetDestino = new THREE.Vector3();

function volarCamaraA(nuevaPos, nuevoTarget, textoEstado) {
  camPosDestino.copy(nuevaPos);
  camTargetDestino.copy(nuevoTarget);
  animandoCamara = true;
  document.getElementById('camera-status').textContent = textoEstado;
}

// Si el usuario gira la montaña manualmente con el mouse/dedo, detenemos el vuelo automático
controls.addEventListener('start', () => {
  animandoCamara = false;
});

// Actualiza la Tarjeta 03 y enfoca el lote seleccionado
function seleccionarLote(lote, moverCamara = true) {
  loteSeleccionado = lote;
  crearLotes3D(); // Redibuja el lote resaltado en color cobre

  // Actualizar textos de la Tarjeta 03
  document.getElementById('lot-title').textContent = lote.nombre;
  document.getElementById('lot-badge').textContent = lote.estado;
  document.getElementById('lot-area').textContent = lote.area;
  document.getElementById('lot-cota').textContent = lote.cota;
  document.getElementById('lot-slope').textContent = lote.pendiente;
  document.getElementById('lot-coords').textContent = lote.coords;
  document.getElementById('lot-price').textContent = lote.precio;

  // Actualizar link directo de WhatsApp con el nombre del lote
  const mensajeWA = `Hola M&D Topografía, me interesa recibir la cartera técnica y disponibilidad del ${lote.nombre} en Altos de Topocoro.`;
  document.getElementById('btn-whatsapp-lot').href =
    `https://wa.me/573000000000?text=${encodeURIComponent(mensajeWA)}`;

  // Resaltar botón activo en la Tarjeta 02
  document.querySelectorAll('.lot-item-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.id === lote.id);
  });

  if (moverCamara) {
    const [x, y, z] = lote.pos;
    volarCamaraA(
      new THREE.Vector3(x + 18, y + 16, z + 22),
      new THREE.Vector3(x, y, z),
      `ENFOQUE PREDIAL — ${lote.id}`
    );
  }
}

// Poblar los 6 botones de lotes en la Tarjeta 02 al iniciar
const lotGrid = document.getElementById('lot-grid');
LOTES_DATA.forEach((lote) => {
  const btn = document.createElement('button');
  btn.className = 'lot-item-btn';
  btn.dataset.id = lote.id;
  const dotClass = lote.estado === 'DISPONIBLE' ? 'available' : 'reserved';
  btn.innerHTML = `<span><i class="dot ${dotClass}"></i>${lote.id}</span><span>${lote.area}</span>`;
  btn.addEventListener('click', () => seleccionarLote(lote, true));
  lotGrid.appendChild(btn);
});
seleccionarLote(LOTES_DATA[0], false);

// Botones de las 4 estaciones (Tarjeta 01)
document.querySelectorAll('.station-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.station-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const index = Number(btn.dataset.step);
    const est = ESTACIONES_CAMARA[index];
    document.getElementById('flight-slider').value = Math.round((index / 3) * 100);
    document.getElementById('flight-percent').textContent = `${Math.round((index / 3) * 100)}%`;
    volarCamaraA(est.pos, est.target, est.nombre);
  });
});

// Deslizador continuo de vuelo ("Riel de cámara")
document.getElementById('flight-slider').addEventListener('input', (e) => {
  const pct = Number(e.target.value) / 100;
  document.getElementById('flight-percent').textContent = `${e.target.value}%`;

  const totalTramos = ESTACIONES_CAMARA.length - 1;
  const tramoExacto = pct * totalTramos;
  const idx = Math.min(Math.floor(tramoExacto), totalTramos - 1);
  const tLocal = tramoExacto - idx;

  const posInterpolada = new THREE.Vector3().lerpVectors(
    ESTACIONES_CAMARA[idx].pos,
    ESTACIONES_CAMARA[idx + 1].pos,
    tLocal
  );
  const targetInterpolado = new THREE.Vector3().lerpVectors(
    ESTACIONES_CAMARA[idx].target,
    ESTACIONES_CAMARA[idx + 1].target,
    tLocal
  );

  volarCamaraA(posInterpolada, targetInterpolado, `VUELO EN RIEL (${e.target.value}%)`);
});

// Botón "Simular Vista Humana (1.70m)" mirando hacia el Embalse
document.getElementById('btn-pov').addEventListener('click', () => {
  const [x, y, z] = loteSeleccionado.pos;
  volarCamaraA(
    new THREE.Vector3(x, y + 1.8, z),       // Altura de los ojos sobre el lote
    new THREE.Vector3(0, y - 3, 65),        // Mirando hacia el agua del embalse
    `VISTA HUMANA (1.70M) DESDE ${loteSeleccionado.id}`
  );
});

// Botones de barra superior (Curvas, Malla TIN, Tema 3D y Centrar)
document.getElementById('btn-contours').addEventListener('click', (e) => {
  if (!curvasGroup) return;
  curvasGroup.visible = !curvasGroup.visible;
  e.currentTarget.classList.toggle('active', curvasGroup.visible);
});

document.getElementById('btn-wireframe').addEventListener('click', (e) => {
  if (!superficieMesh) return;
  let activo = false;
  superficieMesh.traverse((child) => {
    if (child.isMesh) {
      child.material.wireframe = !child.material.wireframe;
      activo = child.material.wireframe;
    }
  });
  e.currentTarget.classList.toggle('active', activo);
});

document.getElementById('btn-theme').addEventListener('click', (e) => {
  modoOscuro3D = !modoOscuro3D;
  scene.background.setHex(modoOscuro3D ? 0x090a0c : 0xf0ede6);
  scene.fog.color.setHex(modoOscuro3D ? 0x090a0c : 0xf0ede6);
  e.currentTarget.textContent = modoOscuro3D ? 'Tema 3D: Oscuro' : 'Tema 3D: Maqueta Blanca';
  if (superficieMesh && superficieMesh.isMesh) {
    superficieMesh.material.color.setHex(modoOscuro3D ? 0x181a1f : 0xffffff);
  }
});

document.getElementById('btn-reset-cam').addEventListener('click', () => {
  volarCamaraA(ESTACIONES_CAMARA[0].pos, ESTACIONES_CAMARA[0].target, ESTACIONES_CAMARA[0].nombre);
});

// Ajuste automático cuando cambias el tamaño de la ventana o giras la tablet
function ajustarPantalla() {
  const cont = canvas.parentElement;
  camera.aspect = cont.clientWidth / cont.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(cont.clientWidth, cont.clientHeight);
}
window.addEventListener('resize', ajustarPantalla);
ajustarPantalla();

// Bucle principal de animación a 60 FPS
function animar() {
  requestAnimationFrame(animar);

  if (animandoCamara) {
    camera.position.lerp(camPosDestino, 0.07);
    controls.target.lerp(camTargetDestino, 0.07);
    if (camera.position.distanceTo(camPosDestino) < 0.15) {
      animandoCamara = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animar();

