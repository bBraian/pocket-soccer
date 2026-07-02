import { create } from 'zustand';
import type { MatchConfig, MatchResult, Score, Side } from '../types';
import { MATCH_TIME_MS, TURN_TIME_MS } from '../engine/constants';

interface CelebrationState {
  active: boolean;
  scoringSide: Side | null;
  score: Score;
}

interface MatchState {
  config: MatchConfig | null;
  score: Score;
  clockSec: number;
  turnSec: number;
  turn: Side;
  golden: boolean;
  celebration: CelebrationState;
  result: MatchResult | null;

  // Called by the engine bridge (GameCanvas).
  begin: (config: MatchConfig) => void;
  setScore: (score: Score) => void;
  setClock: (sec: number) => void;
  setTurnClock: (sec: number) => void;
  setTurn: (turn: Side) => void;
  setGolden: () => void;
  startCelebration: (scoringSide: Side, score: Score) => void;
  endCelebration: () => void;
  finish: (result: MatchResult) => void;
  clear: () => void;
}

const emptyScore: Score = { home: 0, away: 0 };

export const useMatchStore = create<MatchState>((set) => ({
  config: null,
  score: emptyScore,
  clockSec: MATCH_TIME_MS / 1000,
  turnSec: TURN_TIME_MS / 1000,
  turn: 'home',
  golden: false,
  celebration: { active: false, scoringSide: null, score: emptyScore },
  result: null,

  begin: (config) =>
    set({
      config,
      score: { home: 0, away: 0 },
      clockSec: MATCH_TIME_MS / 1000,
      turnSec: TURN_TIME_MS / 1000,
      turn: 'home',
      golden: false,
      celebration: { active: false, scoringSide: null, score: { home: 0, away: 0 } },
      result: null,
    }),
  setScore: (score) => set({ score }),
  setClock: (clockSec) => set({ clockSec }),
  setTurnClock: (turnSec) => set({ turnSec }),
  setTurn: (turn) => set({ turn }),
  setGolden: () => set({ golden: true }),
  startCelebration: (scoringSide, score) =>
    set({ celebration: { active: true, scoringSide, score } }),
  endCelebration: () =>
    set((s) => ({ celebration: { ...s.celebration, active: false } })),
  finish: (result) => set({ result }),
  clear: () =>
    set({ config: null, result: null, score: emptyScore, golden: false }),
}));
