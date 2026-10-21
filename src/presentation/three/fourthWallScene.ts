import * as THREE from "three";
import type { SceneController } from "./types";

// The fourth wall: an invisible pane of glass over the hero.
// Scrolling (or a click) cracks it from the impact point, then it shatters toward the viewer.
// The pane is one mesh of jittered triangles; the shaders draw the cracks and move the shards.

const COLUMNS = 16;
const ROWS = 10;

const vertexShader = /* glsl */ `
  uniform float uShatter;
  uniform vec2 uScale;
  uniform vec2 uImpact;
  attribute vec2 aCentroid;
  attribute vec3 aBary;
  attribute float aRandom;
  varying vec3 vBary;
  varying float vDistance;
  varying float vShatter;
  varying float vRandom;
  varying float vFacing;

  vec3 rotateAround(vec3 v, vec3 axis, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
  }

  void main() {
    // Shards near the impact go first.
    float distanceToImpact = distance(aCentroid, uImpact);
    float shatter = clamp(uShatter * 1.8 - distanceToImpact * 0.9 - aRandom * 0.25, 0.0, 1.0);
    shatter = shatter * shatter;

    vec3 centre = vec3(aCentroid * uScale, 0.0);
    vec3 local = vec3(position.xy * uScale, 0.0) - centre;
    vec3 axis = normalize(vec3(aRandom - 0.5, 0.5 - fract(aRandom * 7.31), 0.4));
    local = rotateAround(local, axis, shatter * (3.0 + aRandom * 5.0));

    vec2 away = normalize(aCentroid - uImpact + 0.0001) * uScale;
    vec3 flight = vec3(away * shatter * (0.25 + aRandom * 0.35), shatter * (3.0 + aRandom * 7.0));
    flight.y -= shatter * shatter * 2.5;

    vBary = aBary;
    vDistance = distanceToImpact;
    vShatter = shatter;
    vRandom = aRandom;
    vFacing = abs(rotateAround(vec3(0.0, 0.0, 1.0), axis, shatter * (3.0 + aRandom * 5.0)).z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(centre + local + flight, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uCrack;
  varying vec3 vBary;
  varying float vDistance;
  varying float vShatter;
  varying float vRandom;
  varying float vFacing;

  void main() {
    float nearestEdge = min(min(vBary.x, vBary.y), vBary.z);
    float width = fwidth(nearestEdge) * 1.4;
    float edge = 1.0 - smoothstep(0.0, width, nearestEdge);

    // The crack spreads outward from the impact point.
    float reach = uCrack * 1.25;
    float cracked = 1.0 - smoothstep(reach - 0.06, reach, vDistance);

    vec3 glass = vec3(0.86, 0.9, 0.95);
    vec3 red = vec3(0.84, 0.12, 0.12);
    vec3 tint = vRandom > 0.82 ? red : glass;
    float sheen = pow(1.0 - vFacing, 2.0) * vShatter;

    vec3 color = mix(tint, vec3(1.0), edge * 0.8) + sheen;
    float alpha = edge * cracked * 0.9 + cracked * 0.035 + vShatter * (0.18 + sheen * 0.6);
    alpha *= 1.0 - smoothstep(0.75, 1.0, vShatter);
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

function buildPane(): THREE.BufferGeometry {
  // A jittered grid in -0.5..0.5, split into triangles with random diagonals.
  const points: THREE.Vector2[][] = [];
  for (let row = 0; row <= ROWS; row++) {
    points.push([]);
    for (let column = 0; column <= COLUMNS; column++) {
      const edge = row === 0 || row === ROWS || column === 0 || column === COLUMNS;
      const jitter = edge ? 0 : 0.38;
      points[row].push(
        new THREE.Vector2(
          (column + (Math.random() - 0.5) * jitter) / COLUMNS - 0.5,
          (row + (Math.random() - 0.5) * jitter) / ROWS - 0.5,
        ),
      );
    }
  }

  const positions: number[] = [];
  const centroids: number[] = [];
  const barys: number[] = [];
  const randoms: number[] = [];
  const addTriangle = (a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2) => {
    const cx = (a.x + b.x + c.x) / 3;
    const cy = (a.y + b.y + c.y) / 3;
    const random = Math.random();
    [a, b, c].forEach((p, i) => {
      positions.push(p.x, p.y, 0);
      centroids.push(cx, cy);
      barys.push(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
      randoms.push(random);
    });
  };

  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      const a = points[row][column];
      const b = points[row][column + 1];
      const c = points[row + 1][column + 1];
      const d = points[row + 1][column];
      if (Math.random() > 0.5) {
        addTriangle(a, b, c);
        addTriangle(a, c, d);
      } else {
        addTriangle(a, b, d);
        addTriangle(b, c, d);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aCentroid", new THREE.Float32BufferAttribute(centroids, 2));
  geometry.setAttribute("aBary", new THREE.Float32BufferAttribute(barys, 3));
  geometry.setAttribute("aRandom", new THREE.Float32BufferAttribute(randoms, 1));
  return geometry;
}

export function createFourthWallScene(canvas: HTMLCanvasElement): SceneController {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 100);
  camera.position.set(0, 0, 6);

  const geometry = buildPane();
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uCrack: { value: 0 },
      uShatter: { value: 0 },
      uScale: { value: new THREE.Vector2(1, 1) },
      uImpact: { value: new THREE.Vector2(0.12, 0.08) },
    },
  });
  const pane = new THREE.Mesh(geometry, material);
  scene.add(pane);

  let progress = 0;
  let shownCrack = 0;
  let shownShatter = 0;
  let hitCrack = 0;
  const pointer = new THREE.Vector2();
  const tilt = new THREE.Vector2();

  const smooth = (edge0: number, edge1: number, x: number) => THREE.MathUtils.smoothstep(x, edge0, edge1);

  return {
    setProgress(value) {
      progress = THREE.MathUtils.clamp(value, 0, 1);
    },
    setPointer(x, y) {
      pointer.set(x, y);
    },
    hit(x, y) {
      // x, y in -1..1; the pane's own coordinates run -0.5..0.5.
      material.uniforms.uImpact.value.set(x / 2, y / 2);
      hitCrack = Math.max(hitCrack, 0.45);
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      // Size the pane to exactly fill the view at z = 0.
      const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      material.uniforms.uScale.value.set(viewHeight * camera.aspect, viewHeight);
    },
    render() {
      const crackTarget = Math.max(smooth(0.02, 0.3, progress), hitCrack);
      shownCrack += (crackTarget - shownCrack) * 0.12;
      shownShatter += (smooth(0.32, 0.9, progress) - shownShatter) * 0.12;
      tilt.lerp(pointer, 0.05);
      pane.rotation.y = tilt.x * 0.06;
      pane.rotation.x = -tilt.y * 0.04;
      material.uniforms.uCrack.value = shownCrack;
      material.uniforms.uShatter.value = shownShatter;
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
