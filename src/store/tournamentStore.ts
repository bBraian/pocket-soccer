import { create } from 'zustand';
import type { CompetitionId, Tournament } from '../types';
import {
  advanceAfterUserMatch,
  createTournament,
  shuffle,
} from '../tournament/bracket';
import { load, remove, save } from './persist';

const KEY = 'ps.tournament';

interface TournamentState {
  tournament: Tournament | null;
  createNew: (
    competition: CompetitionId,
    size: number,
    teamIds: string[],
    userTeamId: string,
  ) => void;
  recordUserMatch: (userHome: number, userAway: number) => void;
  clear: () => void;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournament: load<Tournament | null>(KEY, null),

  createNew: (competition, size, teamIds, userTeamId) => {
    // Random draw among the chosen teams.
    const t = createTournament(competition, size, shuffle(teamIds), userTeamId);
    save(KEY, t);
    set({ tournament: t });
  },

  recordUserMatch: (userHome, userAway) => {
    const cur = get().tournament;
    if (!cur) return;
    const next = advanceAfterUserMatch(cur, userHome, userAway);
    save(KEY, next);
    set({ tournament: next });
  },

  clear: () => {
    remove(KEY);
    set({ tournament: null });
  },
}));
