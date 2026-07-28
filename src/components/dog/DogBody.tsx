import { useMemo } from "react";
import * as THREE from "three";

interface Props {
  opacity: number;
}

/**
 * Stylised anatomical dog built from primitives.
 * x = nose (+) to tail (-), y = up, z = right (+).
 */
export function DogBody({ opacity }: Props) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c9a274"),
        roughness: 0.88,
        metalness: 0.0,
        transparent: true,
        opacity,
        depthWrite: opacity > 0.85,
        side: THREE.DoubleSide,
      }),
    [opacity],
  );

  // markings / muzzle / paws — creamier fur
  const cream = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#eadfc9"),
        roughness: 0.9,
        transparent: true,
        opacity,
        depthWrite: opacity > 0.85,
      }),
    [opacity],
  );

  // face features stay legible even when tissue is faded
  const faceOpacity = Math.max(opacity, 0.9);
  const wet = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1b1512"),
        roughness: 0.18,
        metalness: 0.05,
        transparent: true,
        opacity: faceOpacity,
      }),
    [faceOpacity],
  );
  const sclera = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#f6f2ea"),
        roughness: 0.16,
        transparent: true,
        opacity: faceOpacity,
      }),
    [faceOpacity],
  );
  const iris = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#6b3f1d"),
        roughness: 0.12,
        transparent: true,
        opacity: faceOpacity,
      }),
    [faceOpacity],
  );
  const tongue = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c9646f"),
        roughness: 0.3,
        transparent: true,
        opacity: faceOpacity,
      }),
    [faceOpacity],
  );

  const leg = (
    x: number,
    z: number,
    upper: [number, number, number],
    mid: [number, number, number],
    lower: [number, number, number],
  ) => (
    <group key={`${x}-${z}`}>
      <mesh position={[x + upper[0], upper[1], z + upper[2]]} material={material}>
        <capsuleGeometry args={[0.17, 0.42, 8, 16]} />
      </mesh>
      <mesh position={[x + mid[0], mid[1], z + mid[2]]} material={material}>
        <capsuleGeometry args={[0.105, 0.34, 8, 16]} />
      </mesh>
      <mesh position={[x + lower[0], lower[1], z + lower[2]]} material={material}>
        <capsuleGeometry args={[0.075, 0.26, 8, 14]} />
      </mesh>
      {/* paw */}
      <mesh position={[x + lower[0] + 0.05, 0.07, z + lower[2]]} scale={[1.3, 0.75, 1]} material={cream}>
        <sphereGeometry args={[0.11, 16, 12]} />
      </mesh>
      {/* toes */}
      {[-0.06, 0, 0.06].map((dz) => (
        <mesh
          key={`toe${dz}`}
          position={[x + lower[0] + 0.13, 0.055, z + lower[2] + dz]}
          material={cream}
        >
          <sphereGeometry args={[0.04, 10, 8]} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group>
      {/* torso */}
      <mesh position={[0.15, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} material={material}>
        <capsuleGeometry args={[0.54, 2.1, 14, 32]} />
      </mesh>
      {/* belly */}
      <mesh position={[0.1, 1.28, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.82]} material={cream}>
        <capsuleGeometry args={[0.4, 1.7, 12, 24]} />
      </mesh>
      {/* chest */}
      <mesh position={[1.15, 1.42, 0]} scale={[1, 1.1, 0.88]} material={material}>
        <sphereGeometry args={[0.6, 28, 20]} />
      </mesh>
      {/* hindquarter */}
      <mesh position={[-1.15, 1.55, 0]} scale={[1, 1.04, 0.94]} material={material}>
        <sphereGeometry args={[0.62, 28, 20]} />
      </mesh>
      {/* neck */}
      <mesh position={[1.98, 2.0, 0]} rotation={[0, 0, -0.62]} material={material}>
        <capsuleGeometry args={[0.31, 0.74, 12, 22]} />
      </mesh>
      {/* throat */}
      <mesh position={[2.12, 1.86, 0]} rotation={[0, 0, -0.7]} scale={[1, 1, 0.8]} material={cream}>
        <capsuleGeometry args={[0.17, 0.5, 10, 16]} />
      </mesh>

      {/* skull */}
      <mesh position={[2.72, 2.42, 0]} scale={[1.15, 1, 0.95]} material={material}>
        <sphereGeometry args={[0.37, 28, 20]} />
      </mesh>
      {/* brow ridge */}
      <mesh position={[2.94, 2.54, 0]} scale={[0.55, 0.4, 0.95]} material={material}>
        <sphereGeometry args={[0.3, 20, 14]} />
      </mesh>
      {/* muzzle */}
      <mesh position={[3.16, 2.24, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.95]} material={cream}>
        <capsuleGeometry args={[0.17, 0.36, 12, 20]} />
      </mesh>
      {/* lower jaw */}
      <mesh position={[3.1, 2.12, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 0.8, 0.8]} material={cream}>
        <capsuleGeometry args={[0.1, 0.32, 10, 16]} />
      </mesh>
      {/* tongue */}
      <mesh position={[3.3, 2.09, 0]} rotation={[0, 0, -0.35]} scale={[1.4, 0.35, 0.7]} material={tongue}>
        <sphereGeometry args={[0.09, 14, 10]} />
      </mesh>
      {/* nose */}
      <mesh position={[3.44, 2.3, 0]} scale={[0.9, 0.85, 1.05]} material={wet}>
        <sphereGeometry args={[0.095, 18, 14]} />
      </mesh>
      {[0.045, -0.045].map((z) => (
        <mesh key={`nos${z}`} position={[3.5, 2.29, z]} material={wet}>
          <sphereGeometry args={[0.028, 10, 8]} />
        </mesh>
      ))}

      {/* eyes */}
      {[0.19, -0.19].map((z) => (
        <group key={`eye${z}`} position={[3.0, 2.52, z]}>
          <mesh scale={[0.85, 1, 1]} material={sclera}>
            <sphereGeometry args={[0.075, 18, 14]} />
          </mesh>
          <mesh position={[0.05, 0, z * 0.12]} material={iris}>
            <sphereGeometry args={[0.045, 16, 12]} />
          </mesh>
          <mesh position={[0.078, 0, z * 0.14]} material={wet}>
            <sphereGeometry args={[0.024, 12, 10]} />
          </mesh>
          {/* eyelid rim */}
          <mesh position={[0.01, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={wet}>
            <torusGeometry args={[0.076, 0.012, 8, 20]} />
          </mesh>
        </group>
      ))}

      {/* floppy ears */}
      {[0.3, -0.3].map((z) => (
        <mesh
          key={`ear${z}`}
          position={[2.55, 2.55, z * 1.05]}
          rotation={[z > 0 ? -0.35 : 0.35, 0, 0.35]}
          scale={[0.4, 1, 0.85]}
          material={material}
        >
          <capsuleGeometry args={[0.16, 0.42, 10, 18]} />
        </mesh>
      ))}

      {/* tail */}
      <mesh position={[-2.05, 1.82, 0]} rotation={[0, 0, 0.75]} material={material}>
        <capsuleGeometry args={[0.11, 0.6, 10, 16]} />
      </mesh>
      <mesh position={[-2.62, 2.16, 0]} rotation={[0, 0, 1.0]} material={material}>
        <capsuleGeometry args={[0.08, 0.55, 10, 16]} />
      </mesh>
      <mesh position={[-2.86, 2.5, 0]} material={cream}>
        <sphereGeometry args={[0.08, 12, 10]} />
      </mesh>

      {/* forelimbs */}
      {[0.42, -0.42].map((z) =>
        leg(1.28, z, [-0.02, 1.16, 0], [0.02, 0.72, 0.02], [0.04, 0.32, 0.02]),
      )}
      {/* hind limbs */}
      {[0.42, -0.42].map((z) =>
        leg(-1.24, z, [0.02, 1.2, 0], [-0.06, 0.74, 0], [-0.16, 0.3, 0]),
      )}
    </group>
  );
}
