import Phaser from 'phaser';

export type CollectibleKind = 'shell' | 'pearl';

export class Collectible extends Phaser.Physics.Arcade.Image {
  readonly kind: CollectibleKind;
  private readonly startY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: CollectibleKind) {
    super(scene, x, y, kind === 'shell' ? 'pink-shell' : 'pearl');
    this.kind = kind;
    this.startY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(28);
    this.setDepth(25);
    this.setImmovable(true);
    this.setDisplaySize(kind === 'shell' ? 74 : 58, kind === 'shell' ? 54 : 50);
  }

  update(time: number) {
    this.y = this.startY + Math.sin(time / 520 + this.x * 0.01) * 8;
    this.rotation = Math.sin(time / 700 + this.x) * 0.08;
  }
}
