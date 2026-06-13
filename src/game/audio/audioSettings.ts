export type AudioSettings = {
  bgmEnabled: boolean;
  bgmVolume: number;
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  bgmEnabled: true,
  bgmVolume: 0.25,
};
