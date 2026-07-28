import { useMemo } from "react";
import * as THREE from "three";

interface Props {
  opacity?: number;
}

function organMat(color: string, opacity: number, rough = 0.35) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: rough,
    metalness: 0.05,
    transparent: opacity < 1,
    opacity,
    side: THREE.DoubleSide,
  });
}

/** Coiled small-intestine tube filling the abdomen. */
function useIntestine(
  turns: number,
  radius: number,
  tubeR: number,
  center: [number, number, number],
  spread: [number, number, number],
  seed = 1,
) {
  return useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = Math.round(turns * 26);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = t * Math.PI * 2 * turns;
      const wob = Math.sin(a * 2.3 + seed) * 0.09;
      pts.push(
        new THREE.Vector3(
          center[0] + Math.cos(a) * (radius + wob) * spread[0],
          center[1] + Math.sin(a * 1.6 + seed) * 0.16 * spread[1],
          center[2] + Math.sin(a) * (radius + wob) * spread[2],
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, steps * 2, tubeR, 10, false);
  }, [turns, radius, tubeR, center, spread, seed]);
}

/**
 * Visceral anatomy: lungs, heart, liver, stomach, spleen, kidneys,
 * small intestine coil, colon and bladder. Same coordinate space as DogBody.
 */
export function DogOrgans({ opacity = 0.95 }: Props) {
  const lung = useMemo(() => organMat("#e08a92", opacity, 0.55), [opacity]);
  const heart = useMemo(() => organMat("#a52632", opacity, 0.3), [opacity]);
  const liver = useMemo(() => organMat("#7d2b28", opacity, 0.35), [opacity]);
  const stomach = useMemo(() => organMat("#c98a63", opacity, 0.4), [opacity]);
  const gut = useMemo(() => organMat("#d79a80", opacity, 0.38), [opacity]);
  const colon = useMemo(() => organMat("#bd7d68", opacity, 0.4), [opacity]);
  const kidney = useMemo(() => organMat("#8e3b46", opacity, 0.33), [opacity]);
  const bladder = useMemo(() => organMat("#d9c26f", opacity * 0.9, 0.25), [opacity]);
  const spleen = useMemo(() => organMat("#6c2440", opacity, 0.35), [opacity]);

  const smallIntestine = useIntestine(3.4, 0.26, 0.07, [-0.4, 1.55, 0], [1.7, 1, 0.95], 0.7);
  const colonGeom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        [-0.9, 1.32, 0.28],
        [0.2, 1.3, 0.3],
        [0.4, 1.66, 0.14],
        [0.1, 1.76, -0.02],
        [-0.55, 1.72, -0.2],
        [-0.95, 1.6, -0.2],
        [-1.2, 1.52, -0.05],
        [-1.45, 1.5, 0],
      ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    );
    return new THREE.TubeGeometry(curve, 160, 0.1, 12, false);
  }, []);

  const trachea = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        [2.85, 2.2, 0],
        [2.35, 2.0, 0],
        [1.9, 1.78, 0],
        [1.5, 1.62, 0],
      ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    );
    return new THREE.TubeGeometry(curve, 60, 0.055, 10, false);
  }, []);

  const esophagus = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        [1.5, 1.62, 0.02],
        [1.0, 1.6, 0.05],
        [0.55, 1.6, 0.08],
      ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    );
    return new THREE.TubeGeometry(curve, 40, 0.04, 8, false);
  }, []);

  return (
    <group>
      {/* lungs */}
      {[0.26, -0.26].map((z) => (
        <group key={`lung${z}`}>
          <mesh position={[0.95, 1.62, z]} scale={[1.5, 0.95, 0.62]} material={lung}>
            <sphereGeometry args={[0.36, 20, 16]} />
          </mesh>
          <mesh position={[0.42, 1.55, z * 0.95]} scale={[1.25, 0.8, 0.55]} material={lung}>
            <sphereGeometry args={[0.32, 18, 14]} />
          </mesh>
        </group>
      ))}
      <mesh position={[1.2, 1.72, 0]} scale={[1, 0.7, 0.5]} material={lung}>
        <sphereGeometry args={[0.3, 16, 12]} />
      </mesh>

      {/* trachea + esophagus */}
      <mesh geometry={trachea} material={stomach} />
      <mesh geometry={esophagus} material={stomach} />

      {/* heart */}
      <group position={[0.92, 1.36, 0.02]} rotation={[0, 0, -0.5]}>
        <mesh scale={[0.95, 1.25, 0.85]} material={heart}>
          <sphereGeometry args={[0.23, 20, 16]} />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI, 0, 0]} material={heart}>
          <coneGeometry args={[0.16, 0.24, 16]} />
        </mesh>
      </group>

      {/* liver */}
      <mesh position={[0.32, 1.35, 0.05]} rotation={[0, 0.2, 0.12]} scale={[0.7, 0.95, 1.25]} material={liver}>
        <sphereGeometry args={[0.36, 20, 16]} />
      </mesh>

      {/* stomach */}
      <mesh position={[0.15, 1.6, -0.16]} rotation={[0.2, 0, 0.5]} scale={[1.4, 0.85, 0.85]} material={stomach}>
        <sphereGeometry args={[0.24, 18, 14]} />
      </mesh>

      {/* spleen */}
      <mesh position={[-0.15, 1.62, -0.36]} rotation={[0, 0, 0.7]} scale={[0.4, 1.5, 0.85]} material={spleen}>
        <sphereGeometry args={[0.2, 14, 12]} />
      </mesh>

      {/* small intestine */}
      <mesh geometry={smallIntestine} material={gut} />
      {/* colon */}
      <mesh geometry={colonGeom} material={colon} />

      {/* kidneys */}
      {[0.24, -0.24].map((z) => (
        <mesh
          key={`kid${z}`}
          position={[-0.85, 1.78, z]}
          rotation={[0, 0, 0.15]}
          scale={[1.35, 0.85, 0.7]}
          material={kidney}
        >
          <sphereGeometry args={[0.15, 16, 12]} />
        </mesh>
      ))}

      {/* bladder */}
      <mesh position={[-1.15, 1.38, 0]} scale={[1.15, 0.95, 1]} material={bladder}>
        <sphereGeometry args={[0.16, 16, 12]} />
      </mesh>
    </group>
  );
}
