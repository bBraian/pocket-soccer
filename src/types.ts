// Shared domain types for Pocket Soccer.

export type TeamType = 'nation' | 'club';

export interface Team {
  id: string;
  name: string;
  type: TeamType;
  flagCode?: string; // ISO code for flag-icons when type === 'nation'
  badgeInitials?: string; // e.g. "RC" when type === 'club'
  colorPrimary: string;
  colorSecondary: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 = easiest, 5 = hardest
}

export type FormationId = 'line' | 'defensive' | 'offensive' | 'triangle';

export interface FormationDef {
  id: FormationId;
  label: string;
  // Positions in normalized half-field coords for the HOME side (left half).
  // x: 0 (own goal line) .. 1 (halfway). y: 0 (top) .. 1 (bottom).
  // Mirrored automatically for the away side.
  spots: Array<{ x: number; y: number }>;
}

export type Side = 'home' | 'away';
export type MatchMode = 'cpu' | 'pvp';

export interface Score {
  home: number;
  away: number;
}

export interface MatchConfig {
  mode: MatchMode;
  homeTeam: Team;
  awayTeam: Team;
  homeFormation: FormationId;
  awayFormation: FormationId;
  cpuSide?: Side; // which side the CPU controls in 'cpu' mode
  fromTournament: boolean;
}

export interface MatchResult {
  homeTeam: Team;
  awayTeam: Team;
  home: number;
  away: number;
  winner: Side;
  golden: boolean;
}

// ---- Settings ----
export type GrassSkin = 'classic' | 'night' | 'dirt' | 'beach';
export type BallSkin = 'classic' | 'striped' | 'star' | 'retro';

// ---- Tournament ----
export type CompetitionId = 'worldcup' | 'clubleague';

export interface BracketMatch {
  id: string;
  round: number; // 0 = first round
  slot: number; // index within round
  homeId: string | null;
  awayId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: string | null;
  played: boolean;
  isUserMatch: boolean;
}

export interface Tournament {
  competition: CompetitionId;
  size: number; // 4 | 8 | 16 | 32
  teamIds: string[];
  userTeamId: string;
  rounds: number;
  matches: BracketMatch[];
  currentMatchId: string | null;
  championId: string | null;
  eliminated: boolean;
}

export type ScreenName =
  | 'home'
  | 'teamSelect'
  | 'formation'
  | 'match'
  | 'result'
  | 'bracket'
  | 'settings'
  | 'tournamentSetup';
