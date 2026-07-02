import type { Side } from '../types';
import {
  BALL_RESTITUTION,
  DISC_RESTITUTION,
  FIELD_H,
  FIELD_W,
  GOAL_BOTTOM,
  GOAL_TOP,
  LINEAR_DAMPING,
  POST_R,
  STOP_SPEED,
  WALL_RESTITUTION,
} from './constants';
import type { Ball, Body, Disc } from './entities';
import { speed } from './entities';

// Integrate one fixed step: damping + position update + rest snapping.
export function integrate(bodies: Body[], dt: number): void {
  const decay = Math.max(0, 1 - LINEAR_DAMPING * dt);
  for (const b of bodies) {
    b.vx *= decay;
    b.vy *= decay;
    if (speed(b) < STOP_SPEED) {
      b.vx = 0;
      b.vy = 0;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }
}

// Elastic-ish collision resolution between two circles.
function resolvePair(a: Body, b: Body, restitution: number): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let d = Math.hypot(dx, dy);
  const minD = a.r + b.r;
  if (d >= minD || d === 0) {
    if (d === 0) {
      // Perfectly overlapping — nudge apart deterministically.
      b.x += 0.01;
      d = 0.01;
    } else {
      return;
    }
  }
  const nx = dx / d;
  const ny = dy / d;

  // Positional correction split by inverse mass.
  const invA = 1 / a.mass;
  const invB = 1 / b.mass;
  const overlap = minD - d;
  const corr = overlap / (invA + invB);
  a.x -= nx * corr * invA;
  a.y -= ny * corr * invA;
  b.x += nx * corr * invB;
  b.y += ny * corr * invB;

  // Relative velocity along the normal.
  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const velN = rvx * nx + rvy * ny;
  if (velN > 0) return; // already separating

  const j = (-(1 + restitution) * velN) / (invA + invB);
  const ix = j * nx;
  const iy = j * ny;
  a.vx -= ix * invA;
  a.vy -= iy * invA;
  b.vx += ix * invB;
  b.vy += iy * invB;
}

export function collide(discs: Disc[], ball: Ball): void {
  const all: Body[] = [...discs, ball];
  for (let i = 0; i < all.length; i++) {
    for (let k = i + 1; k < all.length; k++) {
      const a = all[i];
      const b = all[k];
      const rest = a === ball || b === ball ? BALL_RESTITUTION : DISC_RESTITUTION;
      resolvePair(a, b, rest);
    }
  }
}

// Bounce a body off the 4 walls. `allowGoal` (ball only) lets it pass through
// the goal mouths so the caller can detect a score.
export function walls(b: Body, allowGoal: boolean): void {
  // Top / bottom walls.
  if (b.y - b.r < 0) {
    b.y = b.r;
    b.vy = Math.abs(b.vy) * WALL_RESTITUTION;
  } else if (b.y + b.r > FIELD_H) {
    b.y = FIELD_H - b.r;
    b.vy = -Math.abs(b.vy) * WALL_RESTITUTION;
  }

  const inMouth = b.y > GOAL_TOP && b.y < GOAL_BOTTOM;
  // Left / right walls.
  if (b.x - b.r < 0) {
    if (!(allowGoal && inMouth)) {
      b.x = b.r;
      b.vx = Math.abs(b.vx) * WALL_RESTITUTION;
    }
  } else if (b.x + b.r > FIELD_W) {
    if (!(allowGoal && inMouth)) {
      b.x = FIELD_W - b.r;
      b.vx = -Math.abs(b.vx) * WALL_RESTITUTION;
    }
  }
}

// Solid goal posts at the two ends of each goal mouth. A body hitting a post
// is pushed out and bounces — so only shots through the front of the mouth
// score; grazing the side of the goal is deflected.
interface StaticCircle {
  x: number;
  y: number;
  r: number;
}

export const GOAL_POSTS: StaticCircle[] = [
  { x: 0, y: GOAL_TOP, r: POST_R },
  { x: 0, y: GOAL_BOTTOM, r: POST_R },
  { x: FIELD_W, y: GOAL_TOP, r: POST_R },
  { x: FIELD_W, y: GOAL_BOTTOM, r: POST_R },
];

function collideStatic(b: Body, s: StaticCircle, rest: number): void {
  const dx = b.x - s.x;
  const dy = b.y - s.y;
  let d = Math.hypot(dx, dy);
  const minD = b.r + s.r;
  if (d >= minD) return;
  let nx: number;
  let ny: number;
  if (d === 0) {
    nx = 1;
    ny = 0;
    d = 0.01;
  } else {
    nx = dx / d;
    ny = dy / d;
  }
  b.x = s.x + nx * minD;
  b.y = s.y + ny * minD;
  const vn = b.vx * nx + b.vy * ny;
  if (vn < 0) {
    b.vx -= (1 + rest) * vn * nx;
    b.vy -= (1 + rest) * vn * ny;
  }
}

export function collidePosts(bodies: Body[]): void {
  for (const b of bodies) {
    for (const s of GOAL_POSTS) collideStatic(b, s, WALL_RESTITUTION);
  }
}

// Returns the scoring side if the ball fully crossed a goal line, else null.
// Home defends the left goal and attacks right; away is mirrored.
export function checkGoal(ball: Ball): Side | null {
  const inMouth = ball.y > GOAL_TOP && ball.y < GOAL_BOTTOM;
  if (!inMouth) return null;
  if (ball.x + ball.r < 0) return 'away'; // ball in left goal -> away scores
  if (ball.x - ball.r > FIELD_W) return 'home'; // right goal -> home scores
  return null;
}

export function allAtRest(bodies: Body[]): boolean {
  return bodies.every((b) => b.vx === 0 && b.vy === 0);
}
