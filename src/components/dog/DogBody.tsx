import { useMemo } from "react";
import * as THREE from "three";
import { TRUNK, loftGeometry, type Vec3 } from "./anatomy";

interface Props {
  opacity: number;
}

const FUR_DORSAL = "#a97b47";
const FUR_VENTRAL = "#e7d7bb";

/** limb built from tapered cross-sections so joints read like a real leg */
function limbGeometry(pts: { c: Vec3; r: number }[]) {
  return loftGeometry(
    pts.map((p) => ({ c: p.c, ry: p.r, rz: p.r * 0.86 })),
    { radial: 18, capStart: true, capEnd: true, dorsal: FUR_DORSAL, ventral: "#d9c39f" },
  );
}

/**
 * Realistic short-coated dog built by lofting anatomical cross-sections.
 * x = nose (+) to tail (-), y = up, z = right (+).
 */
export function DogBody({ opacity }: Props) {
  const skin = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.92,
        metalness: 0,
        transparent: true,
        opacity,
        depthWrite: opacity > 0.85,
        side: THREE.DoubleSide,
      }),
    [opacity],
  );

  const plain = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(FUR_DORSAL),
        roughness: 0.92,
        transparent: true,
        opacity,
        depthWrite: opacity > 0.85,
      }),
    [opacity],
  );

  const cream = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(FUR_VENTRAL),
        roughness: 0.94,
        transparent: true,
        opacity,
        depthWrite: opacity > 0.85,
      }),
    [opacity],
  );

  // face stays readable when the tissue layer is faded back
  const faceOpacity = Math.max(opacity, 0.92);
  const mk = (color: string, rough: number) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: rough,
      transparent: true,
      opacity: faceOpacity,
    });
  const wet = useMemo(() => mk("#161110", 0.16), [faceOpacity]);
  const sclera = useMemo(() => mk("#f7f3ec", 0.15), [faceOpacity]);
  const iris = useMemo(() => mk("#5c3617", 0.12), [faceOpacity]);
  const tongueMat = useMemo(() => mk("#c9646f", 0.3), [faceOpacity]);
  const headMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#b98a53"),
        roughness: 0.92,
        transparent: true,
        opacity: Math.max(opacity, 0.55),
        depthWrite: opacity > 0.85,
      }),
    [opacity],
  );

  const trunkGeom = useMemo(
    () =>
      loftGeometry(
        TRUNK.map((s) => ({ c: [s.x, s.cy, 0] as Vec3, ry: s.ry, rz: s.rz })),
        { capStart: true, capEnd: true, dorsal: FUR_DORSAL, ventral: FUR_VENTRAL },
      ),
    [],
  );

  const neckGeom = useMemo(
    () =>
      loftGeometry(
        [
          { c: [1.95, 1.72, 0], ry: 0.36, rz: 0.3 },
          { c: [2.1, 1.85, 0], ry: 0.34, rz: 0.29 },
          { c: [2.28, 2.02, 0], ry: 0.31, rz: 0.26 },
          { c: [2.46, 2.2, 0], ry: 0.28, rz: 0.24 },
          { c: [2.6, 2.32, 0], ry: 0.26, rz: 0.23 },
        ],
        { capEnd: true, dorsal: FUR_DORSAL, ventral: FUR_VENTRAL },
      ),
    [],
  );

  const tailGeom = useMemo(
    () =>
      loftGeometry(
        [
          { c: [-1.8, 1.68, 0], ry: 0.17, rz: 0.17 },
          { c: [-2.05, 1.72, 0], ry: 0.13, rz: 0.13 },
          { c: [-2.32, 1.86, 0], ry: 0.11, rz: 0.11 },
          { c: [-2.58, 2.1, 0], ry: 0.09, rz: 0.09 },
          { c: [-2.78, 2.36, 0], ry: 0.07, rz: 0.07 },
          { c: [-2.88, 2.54, 0], ry: 0.035, rz: 0.035 },
        ],
        { radial: 16, capEnd: true, dorsal: FUR_DORSAL, ventral: "#d9c39f" },
      ),
    [],
  );

  // fore limb: scapula → elbow → carpus → paw (slight caudal slope)
  const foreGeom = useMemo(
    () =>
      limbGeometry([
        { c: [1.34, 1.62, 0], r: 0.24 },
        { c: [1.3, 1.25, 0], r: 0.21 },
        { c: [1.28, 0.95, 0], r: 0.15 },
        { c: [1.3, 0.62, 0], r: 0.1 },
        { c: [1.31, 0.36, 0], r: 0.085 },
        { c: [1.33, 0.14, 0], r: 0.08 },
      ]),
    [],
  );

  // hind limb: stifle forward, hock angled back — the classic canine Z
  const hindGeom = useMemo(
    () =>
      limbGeometry([
        { c: [-1.16, 1.6, 0], r: 0.3 },
        { c: [-1.14, 1.24, 0], r: 0.27 },
        { c: [-1.12, 0.94, 0], r: 0.17 },
        { c: [-1.34, 0.66, 0], r: 0.12 },
        { c: [-1.42, 0.4, 0], r: 0.085 },
        { c: [-1.36, 0.14, 0], r: 0.08 },
      ]),
    [],
  );

  const paw = (x: number, z: number) => (
    <group key={`paw${x}${z}`} position={[x, 0.075, z]}>
      <mesh scale={[1.35, 0.62, 1.05]} material={cream}>
        <sphereGeometry args={[0.115, 18, 14]} />
      </mesh>
      {[-0.06, 0, 0.06].map((dz) => (
        <mesh key={dz} position={[0.09, -0.008, dz]} scale={[1.3, 0.8, 1]} material={cream}>
          <sphereGeometry args={[0.042, 12, 10]} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group>
      <mesh geometry={trunkGeom} material={skin} />
      <mesh geometry={neckGeom} material={skin} />
      <mesh geometry={tailGeom} material={skin} />

      {/* limbs */}
      {[0.4, -0.4].map((z) => (
        <mesh key={`fl${z}`} geometry={foreGeom} position={[0, 0, z]} material={skin} />
      ))}
      {[0.4, -0.4].map((z) => (
        <mesh key={`hl${z}`} geometry={hindGeom} position={[0, 0, z]} material={skin} />
      ))}
      {paw(1.36, 0.4)}
      {paw(1.36, -0.4)}
      {paw(-1.34, 0.4)}
      {paw(-1.34, -0.4)}

      {/* cranium */}
      <mesh position={[2.76, 2.44, 0]} scale={[1.12, 0.98, 0.94]} material={headMat}>
        <sphereGeometry args={[0.33, 30, 22]} />
      </mesh>
      {/* cheeks / masseter */}
      {[0.22, -0.22].map((z) => (
        <mesh key={`ch${z}`} position={[2.86, 2.28, z]} scale={[1.1, 0.9, 0.7]} material={headMat}>
          <sphereGeometry args={[0.17, 18, 14]} />
        </mesh>
      ))}
      {/* stop + muzzle */}
      <mesh position={[3.02, 2.36, 0]} scale={[0.6, 0.5, 0.95]} material={headMat}>
        <sphereGeometry args={[0.26, 20, 16]} />
      </mesh>
      <mesh
        position={[3.2, 2.26, 0]}
        rotation={[0, 0, Math.PI / 2 - 0.06]}
        scale={[1, 1, 0.92]}
        material={headMat}
      >
        <capsuleGeometry args={[0.15, 0.34, 14, 22]} />
      </mesh>
      {/* lower jaw */}
      <mesh
        position={[3.14, 2.13, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[1, 0.8, 0.78]}
        material={cream}
      >
        <capsuleGeometry args={[0.095, 0.3, 12, 18]} />
      </mesh>
      <mesh position={[3.34, 2.1, 0]} rotation={[0, 0, -0.3]} scale={[1.4, 0.32, 0.7]} material={tongueMat}>
        <sphereGeometry args={[0.085, 14, 10]} />
      </mesh>
      {/* nose */}
      <mesh position={[3.47, 2.32, 0]} scale={[0.9, 0.82, 1.08]} material={wet}>
        <sphereGeometry args={[0.09, 20, 16]} />
      </mesh>
      {[0.042, -0.042].map((z) => (
        <mesh key={`n${z}`} position={[3.53, 2.31, z]} material={wet}>
          <sphereGeometry args={[0.025, 10, 8]} />
        </mesh>
      ))}

      {/* eyes, set into the orbit and angled forward */}
      {[0.185, -0.185].map((z) => (
        <group key={`eye${z}`} position={[3.0, 2.5, z]} rotation={[0, z > 0 ? -0.35 : 0.35, 0]}>
          <mesh scale={[0.82, 1, 1]} material={sclera}>
            <sphereGeometry args={[0.07, 18, 14]} />
          </mesh>
          <mesh position={[0.048, 0, 0]} material={iris}>
            <sphereGeometry args={[0.043, 16, 12]} />
          </mesh>
          <mesh position={[0.072, 0, 0]} material={wet}>
            <sphereGeometry args={[0.022, 12, 10]} />
          </mesh>
          <mesh position={[0.008, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={wet}>
            <torusGeometry args={[0.071, 0.011, 8, 20]} />
          </mesh>
        </group>
      ))}
      {/* brows */}
      {[0.19, -0.19].map((z) => (
        <mesh key={`bw${z}`} position={[2.95, 2.62, z]} scale={[1.3, 0.35, 0.8]} material={headMat}>
          <sphereGeometry args={[0.09, 14, 10]} />
        </mesh>
      ))}

      {/* drop ears */}
      {[0.27, -0.27].map((z) => (
        <mesh
          key={`ear${z}`}
          position={[2.64, 2.44, z * 1.15]}
          rotation={[z > 0 ? -0.28 : 0.28, 0, 0.4]}
          scale={[0.34, 1, 0.9]}
          material={plain}
        >
          <capsuleGeometry args={[0.17, 0.4, 10, 18]} />
        </mesh>
      ))}
    </group>
  );
}
