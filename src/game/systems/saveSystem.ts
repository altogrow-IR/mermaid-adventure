import { companionFishCatalog, type CompanionFishId } from '../../types/companionFish';
import { defaultDressUpState, initialDressUpItemIds } from '../../types/dressUp';
import type { SaveData } from '../../types/saveData';
import { DEFAULT_AUDIO_SETTINGS } from '../audio/audioSettings';

export const SAVE_DATA_KEY = 'mermaid-save-data';
export const SAVE_DATA_VERSION = 2;

export const defaultSaveData: SaveData = {
  collectedShells: 0,
  collectedPearls: 0,
  clearedQuestIds: [],
  sparklePoint: 0,
  version: SAVE_DATA_VERSION,
  companionFish: {
    unlockedIds: ['clownfish'],
    selectedIds: ['clownfish'],
  },
  dressUp: defaultDressUpState,
  unlockedDressUpItemIds: [...initialDressUpItemIds],
  openedTreasureIds: [],
  audioSettings: { ...DEFAULT_AUDIO_SETTINGS },
};

const companionFishIds = new Set<CompanionFishId>(companionFishCatalog.map((fish) => fish.id));
const dressUpItemIds = new Set([
  'tail-aqua',
  'tail-pink',
  'tail-purple',
  'hair-flower',
  'hair-star',
  'hair-pearl',
  'tiara-gold',
  'tiara-pearl',
  'tiara-star',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function numberOrZero(value: unknown) {
  return Math.max(0, Number(value ?? 0));
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function companionIds(value: unknown) {
  return stringArray(value).filter((id): id is CompanionFishId => companionFishIds.has(id as CompanionFishId));
}

function unique<T extends string>(items: T[]) {
  return Array.from(new Set(items));
}

function validDressUpItem(id: unknown, fallback: string) {
  return typeof id === 'string' && dressUpItemIds.has(id) ? id : fallback;
}

function validAudioSettings(value: unknown) {
  if (!isRecord(value)) {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }

  const volume = Number(value.bgmVolume);
  return {
    bgmEnabled: typeof value.bgmEnabled === 'boolean' ? value.bgmEnabled : DEFAULT_AUDIO_SETTINGS.bgmEnabled,
    bgmVolume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_AUDIO_SETTINGS.bgmVolume,
  };
}

export function migrateSaveData(raw: unknown): SaveData {
  if (!isRecord(raw)) {
    return structuredClone(defaultSaveData);
  }

  const companionRaw = isRecord(raw.companionFish) ? raw.companionFish : {};
  const dressUpRaw = isRecord(raw.dressUp) ? raw.dressUp : {};
  const unlockedFish = unique(['clownfish', ...companionIds(companionRaw.unlockedIds)]);
  const selectedFish = unique(companionIds(companionRaw.selectedIds)).filter((id) => unlockedFish.includes(id)).slice(0, 3);

  return {
    collectedShells: numberOrZero(raw.collectedShells),
    collectedPearls: numberOrZero(raw.collectedPearls),
    clearedQuestIds: stringArray(raw.clearedQuestIds),
    sparklePoint: numberOrZero(raw.sparklePoint),
    version: SAVE_DATA_VERSION,
    companionFish: {
      unlockedIds: unlockedFish,
      selectedIds: selectedFish.length > 0 ? selectedFish : ['clownfish'],
    },
    dressUp: {
      tail: validDressUpItem(dressUpRaw.tail, defaultDressUpState.tail),
      hairAccessory: validDressUpItem(dressUpRaw.hairAccessory, defaultDressUpState.hairAccessory),
      tiara: validDressUpItem(dressUpRaw.tiara, defaultDressUpState.tiara),
    },
    unlockedDressUpItemIds: unique([...initialDressUpItemIds, ...stringArray(raw.unlockedDressUpItemIds)]).filter((id) =>
      dressUpItemIds.has(id),
    ),
    openedTreasureIds: stringArray(raw.openedTreasureIds),
    audioSettings: validAudioSettings(raw.audioSettings),
  };
}

export function loadSaveData(): SaveData {
  try {
    const rawData = window.localStorage.getItem(SAVE_DATA_KEY);
    if (!rawData) {
      return structuredClone(defaultSaveData);
    }

    return migrateSaveData(JSON.parse(rawData));
  } catch (error) {
    console.warn('Save data could not be loaded:', error);
    return structuredClone(defaultSaveData);
  }
}

export function saveSaveData(saveData: SaveData) {
  try {
    window.localStorage.setItem(SAVE_DATA_KEY, JSON.stringify({ ...saveData, version: SAVE_DATA_VERSION }));
    window.dispatchEvent(new CustomEvent<SaveData>('mermaid:save-updated', { detail: saveData }));
  } catch (error) {
    console.warn('Save data could not be saved:', error);
  }
}

export function resetSaveData() {
  saveSaveData(structuredClone(defaultSaveData));
}
