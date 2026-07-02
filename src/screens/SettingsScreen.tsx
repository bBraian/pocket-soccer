import type { BallSkin, GrassSkin } from '../types';
import { useNavStore } from '../store/navStore';
import { useSettingsStore } from '../store/settingsStore';

const GRASS: Array<{ id: GrassSkin; label: string; swatch: string }> = [
  { id: 'classic', label: 'Grama clássica', swatch: '#3a8f3a' },
  { id: 'night', label: 'Estádio noturno', swatch: '#1f3d2b' },
  { id: 'dirt', label: 'Terra', swatch: '#a9743f' },
  { id: 'beach', label: 'Praia', swatch: '#e2c98a' },
];

const BALLS: Array<{ id: BallSkin; label: string }> = [
  { id: 'classic', label: 'Clássica' },
  { id: 'striped', label: 'Listrada' },
  { id: 'star', label: 'Estrela' },
  { id: 'retro', label: 'Retrô' },
];

export function SettingsScreen() {
  const go = useNavStore((s) => s.go);
  const { grass, ball, setGrass, setBall } = useSettingsStore();

  return (
    <div className="screen settings">
      <header className="screen-header">
        <button className="back" onClick={() => go('home')}>
          ‹ Voltar
        </button>
        <h2>Configurações</h2>
      </header>

      <section>
        <h3>Gramado</h3>
        <div className="option-grid">
          {GRASS.map((g) => (
            <button
              key={g.id}
              className={`option-card ${grass === g.id ? 'selected' : ''}`}
              onClick={() => setGrass(g.id)}
            >
              <span className="swatch" style={{ background: g.swatch }} />
              {g.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>Bola</h3>
        <div className="option-grid">
          {BALLS.map((b) => (
            <button
              key={b.id}
              className={`option-card ${ball === b.id ? 'selected' : ''}`}
              onClick={() => setBall(b.id)}
            >
              <span className={`ball-preview ball-${b.id}`} />
              {b.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
