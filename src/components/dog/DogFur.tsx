import { useMemo } from "react";
import * as THREE from "three";

interface Props {
  /** 0..1 — how dense/long the coat is */
  density?: number;
}

type Region = {
  /** ellipsoid centre */
  c: [number, number, number];
  /** ellipsoid radii */
  r: [number, number, number];
  /** number of strands */
  n: number;
  len: number;
  color: string;
};

/** Body regions roughly matching DogBody's silhouette. */
const REGIONS: Region[] = [
  { c: [0.15, 1.5, 0], r: [1.6, 0.56, 0.56], n: 2600, len: 0.17, color: "#c9a274" },
  { c: [1.15, 1.42, 0], r: [0.62, 0.66, 0.55], n: 900, len: 0.17, color: "#c9a274" },
  { c: [-1.15, 1.55, 0], r: [0.64, 0.65, 0.6], n: 900, len: 0.19, color: "#c9a274" },
  { c: [1.98, 2.0, 0], r: [0.5, 0.42, 0.34], n: 700, len: 0.22, color: "#b8905f" },
  { c: [2.72, 2.42, 0], r: [0.44, 0.38, 0.36], n: 420, len: 0.1, color: "#c9a274" },
  { c: [-2.35, 2.05, 0], r: [0.55, 0.45, 0.14], n: 520, len: 0.22, color: "#b8905f" },
  // limbs
  { c: [1.26, 1.16, 0.42], r: [0.2, 0.34, 0.2], n: 230, len: 0.12, color: "#c9a274" },
  { c: [1.26, 1.16, -0.42], r: [0.2, 0.34, 0.2], n: 230, len: 0.12, color: "#c9a274" },
  { c: [-1.22, 1.2, 0.42], r: [0.22, 0.36, 0.22], n: 250, len: 0.13, color: "#c9a274" },
  { c: [-1.22, 1.2, -0.42], r: [0.22, 0.36, 0.22], n: 250, len: 0.13, color: "#c9a274" },
  { c: [1.3, 0.72, 0.44], r: [0.14, 0.26, 0.14], n: 140, len: 0.09, color: "#c9a274" },
  { c: [1.3, 0.72, -0.44], r: [0.14, 0.26, 0.14], n: 140, len: 0.09, color: "#c9a274" },
  { c: [-1.3, 0.74, 0.42], r: [0.14, 0.26, 0.14], n: 140, len: 0.09, color: "#c9a274" },
  { c: [-1.3, 0.74, -0.42], r: [0.14, 0.26, 0.14], n: 140, len: 0.09, color: "#c9a274" },
];

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function FurPatch({ region, density }: { region: Region; density: number }) {
  const count = Math.max(1, Math.round(region.n * density));

  const { geometry, material } = useMemo(() => {
    const g = new THREE.ConeGeometry(0.011, 1, 4, 1, true);
    g.translate(0, 0.5, 0); // pivot at root
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(region.color),
      roughness: 0.95,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    return { geometry: g, material: m };
  }, [region.color]);

  const instances = useMemo(() => {
    const arr = new Float32Array(count * 16);
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion();
    const normal = new THREE.Vector3();
    const [cx, cy, cz] = region.c;
    const [rx, ry, rz] = region.r;

    for (let i = 0; i < count; i++) {
      // even-ish sphere sampling
      const u = seeded(i * 3 + 1);
      const v = seeded(i * 3 + 2);
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const sx = Math.sin(phi) * Math.cos(theta);
      const sy = Math.cos(phi);
      const sz = Math.sin(phi) * Math.sin(theta);

      dummy.position.set(cx + sx * rx, cy + sy * ry, cz + sz * rz);
      normal.set(sx / rx, sy / ry, sz / rz).normalize();
      // sweep strands slightly toward the tail
      normal.x -= 0.45;
      normal.normalize();
      q.setFromUnitVectors(up, normal);
      dummy.quaternion.copy(q);

      const jitter = 0.65 + seeded(i * 3 + 3) * 0.7;
      dummy.scale.set(1, region.len * jitter, 1);
      dummy.updateMatrix();
      dummy.matrix.toArray(arr, i * 16);
    }
    return arr;
  }, [count, region]);

  return (
    <instancedMesh
      args={[geometry, material, count]}
      // eslint-disable-next-line react/no-unknown-property
      instanceMatrix-array={instances}
      frustumCulled={false}
    />
  );
}

/** Instanced strand coat layered over the dog's body. */
export function DogFur({ density = 1 }: Props) {
  return (
    <group>
      {REGIONS.map((r, i) => (
        <FurPatch key={i} region={r} density={density} />
      ))}
    </group>
  );
}
