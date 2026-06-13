import { companionFishCatalog } from '../../types/companionFish';
import type { SaveData } from '../../types/saveData';

export type RewardResult =
  | {
      kind: 'companionFish';
      id: string;
      message: string;
    }
  | {
      kind: 'dressUpItem';
      id: string;
      message: string;
    }
  | {
      kind: 'sparklePoint';
      amount: number;
      message: string;
    };

export function grantNextReward(saveData: SaveData): RewardResult {
  const nextFish = companionFishCatalog.find((fish) => !saveData.companionFish.unlockedIds.includes(fish.id));
  if (nextFish) {
    saveData.companionFish.unlockedIds = [...saveData.companionFish.unlockedIds, nextFish.id];
    saveData.companionFish.selectedIds = Array.from(new Set([...saveData.companionFish.selectedIds, nextFish.id])).slice(
      0,
      3,
    );
    return {
      kind: 'companionFish',
      id: nextFish.id,
      message: `${nextFish.name}が なかまになった！`,
    };
  }

  saveData.sparklePoint += 50;
  return {
    kind: 'sparklePoint',
    amount: 50,
    message: 'キラキラ 50を ゲット！',
  };
}
