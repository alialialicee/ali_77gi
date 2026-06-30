import { useState } from 'react';
import IntroForm from './components/IntroForm';
import LoadingRitual from './components/LoadingRitual';
import JumpScare from './components/JumpScare';
import ResultScreen from './components/ResultScreen';
import { generateFortune, type FortuneResult, type UserInput } from './utils/generateFortune';

type Screen = 'intro' | 'loading' | 'jump' | 'result';

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [result, setResult] = useState<FortuneResult | null>(null);

  const beginRitual = (input: UserInput) => {
    setResult(generateFortune(input));
    setScreen('loading');
  };

  const reset = () => {
    setResult(null);
    setScreen('intro');
  };

  return (
    <main className="app-shell">
      {screen === 'intro' && <IntroForm onSubmit={beginRitual} />}
      {screen === 'loading' && <LoadingRitual onComplete={() => setScreen('jump')} />}
      {screen === 'jump' && <JumpScare onComplete={() => setScreen('result')} />}
      {screen === 'result' && result && <ResultScreen result={result} onReset={reset} />}
    </main>
  );
}
