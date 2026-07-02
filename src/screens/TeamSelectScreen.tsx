import { useState } from 'react';
import type { Team, TeamType } from '../types';
import { CLUBS, NATIONS } from '../data/teams';
import { useNavStore } from '../store/navStore';
import { DifficultyStars, TeamCrest } from '../components/TeamCrest';

export function TeamSelectScreen() {
  const go = useNavStore((s) => s.go);
  const mode = useNavStore((s) => s.mode);
  const setHomeTeam = useNavStore((s) => s.setHomeTeam);
  const setAwayTeam = useNavStore((s) => s.setAwayTeam);
  const homeTeam = useNavStore((s) => s.homeTeam);

  const [step, setStep] = useState<'home' | 'away'>('home');
  const [tab, setTab] = useState<TeamType>('nation');

  const list = tab === 'nation' ? NATIONS : CLUBS;

  const title =
    step === 'home'
      ? mode === 'pvp'
        ? 'Jogador 1 — escolha seu time'
        : 'Escolha seu time'
      : mode === 'pvp'
        ? 'Jogador 2 — escolha seu time'
        : 'Escolha o adversário (CPU)';

  const pick = (team: Team) => {
    if (step === 'home') {
      setHomeTeam(team);
      setStep('away');
    } else {
      setAwayTeam(team);
      go('formation');
    }
  };

  const back = () => {
    if (step === 'away') setStep('home');
    else go('home');
  };

  return (
    <div className="screen team-select">
      <header className="screen-header">
        <button className="back" onClick={back}>
          ‹ Voltar
        </button>
        <h2>{title}</h2>
      </header>

      {step === 'away' && homeTeam && (
        <div className="picked-hint">
          Seu time: <TeamCrest team={homeTeam} size={22} /> {homeTeam.name}
        </div>
      )}

      <div className="tabs">
        <button
          className={tab === 'nation' ? 'active' : ''}
          onClick={() => setTab('nation')}
        >
          Seleções
        </button>
        <button
          className={tab === 'club' ? 'active' : ''}
          onClick={() => setTab('club')}
        >
          Clubes
        </button>
      </div>

      <div className="team-grid">
        {list.map((team) => {
          const disabled = step === 'away' && homeTeam?.id === team.id;
          return (
            <button
              key={team.id}
              className="team-card"
              disabled={disabled}
              onClick={() => pick(team)}
            >
              <TeamCrest team={team} size={44} />
              <span className="team-name">{team.name}</span>
              <DifficultyStars level={team.difficulty} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
