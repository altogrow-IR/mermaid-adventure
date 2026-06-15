import { useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameCanvas } from './components/GameCanvas';
import { CompanionFishSelector } from './components/CompanionFishSelector';
import { AudioSettingsPanel } from './components/AudioSettingsPanel';
import { CastleSelectScreen } from './components/CastleSelectScreen';
import { ShopScreen } from './components/ShopScreen';
import { StageSelectScreen } from './components/StageSelectScreen';

type OverlayScreen = 'none' | 'companion' | 'audio' | 'shop' | 'stage' | 'castle';

export default function App() {
  const [overlayScreen, setOverlayScreen] = useState<OverlayScreen>('none');

  useEffect(() => {
    const openCompanion = () => setOverlayScreen('companion');
    const openAudioSettings = () => setOverlayScreen('audio');
    const openShop = () => setOverlayScreen('shop');
    const openStageSelect = () => setOverlayScreen('stage');
    const openCastleSelect = () => setOverlayScreen('castle');

    window.addEventListener('mermaid:open-companion', openCompanion);
    window.addEventListener('mermaid:open-audio-settings', openAudioSettings);
    window.addEventListener('mermaid:open-shop', openShop);
    window.addEventListener('mermaid:open-stage-select', openStageSelect);
    window.addEventListener('mermaid:open-castle-select', openCastleSelect);

    return () => {
      window.removeEventListener('mermaid:open-companion', openCompanion);
      window.removeEventListener('mermaid:open-audio-settings', openAudioSettings);
      window.removeEventListener('mermaid:open-shop', openShop);
      window.removeEventListener('mermaid:open-stage-select', openStageSelect);
      window.removeEventListener('mermaid:open-castle-select', openCastleSelect);
    };
  }, []);

  return (
    <ErrorBoundary>
      <main className="app-shell" aria-label="ひなちゃんとにじいろマーメイドのぼうけん">
        <GameCanvas />
        {overlayScreen === 'companion' && <CompanionFishSelector onClose={() => setOverlayScreen('none')} />}
        {overlayScreen === 'audio' && <AudioSettingsPanel onClose={() => setOverlayScreen('none')} />}
        {overlayScreen === 'shop' && <ShopScreen onClose={() => setOverlayScreen('none')} />}
        {overlayScreen === 'stage' && <StageSelectScreen onClose={() => setOverlayScreen('none')} />}
        {overlayScreen === 'castle' && <CastleSelectScreen onClose={() => setOverlayScreen('none')} />}
      </main>
    </ErrorBoundary>
  );
}

