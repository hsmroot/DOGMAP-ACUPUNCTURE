import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { TRUNK, trunkAt, trunkSurface } from "./anatomy";

interface Props {
  density?: number;
}

const DORSAL = new THREE.Color("#a97b47");
const VENTRAL = new THREE.Color("#e7d7bb");

function rnd(i: number, s: number) {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface Strand {
  p: THREE.Vector3;
  n: THREE.Vector3;
  len: number;
  c: THREE.Color;
}

function trunkStrands(count: number): Strand[] {
  const out: Strand[] = [];
  const xMin = TRUNK[TRUNK.length - 1].x;
  const xMax = TRUNK[0].x;
  for (let i = 0; i < count; i++) {
    const x = xMin + rnd(i, 1) * (xMax - xMin);
    const theta = rnd(i, 2) * Math.PI * 2;
    const s = trunkAt(x);
    const p = trunkSurface(x, theta, -0.01);
    const n = new THREE.Vector3(0, Math.cos(theta) / s.ry, Math.sin(theta) / s.rz).normalize();
    const t = (1 - Math.cos(theta)) / 2;
    out.push({
      p: new THREE.Vector3(...p),
      n,
      len: 0.075 + rnd(i, 3) * 0.05,
      c: DORSAL.clone().lerp(VENTRAL, Math.pow(t, 1.7)),
    });
  }
  return out;
}

function blobStrands(
  count: number,
  c: [number, number, number],
  r: [number, number, number],
  len: number,
  seed: number,
  color: THREE.Color,
): Strand[] {
  const out: Strand[] = [];
  for (let i = 0; i < count; i++) {
    const u = rnd(i + seed, 5);
    const v = rnd(i + seed, 7);
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const sx = Math.sin(phi) * Math.cos(theta);
    const sy = Math.cos(phi);
    const sz = Math.sin(phi) * Math.sin(theta);
    out.push({
      p: new THREE.Vector3(c[0] + sx * r[0], c[1] + sy * r[1], c[2] + sz * r[2]),
      n: new THREE.Vector3(sx / r[0], sy / r[1], sz / r[2]).normalize(),
      len: len * (0.7 + rnd(i + seed, 9) * 0.6),
      c: color,
    });
  }
  return out;
}

/** Instanced hair coat that follows the dog's actual surface. */
export function DogFur({ density = 1 }: Props) {
  const strands = useMemo(() => {
    const s: Strand[] = [
      ...trunkStrands(6000),
      // neck & head
      ...blobStrands(700, [2.3, 2.02, 0], [0.42, 0.34, 0.28], 0.09, 11, DORSAL),
      ...blobStrands(500, [2.76, 2.44, 0], [0.38, 0.33, 0.32], 0.05, 23, DORSAL),
      // limbs
      ...blobStrands(400, [1.32, 1.38, 0.4], [0.22, 0.4, 0.22], 0.07, 31, DORSAL),
      ...blobStrands(400, [1.32, 1.38, -0.4], [0.22, 0.4, 0.22], 0.07, 37, DORSAL),
      ...blobStrands(450, [-1.15, 1.35, 0.4], [0.28, 0.42, 0.28], 0.08, 41, DORSAL),
      ...blobStrands(450, [-1.15, 1.35, -0.4], [0.28, 0.42, 0.28], 0.08, 43, DORSAL),
      ...blobStrands(200, [1.3, 0.75, 0.4], [0.11, 0.28, 0.11], 0.05, 47, DORSAL),
      ...blobStrands(200, [1.3, 0.75, -0.4], [0.11, 0.28, 0.11], 0.05, 53, DORSAL),
      ...blobStrands(200, [-1.3, 0.72, 0.4], [0.11, 0.28, 0.11], 0.05, 59, DORSAL),
      ...blobStrands(200, [-1.3, 0.72, -0.4], [0.11, 0.28, 0.11], 0.05, 61, DORSAL),
      // tail plume
      ...blobStrands(500, [-2.3, 1.92, 0], [0.5, 0.36, 0.12], 0.11, 67, DORSAL),
    ];
    return s;
  }, []);

  const count = Math.max(1, Math.round(strands.length * density));

  const geometry = useMemo(() => {
    const g = new THREE.ConeGeometry(0.007, 1, 4, 1, true);
    g.translate(0, 0.5, 0);
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.96,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const s = strands[i];
      dummy.position.copy(s.p);
      dir.copy(s.n);
      dir.x -= 0.4; // sweep the coat toward the tail
      dir.normalize();
      dummy.quaternion.setFromUnitVectors(up, dir);
      dummy.scale.set(1, s.len, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, s.c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [strands, count]);

  return <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} />;
}
