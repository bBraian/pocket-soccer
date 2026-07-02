import { useNavStore } from '../store/navStore';
import { useTournamentStore } from '../store/tournamentStore';
import { fullscreenSupported, toggleFullscreen } from '../fullscreen';

export function HomeScreen() {
  const go = useNavStore((s) => s.go);
  const startFlow = useNavStore((s) => s.startFlow);
  const tournament = useTournamentStore((s) => s.tournament);
  const hasTournament = tournament && !tournament.championId;

  return (
    <div className="screen home">
      <div className="home-logo">
        <span className="ball-dot" />
        <h1>Pocket Soccer</h1>
        <p>Futebol de botão</p>
      </div>

      <div className="home-menu">
        <button
          className="menu-btn primary"
          onClick={() => {
            startFlow('cpu');
            go('teamSelect');
          }}
        >
          1 vs CPU
        </button>
        <button
          className="menu-btn"
          onClick={() => {
            startFlow('pvp');
            go('teamSelect');
          }}
        >
          PvP Local
        </button>
        <button className="menu-btn" onClick={() => go('tournamentSetup')}>
          Torneio
        </button>
        {hasTournament && (
          <button className="menu-btn resume" onClick={() => go('bracket')}>
            ▶ Retomar torneio
          </button>
        )}
        <button className="menu-btn ghost" onClick={() => go('settings')}>
          ⚙ Configurações
        </button>
        {fullscreenSupported() && (
          <button className="menu-btn ghost" onClick={toggleFullscreen}>
            ⛶ Tela cheia
          </button>
        )}
      </div>

      <p className="install-hint">
        Dica: no celular, use “Adicionar à tela inicial” do navegador para abrir
        como app (tela cheia, sem barra).
      </p>
    </div>
  );
}
