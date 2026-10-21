import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { SceneController } from "./types";

// Two katanas crossed in an X, the way he carries them on his back.
// Built from simple geometry; the polished steel comes from an environment map.

const BLADE_LENGTH = 3.1;

function bladeGeometry(): THREE.ExtrudeGeometry {
  // Side profile of the blade: the spine curves gently (the "sori"), the tip is cut at an angle.
  const curve = (t: number) => Math.sin(t * Math.PI * 0.5) * 0.14;
  const shape = new THREE.Shape();
  const steps = 24;
  shape.moveTo(0, 0);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    shape.lineTo(t * BLADE_LENGTH, curve(t));
  }
  shape.lineTo(BLADE_LENGTH - 0.28, curve(1) + 0.13);
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const width = 0.13 - t * 0.02;
    if (t * BLADE_LENGTH < BLADE_LENGTH - 0.28) shape.lineTo(t * BLADE_LENGTH, curve(t) + width);
  }
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    steps: 1,
  });
  geometry.translate(0, -0.065, -0.009);
  return geometry;
}

function wrapTexture(): THREE.CanvasTexture {
  // The handle wrap: red silk crossing over black, the classic diamond pattern.
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#111111";
  context.fillRect(0, 0, 128, 512);
  context.fillStyle = "#b5121b";
  const diamond = 64;
  for (let y = -diamond; y < 512 + diamond; y += diamond) {
    context.beginPath();
    context.moveTo(64, y);
    context.lineTo(118, y + diamond / 2);
    context.lineTo(64, y + diamond);
    context.lineTo(10, y + diamond / 2);
    context.closePath();
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function buildKatana(materials: Record<"steel" | "brass" | "iron" | "wrap", THREE.Material>, blade: THREE.BufferGeometry) {
  const katana = new THREE.Group();

  const steel = new THREE.Mesh(blade, materials.steel);
  katana.add(steel);

  const habaki = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.07), materials.brass);
  habaki.position.set(0.04, 0, 0);
  katana.add(habaki);

  const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 48), materials.iron);
  tsuba.rotation.z = Math.PI / 2;
  tsuba.position.set(-0.03, 0, 0);
  katana.add(tsuba);

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.95, 32), materials.wrap);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(-0.53, -0.01, 0);
  katana.add(handle);

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), materials.iron);
  cap.rotation.z = Math.PI / 2;
  cap.position.set(-1.0, -0.01, 0);
  katana.add(cap);

  // Centre the sword on its balance point so the X turns around its middle.
  katana.children.forEach((part) => (part.position.x -= 1.0));
  return katana;
}

export function createKatanaScene(canvas: HTMLCanvasElement): SceneController {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;

  const camera = new THREE.PerspectiveCamera(30, 3 / 4, 0.1, 50);
  camera.position.set(0, 0, 9);

  const key = new THREE.DirectionalLight("#ffffff", 2.2);
  key.position.set(3, 4, 5);
  scene.add(key, new THREE.AmbientLight("#ffffff", 0.4));

  const wrap = wrapTexture();
  const materials = {
    steel: new THREE.MeshStandardMaterial({ color: "#e8e8e8", metalness: 1, roughness: 0.18 }),
    brass: new THREE.MeshStandardMaterial({ color: "#c9a14a", metalness: 1, roughness: 0.3 }),
    iron: new THREE.MeshStandardMaterial({ color: "#1b1b1b", metalness: 0.8, roughness: 0.45 }),
    wrap: new THREE.MeshStandardMaterial({ map: wrap, metalness: 0, roughness: 0.75 }),
  };
  const blade = bladeGeometry();

  const pair = new THREE.Group();
  const left = buildKatana(materials, blade);
  const right = buildKatana(materials, blade);
  left.rotation.z = Math.PI / 4;
  right.rotation.z = (Math.PI * 3) / 4;
  right.rotation.x = Math.PI; // flip so both edges face outward
  left.position.z = 0.12;
  right.position.z = -0.12;
  pair.add(left, right);
  scene.add(pair);

  let progress = 0;
  let shown = 0;
  const pointer = new THREE.Vector2();
  const tilt = new THREE.Vector2();

  return {
    setProgress(value) {
      progress = THREE.MathUtils.clamp(value, 0, 1);
    },
    setPointer(x, y) {
      pointer.set(x, y);
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },
    render(time) {
      shown += (progress - shown) * 0.08;
      tilt.lerp(pointer, 0.06);
      // The blades are "drawn" as the chapter arrives: they open from parallel into the X.
      const open = THREE.MathUtils.smoothstep(shown, 0, 1);
      left.rotation.z = Math.PI / 2 - open * (Math.PI / 4);
      right.rotation.z = Math.PI / 2 + open * (Math.PI / 4);
      pair.rotation.y = Math.sin(time * 0.4) * 0.5 + tilt.x * 0.6;
      pair.rotation.x = tilt.y * 0.3;
      pair.position.y = Math.sin(time * 0.8) * 0.05;
      renderer.render(scene, camera);
    },
    dispose() {
      blade.dispose();
      wrap.dispose();
      Object.values(materials).forEach((m) => m.dispose());
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
