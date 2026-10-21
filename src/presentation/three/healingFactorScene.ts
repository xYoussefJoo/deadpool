import * as THREE from "three";
import type { SceneController } from "./types";

// The healing factor: a mass of red flesh blown into fragments that knit back together as the reader scrolls.
// Every triangle is its own fragment; the vertex shader moves it between "blown apart" and "healed".

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  attribute vec3 aCentroid;
  attribute vec3 aDirection;
  attribute float aRandom;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vBlown;

  vec3 rotateAround(vec3 v, vec3 axis, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
  }

  void main() {
    // Fragments heal in a staggered order, so the wound closes from the inside out.
    float blown = clamp((1.0 - uProgress) * 1.6 - aRandom * 0.6, 0.0, 1.0);
    blown = blown * blown * (3.0 - 2.0 * blown);

    vec3 axis = normalize(aDirection + vec3(0.3, 0.7, 0.1));
    float angle = blown * (2.0 + aRandom * 6.0);
    vec3 local = rotateAround(position - aCentroid, axis, angle) * (1.0 - blown * 0.45);
    vec3 drift = aDirection * blown * (1.2 + aRandom * 2.4);
    float breath = 1.0 + sin(uTime * 1.4 + aRandom * 2.0) * 0.012 * (1.0 - blown);

    vec3 transformed = (aCentroid * breath) + local + drift;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

    vNormal = normalize(normalMatrix * rotateAround(normal, axis, angle));
    vViewPosition = -mvPosition.xyz;
    vBlown = blown;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uRed;
  uniform vec3 uScar;
  uniform vec3 uLight;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vBlown;

  void main() {
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing) normal = -normal;
    vec3 viewDir = normalize(vViewPosition);

    float key = max(dot(normal, normalize(uLight)), 0.0);
    float fill = max(dot(normal, normalize(vec3(-0.6, -0.2, 0.5))), 0.0) * 0.25;
    float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0) * 0.35;
    vec3 halfDir = normalize(normalize(uLight) + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 48.0) * 0.5;

    vec3 base = mix(uRed, uScar, vBlown * 0.8);
    vec3 color = base * (0.18 + key * 0.85 + fill) + vec3(rim + spec);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function buildFragments(): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(1.15, 5).toNonIndexed();
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const vertex = new THREE.Vector3();

  // Lumpy, fleshy surface instead of a perfect ball.
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const n = vertex.clone().normalize();
    const bump = 1 + 0.08 * Math.sin(n.x * 5.1 + n.y * 2.3) + 0.06 * Math.sin(n.y * 7.7 - n.z * 3.1) + 0.04 * Math.sin(n.z * 11.3);
    vertex.copy(n.multiplyScalar(1.15 * bump));
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.computeVertexNormals();

  const triangles = position.count / 3;
  const centroids = new Float32Array(position.count * 3);
  const directions = new Float32Array(position.count * 3);
  const randoms = new Float32Array(position.count);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  for (let t = 0; t < triangles; t++) {
    a.fromBufferAttribute(position, t * 3);
    b.fromBufferAttribute(position, t * 3 + 1);
    c.fromBufferAttribute(position, t * 3 + 2);
    const centroid = a.clone().add(b).add(c).divideScalar(3);
    const direction = centroid
      .clone()
      .normalize()
      .add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.8))
      .normalize();
    const random = Math.random();

    for (let v = 0; v < 3; v++) {
      const i = t * 3 + v;
      centroids.set([centroid.x, centroid.y, centroid.z], i * 3);
      directions.set([direction.x, direction.y, direction.z], i * 3);
      randoms[i] = random;
    }
  }

  geometry.setAttribute("aCentroid", new THREE.BufferAttribute(centroids, 3));
  geometry.setAttribute("aDirection", new THREE.BufferAttribute(directions, 3));
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
  return geometry;
}

export function createHealingFactorScene(canvas: HTMLCanvasElement): SceneController {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 3 / 4, 0.1, 50);
  camera.position.set(0, 0, 7.2);

  const geometry = buildFragments();
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uRed: { value: new THREE.Color("#d71e1e") },
      uScar: { value: new THREE.Color("#3a0710") },
      uLight: { value: new THREE.Vector3(0.6, 0.8, 0.7) },
    },
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

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
      // Ease toward the scroll value so fast scrolling still heals smoothly.
      shown += (progress - shown) * 0.08;
      tilt.lerp(pointer, 0.06);
      material.uniforms.uProgress.value = shown;
      material.uniforms.uTime.value = time;
      mesh.rotation.y = time * 0.25 + tilt.x * 0.5;
      mesh.rotation.x = 0.2 + tilt.y * 0.35;
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
