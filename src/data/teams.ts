import type { CompetitionId, Team } from '../types';

// Nations use real flags via flag-icons. Difficulty roughly tracks footballing
// pedigree so the tournament sim and CPU feel plausible.
export const NATIONS: Team[] = [
  n('br', 'Brasil', '#f7d417', '#0a7d34', 5),
  n('ar', 'Argentina', '#6cb0e0', '#ffffff', 5),
  n('fr', 'França', '#1c3f95', '#c8102e', 5),
  n('de', 'Alemanha', '#111111', '#d21034', 5),
  n('es', 'Espanha', '#c60b1e', '#ffc400', 4),
  n('gb-eng', 'Inglaterra', '#ffffff', '#c8102e', 4),
  n('pt', 'Portugal', '#c8102e', '#0a7d34', 4),
  n('nl', 'Holanda', '#ec7000', '#1c3f95', 4),
  n('it', 'Itália', '#1c66b0', '#ffffff', 4),
  n('be', 'Bélgica', '#c8102e', '#111111', 4),
  n('hr', 'Croácia', '#c8102e', '#ffffff', 3),
  n('uy', 'Uruguai', '#6cb0e0', '#ffffff', 3),
  n('mx', 'México', '#0a7d34', '#c8102e', 3),
  n('us', 'EUA', '#1c3f95', '#c8102e', 3),
  n('jp', 'Japão', '#12306e', '#ffffff', 3),
  n('sn', 'Senegal', '#0a7d34', '#f7d417', 3),
  n('ma', 'Marrocos', '#c8102e', '#0a7d34', 3),
  n('kr', 'Coreia do Sul', '#c8102e', '#12306e', 3),
  n('ch', 'Suíça', '#c8102e', '#ffffff', 3),
  n('se', 'Suécia', '#1c66b0', '#f7d417', 3),
  n('dk', 'Dinamarca', '#c8102e', '#ffffff', 3),
  n('co', 'Colômbia', '#f7d417', '#1c3f95', 3),
  n('rs', 'Sérvia', '#c8102e', '#12306e', 2),
  n('pl', 'Polônia', '#ffffff', '#c8102e', 2),
  n('ng', 'Nigéria', '#0a7d34', '#ffffff', 2),
  n('gh', 'Gana', '#c8102e', '#0a7d34', 2),
  n('ec', 'Equador', '#f7d417', '#1c3f95', 2),
  n('au', 'Austrália', '#f7d417', '#0a7d34', 2),
  n('cl', 'Chile', '#c8102e', '#1c3f95', 2),
  n('cm', 'Camarões', '#0a7d34', '#c8102e', 2),
  n('ca', 'Canadá', '#c8102e', '#ffffff', 2),
  n('sa', 'Arábia Saudita', '#0a7d34', '#ffffff', 1),
  n('qa', 'Catar', '#7a1330', '#ffffff', 1),
  n('pa', 'Panamá', '#c8102e', '#1c3f95', 1),
];

// Clubs are fully fictional (city + color themes, generated badges) — no real
// club names or crests, to avoid trademark issues.
export const CLUBS: Team[] = [
  c('rio', 'Rio Carmesim', 'RC', '#c8102e', '#111111', 5),
  c('mad', 'Madrid Branco', 'MB', '#f5f5f5', '#d4af37', 5),
  c('mun', 'Munique Real', 'MR', '#c8102e', '#12306e', 5),
  c('lon', 'Londres Norte', 'LN', '#c8102e', '#ffffff', 5),
  c('par', 'Paris Royal', 'PR', '#12306e', '#c8102e', 4),
  c('tur', 'Turim Zebra', 'TZ', '#111111', '#ffffff', 4),
  c('mil', 'Milão Listrado', 'ML', '#c8102e', '#111111', 4),
  c('man', 'Manchester Céu', 'MC', '#6cb0e0', '#ffffff', 4),
  c('dor', 'Dortmund Ouro', 'DO', '#f7d417', '#111111', 4),
  c('ams', 'Amsterdã Lança', 'AL', '#ec7000', '#ffffff', 4),
  c('liv', 'Mersey Vermelho', 'MV', '#c8102e', '#f7d417', 4),
  c('bar', 'Catalunha Azul', 'CA', '#12306e', '#7a1330', 4),
  c('lis', 'Lisboa Águia', 'LA', '#c8102e', '#0a7d34', 3),
  c('por', 'Porto Azul', 'PA', '#1c66b0', '#ffffff', 3),
  c('sev', 'Sevilha Rubro', 'SR', '#c8102e', '#ffffff', 3),
  c('nap', 'Nápoles Céu', 'NC', '#6cb0e0', '#12306e', 3),
  c('gla', 'Glasgow Verde', 'GV', '#0a7d34', '#ffffff', 3),
  c('mar', 'Marselha Costa', 'MA', '#6cb0e0', '#111111', 3),
  c('rom', 'Roma Loba', 'RL', '#7a1330', '#f7d417', 3),
  c('bue', 'Buenos Grená', 'BG', '#7a1330', '#12306e', 3),
  c('mos', 'Moscou Central', 'MC2', '#c8102e', '#1c3f95', 3),
  c('ham', 'Hamburgo Norte', 'HN', '#111111', '#c8102e', 3),
  c('cai', 'Cairo Reis', 'CR', '#c8102e', '#ffffff', 2),
  c('ist', 'Istambul Estrela', 'IE', '#c8102e', '#f7d417', 2),
  c('ate', 'Atenas Coruja', 'AC', '#0a7d34', '#ffffff', 2),
  c('pra', 'Praga Esparta', 'PE', '#c8102e', '#12306e', 2),
  c('bel', 'Belgrado Estrela', 'BE', '#c8102e', '#ffffff', 2),
  c('war', 'Varsóvia Legião', 'VL', '#ffffff', '#0a7d34', 2),
  c('vie', 'Viena Rápida', 'VR', '#0a7d34', '#ffffff', 2),
  c('cop', 'Copenhague Leão', 'CL', '#1c3f95', '#ffffff', 2),
  c('osl', 'Oslo Fjord', 'OF', '#12306e', '#f7d417', 1),
  c('dub', 'Dublin Trevo', 'DT', '#0a7d34', '#ec7000', 1),
];

export const ALL_TEAMS: Team[] = [...NATIONS, ...CLUBS];

const BY_ID = new Map(ALL_TEAMS.map((t) => [t.id, t]));
export const getTeam = (id: string): Team | undefined => BY_ID.get(id);

export function teamsForCompetition(comp: CompetitionId): Team[] {
  return comp === 'worldcup' ? NATIONS : CLUBS;
}

function n(
  flag: string,
  name: string,
  c1: string,
  c2: string,
  difficulty: Team['difficulty'],
): Team {
  return {
    id: `nat-${flag}`,
    name,
    type: 'nation',
    flagCode: flag,
    colorPrimary: c1,
    colorSecondary: c2,
    difficulty,
  };
}

function c(
  id: string,
  name: string,
  initials: string,
  c1: string,
  c2: string,
  difficulty: Team['difficulty'],
): Team {
  return {
    id: `clb-${id}`,
    name,
    type: 'club',
    badgeInitials: initials,
    colorPrimary: c1,
    colorSecondary: c2,
    difficulty,
  };
}
