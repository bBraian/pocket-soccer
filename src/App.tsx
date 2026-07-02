import { useNavStore } from './store/navStore';
import { HomeScreen } from './screens/HomeScreen';
import { TeamSelectScreen } from './screens/TeamSelectScreen';
import { FormationScreen } from './screens/FormationScreen';
import { MatchScreen } from './screens/MatchScreen';
import { ResultScreen } from './screens/ResultScreen';
import { BracketScreen } from './screens/BracketScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TournamentSetupScreen } from './screens/TournamentSetupScreen';

export default function App() {
  const screen = useNavStore((s) => s.screen);

  return (
    <div className="app-shell">
      {screen === 'home' && <HomeScreen />}
      {screen === 'teamSelect' && <TeamSelectScreen />}
      {screen === 'formation' && <FormationScreen />}
      {screen === 'match' && <MatchScreen />}
      {screen === 'result' && <ResultScreen />}
      {screen === 'bracket' && <BracketScreen />}
      {screen === 'settings' && <SettingsScreen />}
      {screen === 'tournamentSetup' && <TournamentSetupScreen />}
    </div>
  );
}
