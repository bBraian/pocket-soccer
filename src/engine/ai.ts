import { FIELD_H, FIELD_W, MAX_SHOT_SPEED } from './constants';
import type { Ball, Disc } from './entities';
import { fromAngle, norm } from './vec';

export interface AiShot {
  disc: Disc;
  vx: number;
  vy: number;
}

// Reaction delay (ms) within the 5s window — weaker teams hesitate longer.
export function aiReactionDelay(difficulty: number): number {
  const base = 350 + (5 - difficulty) * 550; // diff5 ~350ms, diff1 ~2550ms
  return base + Math.random() * 500;
}

// Decide which disc to move and with what velocity.
// The CPU picks the disc nearest the ball and blends "go to the ball" with
// "push the ball toward the opponent goal".
export function decideShot(
  discs: Disc[],
  ball: Ball,
  attackingSide: 'home' | 'away',
  difficulty: number,
): AiShot | null {
  if (discs.length === 0) return null;

  // Opponent goal center.
  const goal = {
    x: attackingSide === 'home' ? FIELD_W : 0,
    y: FIELD_H / 2,
  };

  // Nearest disc to the ball.
  let disc = discs[0];
  let best = Infinity;
  for (const d of discs) {
    const dd = (d.x - ball.x) ** 2 + (d.y - ball.y) ** 2;
    if (dd < best) {
      best = dd;
      disc = d;
    }
  }

  const toBall = norm({ x: ball.x - disc.x, y: ball.y - disc.y });
  const ballToGoal = norm({ x: goal.x - ball.x, y: goal.y - ball.y });

  // Blend: mostly toward the ball, biased so the strike carries to the goal.
  let dir = norm({
    x: toBall.x * 0.55 + ballToGoal.x * 0.45,
    y: toBall.y * 0.55 + ballToGoal.y * 0.45,
  });

  // Angular noise — precise for high difficulty, sloppy for low.
  const maxNoise = (5 - difficulty) * 0.09; // rad
  const noise = (Math.random() * 2 - 1) * maxNoise;
  const a = Math.atan2(dir.y, dir.x) + noise;
  dir = fromAngle(a);

  const distToBall = Math.hypot(ball.x - disc.x, ball.y - disc.y);
  const kickSpeed = Math.min(MAX_SHOT_SPEED, distToBall * 4 + 650);

  return { disc, vx: dir.x * kickSpeed, vy: dir.y * kickSpeed };
}
