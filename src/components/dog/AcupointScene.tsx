import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, ContactShadows, Html, Environment } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { DogBody } from "./DogBody";
import { DogSkeleton } from "./DogSkeleton";
import { DogOrgans } from "./DogOrgans";
import { DogFur } from "./DogFur";
import { MERIDIANS, ALL_POINTS, type FlatPoint } from "@/data/meridians";

interface Props {
  activeIds: string[];
  selected: FlatPoint | null;
  hovered: FlatPoint | null;
  onSelect: (p: FlatPoint | null) => void;
  onHover: (p: FlatPoint | null) => void;
  bodyOpacity: number;
  showPaths: boolean;
  showLabels: boolean;
  showSkeleton: boolean;
  showOrgans: boolean;
  showFur: boolean;
}

function PointMesh({
  point,
  state,
  onSelect,
  onHover,
  showLabel,
}: {
  point: FlatPoint;
  state: "idle" | "hover" | "selected";
  onSelect: (p: FlatPoint | null) => void;
  onHover: (p: FlatPoint | null) => void;
  showLabel: boolean;
}) {
  const scale = state === "selected" ? 2.1 : state === "hover" ? 1.6 : 1;
  return (
    <group position={point.pos}>
      <mesh
        scale={scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(point);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(point);
        }}
      >
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial
          color={point.color}
          emissive={new THREE.Color(point.color)}
          emissiveIntensity={state === "idle" ? 0.45 : 1.4}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {state === "selected" && (
        <mesh scale={3.4}>
          <sphereGeometry args={[0.045, 16, 12]} />
          <meshBasicMaterial color={point.color} transparent opacity={0.18} />
        </mesh>
      )}
      {(showLabel || state !== "idle") && (
        <Html center distanceFactor={7} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <span className="point-tag" style={{ borderColor: point.color }}>
            {point.code}
          </span>
        </Html>
      )}
    </group>
  );
}

function MeridianPaths({ activeIds }: { activeIds: string[] }) {
  const paths = useMemo(() => {
    const out: { key: string; pts: [number, number, number][]; color: string }[] = [];
    for (const m of MERIDIANS) {
      if (!activeIds.includes(m.id) || m.id === "extra") continue;
      const mid = m.points.filter((p) => p.midline).map((p) => p.pos);
      if (mid.length > 1) out.push({ key: `${m.id}-M`, pts: mid, color: m.color });
      const lat = m.points.filter((p) => !p.midline);
      if (lat.length > 1) {
        out.push({ key: `${m.id}-R`, pts: lat.map((p) => p.pos), color: m.color });
        out.push({
          key: `${m.id}-L`,
          pts: lat.map((p) => [p.pos[0], p.pos[1], -p.pos[2]] as [number, number, number]),
          color: m.color,
        });
      }
    }
    return out;
  }, [activeIds]);

  return (
    <>
      {paths.map((p) => (
        <Line
          key={p.key}
          points={p.pts}
          color={p.color}
          lineWidth={1.6}
          transparent
          opacity={0.55}
          dashed={false}
        />
      ))}
    </>
  );
}

export function AcupointScene({
  activeIds,
  selected,
  hovered,
  onSelect,
  onHover,
  bodyOpacity,
  showPaths,
  showLabels,
  showSkeleton,
  showOrgans,
  showFur,
}: Props) {
  const visible = useMemo(
    () => ALL_POINTS.filter((p) => activeIds.includes(p.meridianId)),
    [activeIds],
  );

  return (
    <Canvas
      camera={{ position: [6.2, 3.2, 11.5], fov: 40 }}
      dpr={[1, 2]}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#12100e"]} />
      <fog attach="fog" args={["#12100e", 12, 26]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 4]} intensity={1.5} />
      <directionalLight position={[-6, 3, -5]} intensity={0.5} color="#8fb7ff" />
      <Suspense fallback={null}>
        <Environment preset="studio" environmentIntensity={0.35} />
      </Suspense>

      <group position={[-0.2, -1.5, 0]}>
        {showSkeleton && <DogSkeleton />}
        {showOrgans && <DogOrgans />}
        <DogBody opacity={bodyOpacity} />
        {showFur && <DogFur />}
        {showPaths && <MeridianPaths activeIds={activeIds} />}
        {visible.map((p) => (
          <PointMesh
            key={p.key}
            point={p}
            state={
              selected?.key === p.key ? "selected" : hovered?.key === p.key ? "hover" : "idle"
            }
            onSelect={onSelect}
            onHover={onHover}
            showLabel={showLabels && p.side !== "L"}
          />
        ))}
        <ContactShadows position={[0, 0.001, 0]} opacity={0.5} scale={14} blur={2.6} far={4} />
        <gridHelper args={[24, 24, "#3a332b", "#221e19"]} position={[0, 0, 0]} />
      </group>

      <OrbitControls
        makeDefault
        target={[0, 0.15, 0]}
        enablePan={false}
        minDistance={4.5}
        maxDistance={18}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate={!selected}
        autoRotateSpeed={0.35}
      />
    </Canvas>
  );
}