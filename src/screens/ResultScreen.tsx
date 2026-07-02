import { useState } from 'react';
import { useNavStore } from '../store/navStore';
import { useMatchStore } from '../store/matchStore';
import { useTournamentStore } from '../store/tournamentStore';
import { TeamCrest } from '../components/TeamCrest';
import trophyImg from '../assets/word-cup.png';

export function ResultScreen() {
  const go = useNavStore((s) => s.go);
  const fromTournament = useNavStore((s) => s.fromTournament);
  const result = useMatchStore((s) => s.result);
  const tournament = useTournamentStore((s) => s.tournament);
  const recordUserMatch = useTournamentStore((s) => s.recordUserMatch);
  const [recorded, setRecorded] = useState(false);

  if (!result) {
    go('home');
    return null;
  }

  const { homeTeam, awayTeam, home, away, golden, winner } = result;
  const winnerTeam = winner === 'home' ? homeTeam : awayTeam;
  const userWon = winner === 'home'; // user always plays as home

  const continueTournament = () => {
    if (recorded || !tournament) return;
    const cur = tournament.matches.find((m) => m.id === tournament.currentMatchId);
    if (cur) {
      // Map engine home/away (user=home) onto bracket home/away order.
      if (cur.homeId === tournament.userTeamId) recordUserMatch(home, away);
      else recordUserMatch(away, home);
    }
    setRecorded(true);
    go('bracket');
  };

  return (
    <div className="screen result">
      <div className="result-card">
        <h2>{golden ? 'Gol de Ouro!' : 'Fim de jogo'}</h2>

        <div className="result-score">
          <div className={`result-team ${winner === 'home' ? 'win' : ''}`}>
            <TeamCrest team={homeTeam} size={64} />
            <span>{homeTeam.name}</span>
          </div>
          <div className="result-numbers">
            {home} <span>-</span> {away}
          </div>
          <div className={`result-team ${winner === 'away' ? 'win' : ''}`}>
            <TeamCrest team={awayTeam} size={64} />
            <span>{awayTeam.name}</span>
          </div>
        </div>

        <p className="result-winner">
          <img src={trophyImg} className="trophy-img inline" alt="" />
          {winnerTeam.name} venceu
        </p>

        {fromTournament ? (
          <>
            <p className="result-sub">
              {userWon
                ? 'Você avança no torneio!'
                : 'Você foi eliminado — veja o campeão.'}
            </p>
            <button className="menu-btn primary" onClick={continueTournament}>
              Continuar
            </button>
          </>
        ) : (
          <div className="result-actions">
            <button className="menu-btn primary" onClick={() => go('match')}>
              Jogar de novo
            </button>
            <button className="menu-btn ghost" onClick={() => go('home')}>
              Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
