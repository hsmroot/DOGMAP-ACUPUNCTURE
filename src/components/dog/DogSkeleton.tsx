import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { trunkAt } from "./anatomy";

interface Props {
  opacity?: number;
}

/** Catmull-rom tube helper geometry */
function useTube(points: [number, number, number][], radius: number, radial = 8) {
  return useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, Math.max(12, points.length * 6), radius, radial, false);
  }, [points, radius, radial]);
}

function Bone({
  position,
  rotation,
  args,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  args: [number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <capsuleGeometry args={[args[0], args[1], 6, 12]} />
    </mesh>
  );
}

/** Rib that hugs the real trunk cross-section at its own station. */
function Rib({ x, floating }: { x: number; floating: boolean }) {
  const s = trunkAt(x);
  const half = (sign: number) =>
    [
      [x, s.cy + s.ry - 0.07, 0.05 * sign],
      [x, s.cy + s.ry * 0.6, s.rz * 0.62 * sign],
      [x - 0.04, s.cy, s.rz * 0.85 * sign],
      [x - 0.09, s.cy - s.ry * 0.6, s.rz * (floating ? 0.72 : 0.6) * sign],
      [x - 0.13, s.cy - s.ry + (floating ? 0.22 : 0.1), (floating ? 0.3 : 0.12) * sign],
    ] as [number, number, number][];

  return (
    <>
      <RibArc pts={half(1)} />
      <RibArc pts={half(-1)} />
    </>
  );
}

function RibArc({ pts }: { pts: [number, number, number][] }) {
  const geom = useTube(pts, 0.028, 6);
  return <mesh geometry={geom} />;
}

function Vertebra({
  pos,
  r,
  spine,
}: {
  pos: [number, number, number];
  r: number;
  spine: number;
}) {
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[r, 12, 10]} />
      </mesh>
      {/* transverse processes */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0, s * (r + 0.03)]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.045, 0.07, 0.035]} />
        </mesh>
      ))}
      {/* dorsal spinous process */}
      {spine > 0 && (
        <mesh position={[0, r + spine / 2, 0]} rotation={[0, 0, 0.16]}>
          <boxGeometry args={[0.05, spine, 0.045]} />
        </mesh>
      )}
    </group>
  );
}

/**
 * Stylised canine skeleton, aligned with DogBody's coordinate space.
 * x = nose (+) to tail (-), y = up, z = right (+).
 */
