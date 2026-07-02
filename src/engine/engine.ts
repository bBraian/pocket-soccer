import type {
  BallSkin,
  GrassSkin,
  MatchConfig,
  MatchResult,
  Score,
  Side,
} from '../types';
import { aiReactionDelay, decideShot } from './ai';
import {
  CELEBRATION_MS,
  DISC_R,
  FIELD_H,
  FIELD_W,
  FIXED_DT,
  INACTIVE_ALPHA,
  MATCH_TIME_MS,
  MAX_DRAG,
  SHOT_POWER,
  TURN_TIME_MS,
} from './constants';
import type { Ball, Body, Disc } from './entities';
import { makeBall, makeDisc } from './entities';
import { resolveFormation } from './formations';
import { checkGoal, collide, collidePosts, integrate, walls } from './physics';
import { drawBall, drawDisc, drawField, drawForceRing } from './render';

export type MatchPhase = 'aiming' | 'dragging' | 'celebrating' | 'ended';

export interface EngineCallbacks {
  onScore: (score: Score, scoringSide: Side) => void;
  onCelebrationEnd: () => void;
  onTurnChange: (turn: Side) => void;
  onClock: (secondsLeft: number) => void;
  onTurnClock: (secondsLeft: number) => void;
  onGolden: () => void;
  onMatchEnd: (result: MatchResult) => void;
}

export interface EngineSettings {
  grass: GrassSkin;
  ball: BallSkin;
}

export class GameEngine {
  private cfg: MatchConfig;
  private settings: EngineSettings;
  private cb: EngineCallbacks;

  private discs: Disc[] = [];
  private ball: Ball;
  private bodies: Body[] = [];

  private score: Score = { home: 0, away: 0 };
  private matchTimeMs = MATCH_TIME_MS;
  private turnTimeMs = TURN_TIME_MS;
  turn: Side = 'home';
  phase: MatchPhase = 'aiming';
  private golden = false;

  private celebrationMs = 0;
  private cpuActAt = 0;

  private grabbed: Disc | null = null;
  private dragX = 0;
  private dragY = 0;
  private ringRotation = 0;
  private crestImages: Record<string, HTMLImageElement> = {};

  private lastNow = 0;
  private acc = 0;
  private lastClockSec = -1;
  private lastTurnSec = -1;

  constructor(cfg: MatchConfig, settings: EngineSettings, cb: EngineCallbacks) {
    this.cfg = cfg;
    this.settings = settings;
    this.cb = cb;
    this.ball = makeBall(FIELD_W / 2, FIELD_H / 2);
    this.kickoff('home');
  }

  // ---- lifecycle ----
  start(now: number): void {
    this.lastNow = now;
    this.turn = 'home';
    this.phase = 'aiming';
    this.turnTimeMs = TURN_TIME_MS;
    this.cb.onTurnChange(this.turn);
    this.cb.onClock(Math.ceil(this.matchTimeMs / 1000));
    this.maybeScheduleCpu(now);
  }

  private kickoff(serveTo: Side): void {
    const home = resolveFormation(this.cfg.homeFormation, 'home');
    const away = resolveFormation(this.cfg.awayFormation, 'away');
    this.discs = [
      ...home.map((p, i) => makeDisc('home', i, p.x, p.y)),
      ...away.map((p, i) => makeDisc('away', i, p.x, p.y)),
    ];
    this.ball = makeBall(FIELD_W / 2, FIELD_H / 2);
    this.bodies = [...this.discs, this.ball];
    this.turn = serveTo;
    this.turnTimeMs = TURN_TIME_MS;
    this.grabbed = null;
  }

  private isHumanTurn(): boolean {
    if (this.cfg.mode === 'pvp') return true;
    return this.turn !== this.cfg.cpuSide;
  }

  private maybeScheduleCpu(now: number): void {
    if (
      this.cfg.mode === 'cpu' &&
      this.turn === this.cfg.cpuSide &&
      this.phase === 'aiming'
    ) {
      const team = this.turn === 'home' ? this.cfg.homeTeam : this.cfg.awayTeam;
      this.cpuActAt = now + aiReactionDelay(team.difficulty);
    }
  }

  // ---- input (field coordinates) ----
  pointerDown(x: number, y: number): void {
    if (this.phase !== 'aiming' || !this.isHumanTurn()) return;
    let pick: Disc | null = null;
    let best = Infinity;
    for (const d of this.discs) {
      if (d.side !== this.turn) continue;
      const dd = Math.hypot(d.x - x, d.y - y);
      if (dd <= DISC_R * 1.7 && dd < best) {
        best = dd;
        pick = d;
      }
    }
    if (!pick) return;
    pick.vx = 0;
    pick.vy = 0;
    this.grabbed = pick;
    this.dragX = x;
    this.dragY = y;
    this.phase = 'dragging';
  }

  pointerMove(x: number, y: number): void {
    if (this.phase !== 'dragging' || !this.grabbed) return;
    this.dragX = x;
    this.dragY = y;
  }

  pointerUp(): void {
    if (this.phase !== 'dragging' || !this.grabbed) return;
    const d = this.grabbed;
    const dx = this.dragX - d.x;
    const dy = this.dragY - d.y;
    const len = Math.hypot(dx, dy);
    if (len > 4) {
      const clamped = Math.min(len, MAX_DRAG);
      const ux = dx / len;
      const uy = dy / len;
      // Launch opposite the pull (slingshot).
      d.vx = -ux * clamped * SHOT_POWER;
      d.vy = -uy * clamped * SHOT_POWER;
      vibrate(15);
    }
    this.grabbed = null;
    this.endTurn(this.lastNow);
  }

