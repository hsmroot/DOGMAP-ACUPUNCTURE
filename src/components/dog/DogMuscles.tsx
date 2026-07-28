import { useMemo } from "react";
import * as THREE from "three";
import { TRUNK, loftGeometry, type Vec3 } from "./anatomy";

interface Props {
  opacity?: number;
}

/** Superficial musculature layer: sits between the skeleton and the skin. */
export function DogMuscles({ opacity = 1 }: Props) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#9c3f44"),
        roughness: 0.62,
        metalness: 0.02,
        transparent: opacity < 1,
        opacity,
      }),
    [opacity],
  );

  const bandMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#b74a4c"),
        roughness: 0.55,
        transparent: opacity < 1,
        opacity,
      }),
    [opacity],
  );

  const trunkGeom = useMemo(
    () =>
      loftGeometry(
        TRUNK.map((s) => ({ c: [s.x, s.cy, 0] as Vec3, ry: s.ry * 0.9, rz: s.rz * 0.9 })),
        { capStart: true, capEnd: true, dorsal: "#9c3f44", ventral: "#9c3f44" },
      ),
    [],
  );

  const neckGeom = useMemo(
    () =>
      loftGeometry(
        [
          { c: [1.95, 1.72, 0] as Vec3, ry: 0.32, rz: 0.26 },
          { c: [2.12, 1.86, 0] as Vec3, ry: 0.3, rz: 0.25 },
          { c: [2.3, 2.03, 0] as Vec3, ry: 0.27, rz: 0.22 },
          { c: [2.48, 2.2, 0] as Vec3, ry: 0.23, rz: 0.19 },
        ],
        { capEnd: true, dorsal: "#9c3f44", ventral: "#9c3f44" },
      ),
    [],
  );

  const limb = (pts: { c: Vec3; r: number }[]) =>
    loftGeometry(
      pts.map((p) => ({ c: p.c, ry: p.r, rz: p.r * 0.85 })),
      { radial: 16, capStart: true, capEnd: true, dorsal: "#9c3f44", ventral: "#9c3f44" },
    );

  const foreGeom = useMemo(
    () =>
      limb([
        { c: [1.34, 1.6, 0], r: 0.2 },
        { c: [1.3, 1.25, 0], r: 0.18 },
        { c: [1.28, 0.95, 0], r: 0.12 },
        { c: [1.3, 0.62, 0], r: 0.07 },
        { c: [1.31, 0.32, 0], r: 0.055 },
      ]),
    [],
  );

  const hindGeom = useMemo(
    () =>
      limb([
        { c: [-1.16, 1.58, 0], r: 0.26 },
        { c: [-1.14, 1.24, 0], r: 0.23 },
        { c: [-1.12, 0.94, 0], r: 0.13 },
        { c: [-1.34, 0.66, 0], r: 0.08 },
        { c: [-1.42, 0.38, 0], r: 0.055 },
      ]),
    [],
  );

  return (
    <group>
      <mesh geometry={trunkGeom} material={mat} />
      <mesh geometry={neckGeom} material={mat} />
      {[0.4, -0.4].map((z) => (
        <mesh key={`mf${z}`} geometry={foreGeom} position={[0, 0, z]} material={mat} />
      ))}
      {[0.4, -0.4].map((z) => (
        <mesh key={`mh${z}`} geometry={hindGeom} position={[0, 0, z]} material={mat} />
      ))}

      {/* brachiocephalicus — neck to shoulder */}
      {[0.2, -0.2].map((z) => (
        <mesh
          key={`bc${z}`}
          position={[2.0, 1.95, z]}
          rotation={[0, 0, -0.75]}
          scale={[1, 1, 0.45]}
          material={bandMat}
        >
          <capsuleGeometry args={[0.11, 0.6, 8, 16]} />
        </mesh>
      ))}
      {/* trapezius over the withers */}
      {[0.26, -0.26].map((z) => (
        <mesh key={`tz${z}`} position={[1.42, 1.85, z]} scale={[1.5, 0.7, 0.35]} material={bandMat}>
          <sphereGeometry args={[0.3, 18, 14]} />
        </mesh>
      ))}
      {/* latissimus dorsi over the caudal ribs */}
      {[0.36, -0.36].map((z) => (
        <mesh key={`ld${z}`} position={[0.55, 1.6, z]} scale={[2.1, 1.0, 0.28]} material={bandMat}>
          <sphereGeometry args={[0.3, 20, 14]} />
        </mesh>
      ))}
      {/* deltoid / triceps mass */}
      {[0.4, -0.4].map((z) => (
        <mesh key={`tri${z}`} position={[1.2, 1.32, z]} scale={[0.8, 1.3, 0.7]} material={bandMat}>
          <sphereGeometry args={[0.22, 18, 14]} />
        </mesh>
      ))}
      {/* gluteal + biceps femoris */}
      {[0.34, -0.34].map((z) => (
        <mesh key={`gl${z}`} position={[-1.18, 1.62, z]} scale={[1.25, 1.0, 0.6]} material={bandMat}>
          <sphereGeometry args={[0.3, 20, 16]} />
        </mesh>
      ))}
      {[0.4, -0.4].map((z) => (
        <mesh key={`bf${z}`} position={[-1.2, 1.2, z]} scale={[0.9, 1.25, 0.62]} material={bandMat}>
          <sphereGeometry args={[0.26, 18, 14]} />
        </mesh>
      ))}
      {/* masseter */}
      {[0.2, -0.2].map((z) => (
        <mesh key={`ms${z}`} position={[2.85, 2.28, z]} scale={[1, 0.85, 0.5]} material={bandMat}>
          <sphereGeometry args={[0.15, 14, 12]} />
        </mesh>
      ))}
    </group>
  );
}
