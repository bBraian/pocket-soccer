import type { BracketMatch, CompetitionId, FormationId, Tournament } from '../types';
import { getTeam } from '../data/teams';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const matchId = (r: number, s: number) => `m-${r}-${s}`;
const roundsForSize = (size: number) => Math.round(Math.log2(size));

function getMatch(t: Tournament, round: number, slot: number): BracketMatch | undefined {
  return t.matches.find((m) => m.round === round && m.slot === slot);
}

export function createTournament(
  competition: CompetitionId,
  size: number,
  drawOrder: string[],
  userTeamId: string,
  userFormation: FormationId,
): Tournament {
  const rounds = roundsForSize(size);
  const matches: BracketMatch[] = [];

  // Round 0 — seeded from the draw order.
  const firstRoundMatches = size / 2;
  for (let s = 0; s < firstRoundMatches; s++) {
    const homeId = drawOrder[2 * s];
    const awayId = drawOrder[2 * s + 1];
    matches.push({
      id: matchId(0, s),
      round: 0,
      slot: s,
      homeId,
      awayId,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      played: false,
      isUserMatch: homeId === userTeamId || awayId === userTeamId,
    });
  }

  // Empty placeholders for later rounds.
  for (let r = 1; r < rounds; r++) {
    const count = size / 2 ** (r + 1);
    for (let s = 0; s < count; s++) {
      matches.push({
        id: matchId(r, s),
        round: r,
        slot: s,
        homeId: null,
        awayId: null,
        homeScore: null,
        awayScore: null,
        winnerId: null,
        played: false,
        isUserMatch: false,
      });
    }
  }

  const userMatch = matches.find((m) => m.isUserMatch)!;
  return {
    competition,
    size,
    teamIds: drawOrder,
    userTeamId,
    userFormation,
    rounds,
    matches,
    currentMatchId: userMatch.id,
    championId: null,
    eliminated: false,
  };
}

// Poisson goal count for a given expected value.
function poisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

// Simulate a CPU-vs-CPU match, weighted by difficulty. Never returns a draw.
export function simMatch(homeId: string, awayId: string): {
  homeScore: number;
  awayScore: number;
  winnerId: string;
} {
  const dh = getTeam(homeId)?.difficulty ?? 3;
  const da = getTeam(awayId)?.difficulty ?? 3;
  const strengthH = dh / (dh + da);
  const gh = 0.6 + strengthH * 2.4;
  const ga = 0.6 + (1 - strengthH) * 2.4;
  let hs = poisson(gh);
  let as = poisson(ga);
  while (hs === as) {
    if (Math.random() < strengthH) hs++;
    else as++;
  }
  return { homeScore: hs, awayScore: as, winnerId: hs > as ? homeId : awayId };
}

// Push each played match's winner into the next round.
function propagateRound(t: Tournament, round: number): void {
  if (round + 1 >= t.rounds) return;
  const current = t.matches.filter((m) => m.round === round);
  for (const m of current) {
    if (!m.winnerId) continue;
    const nextSlot = Math.floor(m.slot / 2);
    const next = getMatch(t, round + 1, nextSlot);
    if (!next) continue;
    if (m.slot % 2 === 0) next.homeId = m.winnerId;
    else next.awayId = m.winnerId;
    next.isUserMatch =
      next.homeId === t.userTeamId || next.awayId === t.userTeamId;
  }
}

// Simulate every not-yet-played match in a round (used for CPU-vs-CPU games).
function simRound(t: Tournament, round: number): void {
  for (const m of t.matches.filter((x) => x.round === round)) {
    if (m.played || !m.homeId || !m.awayId) continue;
    const r = simMatch(m.homeId, m.awayId);
    m.homeScore = r.homeScore;
    m.awayScore = r.awayScore;
    m.winnerId = r.winnerId;
    m.played = true;
  }
}

function clone(t: Tournament): Tournament {
  return {
    ...t,
    teamIds: [...t.teamIds],
    matches: t.matches.map((m) => ({ ...m })),
  };
}

// Record the user's match result, then resolve the rest of the round and
// advance the bracket. If the user lost, auto-simulate to a champion.
export function advanceAfterUserMatch(
  tournament: Tournament,
  userHome: number,
  userAway: number,
): Tournament {
  const t = clone(tournament);
  const cur = t.matches.find((m) => m.id === t.currentMatchId);
  if (!cur) return t;

  cur.homeScore = userHome;
  cur.awayScore = userAway;
  cur.winnerId = userHome > userAway ? cur.homeId : cur.awayId;
  cur.played = true;

  const round = cur.round;
  const userWon = cur.winnerId === t.userTeamId;

  // Resolve the other games in this round, then build the next round.
  simRound(t, round);
  propagateRound(t, round);

  if (round + 1 >= t.rounds) {
    // That was the final.
    t.championId = cur.winnerId;
    t.currentMatchId = null;
    if (!userWon) t.eliminated = true;
    return t;
  }

  if (userWon) {
    const nextUserMatch = t.matches.find(
      (m) => m.round === round + 1 && m.isUserMatch,
    );
    t.currentMatchId = nextUserMatch ? nextUserMatch.id : null;
    return t;
  }

  // User eliminated — simulate the remainder to crown a champion.
  t.eliminated = true;
  t.currentMatchId = null;
  for (let r = round + 1; r < t.rounds; r++) {
    simRound(t, r);
    propagateRound(t, r);
  }
  const final = t.matches.find((m) => m.round === t.rounds - 1);
  t.championId = final?.winnerId ?? null;
  return t;
}

export const ROUND_NAMES = (rounds: number, round: number): string => {
  const remaining = rounds - round;
  if (remaining === 1) return 'Final';
  if (remaining === 2) return 'Semifinal';
  if (remaining === 3) return 'Quartas';
  if (remaining === 4) return 'Oitavas';
  if (remaining === 5) return '16-avos';
  return `Rodada ${round + 1}`;
};
