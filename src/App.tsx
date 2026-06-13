import { useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameCanvas } from './components/GameCanvas';
import { CompanionFishSelector } from './components/CompanionFishSelector';
import { AudioSettingsPanel } from './components/AudioSettingsPanel';

type OverlayScreen = 'none' | 'companion' | 'audio';

export default function App() {
  const [overlayScreen, setOverlayScreen] = useState<OverlayScreen>('none');

  useEffect(() => {
    const openCompanion = () => setOverlayScreen('companion');
    const openAudioSettings = () => setOverlayScreen('audio');

    window.addEventListener('mermaid:open-companion', openCompanion);
    window.addEventListener('mermaid:open-audio-settings', openAudioSettings);

    return () => {
      window.removeEventListener('mermaid:open-companion', openCompanion);
      window.removeEventListener('mermaid:open-audio-settings', openAudioSettings);
    };
  }, []);

  return (
    <ErrorBoundary>
      <main className="app-shell" aria-label="ひなちゃんとにじいろマーメイドのぼうけん">
        <GameCanvas />
        {overlayScreen === 'companion' && <CompanionFishSelector onClose={() => setOverlayScreen('none')} />}
        {overlayScreen === 'audio' && <AudioSettingsPanel onClose={() => setOverlayScreen('none')} />}
      </main>
    </ErrorBoundary>
  );
}
