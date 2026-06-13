import Phaser from 'phaser';
import { loadSaveData, saveSaveData } from '../../stores/saveData';
import { AUDIO_KEYS } from './audioKeys';
import { DEFAULT_AUDIO_SETTINGS, type AudioSettings } from './audioSettings';

const AUDIO_MANAGER_REGISTRY_KEY = 'audioManager';

export class AudioManager {
  private scene: Phaser.Scene;
  private mainBgm?: Phaser.Sound.BaseSound;
  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };

  private constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.syncSettings();
  }

  static get(scene: Phaser.Scene) {
    const current = scene.registry.get(AUDIO_MANAGER_REGISTRY_KEY) as AudioManager | undefined;
    if (current) {
      current.scene = scene;
      current.syncSettings();
      return current;
    }

    const manager = new AudioManager(scene);
    scene.registry.set(AUDIO_MANAGER_REGISTRY_KEY, manager);
    return manager;
  }

  playMainBgm() {
    this.syncSettings();

    if (!this.settings.bgmEnabled) {
      this.stopMainBgm();
      return;
    }

    if (!this.scene.cache.audio.exists(AUDIO_KEYS.MAIN_BGM)) {
      console.warn('Main BGM is not loaded. Place the audio file in src/assets/audio/.');
      return;
    }

    try {
      if (!this.mainBgm) {
        this.mainBgm = this.scene.sound.add(AUDIO_KEYS.MAIN_BGM, {
          loop: true,
          volume: this.settings.bgmVolume,
        });
      }

      this.applyVolume();

      if (!this.mainBgm.isPlaying) {
        this.mainBgm.play({ loop: true, volume: this.settings.bgmVolume });
      }
    } catch (error) {
      console.warn('Main BGM could not be played:', error);
    }
  }

  stopMainBgm() {
    try {
      if (this.mainBgm?.isPlaying) {
        this.mainBgm.stop();
      }
    } catch (error) {
      console.warn('Main BGM could not be stopped:', error);
    }
  }

  toggleBgm() {
    const nextSettings = {
      ...this.settings,
      bgmEnabled: !this.settings.bgmEnabled,
    };
    this.saveSettings(nextSettings);

    if (nextSettings.bgmEnabled) {
      this.playMainBgm();
    } else {
      this.stopMainBgm();
    }

    return nextSettings;
  }

  setVolume(volume: number) {
    const nextSettings = {
      ...this.settings,
      bgmVolume: this.clampVolume(volume),
    };
    this.saveSettings(nextSettings);
    this.applyVolume();

    if (nextSettings.bgmEnabled) {
      this.playMainBgm();
    }

    return nextSettings;
  }

  applySettings(settings: AudioSettings) {
    const nextSettings = {
      bgmEnabled: settings.bgmEnabled,
      bgmVolume: this.clampVolume(settings.bgmVolume),
    };
    this.saveSettings(nextSettings);

    if (nextSettings.bgmEnabled) {
      this.playMainBgm();
    } else {
      this.stopMainBgm();
    }
  }

  getSettings() {
    this.syncSettings();
    return { ...this.settings };
  }

  private syncSettings() {
    this.settings = loadSaveData().audioSettings;
    this.applyVolume();
  }

  private saveSettings(settings: AudioSettings) {
    this.settings = settings;
    const saveData = loadSaveData();
    saveSaveData({
      ...saveData,
      audioSettings: settings,
    });
  }

  private applyVolume() {
    if (!this.mainBgm) {
      return;
    }

    const soundWithVolume = this.mainBgm as Phaser.Sound.BaseSound & { setVolume?: (volume: number) => void; volume?: number };
    if (soundWithVolume.setVolume) {
      soundWithVolume.setVolume(this.settings.bgmVolume);
      return;
    }

    soundWithVolume.volume = this.settings.bgmVolume;
  }

  private clampVolume(volume: number) {
    return Phaser.Math.Clamp(Number.isFinite(volume) ? volume : DEFAULT_AUDIO_SETTINGS.bgmVolume, 0, 1);
  }
}
