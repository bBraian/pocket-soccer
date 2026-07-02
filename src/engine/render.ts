import type { GrassSkin, Team } from '../types';
import {
  BALL_R,
  DISC_R,
  FIELD_H,
  FIELD_W,
  GOAL_BOTTOM,
  GOAL_BOX_DEPTH,
  GOAL_TOP,
  MAX_DRAG,
  PENALTY_H,
  PENALTY_W,
} from './constants';
import type { Ball, Disc } from './entities';

interface GrassPalette {
  base: string;
  stripe: string;
  line: string;
}

const GRASS: Record<GrassSkin, GrassPalette> = {
  classic: { base: '#3a8f3a', stripe: '#347f34', line: 'rgba(255,255,255,0.85)' },
  night: { base: '#1f3d2b', stripe: '#1a3324', line: 'rgba(210,230,220,0.7)' },
  dirt: { base: '#a9743f', stripe: '#9c6a39', line: 'rgba(255,248,230,0.75)' },
  beach: { base: '#e2c98a', stripe: '#d8bd78', line: 'rgba(255,255,255,0.8)' },
};

export function drawField(ctx: CanvasRenderingContext2D, grass: GrassSkin): void {
  const p = GRASS[grass];
  ctx.fillStyle = p.base;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);

  // Vertical mowing stripes.
  const stripes = 10;
  const w = FIELD_W / stripes;
  ctx.fillStyle = p.stripe;
  for (let i = 0; i < stripes; i += 2) {
    ctx.fillRect(i * w, 0, w, FIELD_H);
  }

  ctx.strokeStyle = p.line;
  ctx.lineWidth = 3;

  // Outer boundary.
  ctx.strokeRect(6, 6, FIELD_W - 12, FIELD_H - 12);

  // Halfway line + center circle.
  ctx.beginPath();
  ctx.moveTo(FIELD_W / 2, 6);
  ctx.lineTo(FIELD_W / 2, FIELD_H - 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(FIELD_W / 2, FIELD_H / 2, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(FIELD_W / 2, FIELD_H / 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = p.line;
  ctx.fill();

  // Penalty box markings (rectangles drawn on the pitch, around each goal).
  const pbTop = (FIELD_H - PENALTY_H) / 2;
  ctx.strokeRect(6, pbTop, PENALTY_W, PENALTY_H);
  ctx.strokeRect(FIELD_W - 6 - PENALTY_W, pbTop, PENALTY_W, PENALTY_H);

  drawGoalBacks(ctx);
}

// Back layer of the goal boxes — the darkened interior, drawn BEFORE the discs
// so a disc/ball driving into the goal sits on top of it.
function drawGoalBacks(ctx: CanvasRenderingContext2D): void {
  for (const [back, front] of GOAL_BOXES) {
    const x0 = Math.min(back, front);
    const w = Math.abs(front - back);
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x0, GOAL_TOP, w, GOAL_BOTTOM - GOAL_TOP);
    ctx.restore();
  }
}

// Front layer — net mesh + white frame, drawn AFTER the discs/ball so they
// appear inside the net (mesh over them). No solid posts are drawn.
export function drawGoals(ctx: CanvasRenderingContext2D): void {
  for (const [back, front] of GOAL_BOXES) {
    const x0 = Math.min(back, front);
    const w = Math.abs(front - back);
    drawNet(ctx, x0, GOAL_TOP, w, GOAL_BOTTOM - GOAL_TOP);

    ctx.save();
    ctx.strokeStyle = '#f2f2f2';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(front, GOAL_TOP);
    ctx.lineTo(back, GOAL_TOP);
    ctx.moveTo(front, GOAL_BOTTOM);
    ctx.lineTo(back, GOAL_BOTTOM);
    ctx.moveTo(back, GOAL_TOP);
    ctx.lineTo(back, GOAL_BOTTOM);
    ctx.stroke();
    ctx.restore();
  }
}

const GOAL_BOXES: Array<[number, number]> = [
  [0, GOAL_BOX_DEPTH],
  [FIELD_W, FIELD_W - GOAL_BOX_DEPTH],
];

function drawNet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1;
  const step = 9;
  for (let gx = x; gx <= x + w; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.stroke();
  }
  for (let gy = y; gy <= y + h; gy += step) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }
  ctx.restore();
}

