import type { BracketMatch } from '../types';
import { getTeam } from '../data/teams';
import { ROUND_NAMES } from '../tournament/bracket';
import { randomFormationId } from '../engine/formations';
import { useNavStore } from '../store/navStore';
import { useTournamentStore } from '../store/tournamentStore';
import { TeamCrest } from '../components/TeamCrest';

function Slot({
  teamId,
  score,
  isWinner,
  isUser,
}: {
  teamId: string | null;
  score: number | null;
  isWinner: boolean;
  isUser: boolean;
}) {
  const team = teamId ? getTeam(teamId) : undefined;
  return (
    <div className={`bslot ${isWinner ? 'win' : ''} ${isUser ? 'user' : ''}`}>
      {team ? (
        <>
          <TeamCrest team={team} size={18} />
          <span className="bname">{team.name}</span>
        </>
      ) : (
        <span className="bname tbd">—</span>
      )}
      <span className="bscore">{score ?? ''}</span>
    </div>
  );
}

function MatchBox({ m, userId }: { m: BracketMatch; userId: string }) {
  return (
    <div className={`bmatch ${m.isUserMatch ? 'usermatch' : ''}`}>
      <Slot
        teamId={m.homeId}
        score={m.homeScore}
        isWinner={m.played && m.winnerId === m.homeId}
        isUser={m.homeId === userId}
      />
      <Slot
        teamId={m.awayId}
        score={m.awayScore}
        isWinner={m.played && m.winnerId === m.awayId}
        isUser={m.awayId === userId}
      />
    </div>
  );
}

export function BracketScreen() {
  const go = useNavStore((s) => s.go);
  const nav = useNavStore.getState();
  const tournament = useTournamentStore((s) => s.tournament);
  const clear = useTournamentStore((s) => s.clear);

  if (!tournament) {
    go('home');
    return null;
  }

  const { rounds, matches, userTeamId, currentMatchId, championId } = tournament;
  const champion = championId ? getTeam(championId) : null;
  const current = matches.find((m) => m.id === currentMatchId);

  const playNext = () => {
    if (!current || !current.homeId || !current.awayId) return;
    const oppId = current.homeId === userTeamId ? current.awayId : current.homeId;
    const userTeam = getTeam(userTeamId);
    const opp = getTeam(oppId);
    if (!userTeam || !opp) return;
    nav.setTournamentMatch(userTeam, opp);
    nav.setHomeFormation(tournament.userFormation);
    nav.setAwayFormation(randomFormationId());
    go('match');
  };

  return (
    <div className="screen bracket">
      <header className="screen-header">
        <button className="back" onClick={() => go('home')}>
          ‹ Menu
        </button>
        <h2>Chaveamento</h2>
      </header>

      {champion ? (
        <div className="champion-banner">
          <div className="champion-crest">
            <TeamCrest team={champion} size={90} />
          </div>
          <h3>🏆 Campeão</h3>
          <p className="champion-name">{champion.name}</p>
          <button
            className="menu-btn primary"
            onClick={() => {
              clear();
              go('home');
            }}
          >
            Concluir
          </button>
        </div>
      ) : (
        current && (
          <div className="next-match">
            <span>Próximo confronto:</span>
            <div className="next-match-teams">
              {current.homeId && (
                <TeamCrest team={getTeam(current.homeId)!} size={30} />
              )}
              <strong>vs</strong>
              {current.awayId && (
                <TeamCrest team={getTeam(current.awayId)!} size={30} />
              )}
            </div>
            <button className="menu-btn primary" onClick={playNext}>
              Jogar
            </button>
          </div>
        )
      )}

      <div className="bracket-scroll">
        {Array.from({ length: rounds }).map((_, r) => (
          <div className="bround" key={r}>
            <h4>{ROUND_NAMES(rounds, r)}</h4>
            {matches
              .filter((m) => m.round === r)
              .sort((a, b) => a.slot - b.slot)
              .map((m) => (
                <MatchBox key={m.id} m={m} userId={userTeamId} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