  cancelDrag(): void {
    this.grabbed = null;
    if (this.phase === 'dragging') this.phase = 'aiming';
  }

  private endTurn(now: number): void {
    this.turn = this.turn === 'home' ? 'away' : 'home';
    this.phase = 'aiming';
    this.turnTimeMs = TURN_TIME_MS;
    this.lastTurnSec = -1;
    this.cb.onTurnChange(this.turn);
    this.maybeScheduleCpu(now);
  }

  // ---- main update ----
  update(now: number): void {
    let dt = (now - this.lastNow) / 1000;
    this.lastNow = now;
    if (dt > 0.05) dt = 0.05; // clamp big frame gaps
    if (dt <= 0) return;
    this.ringRotation += dt * 2.2;

    if (this.phase === 'ended') return;

    if (this.phase === 'celebrating') {
      this.celebrationMs -= dt * 1000;
      if (this.celebrationMs <= 0) {
        this.cb.onCelebrationEnd();
        // Conceding side serves.
        // scoringSide stored implicitly: whoever did NOT score kicks off.
        this.kickoff(this.pendingServe);
        this.phase = 'aiming';
        this.lastClockSec = -1;
        this.lastTurnSec = -1;
        this.cb.onTurnChange(this.turn);
        this.maybeScheduleCpu(now);
      }
      return; // physics + clock frozen during celebration
    }

    // Turn timer only ticks while aiming (frozen once the player pulls).
    if (this.phase === 'aiming') {
      // CPU acts within its window.
      if (
        this.cfg.mode === 'cpu' &&
        this.turn === this.cfg.cpuSide &&
        now >= this.cpuActAt
      ) {
        this.runCpu(now);
      } else if (this.isHumanTurn() || this.cfg.mode === 'pvp') {
        this.turnTimeMs -= dt * 1000;
        const ts = Math.max(0, Math.ceil(this.turnTimeMs / 1000));
        if (ts !== this.lastTurnSec) {
          this.lastTurnSec = ts;
          this.cb.onTurnClock(ts);
        }
        if (this.turnTimeMs <= 0) {
          // Lost the turn — no shot fired.
          this.endTurn(now);
        }
      }
    }

    // Match clock — real time, paused only during celebration (handled above).
    if (!this.golden) {
      this.matchTimeMs -= dt * 1000;
      const cs = Math.max(0, Math.ceil(this.matchTimeMs / 1000));
      if (cs !== this.lastClockSec) {
        this.lastClockSec = cs;
        this.cb.onClock(cs);
      }
      if (this.matchTimeMs <= 0) {
        this.matchTimeMs = 0;
        if (this.score.home === this.score.away) {
          this.golden = true;
          this.cb.onGolden();
        } else {
          this.endMatch();
          return;
        }
      }
    }

    // Physics with fixed sub-steps.
    this.acc += dt;
    while (this.acc >= FIXED_DT) {
      integrate(this.bodies, FIXED_DT);
      collide(this.discs, this.ball);
      for (const d of this.discs) walls(d, false);
      walls(this.ball, true);
      collidePosts(this.bodies);
      const scorer = checkGoal(this.ball);
      if (scorer) {
        this.acc = 0;
        this.handleGoal(scorer);
        return;
      }
      this.acc -= FIXED_DT;
    }
  }

  private pendingServe: Side = 'home';

  private handleGoal(scorer: Side): void {
    this.score[scorer] += 1;
    this.pendingServe = scorer === 'home' ? 'away' : 'home';
    this.cb.onScore({ ...this.score }, scorer);

    if (this.golden) {
      this.endMatch();
      return;
    }
    this.phase = 'celebrating';
    this.celebrationMs = CELEBRATION_MS;
  }

  private runCpu(now: number): void {
    const team = this.turn === 'home' ? this.cfg.homeTeam : this.cfg.awayTeam;
    const mine = this.discs.filter((d) => d.side === this.turn);
    const shot = decideShot(mine, this.ball, this.turn, team.difficulty);
    if (shot) {
      shot.disc.vx = shot.vx;
      shot.disc.vy = shot.vy;
    }
    this.endTurn(now);
  }

  private endMatch(): void {
    this.phase = 'ended';
    const winner: Side = this.score.home >= this.score.away ? 'home' : 'away';
    const result: MatchResult = {
      homeTeam: this.cfg.homeTeam,
      awayTeam: this.cfg.awayTeam,
      home: this.score.home,
      away: this.score.away,
      winner,
      golden: this.golden,
    };
    this.cb.onMatchEnd(result);
  }

  // ---- render ----
  render(ctx: CanvasRenderingContext2D): void {
    drawField(ctx, this.settings.grass);
    for (const d of this.discs) {
      const team = d.side === 'home' ? this.cfg.homeTeam : this.cfg.awayTeam;
      const active =
        this.phase === 'celebrating' || this.phase === 'ended'
          ? 1
          : d.side === this.turn
            ? 1
            : INACTIVE_ALPHA;
      drawDisc(ctx, d, team, active, this.crestImages[team.id]);
    }
    drawBall(ctx, this.ball, this.settings.ball);

    if (this.phase === 'dragging' && this.grabbed) {
      const dx = this.dragX - this.grabbed.x;
      const dy = this.dragY - this.grabbed.y;
      const ratio = Math.min(1, Math.hypot(dx, dy) / MAX_DRAG);
      drawForceRing(ctx, this.grabbed, ratio, this.ringRotation);
    }
  }

  updateSettings(s: EngineSettings): void {
    this.settings = s;
  }

  setCrestImages(map: Record<string, HTMLImageElement>): void {
    this.crestImages = map;
  }
}

function vibrate(ms: number): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(ms);
    } catch {
      /* ignore */
    }
  }
}
