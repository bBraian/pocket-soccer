import type { Side } from '../types';
import { BALL_MASS, BALL_R, DISC_MASS, DISC_R } from './constants';

export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  mass: number;
}

export interface Disc extends Body {
  kind: 'disc';
  side: Side;
  index: number; // 0..2 within the team
}

export interface Ball extends Body {
  kind: 'ball';
}

export const makeDisc = (side: Side, index: number, x: number, y: number): Disc => ({
  kind: 'disc',
  side,
  index,
  x,
  y,
  vx: 0,
  vy: 0,
  r: DISC_R,
  mass: DISC_MASS,
});

export const makeBall = (x: number, y: number): Ball => ({
  kind: 'ball',
  x,
  y,
  vx: 0,
  vy: 0,
  r: BALL_R,
  mass: BALL_MASS,
});

export const speed = (b: Body): number => Math.hypot(b.vx, b.vy);
