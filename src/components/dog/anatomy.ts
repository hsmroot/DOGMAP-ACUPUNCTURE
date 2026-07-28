import * as THREE from "three";

export type Vec3 = [number, number, number];

/** A cross-section of the trunk: centre, dorso-ventral radius, lateral radius. */
export interface Station {
  x: number;
  cy: number;
  ry: number;
  rz: number;
}

/**
 * Trunk profile of a medium short-coated dog (Labrador-ish), measured in the
 * scene's units. x = nose(+) → tail(-), y = up, z = right(+).
 * Withers sit at y ≈ 2.1, elbow line at y ≈ 0.87, loin tucks up to y ≈ 1.16.
 */
export const TRUNK: Station[] = [
  { x: 1.95, cy: 1.72, ry: 0.36, rz: 0.3 },
  { x: 1.7, cy: 1.63, ry: 0.46, rz: 0.37 },
  { x: 1.45, cy: 1.55, ry: 0.56, rz: 0.43 },
  { x: 1.15, cy: 1.45, ry: 0.58, rz: 0.46 },
  { x: 0.85, cy: 1.44, ry: 0.57, rz: 0.47 },
  { x: 0.55, cy: 1.45, ry: 0.55, rz: 0.46 },
  { x: 0.25, cy: 1.48, ry: 0.52, rz: 0.44 },
  { x: -0.05, cy: 1.53, ry: 0.47, rz: 0.41 },
  { x: -0.35, cy: 1.58, ry: 0.42, rz: 0.38 },
  { x: -0.65, cy: 1.58, ry: 0.43, rz: 0.39 },
  { x: -0.95, cy: 1.57, ry: 0.46, rz: 0.44 },
  { x: -1.25, cy: 1.6, ry: 0.43, rz: 0.42 },
  { x: -1.55, cy: 1.63, ry: 0.33, rz: 0.32 },
  { x: -1.8, cy: 1.68, ry: 0.2, rz: 0.2 },
];

/** Interpolated trunk cross-section at any x (clamped to the trunk). */
export function trunkAt(x: number): Station {
  const first = TRUNK[0];
  const last = TRUNK[TRUNK.length - 1];
  if (x >= first.x) return first;
  if (x <= last.x) return last;
  for (let i = 0; i < TRUNK.length - 1; i++) {
    const a = TRUNK[i];
    const b = TRUNK[i + 1];
    if (x <= a.x && x >= b.x) {
      const t = (a.x - x) / (a.x - b.x);
      return {
        x,
        cy: a.cy + (b.cy - a.cy) * t,
        ry: a.ry + (b.ry - a.ry) * t,
        rz: a.rz + (b.rz - a.rz) * t,
      };
    }
  }
  return last;
}

/** Point on the trunk skin. theta = 0 dorsal midline, +π/2 right flank, π ventral. */
export function trunkSurface(x: number, theta: number, offset = 0): Vec3 {
  const s = trunkAt(x);
  return [
    x,
    s.cy + (s.ry + offset) * Math.cos(theta),
    (s.rz + offset) * Math.sin(theta),
  ];
}

/**
 * Push a trunk-region point out onto the skin, keeping its direction from the
 * trunk axis. Used so spinal / costal acupoints land exactly on the back and
 * ribs instead of floating inside or outside the dog.
 */
export function snapToSkin(pos: Vec3, offset = 0.015): Vec3 {
  const [x, y, z] = pos;
  const s = trunkAt(x);
  const dy = y - s.cy;
  const theta = Math.atan2(z / s.rz, dy / s.ry);
  return trunkSurface(x, theta, offset);
}

/** Loft a tube through elliptical cross-sections, with dorsal→ventral colour blend. */
export function loftGeometry(
  stations: { c: Vec3; ry: number; rz: number }[],
  opts: { radial?: number; capStart?: boolean; capEnd?: boolean; dorsal?: string; ventral?: string } = {},
) {
  const radial = opts.radial ?? 40;
  const rows = stations.length;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const dorsal = new THREE.Color(opts.dorsal ?? "#b5854f");
  const ventral = new THREE.Color(opts.ventral ?? "#e6d6bb");
  const tmp = new THREE.Color();

  for (let i = 0; i < rows; i++) {
    const st = stations[i];
    for (let j = 0; j < radial; j++) {
      const theta = (j / radial) * Math.PI * 2;
      pos.push(st.c[0], st.c[1] + st.ry * Math.cos(theta), st.c[2] + st.rz * Math.sin(theta));
      const t = (1 - Math.cos(theta)) / 2; // 0 dorsal → 1 ventral
      tmp.copy(dorsal).lerp(ventral, Math.pow(t, 1.7));
      col.push(tmp.r, tmp.g, tmp.b);
    }
  }
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      const c = (i + 1) * radial + j;
      const d = (i + 1) * radial + ((j + 1) % radial);
      idx.push(a, c, b, b, c, d);
    }
  }
  const capOf = (row: number, flip: boolean) => {
    const st = stations[row];
    const centre = pos.length / 3;
    pos.push(st.c[0], st.c[1], st.c[2]);
    col.push(dorsal.r, dorsal.g, dorsal.b);
    for (let j = 0; j < radial; j++) {
      const a = row * radial + j;
      const b = row * radial + ((j + 1) % radial);
      if (flip) idx.push(centre, b, a);
      else idx.push(centre, a, b);
    }
  };
  if (opts.capStart) capOf(0, false);
  if (opts.capEnd) capOf(rows - 1, true);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}
