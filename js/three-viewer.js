/* Interactive 3D model viewer (Three.js, ES module).
   Each .model-viewport is wired up. If data-stl points to a reachable .stl file
   it is loaded; otherwise a procedural brass placeholder is built so the viewer
   is interactive out of the box. Drop real exports into assets/models/ to swap. */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const BRASS = () =>
  new THREE.MeshStandardMaterial({
    color: 0xc0913f,
    metalness: 0.92,
    roughness: 0.34,
    envMapIntensity: 1.1,
  });

/* ---------- procedural placeholders ---------- */

function addCyl(group, r1, r2, h, y, seg = 48) {
  const g = new THREE.CylinderGeometry(r1, r2, h, seg);
  const m = new THREE.Mesh(g, BRASS());
  m.position.y = y;
  group.add(m);
  return m;
}

function gearGeometry(radius, teeth, thickness, holeR) {
  const shape = new THREE.Shape();
  const toothH = radius * 0.16;
  const rIn = radius - toothH;
  const step = (Math.PI * 2) / teeth;
  const P = (r, a, first) => {
    const x = r * Math.cos(a), y = r * Math.sin(a);
    first ? shape.moveTo(x, y) : shape.lineTo(x, y);
  };
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    P(rIn, a, i === 0);
    P(radius, a + step * 0.28);
    P(radius, a + step * 0.5);
    P(rIn, a + step * 0.78);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, holeR, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness, bevelEnabled: true,
    bevelThickness: thickness * 0.12, bevelSize: thickness * 0.1, bevelSegments: 2, steps: 1,
  });
  geo.center();
  return geo;
}

function makeGear(radius, teeth, thickness, holeR) {
  const mesh = new THREE.Mesh(gearGeometry(radius, teeth, thickness, holeR), BRASS());
  mesh.rotation.y = Math.PI / 2; // face along the shaft (X) axis
  return mesh;
}

/* Stepped input shaft with two spur gears + keyway — stand-in for the SolidWorks assembly */
function buildShaft() {
  const g = new THREE.Group();
  let y = 0;
  const steps = [
    [0.45, 1.1], [0.72, 0.5], [0.6, 2.3], [0.85, 0.45],
    [0.6, 1.4], [0.5, 0.5], [0.4, 0.9],
  ];
  for (const [r, h] of steps) { addCyl(g, r, r, h, y + h / 2); y += h; }
  const total = y;

  const bigGear = makeGear(1.35, 22, 0.42, 0.62);
  bigGear.position.y = 0.45 + 0.5 + 2.3 + 0.22;
  g.add(bigGear);
  const smallGear = makeGear(0.9, 15, 0.36, 0.5);
  smallGear.position.y = 0.45 + 0.5 + 2.3 + 0.45 + 1.4 + 0.25;
  g.add(smallGear);

  // keyway slot on the main journal
  const key = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.9, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x2c2013, metalness: 0.6, roughness: 0.6 })
  );
  key.position.set(0, 0.45 + 0.5 + 1.0, 0.55);
  g.add(key);

  g.position.y = -total / 2;
  const wrap = new THREE.Group();
  wrap.add(g);
  wrap.rotation.z = Math.PI / 2; // lay horizontal
  return wrap;
}

