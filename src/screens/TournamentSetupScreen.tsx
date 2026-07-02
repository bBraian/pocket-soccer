import { useMemo, useState } from 'react';
import type { CompetitionId } from '../types';
import { teamsForCompetition } from '../data/teams';
import { shuffle } from '../tournament/bracket';
import { useNavStore } from '../store/navStore';
import { useTournamentStore } from '../store/tournamentStore';
import { TeamCrest } from '../components/TeamCrest';

const SIZES = [4, 8, 16, 32];

export function TournamentSetupScreen() {
  const go = useNavStore((s) => s.go);
  const createNew = useTournamentStore((s) => s.createNew);

  const [comp, setComp] = useState<CompetitionId>('worldcup');
  const [size, setSize] = useState(8);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const pool = useMemo(() => teamsForCompetition(comp), [comp]);
  const maxSize = Math.min(32, 2 ** Math.floor(Math.log2(pool.length)));

  const resetForComp = (c: CompetitionId) => {
    setComp(c);
    setUserTeamId(null);
    setSelected([]);
  };

  const toggle = (id: string) => {
    if (id === userTeamId) return; // your team stays in
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= size) return cur;
      return [...cur, id];
    });
  };

  const pickUser = (id: string) => {
    setUserTeamId(id);
    setSelected((cur) => (cur.includes(id) ? cur : [id, ...cur].slice(0, size)));
  };

  const fillRandom = () => {
    setSelected((cur) => {
      const remaining = pool
        .map((t) => t.id)
        .filter((id) => !cur.includes(id));
      const need = size - cur.length;
      if (need <= 0) return cur;
      return [...cur, ...shuffle(remaining).slice(0, need)];
    });
  };

  const changeSize = (s: number) => {
    setSize(s);
    setSelected((cur) => {
      if (cur.length <= s) return cur;
      const keep = userTeamId
        ? [userTeamId, ...cur.filter((x) => x !== userTeamId)]
        : cur;
      return keep.slice(0, s);
    });
  };

  const ready = userTeamId != null && selected.length === size;

  const create = () => {
    if (!ready || !userTeamId) return;
    createNew(comp, size, selected, userTeamId);
    go('bracket');
  };

  return (
    <div className="screen tournament-setup">
      <header className="screen-header">
        <button className="back" onClick={() => go('home')}>
          ‹ Voltar
        </button>
        <h2>Novo Torneio</h2>
      </header>

      <div className="tabs">
        <button
          className={comp === 'worldcup' ? 'active' : ''}
          onClick={() => resetForComp('worldcup')}
        >
          Copa do Mundo
        </button>
        <button
          className={comp === 'clubleague' ? 'active' : ''}
          onClick={() => resetForComp('clubleague')}
        >
          Liga dos Clubes
        </button>
      </div>

      <div className="setup-row">
        <span>Times:</span>
        {SIZES.filter((s) => s <= maxSize).map((s) => (
          <button
            key={s}
            className={`chip ${size === s ? 'active' : ''}`}
            onClick={() => changeSize(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="setup-row">
        <button className="chip fill" onClick={fillRandom}>
          🎲 Preencher sorteado
        </button>
        <span className="count">
          {selected.length}/{size}
        </span>
      </div>

      <p className="hint-line">
        Toque para incluir/remover. Segure o ⭐ para definir seu time.
      </p>

      <div className="team-grid compact">
        {pool.map((team) => {
          const inBracket = selected.includes(team.id);
          const isUser = userTeamId === team.id;
          return (
            <div
              key={team.id}
              className={`team-card small ${inBracket ? 'in' : ''} ${
                isUser ? 'user' : ''
              }`}
            >
              <button className="team-card-main" onClick={() => toggle(team.id)}>
                <TeamCrest team={team} size={34} />
                <span className="team-name">{team.name}</span>
              </button>
              <button
                className={`star-btn ${isUser ? 'on' : ''}`}
                onClick={() => pickUser(team.id)}
                aria-label="Definir como seu time"
              >
                ⭐
              </button>
            </div>
          );
        })}
      </div>

      <div className="setup-footer">
        <button className="menu-btn primary" disabled={!ready} onClick={create}>
          Criar torneio
        </button>
      </div>
    </div>
  );
}
