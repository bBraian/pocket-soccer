import { create } from 'zustand';
import type { FormationId, MatchMode, ScreenName, Team } from '../types';

// Holds the current screen plus the in-progress match-setup selections that
// flow across the menu screens (team pick -> formation -> match).
interface NavState {
  screen: ScreenName;
  go: (screen: ScreenName) => void;

  mode: MatchMode;
  fromTournament: boolean;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeFormation: FormationId;
  awayFormation: FormationId;

  startFlow: (mode: MatchMode) => void;
  setHomeTeam: (t: Team) => void;
  setAwayTeam: (t: Team) => void;
  setHomeFormation: (f: FormationId) => void;
  setAwayFormation: (f: FormationId) => void;
  setTournamentMatch: (home: Team, away: Team) => void;
}

export const useNavStore = create<NavState>((set) => ({
  screen: 'home',
  go: (screen) => set({ screen }),

  mode: 'cpu',
  fromTournament: false,
  homeTeam: null,
  awayTeam: null,
  homeFormation: 'triangle',
  awayFormation: 'triangle',

  startFlow: (mode) =>
    set({
      mode,
      fromTournament: false,
      homeTeam: null,
      awayTeam: null,
    }),
  setHomeTeam: (homeTeam) => set({ homeTeam }),
  setAwayTeam: (awayTeam) => set({ awayTeam }),
  setHomeFormation: (homeFormation) => set({ homeFormation }),
  setAwayFormation: (awayFormation) => set({ awayFormation }),
  setTournamentMatch: (homeTeam, awayTeam) =>
    set({ homeTeam, awayTeam, fromTournament: true, mode: 'cpu' }),
}));
