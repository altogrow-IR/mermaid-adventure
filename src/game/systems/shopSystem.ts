import type { SaveData } from '../../types/saveData';
import type { CastleId, ShopItem, StageId } from '../../types/shop';

export function isPurchased(saveData: SaveData, itemId: string): boolean {
  return saveData.purchasedItemIds.includes(itemId);
}

export function canBuyItem(saveData: SaveData, item: ShopItem): boolean {
  return saveData.sparklePoint >= item.price && !isPurchased(saveData, item.id);
}

export function buyItem(saveData: SaveData, item: ShopItem): SaveData {
  if (!canBuyItem(saveData, item)) {
    return saveData;
  }

  const nextSaveData: SaveData = {
    ...saveData,
    sparklePoint: Math.max(0, saveData.sparklePoint - item.price),
    purchasedItemIds: [...saveData.purchasedItemIds, item.id],
  };

  if (item.type === 'stage') {
    return selectStage(nextSaveData, item.id as StageId);
  }

  if (item.type === 'castle') {
    return selectCastle(nextSaveData, item.id as CastleId);
  }

  return nextSaveData;
}

export function selectStage(saveData: SaveData, stageId: StageId): SaveData {
  if (stageId !== 'stage_default' && !saveData.purchasedItemIds.includes(stageId)) {
    return saveData;
  }

  return {
    ...saveData,
    selectedStageId: stageId,
  };
}

export function selectCastle(saveData: SaveData, castleId: CastleId): SaveData {
  if (castleId !== 'none' && !saveData.purchasedItemIds.includes(castleId)) {
    return saveData;
  }

  return {
    ...saveData,
    selectedCastleId: castleId,
  };
}

