export type CompanionFishId = 'clownfish' | 'bluefish' | 'pinkfish';

export type CompanionFish = {
  id: CompanionFishId;
  name: string;
  imageKey: string;
  unlocked: boolean;
  selected: boolean;
};

export const companionFishCatalog: ReadonlyArray<Omit<CompanionFish, 'unlocked' | 'selected'>> = [
  {
    id: 'clownfish',
    name: 'クマノミ',
    imageKey: 'fish-clownfish',
  },
  {
    id: 'bluefish',
    name: 'あおいさかな',
    imageKey: 'fish-bluefish',
  },
  {
    id: 'pinkfish',
    name: 'ピンクのさかな',
    imageKey: 'fish-pinkfish',
  },
];
