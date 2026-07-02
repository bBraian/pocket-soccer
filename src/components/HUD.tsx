import type { Team } from '../types';
import { useMatchStore } from '../store/matchStore';
import { TeamCrest } from './TeamCrest';

interface Props {
  homeTeam: Team;
  awayTeam: Team;
  onPause: () => void;
}

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function HUD({ homeTeam, awayTeam, onPause }: Props) {
  const score = useMatchStore((s) => s.score);
  const clockSec = useMatchStore((s) => s.clockSec);
  const turn = useMatchStore((s) => s.turn);
  const turnSec = useMatchStore((s) => s.turnSec);
  const golden = useMatchStore((s) => s.golden);
  const celebration = useMatchStore((s) => s.celebration);

  return (
    <div className="hud">
      <div className="hud-top">
        <div className={`hud-team left ${turn === 'home' ? 'active' : ''}`}>
          <TeamCrest team={homeTeam} size={30} />
          <span className="hud-team-name">{homeTeam.name}</span>
        </div>

        <div className="hud-center">
          <div className="hud-clock">{golden ? 'OURO' : fmt(clockSec)}</div>
          <div className="hud-score">
            {score.home} - {score.away}
          </div>
        </div>

        <div className={`hud-team right ${turn === 'away' ? 'active' : ''}`}>
          <span className="hud-team-name">{awayTeam.name}</span>
          <TeamCrest team={awayTeam} size={30} />
        </div>

        <button className="hud-pause" onClick={onPause} aria-label="Pausar">
          ❚❚
        </button>
      </div>

      {!celebration.active && (
        <div className={`hud-turn ${turn}`}>
          <span className="hud-turn-dot" />
          Vez: {turn === 'home' ? homeTeam.name : awayTeam.name}
          <span className="hud-turn-timer">{turnSec}s</span>
        </div>
      )}

      {golden && !celebration.active && (
        <div className="hud-golden">GOL DE OURO</div>
      )}

      {celebration.active && (
        <div className="hud-celebration">
          <div className="hud-celebration-band">
            <div className="cel-team">
              <TeamCrest team={homeTeam} size={54} />
              <span>{homeTeam.name}</span>
            </div>
            <div className="cel-score">
              {celebration.score.home} <span>-</span> {celebration.score.away}
            </div>
            <div className="cel-team">
              <TeamCrest team={awayTeam} size={54} />
              <span>{awayTeam.name}</span>
            </div>
          </div>
          <div className="cel-goal">GOL!</div>
        </div>
      )}
    </div>
  );
}
