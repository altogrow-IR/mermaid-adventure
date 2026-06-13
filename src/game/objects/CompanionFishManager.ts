import Phaser from 'phaser';
import { companionFishCatalog, type CompanionFishId } from '../../types/companionFish';

type CompanionSprite = {
  id: CompanionFishId;
  sprite: Phaser.GameObjects.Image;
};

export class CompanionFishManager {
  private readonly sprites: CompanionSprite[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  setSelectedFish(selectedIds: CompanionFishId[]) {
    this.sprites.forEach(({ sprite }) => sprite.destroy());
    this.sprites.length = 0;

    selectedIds.slice(0, 3).forEach((id, index) => {
      const fish = companionFishCatalog.find((item) => item.id === id);
      if (!fish) {
        return;
      }

      const width = 78 - index * 7;
      const height = 46 - index * 4;
      const sprite = this.scene.add.image(0, 0, fish.imageKey).setDepth(34).setDisplaySize(width, height);
      this.sprites.push({ id, sprite });
    });
  }

  update(target: Phaser.GameObjects.Image, time: number) {
    this.sprites.forEach(({ sprite }, index) => {
      const offsetX = target.flipX ? 110 + index * 58 : -110 - index * 58;
      const offsetY = 26 + index * 38;
      const bob = Math.sin(time / 320 + index) * 8;
      const nextX = target.x + offsetX;
      const nextY = target.y + offsetY + bob;

      sprite.x = Phaser.Math.Linear(sprite.x || nextX, nextX, 0.08);
      sprite.y = Phaser.Math.Linear(sprite.y || nextY, nextY, 0.08);
      sprite.setFlipX(target.flipX);
      sprite.rotation = Math.sin(time / 420 + index) * 0.08;
    });
  }

  destroy() {
    this.sprites.forEach(({ sprite }) => sprite.destroy());
    this.sprites.length = 0;
  }
}
