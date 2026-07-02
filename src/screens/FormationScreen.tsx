import { useState } from 'react';
import type { FormationId } from '../types';
import { FORMATION_LIST, FORMATIONS, randomFormationId } from '../engine/formations';
import { useNavStore } from '../store/navStore';

function MiniFormation({ id }: { id: FormationId }) {
  const spots = FORMATIONS[id].spots;
  return (
    <div className="mini-pitch">
      <span className="mini-half" />
      {spots.map((s, i) => (
        <span
          key={i}
          className="mini-dot"
          style={{ left: `${6 + s.x * 44}%`, top: `${8 + s.y * 84}%` }}
        />
      ))}
    </div>
  );
}

export function FormationScreen() {
  const go = useNavStore((s) => s.go);
  const mode = useNavStore((s) => s.mode);
  const setHomeFormation = useNavStore((s) => s.setHomeFormation);
  const setAwayFormation = useNavStore((s) => s.setAwayFormation);

  const [homeF, setHomeF] = useState<FormationId>('triangle');
  const [awayF, setAwayF] = useState<FormationId>('triangle');
  const [side, setSide] = useState<'home' | 'away'>('home');

  const pvp = mode === 'pvp';
  const selected = side === 'home' ? homeF : awayF;
  const setSelected = (f: FormationId) =>
    side === 'home' ? setHomeF(f) : setAwayF(f);

  const confirm = () => {
    setHomeFormation(homeF);
    if (pvp) {
      setAwayFormation(awayF);
    } else {
      // CPU picks a random formation for variety.
      setAwayFormation(randomFormationId());
    }
    go('match');
  };

  const next = () => {
    if (pvp && side === 'home') setSide('away');
    else confirm();
  };

  return (
    <div className="screen formation">
      <header className="screen-header">
        <button className="back" onClick={() => go('teamSelect')}>
          ‹ Voltar
        </button>
        <h2>
          Formação
          {pvp ? ` — ${side === 'home' ? 'Jogador 1' : 'Jogador 2'}` : ''}
        </h2>
      </header>

      <div className="formation-grid">
        {FORMATION_LIST.map((f) => (
          <button
            key={f.id}
            className={`formation-card ${selected === f.id ? 'selected' : ''}`}
            onClick={() => setSelected(f.id)}
          >
            <MiniFormation id={f.id} />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <button className="menu-btn primary confirm" onClick={next}>
        {pvp && side === 'home' ? 'Próximo jogador' : 'Iniciar partida'}
      </button>
    </div>
  );
}
