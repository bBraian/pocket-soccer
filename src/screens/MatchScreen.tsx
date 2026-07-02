import { useEffect, useMemo, useState } from 'react';
import type { MatchConfig } from '../types';
import { GameCanvas } from '../components/GameCanvas';
import { HUD } from '../components/HUD';
import { useNavStore } from '../store/navStore';
import { useMatchStore } from '../store/matchStore';
import { useSettingsStore } from '../store/settingsStore';

export function MatchScreen() {
  const go = useNavStore((s) => s.go);
  const nav = useNavStore.getState();
  const begin = useMatchStore((s) => s.begin);
  const { grass, ball } = useSettingsStore();
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);

  const config = useMemo<MatchConfig | null>(() => {
    if (!nav.homeTeam || !nav.awayTeam) return null;
    return {
      mode: nav.mode,
      homeTeam: nav.homeTeam,
      awayTeam: nav.awayTeam,
      homeFormation: nav.homeFormation,
      awayFormation: nav.awayFormation,
      cpuSide: nav.mode === 'cpu' ? 'away' : undefined,
      fromTournament: nav.fromTournament,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!config) {
      go('home');
      return;
    }
    begin(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Best-effort landscape lock (only works when installed / fullscreen; a plain
  // browser tab just ignores it).
  useEffect(() => {
    const o = window.screen?.orientation as
      | (ScreenOrientation & {
          lock?: (o: string) => Promise<void>;
          unlock?: () => void;
        })
      | undefined;
    o?.lock?.('landscape').catch(() => {});
    return () => o?.unlock?.();
  }, []);

  if (!config) return null;

  return (
    <div className="screen match">
      <div className="pitch-wrap">
        <GameCanvas
          config={config}
          grass={grass}
          ball={ball}
          paused={paused || ended}
          onMatchEnd={() => {
            setEnded(true);
            go('result');
          }}
        />
        <HUD
          homeTeam={config.homeTeam}
          awayTeam={config.awayTeam}
          onPause={() => setPaused(true)}
        />
      </div>

      {paused && (
        <div className="pause-overlay">
          <div className="pause-box">
            <h2>Pausado</h2>
            <button className="menu-btn primary" onClick={() => setPaused(false)}>
              Continuar
            </button>
            <button
              className="menu-btn ghost"
              onClick={() => {
                setPaused(false);
                go(nav.fromTournament ? 'bracket' : 'home');
              }}
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
