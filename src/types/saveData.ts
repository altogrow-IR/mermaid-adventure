import type { CompanionFishId } from './companionFish';
import type { DressUpState } from './dressUp';
import type { AudioSettings } from '../game/audio/audioSettings';

export type SaveData = {
  collectedShells: number;
  collectedPearls: number;
  clearedQuestIds: string[];
  sparklePoint: number;
  version: number;
  companionFish: {
    unlockedIds: CompanionFishId[];
    selectedIds: CompanionFishId[];
  };
  dressUp: DressUpState;
  unlockedDressUpItemIds: string[];
  openedTreasureIds: string[];
  audioSettings: AudioSettings;
};
