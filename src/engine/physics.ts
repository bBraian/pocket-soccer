import type { Side } from '../types';
import {
  BALL_RESTITUTION,
  DISC_RESTITUTION,
  FIELD_H,
  FIELD_W,
  GOAL_BOTTOM,
  GOAL_BOX_DEPTH,
  GOAL_TOP,
  LINEAR_DAMPING,
  MAX_SPIN,
  POST_R,
  SPIN_DAMPING,
  SPIN_FACTOR,
  STOP_SPEED,
  WALL_RESTITUTION,
} from './constants';
import type { Ball, Body, Disc } from './entities';
import { speed } from './entities';

const isBall = (b: Body): b is Ball => 'spin' in b;

// Add spin to the ball from the tangential (sideways) component of an impact.
function addSpin(b: Body, tangentialVel: number): void {
  if (!isBall(b)) return;
  b.spin += (SPIN_FACTOR * tangentialVel) / b.r;
  if (b.spin > MAX_SPIN) b.spin = MAX_SPIN;
  else if (b.spin < -MAX_SPIN) b.spin = -MAX_SPIN;
}

// Integrate one fixed step: damping + position update + rest snapping + spin.
export function integrate(bodies: Body[], dt: number): void {
  const decay = Math.max(0, 1 - LINEAR_DAMPING * dt);
  const spinDecay = Math.max(0, 1 - SPIN_DAMPING * dt);
  for (const b of bodies) {
    b.vx *= decay;
    b.vy *= decay;
    if (speed(b) < STOP_SPEED) {
      b.vx = 0;
      b.vy = 0;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (isBall(b)) {
      b.angle += b.spin * dt;
      b.spin *= spinDecay;
      if (Math.abs(b.spin) < 0.02) b.spin = 0;
    }
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

  // Off-centre (glancing) hits spin the ball. Tangent t = perpendicular to n.
  const velT = rvx * -ny + rvy * nx;
  addSpin(b, velT);
  addSpin(a, -velT);
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

// Bounce a body off the 4 field edges. The left/right edges are the goal
// backs (nets) and always block — the goal opening is guarded separately by
// the goal-box rails and posts, so nothing leaves the pitch.
export function walls(b: Body): void {
  if (b.y - b.r < 0) {
    b.y = b.r;
    b.vy = Math.abs(b.vy) * WALL_RESTITUTION;
    addSpin(b, b.vx);
  } else if (b.y + b.r > FIELD_H) {
    b.y = FIELD_H - b.r;
    b.vy = -Math.abs(b.vy) * WALL_RESTITUTION;
    addSpin(b, -b.vx);
  }
  if (b.x - b.r < 0) {
    b.x = b.r;
    b.vx = Math.abs(b.vx) * WALL_RESTITUTION;
    addSpin(b, -b.vy);
  } else if (b.x + b.r > FIELD_W) {
    b.x = FIELD_W - b.r;
    b.vx = -Math.abs(b.vx) * WALL_RESTITUTION;
    addSpin(b, b.vy);
  }
}

// Resolve a body against a solid point of radius `pr` (pr = 0 => a line point).
function collidePoint(b: Body, px: number, py: number, pr: number, rest: number): void {
  const dx = b.x - px;
  const dy = b.y - py;
  let d = Math.hypot(dx, dy);
  const minD = b.r + pr;
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
  b.x = px + nx * minD;
  b.y = py + ny * minD;
  const vn = b.vx * nx + b.vy * ny;
  if (vn < 0) {
    b.vx -= (1 + rest) * vn * nx;
    b.vy -= (1 + rest) * vn * ny;
  }
}

// Circle vs. line segment — resolve against the nearest point on the segment.
function collideSegment(
  b: Body,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  rest: number,
): void {
  const abx = bx - ax;
  const aby = by - ay;
  const len2 = abx * abx + aby * aby;
  let t = len2 ? ((b.x - ax) * abx + (b.y - ay) * aby) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  collidePoint(b, ax + abx * t, ay + aby * t, 0, rest);
}

// The two goal boxes. Each has: two side rails (top/bottom, running from the
// end line to the front goal line) that block from inside and outside, and two
// solid posts at the front opening. The back (end line) is handled by walls().
const GOALS = [
  { back: 0, front: GOAL_BOX_DEPTH }, // left goal
  { back: FIELD_W, front: FIELD_W - GOAL_BOX_DEPTH }, // right goal
];

export function collideGoals(bodies: Body[]): void {
  for (const b of bodies) {
    for (const g of GOALS) {
      // Side rails.
      collideSegment(b, g.back, GOAL_TOP, g.front, GOAL_TOP, WALL_RESTITUTION);
      collideSegment(b, g.back, GOAL_BOTTOM, g.front, GOAL_BOTTOM, WALL_RESTITUTION);
      // Front posts.
      collidePoint(b, g.front, GOAL_TOP, POST_R, WALL_RESTITUTION);
      collidePoint(b, g.front, GOAL_BOTTOM, POST_R, WALL_RESTITUTION);
    }
  }
}

// Returns the scoring side if the ball fully crossed a goal line, else null.
// Home defends the left goal and attacks right; away is mirrored.
export function checkGoal(ball: Ball): Side | null {
  const inMouth = ball.y > GOAL_TOP && ball.y < GOAL_BOTTOM;
  if (!inMouth) return null;
  // Whole ball must cross the front goal line (inside the box), not the screen.
  if (ball.x + ball.r < GOAL_BOX_DEPTH) return 'away'; // left goal -> away scores
  if (ball.x - ball.r > FIELD_W - GOAL_BOX_DEPTH) return 'home'; // right goal
  return null;
}

export function allAtRest(bodies: Body[]): boolean {
  return bodies.every((b) => b.vx === 0 && b.vy === 0);
}
