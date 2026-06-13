export type DressUpCategory = 'tail' | 'hairAccessory' | 'tiara';

export type DressUpItem = {
  id: string;
  category: DressUpCategory;
  name: string;
  imageKey: string;
  unlocked: boolean;
};

export type DressUpState = {
  tail: string;
  hairAccessory: string;
  tiara: string;
};

export const defaultDressUpState: DressUpState = {
  tail: 'tail-aqua',
  hairAccessory: 'hair-flower',
  tiara: 'tiara-gold',
};

export const dressUpCatalog: ReadonlyArray<Omit<DressUpItem, 'unlocked'>> = [
  { id: 'tail-aqua', category: 'tail', name: 'みずいろ', imageKey: 'tail-aqua' },
  { id: 'tail-pink', category: 'tail', name: 'ピンク', imageKey: 'tail-pink' },
  { id: 'tail-purple', category: 'tail', name: 'むらさき', imageKey: 'tail-purple' },
  { id: 'hair-flower', category: 'hairAccessory', name: 'おはな', imageKey: 'hair-flower' },
  { id: 'hair-star', category: 'hairAccessory', name: 'ほし', imageKey: 'hair-star' },
  { id: 'hair-pearl', category: 'hairAccessory', name: 'しんじゅ', imageKey: 'hair-pearl' },
  { id: 'tiara-gold', category: 'tiara', name: 'きんのティアラ', imageKey: 'tiara-gold' },
  { id: 'tiara-pearl', category: 'tiara', name: 'しんじゅティアラ', imageKey: 'tiara-pearl' },
  { id: 'tiara-star', category: 'tiara', name: 'ほしのティアラ', imageKey: 'tiara-star' },
];

export const initialDressUpItemIds = ['tail-aqua', 'hair-flower', 'tiara-gold'] as const;
