import { BALL_R, DISC_R, FIELD_H, FIELD_W, MAX_SHOT_SPEED } from './constants';
import type { Ball, Disc } from './entities';
import { fromAngle, norm } from './vec';

export interface AiShot {
  disc: Disc;
  vx: number;
  vy: number;
}

// Reaction delay (ms) before the CPU plays. There is always a clear pause
// (never instant), and a wide random spread so the timing never feels constant.
// Stronger teams tend to be quicker, but the ranges overlap so it stays organic.
export function aiReactionDelay(difficulty: number): number {
  const base = 650 + (5 - difficulty) * 340; // diff5 ~650ms, diff1 ~2010ms
  const spread = Math.random() * 1400; // 0 .. 1.4s
  // Occasional longer "hesitation" so it doesn't settle into a rhythm.
  const hesitation = Math.random() < 0.25 ? Math.random() * 900 : 0;
  return base + spread + hesitation;
}

// Decide which disc to move and how to launch it. The CPU aims at the contact
// point *behind* the ball relative to the goal, so the strike actually carries
// the ball toward the opponent's goal (instead of clipping it sideways).
export function decideShot(
  discs: Disc[],
  ball: Ball,
  attackingSide: 'home' | 'away',
  difficulty: number,
): AiShot | null {
  if (discs.length === 0) return null;

  const goal = {
    x: attackingSide === 'home' ? FIELD_W : 0,
    y: FIELD_H / 2,
  };

  // Direction we want the ball to travel, and the ideal disc position to strike
  // it from (the far side of the ball, away from the goal).
  const shotDir = norm({ x: goal.x - ball.x, y: goal.y - ball.y });
  const reach = BALL_R + DISC_R;
  const contact = {
    x: ball.x - shotDir.x * reach,
    y: ball.y - shotDir.y * reach,
  };

  // Pick the disc that is both close to that contact point and already on the
  // correct side of the ball (so it pushes toward, not away from, the goal).
  let disc = discs[0];
  let bestScore = -Infinity;
  for (const d of discs) {
    const toBall = norm({ x: ball.x - d.x, y: ball.y - d.y });
    const align = toBall.x * shotDir.x + toBall.y * shotDir.y; // -1..1
    const distC = Math.hypot(contact.x - d.x, contact.y - d.y);
    const score = align * 280 - distC;
    if (score > bestScore) {
      bestScore = score;
      disc = d;
    }
  }

  // Aim straight at the contact point; overshoot drives the disc through the
  // ball along shotDir.
  let dir = norm({ x: contact.x - disc.x, y: contact.y - disc.y });

  // Angular noise — precise for high difficulty, sloppy for low.
  const maxNoise = (5 - difficulty) * 0.05; // rad (diff5 = 0, diff1 ~0.2)
  const noise = (Math.random() * 2 - 1) * maxNoise;
  dir = fromAngle(Math.atan2(dir.y, dir.x) + noise);

  // Enough power to reach the ball and push it firmly; stronger teams hit
  // harder.
  const distToContact = Math.hypot(contact.x - disc.x, contact.y - disc.y);
  const power = 780 + distToContact * 3.4 + difficulty * 60;
  const kickSpeed = Math.min(MAX_SHOT_SPEED, power);

  return { disc, vx: dir.x * kickSpeed, vy: dir.y * kickSpeed };
}
