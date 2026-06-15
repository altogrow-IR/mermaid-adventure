export type ShopItemType = 'stage' | 'castle' | 'dressUp' | 'companion';

export type StageId = 'stage_default' | 'stage_jellyfish_sea' | 'stage_rainbow_sea' | 'stage_star_sea';

export type CastleId = 'none' | 'castle_small' | 'castle_pearl' | 'castle_rainbow';

export type ShopItem = {
  id: string;
  type: ShopItemType;
  name: string;
  description: string;
  price: number;
  imageKey: string;
};

export const STAGE_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'stage_jellyfish_sea',
    type: 'stage',
    name: 'くらげのうみ',
    description: 'ひかる くらげが ふわふわする うみ',
    price: 300,
    imageKey: 'stageJellyfishSea',
  },
  {
    id: 'stage_rainbow_sea',
    type: 'stage',
    name: 'にじいろのうみ',
    description: 'にじいろの あわが きらきらする うみ',
    price: 500,
    imageKey: 'stageRainbowSea',
  },
  {
    id: 'stage_star_sea',
    type: 'stage',
    name: 'おほしさまのうみ',
    description: 'ほしと つきが ひかる ふしぎな うみ',
    price: 800,
    imageKey: 'stageStarSea',
  },
];

export const CASTLE_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'castle_small',
    type: 'castle',
    name: 'ちいさなおしろ',
    description: 'かわいい うみの おしろ',
    price: 400,
    imageKey: 'castleSmall',
  },
  {
    id: 'castle_pearl',
    type: 'castle',
    name: 'しんじゅのおしろ',
    description: 'しんじゅで できた きれいな おしろ',
    price: 700,
    imageKey: 'castlePearl',
  },
  {
    id: 'castle_rainbow',
    type: 'castle',
    name: 'にじいろのおしろ',
    description: 'にじいろに ひかる とくべつな おしろ',
    price: 1000,
    imageKey: 'castleRainbow',
  },
];

export const ALL_SHOP_ITEMS = [...STAGE_SHOP_ITEMS, ...CASTLE_SHOP_ITEMS];

export const stageIds: StageId[] = ['stage_default', 'stage_jellyfish_sea', 'stage_rainbow_sea', 'stage_star_sea'];

export const castleIds: CastleId[] = ['none', 'castle_small', 'castle_pearl', 'castle_rainbow'];