export function DogSkeleton({ opacity = 1 }: Props) {
  const boneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#f2ead6"),
        roughness: 0.5,
        metalness: 0.04,
        transparent: opacity < 1,
        opacity,
      }),
    [opacity],
  );

  /**
   * One continuous vertebral column: skull base → 7 cervical → 13 thoracic →
   * 7 lumbar → sacrum → 12 caudal (tail) vertebrae.
   */
  const spinePts: [number, number, number][] = [
    // cervical (atlas at the skull, curving down into the withers)
    [2.62, 2.5, 0],
    [2.4, 2.46, 0],
    [2.2, 2.36, 0],
    [2.02, 2.24, 0],
    [1.86, 2.12, 0],
    [1.7, 2.03, 0],
    [1.55, 1.99, 0],
    // thoracic
    [1.35, 1.99, 0],
    [1.1, 2.01, 0],
    [0.85, 2.01, 0],
    [0.6, 2.0, 0],
    [0.35, 2.0, 0],
    [0.1, 2.0, 0],
    [-0.15, 2.0, 0],
    [-0.4, 2.0, 0],
    // lumbar
    [-0.65, 2.01, 0],
    [-0.9, 2.02, 0],
    [-1.15, 2.02, 0],
    [-1.4, 2.0, 0],
    // sacrum
    [-1.62, 1.96, 0],
    [-1.82, 1.9, 0],
    // caudal / tail
    [-2.02, 1.84, 0],
    [-2.24, 1.86, 0],
    [-2.44, 1.98, 0],
    [-2.6, 2.16, 0],
    [-2.74, 2.36, 0],
    [-2.86, 2.52, 0],
  ];
  const spineGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(spinePts.map((p) => new THREE.Vector3(...p)));
    // taper the cord from neck to tail tip
    const steps = 220;
    const geo = new THREE.TubeGeometry(curve, steps, 1, 10, false);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const center = new THREE.Vector3();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = t < 0.72 ? 0.075 - 0.012 * t : 0.06 * (1 - (t - 0.72) / 0.28) + 0.014;
      curve.getPoint(t, center);
      for (let j = 0; j <= 10; j++) {
        const idx = i * 11 + j;
        const v = new THREE.Vector3().fromBufferAttribute(pos, idx);
        v.sub(center).multiplyScalar(r).add(center);
        pos.setXYZ(idx, v.x, v.y, v.z);
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  // one vertebra body per landmark, with a spinous process that is tallest
  // over the withers and fades out along the tail
  const vertebrae = useMemo(
    () =>
      spinePts.map((p, i) => {
        const t = i / (spinePts.length - 1);
        const tail = i >= 21;
        const r = tail ? 0.055 * (1 - (i - 21) / 8) + 0.02 : 0.085 - 0.012 * t;
        const spine = tail ? 0 : i < 7 ? 0.07 : i < 11 ? 0.24 - (i - 7) * 0.02 : 0.15;
        return { p, r, spine };
      }),
    [],
  );

  const sternumGeom = useTube(
    [1.45, 1.15, 0.85, 0.55, 0.3].map(
      (x) => [x, trunkAt(x).cy - trunkAt(x).ry + 0.1, 0] as [number, number, number],
    ),
    0.045,
    8,
  );

  // 13 pairs of ribs, T1 → T13, matching canine anatomy
  const ribs = Array.from({ length: 13 }, (_, i) => 1.3 - i * 0.1375);

  const legBones = (
    x: number,
    z: number,
    upper: [number, number, number],
    mid: [number, number, number],
    lower: [number, number, number],
  ) => (
    <group key={`sk-${x}-${z}`}>
      <Bone position={[x + upper[0], upper[1], z + upper[2]]} args={[0.075, 0.44]} />
      <Bone position={[x + mid[0], mid[1], z + mid[2]]} args={[0.055, 0.36]} />
      <Bone position={[x + lower[0], lower[1], z + lower[2]]} args={[0.04, 0.28]} />
      {/* paw bones */}
      <mesh position={[x + lower[0] + 0.05, 0.07, z + lower[2]]}>
        <boxGeometry args={[0.17, 0.07, 0.13]} />
      </mesh>
    </group>
  );

  const root = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    root.current?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.material = boneMat;
    });
  });

  return (
    <group>
      <group ref={root}>
        {/* spine */}
        <mesh geometry={spineGeom} />
        {vertebrae.map((v, i) => (
          <Vertebra key={`v${i}`} pos={v.p} r={v.r} spine={v.spine} />
        ))}

        {/* ribcage */}
        {ribs.map((x, i) => (
          <Rib key={`r${i}`} x={x} floating={i >= 10} />
        ))}
        <mesh geometry={sternumGeom} />

        {/* scapulae */}
        {[0.44, -0.44].map((z) => (
          <mesh key={`sc${z}`} position={[1.32, 1.86, z]} rotation={[0, 0, -0.35]} scale={[1, 1.35, 0.22]}>
            <sphereGeometry args={[0.3, 16, 12]} />
          </mesh>
        ))}

        {/* pelvis */}
        <mesh position={[-1.3, 1.78, 0]} rotation={[0, 0, 0.35]} scale={[1.25, 0.6, 1.05]}>
          <torusGeometry args={[0.3, 0.075, 10, 20]} />
        </mesh>
        {[0.34, -0.34].map((z) => (
          <mesh key={`il${z}`} position={[-1.05, 1.95, z]} rotation={[0, 0, -0.5]} scale={[1, 1.1, 0.25]}>
            <sphereGeometry args={[0.26, 14, 10]} />
          </mesh>
        ))}

        {/* skull */}
        <mesh position={[2.72, 2.44, 0]} scale={[1.2, 0.98, 0.9]}>
          <sphereGeometry args={[0.3, 20, 16]} />
        </mesh>
        {/* muzzle / maxilla */}
        <mesh position={[3.16, 2.28, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.8]}>
          <capsuleGeometry args={[0.11, 0.32, 8, 14]} />
        </mesh>
        {/* mandible */}
        <mesh position={[3.1, 2.12, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.7]}>
          <capsuleGeometry args={[0.06, 0.34, 6, 12]} />
        </mesh>
        {/* eye socket hints */}
        {[0.16, -0.16].map((z) => (
          <mesh key={`or${z}`} position={[2.88, 2.48, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.075, 0.022, 8, 14]} />
          </mesh>
        ))}

        {/* limbs */}
        {[0.42, -0.42].map((z) =>
          legBones(1.28, z, [-0.02, 1.16, 0], [0.02, 0.72, 0.02], [0.04, 0.32, 0.02]),
        )}
        {[0.42, -0.42].map((z) =>
          legBones(-1.24, z, [0.02, 1.2, 0], [-0.06, 0.74, 0], [-0.16, 0.3, 0]),
        )}
      </group>
    </group>
  );
}
