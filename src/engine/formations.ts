import type { FormationDef, FormationId, Side } from '../types';
import { FIELD_H, FIELD_W } from './constants';

// Spots are normalized on the HOME half: x 0 (own goal) .. 1 (halfway),
// y 0 (top) .. 1 (bottom). Away side is mirrored horizontally.
export const FORMATIONS: Record<FormationId, FormationDef> = {
  line: {
    id: 'line',
    label: 'Linha',
    spots: [
      { x: 0.55, y: 0.2 },
      { x: 0.55, y: 0.5 },
      { x: 0.55, y: 0.8 },
    ],
  },
  defensive: {
    id: 'defensive',
    label: '1 na frente, 2 atrás',
    spots: [
      { x: 0.72, y: 0.5 },
      { x: 0.3, y: 0.3 },
      { x: 0.3, y: 0.7 },
    ],
  },
  offensive: {
    id: 'offensive',
    label: '2 na frente, 1 atrás',
    spots: [
      { x: 0.75, y: 0.3 },
      { x: 0.75, y: 0.7 },
      { x: 0.35, y: 0.5 },
    ],
  },
  triangle: {
    id: 'triangle',
    label: 'Triângulo neutro',
    spots: [
      { x: 0.3, y: 0.5 },
      { x: 0.62, y: 0.28 },
      { x: 0.62, y: 0.72 },
    ],
  },
};

export const FORMATION_LIST = Object.values(FORMATIONS);

// Random formation (used for the CPU opponent). Kept at module scope so it is
// not treated as an impure call inside React render/handlers.
export function randomFormationId(): FormationId {
  const ids = FORMATION_LIST.map((f) => f.id);
  return ids[Math.floor(Math.random() * ids.length)];
}

// Resolve a formation into absolute field pixel positions for a given side.
export function resolveFormation(
  id: FormationId,
  side: Side,
): Array<{ x: number; y: number }> {
  const def = FORMATIONS[id];
  const halfW = FIELD_W / 2;
  return def.spots.map((s) => {
    const px = s.x * halfW; // distance from own goal line, within own half
    const x = side === 'home' ? px : FIELD_W - px;
    const y = s.y * FIELD_H;
    return { x, y };
  });
}
