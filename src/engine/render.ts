import type { BallSkin, GrassSkin, Team } from '../types';
import {
  BALL_R,
  DISC_R,
  FIELD_H,
  FIELD_W,
  GOAL_BOTTOM,
  GOAL_DEPTH,
  GOAL_TOP,
  MAX_DRAG,
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

  // Penalty arcs (semicircles at each goal).
  ctx.beginPath();
  ctx.arc(6, FIELD_H / 2, 90, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(FIELD_W - 6, FIELD_H / 2, 90, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.stroke();

  drawGoals(ctx, p.line);
}

function drawGoals(ctx: CanvasRenderingContext2D, line: string): void {
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  // Left net.
  drawNet(ctx, -GOAL_DEPTH, GOAL_TOP, GOAL_DEPTH, GOAL_BOTTOM - GOAL_TOP);
  // Right net.
  drawNet(ctx, FIELD_W, GOAL_TOP, GOAL_DEPTH, GOAL_BOTTOM - GOAL_TOP);
}

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

// Two-tone disc resembling a flag button, with rim + highlight.
export function drawDisc(
  ctx: CanvasRenderingContext2D,
  disc: Disc,
  team: Team,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Drop shadow.
  ctx.beginPath();
  ctx.arc(disc.x, disc.y + 3, DISC_R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();

  // Clip to disc and paint horizontal bands.
  ctx.save();
  ctx.beginPath();
  ctx.arc(disc.x, disc.y, DISC_R, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = team.colorPrimary;
  ctx.fillRect(disc.x - DISC_R, disc.y - DISC_R, DISC_R * 2, DISC_R);
  ctx.fillStyle = team.colorSecondary;
  ctx.fillRect(disc.x - DISC_R, disc.y, DISC_R * 2, DISC_R);
  // Thin center seam.
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(disc.x - DISC_R, disc.y - 1.5, DISC_R * 2, 3);

  // Glossy highlight.
  const g = ctx.createRadialGradient(
    disc.x - 8,
    disc.y - 10,
    2,
    disc.x,
    disc.y,
    DISC_R,
  );
  g.addColorStop(0, 'rgba(255,255,255,0.45)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  g.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = g;
  ctx.fillRect(disc.x - DISC_R, disc.y - DISC_R, DISC_R * 2, DISC_R * 2);
  ctx.restore();

  // Rim.
  ctx.beginPath();
  ctx.arc(disc.x, disc.y, DISC_R, 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.stroke();

  ctx.restore();
}

export function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  skin: BallSkin,
): void {
  ctx.save();
  // Shadow.
  ctx.beginPath();
  ctx.arc(ball.x, ball.y + 2, BALL_R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.clip();

  if (skin === 'retro') {
    ctx.fillStyle = '#e8842a';
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillRect(ball.x - BALL_R, ball.y - BALL_R, BALL_R * 2, BALL_R * 2);

  ctx.fillStyle = '#1a1a1a';
  if (skin === 'classic') {
    // Central pentagon + surrounding dabs.
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R * 0.42, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(
        ball.x + Math.cos(a) * BALL_R * 0.85,
        ball.y + Math.sin(a) * BALL_R * 0.85,
        BALL_R * 0.18,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  } else if (skin === 'striped') {
    ctx.fillStyle = '#c62828';
    ctx.fillRect(ball.x - BALL_R, ball.y - 5, BALL_R * 2, 3);
    ctx.fillRect(ball.x - BALL_R, ball.y + 2, BALL_R * 2, 3);
  } else if (skin === 'star') {
    ctx.fillStyle = '#1565c0';
    star(ctx, ball.x, ball.y, 5, BALL_R * 0.85, BALL_R * 0.38);
  } else if (skin === 'retro') {
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Rim + gloss.
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function star(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  points: number,
  outer: number,
  inner: number,
): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
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
