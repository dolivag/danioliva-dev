import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Cabeza en 3D hecha de partículas que sigue al cursor.
 *
 * - Si existe public/models/head.glb (el escaneo), se usan los vértices de su malla.
 * - Si no, una cabeza provisional generada por código (para ver el efecto y el ritmo).
 * Sin WebGL o con «reducir movimiento»: una sola imagen fija, sin seguimiento.
 */

const POINTS = 22000;
const CAM_Z = 5.6;

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uSize;
  uniform float uCamZ;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute vec3 aNormal;
  varying float vMix;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // Respira: cada partícula se desplaza un poco, con su propia fase.
    float wob = sin(uTime * 0.9 + aSeed * 40.0) * 0.006;
    // Al mover el cursor, la nube se «agita»; en reposo vuelve a su sitio.
    float shake = sin(uTime * 3.0 + aSeed * 90.0) * 0.045 * uEnergy;
    p += normalize(p) * (wob + shake);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9) * (1.0 / -mv.z);
    vMix = smoothstep(-0.9, 0.9, position.y + position.x * 0.25);
    // Brillo según la distancia a la cámara: lo de delante (la nariz) destaca y lo de atrás se apaga.
    float depth = clamp(1.15 - (-mv.z - (uCamZ - 1.0)) * 0.75, 0.06, 1.0);
    // Y según hacia dónde mira la superficie: el borde (de canto) se apaga y el frente se enciende,
    // si no, el contorno se vería más denso que la cara.
    vec3 n = normalize(normalMatrix * aNormal);
    float facing = clamp(n.z, 0.0, 1.0);
    // Una luz fija arriba a la izquierda: da relieve a la nariz, las cuencas y la barbilla.
    float light = max(dot(n, normalize(vec3(-0.45, 0.5, 0.75))), 0.0);
    vAlpha = depth * mix(0.12, 1.0, facing) * (0.2 + 0.95 * light);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vMix;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.1, d) * vAlpha * 0.85;
    gl_FragColor = vec4(mix(uColorA, uColorB, vMix), a);
  }