// Button-style disc: shows the team crest inside — the real flag (nations, via
// a preloaded image) or a generated two-tone badge with initials (clubs).
// When `dim` (not this team's turn) the disc stays fully opaque but its texture
// is darkened, so the pitch never shows through it.
export function drawDisc(
  ctx: CanvasRenderingContext2D,
  disc: Disc,
  team: Team,
  dim: boolean,
  crest?: HTMLImageElement | null,
): void {
  const R = DISC_R;
  ctx.save();

  // Drop shadow.
  ctx.beginPath();
  ctx.arc(disc.x, disc.y + 3, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();

  // Clip to the disc for the crest fill.
  ctx.save();
  ctx.beginPath();
  ctx.arc(disc.x, disc.y, R, 0, Math.PI * 2);
  ctx.clip();

  const hasImg = !!crest && crest.complete && crest.naturalWidth > 0;
  if (hasImg) {
    // Real flag, filling the disc square.
    ctx.drawImage(crest as HTMLImageElement, disc.x - R, disc.y - R, R * 2, R * 2);
  } else if (team.type === 'nation') {
    // Fallback two-tone while the flag image loads.
    ctx.fillStyle = team.colorPrimary;
    ctx.fillRect(disc.x - R, disc.y - R, R * 2, R);
    ctx.fillStyle = team.colorSecondary;
    ctx.fillRect(disc.x - R, disc.y, R * 2, R);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(disc.x - R, disc.y - 1.5, R * 2, 3);
  } else {
    // Club badge: diagonal two-tone.
    ctx.fillStyle = team.colorPrimary;
    ctx.fillRect(disc.x - R, disc.y - R, R * 2, R * 2);
    ctx.fillStyle = team.colorSecondary;
    ctx.beginPath();
    ctx.moveTo(disc.x - R, disc.y - R);
    ctx.lineTo(disc.x + R, disc.y - R);
    ctx.lineTo(disc.x - R, disc.y + R);
    ctx.closePath();
    ctx.fill();
  }

  // Glossy highlight over the crest.
  const g = ctx.createRadialGradient(disc.x - 8, disc.y - 10, 2, disc.x, disc.y, R);
  g.addColorStop(0, 'rgba(255,255,255,0.4)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.04)');
  g.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = g;
  ctx.fillRect(disc.x - R, disc.y - R, R * 2, R * 2);

  // Club initials on top.
  if (!hasImg && team.type === 'club') {
    const initials = team.badgeInitials ?? team.name.slice(0, 2).toUpperCase();
    const fs = Math.round(initials.length > 2 ? R * 0.6 : R * 0.85);
    ctx.font = `800 ${fs}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeText(initials, disc.x, disc.y + 1);
    ctx.fillStyle = '#fff';
    ctx.fillText(initials, disc.x, disc.y + 1);
  }

  // Darken (not fade) when it is not this team's turn.
  if (dim) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(disc.x - R, disc.y - R, R * 2, R * 2);
  }
  ctx.restore(); // unclip

  // Rim.
  ctx.beginPath();
  ctx.arc(disc.x, disc.y, R, 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.stroke();

  ctx.restore();
}

export function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  img?: HTMLImageElement | null,
): void {
  const R = BALL_R;
  ctx.save();
  // Shadow.
  ctx.beginPath();
  ctx.arc(ball.x, ball.y + 2, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, ball.x - R, ball.y - R, R * 2, R * 2);
  } else {
    // Fallback plain ball while the skin image loads.
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.stroke();
  }
  ctx.restore();
}

// Circular force indicator around the pressed disc: rotating arcs whose color
// ramps green -> yellow -> red with the pull ratio (0..1).
export function drawForceRing(
  ctx: CanvasRenderingContext2D,
  disc: Disc,
  ratio: number,
  rotation: number,
): void {
  const r = DISC_R + 12;
  const color = forceColor(ratio);
  ctx.save();
  ctx.translate(disc.x, disc.y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  // Arc length grows with force.
  const arcs = 3;
  const sweep = (Math.PI / 3) * (0.4 + ratio * 1.4);
  for (let i = 0; i < arcs; i++) {
    const base = (i / arcs) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, base, base + sweep);
    ctx.stroke();
    // Little arrowhead at the arc end.
    const ex = Math.cos(base + sweep) * r;
    const ey = Math.sin(base + sweep) * r;
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}

function forceColor(ratio: number): string {
  // green (120°) -> yellow (60°) -> red (0°)
  const hue = 120 * (1 - Math.min(1, ratio));
  return `hsl(${hue}, 85%, 50%)`;
}

export { MAX_DRAG };
