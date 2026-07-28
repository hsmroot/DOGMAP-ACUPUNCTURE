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
        color: new THREE.Color("#cbbfa8"),
        roughness: 0.62,
        metalness: 0.06,
        transparent: true,
        opacity,
        depthWrite: opacity > 0.85,
      }),
    [opacity],
  );

  const leg = (
    x: number,
    z: number,
    upper: [number, number, number],
    mid: [number, number, number],
    lower: [number, number, number],
  ) => (
    <group key={`${x}-${z}`}>
      {/* upper */}
      <mesh position={[x + upper[0], upper[1], z + upper[2]]} material={material}>
        <capsuleGeometry args={[0.16, 0.42, 6, 14]} />
      </mesh>
      {/* mid */}
      <mesh position={[x + mid[0], mid[1], z + mid[2]]} material={material}>
        <capsuleGeometry args={[0.1, 0.34, 6, 14]} />
      </mesh>
      {/* cannon */}
      <mesh position={[x + lower[0], lower[1], z + lower[2]]} material={material}>
        <capsuleGeometry args={[0.07, 0.26, 6, 12]} />
      </mesh>
      {/* paw */}
      <mesh position={[x + lower[0] + 0.04, 0.06, z + lower[2]]} material={material}>
        <sphereGeometry args={[0.11, 16, 12]} />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* torso */}
      <mesh position={[0.15, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} material={material}>
        <capsuleGeometry args={[0.52, 2.1, 12, 28]} />
      </mesh>
      {/* chest */}
      <mesh position={[1.15, 1.42, 0]} scale={[1, 1.08, 0.86]} material={material}>
        <sphereGeometry args={[0.58, 24, 18]} />
      </mesh>
      {/* hindquarter */}
      <mesh position={[-1.15, 1.55, 0]} scale={[1, 1.02, 0.92]} material={material}>
        <sphereGeometry args={[0.6, 24, 18]} />
      </mesh>
      {/* neck */}
      <mesh position={[2.0, 2.02, 0]} rotation={[0, 0, -0.62]} material={material}>
        <capsuleGeometry args={[0.3, 0.72, 10, 20]} />
      </mesh>
      {/* skull */}
      <mesh position={[2.72, 2.42, 0]} scale={[1.15, 1, 0.92]} material={material}>
        <sphereGeometry args={[0.36, 24, 18]} />
      </mesh>
      {/* muzzle */}
      <mesh position={[3.18, 2.24, 0]} rotation={[0, 0, Math.PI / 2]} material={material}>
        <capsuleGeometry args={[0.16, 0.34, 8, 16]} />
      </mesh>
      {/* nose */}
      <mesh position={[3.44, 2.28, 0]} material={material}>
        <sphereGeometry args={[0.09, 14, 12]} />
      </mesh>
      {/* ears */}
      {[0.24, -0.24].map((z) => (
        <mesh
          key={`ear${z}`}
          position={[2.44, 2.92, z]}
          rotation={[z > 0 ? -0.28 : 0.28, 0, 0.2]}
          material={material}
        >
          <coneGeometry args={[0.14, 0.5, 4]} />
        </mesh>
      ))}
      {/* tail */}
      <mesh position={[-2.05, 1.82, 0]} rotation={[0, 0, 0.75]} material={material}>
        <capsuleGeometry args={[0.1, 0.6, 8, 14]} />
      </mesh>
      <mesh position={[-2.62, 2.16, 0]} rotation={[0, 0, 1.0]} material={material}>
        <capsuleGeometry args={[0.07, 0.55, 8, 14]} />
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