`;

/** Generador pseudoaleatorio con semilla: la cabeza provisional es siempre igual. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bump = (x: number, y: number, z: number, cx: number, cy: number, cz: number, w: number) =>
  Math.exp(-((x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2) / (w * w));

/** Punto de la superficie de la cabeza provisional en la dirección (dx, dy, dz). */
function surface(dx: number, dy: number, dz: number): [number, number, number] {
  // Ancho según la altura: más estrecha hacia la mandíbula.
  const jaw = 1 - 0.42 * Math.max(0, -dy - 0.05) ** 1.2;
  let R = 1.0;
  const front = dz > 0 ? dz : 0;
  // Relieves en la parte delantera (en las coordenadas de la dirección).
  R += 0.62 * bump(dx, dy, dz, 0, -0.14, 1, 0.12); // nariz
  R += 0.2 * bump(dx, dy, dz, 0, 0.1, 1, 0.13); // puente de la nariz
  R += 0.14 * bump(dx, dy, dz, 0.3, 0.3, 0.95, 0.14); // ceja derecha
  R += 0.14 * bump(dx, dy, dz, -0.3, 0.3, 0.95, 0.14); // ceja izquierda
  R -= 0.3 * bump(dx, dy, dz, 0.32, 0.2, 0.93, 0.11); // cuenca derecha
  R -= 0.3 * bump(dx, dy, dz, -0.32, 0.2, 0.93, 0.11); // cuenca izquierda
  R += 0.1 * bump(dx, dy, dz, 0, -0.45, 0.95, 0.16); // labios
  R -= 0.08 * bump(dx, dy, dz, 0, -0.52, 0.95, 0.1); // línea de la boca
  R += 0.12 * bump(dx, dy, dz, 0, -0.78, 0.8, 0.2); // barbilla
  R += 0.05 * bump(dx, dy, dz, 0.55, -0.05, 0.75, 0.2); // pómulo derecho
  R += 0.05 * bump(dx, dy, dz, -0.55, -0.05, 0.75, 0.2); // pómulo izquierdo
  R *= 1 + 0.03 * front;
  return [dx * R * 0.74 * jaw, dy * R * 1.12, dz * R * 0.92];
}

type Cloud = { positions: Float32Array; normals: Float32Array };

/** Cabeza provisional: elipsoide con nariz, cejas, cuencas, labios y barbilla. */
function placeholderHead(count: number): Cloud {
  const rand = rng(7);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const eps = 0.01;
  const neck = Math.floor(count * 0.1);
  for (let i = 0; i < count - neck; i++) {
    // Dirección uniforme sobre la esfera, sin la nuca: lo interesante es la cara.
    let d = new THREE.Vector3(0, 0, -1);
    while (d.z < -0.35) {
      const u = rand() * 2 - 1;
      const phi = rand() * Math.PI * 2;
      const r2 = Math.sqrt(1 - u * u);
      d = new THREE.Vector3(r2 * Math.cos(phi), u, r2 * Math.sin(phi));
    }
    const at = (v: THREE.Vector3) => new THREE.Vector3(...surface(v.x, v.y, v.z));
    const p0 = at(d);
    // Dos tangentes a la esfera y la normal de la superficie por diferencias finitas.
    const t1 = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0));
    if (t1.lengthSq() < 1e-6) t1.set(1, 0, 0);
    t1.normalize();
    const t2 = new THREE.Vector3().crossVectors(d, t1).normalize();
    const pa = at(d.clone().addScaledVector(t1, eps).normalize());
    const pb = at(d.clone().addScaledVector(t2, eps).normalize());
    const n = new THREE.Vector3().crossVectors(pa.sub(p0), pb.sub(p0)).normalize();
    if (n.dot(d) < 0) n.negate();
    p0.toArray(positions, i * 3);
    n.toArray(normals, i * 3);
  }
  // Cuello: un cilindro que sale de la barbilla.
  for (let i = count - neck; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const y = -1.05 - rand() * 0.75;
    const r = 0.36 + Math.max(0, -1.4 - y) * 0.5;
    positions.set([Math.cos(a) * r, y, Math.sin(a) * r * 0.9 - 0.05], i * 3);
    normals.set([Math.cos(a), 0, Math.sin(a)], i * 3);
  }
  return { positions, normals };
}

/** Vértices de todas las mallas del GLB, centrados y a escala (cabe en una esfera de radio 1). */
async function loadModelPoints(url: string | undefined, count: number): Promise<Cloud | null> {
  if (!url) return null;
  try {
    const gltf = await new GLTFLoader().loadAsync(url);
    const verts: number[] = [];
    const norms: number[] = [];
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const pos = mesh.geometry.getAttribute('position');
      const nor = mesh.geometry.getAttribute('normal');
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        verts.push(v.x, v.y, v.z);
        // Sin normales en el modelo, se usa la dirección desde el centro (se normaliza al final).
        if (nor) v.fromBufferAttribute(nor, i).applyMatrix3(normalMatrix).normalize();
        norms.push(nor ? v.x : 0, nor ? v.y : 0, nor ? v.z : 0);
      }
    });
    if (verts.length < 9) return null;
    const box = new THREE.Box3().setFromArray(verts);
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(...box.getSize(new THREE.Vector3()).toArray()) / 2;
    const total = verts.length / 3;
    const rand = rng(11);
    const positions = new Float32Array(count * 3);
    const normals = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const k = Math.floor(rand() * total) * 3;
      const x = (verts[k] - center.x) / radius;
      const y = (verts[k + 1] - center.y) / radius;
      const z = (verts[k + 2] - center.z) / radius;
      positions.set([x, y, z], i * 3);
      const hasNormal = norms[k] !== 0 || norms[k + 1] !== 0 || norms[k + 2] !== 0;
      if (hasNormal) normals.set([norms[k], norms[k + 1], norms[k + 2]], i * 3);
      else new THREE.Vector3(x, y, z).normalize().toArray(normals, i * 3);
    }
    return { positions, normals };
  } catch {
    return null;
  }
}

export async function startHead(canvas: HTMLCanvasElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return false;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, -0.15, CAM_Z);

  const cloud = (await loadModelPoints(canvas.dataset.model, POINTS)) ?? placeholderHead(POINTS);
  const seeds = new Float32Array(POINTS);
  const rand = rng(3);
  for (let i = 0; i < POINTS; i++) seeds[i] = rand();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(cloud.positions, 3));
  geometry.setAttribute('aNormal', new THREE.BufferAttribute(cloud.normals, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uSize: { value: 23 },
      uCamZ: { value: CAM_Z },
      uPixelRatio: { value: 1 },
      // Morado de marca (aclarado para fondo oscuro) y turquesa.
      uColorA: { value: new THREE.Color('#8e7ddb') },
      uColorB: { value: new THREE.Color('#2fbcc6') },
    },
  });

  const head = new THREE.Points(geometry, material);
  scene.add(head);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    material.uniforms.uPixelRatio.value = ratio;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  // Cursor normalizado respecto a la ventana entera: la cabeza te mira estés donde estés.
  const target = { x: 0, y: 0 };
  let lastMove = -Infinity;
  let energy = 0;
  let lastX = 0;
  let lastY = 0;
  addEventListener(
    'pointermove',
    (e) => {
      target.x = (e.clientX / innerWidth) * 2 - 1;
      target.y = (e.clientY / innerHeight) * 2 - 1;
      const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      energy = Math.min(1, energy + speed / 400);
      lastX = e.clientX;
      lastY = e.clientY;
      lastMove = performance.now();
    },
    { passive: true },
  );

  const start = performance.now();
  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(canvas);

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = (performance.now() - start) / 1000;
    const idle = performance.now() - lastMove > 3000;
    // En reposo (o sin cursor, en móvil) la cabeza se balancea sola.
    const tx = idle ? Math.sin(t * 0.5) * 0.35 : target.x;
    const ty = idle ? Math.sin(t * 0.37) * 0.12 : target.y;
    head.rotation.y += (tx * 0.75 - head.rotation.y) * 0.07;
    head.rotation.x += (ty * 0.4 - head.rotation.x) * 0.07;
    energy *= 0.94;
    material.uniforms.uTime.value = t;
    material.uniforms.uEnergy.value = energy;
    renderer.render(scene, camera);
  }

  if (reduced) {
    // Una imagen fija, ligeramente girada, sin animación ni seguimiento.
    head.rotation.y = -0.25;
    renderer.render(scene, camera);
  } else {
    frame();
  }
  return true;
}
