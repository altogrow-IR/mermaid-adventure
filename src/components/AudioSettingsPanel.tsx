import { useState } from 'react';
import { loadSaveData, saveSaveData } from '../stores/saveData';
import type { AudioSettings } from '../game/audio/audioSettings';

type AudioSettingsPanelProps = {
  onClose: () => void;
};

export function AudioSettingsPanel({ onClose }: AudioSettingsPanelProps) {
  const [settings, setSettings] = useState<AudioSettings>(() => loadSaveData().audioSettings);

  const updateSettings = (nextSettings: AudioSettings) => {
    const saveData = loadSaveData();
    saveSaveData({
      ...saveData,
      audioSettings: nextSettings,
    });
    setSettings(nextSettings);
    window.dispatchEvent(new CustomEvent<AudioSettings>('mermaid:audio-settings-changed', { detail: nextSettings }));
  };

  const toggleBgm = () => {
    updateSettings({
      ...settings,
      bgmEnabled: !settings.bgmEnabled,
    });
  };

  const changeVolume = (value: string) => {
    updateSettings({
      ...settings,
      bgmVolume: Number(value) / 100,
    });
  };

  return (
    <section className="overlay-panel" aria-label="BGMのせってい">
      <div className="overlay-card audio-card">
        <h1>♪ BGM</h1>
        <div className="audio-setting-row">
          <span>おと</span>
          <button className={`toggle-button ${settings.bgmEnabled ? 'is-on' : ''}`} onClick={toggleBgm} type="button">
            {settings.bgmEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        <label className="volume-control">
          <span>おんりょう</span>
          <input
            max="100"
            min="0"
            onChange={(event) => changeVolume(event.target.value)}
            type="range"
            value={Math.round(settings.bgmVolume * 100)}
          />
          <strong>{Math.round(settings.bgmVolume * 100)}%</strong>
        </label>
        <div className="overlay-actions">
          <button className="primary-button" onClick={onClose} type="button">
            OK
          </button>
        </div>
      </div>
    </section>
  );
}