/* Ball-and-beam balancer — stand-in for the MTE 380 beam-balancing robot */
function buildBeam() {
  const g = new THREE.Group();
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x6b7078, metalness: 0.8, roughness: 0.4 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, metalness: 0.1, roughness: 0.8 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.3, 1.6), darkMetal);
  base.position.y = -1.6;
  g.add(base);

  // two triangular fulcrum supports
  const triShape = new THREE.Shape();
  triShape.moveTo(-0.7, 0); triShape.lineTo(0.7, 0); triShape.lineTo(0, 1.5); triShape.closePath();
  const triGeo = new THREE.ExtrudeGeometry(triShape, { depth: 0.14, bevelEnabled: false });
  triGeo.center();
  [-0.55, 0.55].forEach((z) => {
    const t = new THREE.Mesh(triGeo, darkMetal);
    t.rotation.x = Math.PI / 2; // stand upright, span along z
    t.position.set(0, -0.85, z);
    g.add(t);
  });

  // pivot axle
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.5, 24), BRASS());
  axle.rotation.x = Math.PI / 2;
  axle.position.y = -0.1;
  g.add(axle);

  // the beam, tilted
  const beam = new THREE.Group();
  const plank = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.22, 0.7), wood);
  beam.add(plank);
  const railGeo = new THREE.BoxGeometry(5.2, 0.16, 0.08);
  [-0.28, 0.28].forEach((z) => {
    const rail = new THREE.Mesh(railGeo, BRASS());
    rail.position.set(0, 0.16, z); beam.add(rail);
  });
  [-2.6, 2.6].forEach((x) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.7), darkMetal);
    wall.position.set(x, 0.2, 0); beam.add(wall);
  });
  beam.position.y = 0.1;
  beam.rotation.z = -0.14;
  g.add(beam);

  // the rolling ball
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 40, 32),
    new THREE.MeshStandardMaterial({ color: 0xcfcfce, metalness: 1.0, roughness: 0.18 })
  );
  ball.position.set(1.15, 0.1 + 0.44 + Math.tan(0.14) * 1.15 * -1 + 0.42, 0);
  ball.position.set(1.2, 0.6, 0);
  g.add(ball);

  return g;
}

const BUILDERS = { shaft: buildShaft, beam: buildBeam };

/* ---------- viewer ---------- */

function frame(camera, controls, object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center); // recenter at origin
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const dist = (maxDim / 2) / Math.tan(fov / 2) * 1.5;
  camera.position.set(dist * 0.9, dist * 0.55, dist * 1.05);
  camera.near = dist / 100;
  camera.far = dist * 100;
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
  controls.maxDistance = dist * 3;
  controls.minDistance = dist * 0.4;
  controls.update();
}

function initViewer(viewport, env) {
  const card = viewport.closest(".model-card");
  const loadingEl = viewport.querySelector(".model-loading");

  const scene = new THREE.Scene();
  scene.environment = env;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  viewport.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(42, viewport.clientWidth / viewport.clientHeight, 0.1, 1000);

  // warm three-point lighting
  const key = new THREE.DirectionalLight(0xfff1d8, 2.4); key.position.set(4, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd9a0, 1.4); rim.position.set(-5, 3, -4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xf3e6c8, 0x2a1d10, 0.6));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.1;

  let model = null;

  function place(object) {
    if (model) scene.remove(model);
    model = object;
    scene.add(model);
    frame(camera, controls, model);
    if (loadingEl) loadingEl.remove();
  }

  function placeholder() {
    const build = BUILDERS[viewport.dataset.model] || buildShaft;
    place(build());
    const badge = card && card.querySelector(".model-badge");
    if (badge) badge.textContent = "Interactive preview";
  }

  const stl = viewport.dataset.stl;
  if (stl) {
    new STLLoader().load(
      stl,
      (geo) => {
        geo.computeVertexNormals();
        geo.center();
        place(new THREE.Mesh(geo, BRASS()));
        const badge = card && card.querySelector(".model-badge");
        if (badge) badge.textContent = "SolidWorks export";
      },
      undefined,
      () => placeholder() // no file yet → placeholder
    );
  } else {
    placeholder();
  }

  /* controls */
  if (card) {
    card.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const a = btn.dataset.action;
        if (a === "rotate") { controls.autoRotate = !controls.autoRotate; btn.classList.toggle("on", controls.autoRotate); }
        if (a === "wire" && model) {
          const on = btn.classList.toggle("on");
          model.traverse((o) => { if (o.material) o.material.wireframe = on; });
        }
        if (a === "reset" && model) frame(camera, controls, model);
      });
      if (btn.dataset.action === "rotate") btn.classList.add("on");
    });
  }

  /* resize */
  const ro = new ResizeObserver(() => {
    const w = viewport.clientWidth, h = viewport.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(viewport);

  /* render loop — pause when off-screen */
  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.01 }).observe(viewport);
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    controls.update();
    renderer.render(scene, camera);
  }
  tick();
}

function boot() {
  const viewports = document.querySelectorAll(".model-viewport");
  if (!viewports.length) return;
  // shared image-based environment for believable metal, generated procedurally (offline-safe)
  const tmp = new THREE.WebGLRenderer();
  const pmrem = new THREE.PMREMGenerator(tmp);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  viewports.forEach((v) => initViewer(v, env));
}

boot();
