import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../createGameConfig';
import { AudioManager } from '../audio/AudioManager';
import type { AudioSettings } from '../audio/audioSettings';

export class TitleScene extends Phaser.Scene {
  private bubbles: Phaser.GameObjects.Image[] = [];
  private fish: Phaser.GameObjects.Image[] = [];

  constructor() {
    super('TitleScene');
  }

  create() {
    AudioManager.get(this).playMainBgm();
    this.createOceanBackground();
    this.createFloatingDecorations();
    this.createTitleCard();
    window.addEventListener('mermaid:audio-settings-changed', this.handleAudioSettingsChanged);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('mermaid:audio-settings-changed', this.handleAudioSettingsChanged);
    });
    this.createButton(GAME_WIDTH / 2, 420, 'はじめる', 0xff7fa0, () => this.startGame(false));
    this.createButton(GAME_WIDTH / 2, 510, 'つづきから', 0x74c779, () => this.startGame(true));
    this.createButton(GAME_WIDTH / 2 - 190, 610, 'おみせ', 0x9b91d9, () => window.dispatchEvent(new Event('mermaid:open-shop')), 300);
    this.createButton(
      GAME_WIDTH / 2 + 190,
      610,
      'うみをえらぶ',
      0x4fb8d8,
      () => window.dispatchEvent(new Event('mermaid:open-stage-select')),
      300,
    );
  }

  update(time: number, delta: number) {
    this.bubbles.forEach((bubble) => {
      bubble.y -= delta * 0.028 * bubble.scale;
      bubble.x += Math.sin(time / 900 + bubble.y) * 0.18;
      if (bubble.y < -30) {
        bubble.y = GAME_HEIGHT + Phaser.Math.Between(20, 120);
        bubble.x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      }
    });

    this.fish.forEach((fish) => {
      fish.x += delta * 0.035 * fish.scaleX;
      if (fish.x > GAME_WIDTH + 90) {
        fish.x = -90;
        fish.y = Phaser.Math.Between(120, 540);
      }
    });
  }

  private startGame(continueGame: boolean) {
    AudioManager.get(this).playMainBgm();
    this.scene.start('MainSeaScene', { continueGame });
  }

  private handleAudioSettingsChanged = (event: Event) => {
    AudioManager.get(this).applySettings((event as CustomEvent<AudioSettings>).detail);
  };

  private createOceanBackground() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x7ed8f3).setOrigin(0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0.18).setOrigin(0);

    for (let i = 0; i < 8; i += 1) {
      const ray = this.add.polygon(
        Phaser.Math.Between(80, GAME_WIDTH - 80),
        -10,
        [0, 0, 44, 0, 120, GAME_HEIGHT, -70, GAME_HEIGHT],
        0xfffbce,
        0.13,
      );
      ray.setBlendMode(Phaser.BlendModes.ADD);
    }

    this.add.image(100, 620, 'coral-pink').setDisplaySize(150, 106).setAlpha(0.82);
    this.add.image(1130, 620, 'seaweed').setScale(1.2).setAlpha(0.8);
  }

  private createFloatingDecorations() {
    for (let i = 0; i < 24; i += 1) {
      const bubble = this.add
        .image(Phaser.Math.Between(30, GAME_WIDTH - 30), Phaser.Math.Between(20, GAME_HEIGHT + 140), 'bubble')
        .setDisplaySize(Phaser.Math.Between(18, 38), Phaser.Math.Between(14, 28))
        .setAlpha(Phaser.Math.FloatBetween(0.35, 0.7));
      this.bubbles.push(bubble);
    }

    for (let i = 0; i < 6; i += 1) {
      const fish = this.add
        .image(Phaser.Math.Between(-100, GAME_WIDTH), Phaser.Math.Between(110, 560), 'fish')
        .setScale(Phaser.Math.FloatBetween(0.65, 1.05))
        .setAlpha(0.88);
      this.fish.push(fish);
    }
  }

  private createTitleCard() {
    const panel = this.add.graphics();
    panel.fillStyle(0xfff8df, 0.94);
    panel.lineStyle(6, 0xffffff, 0.9);
    panel.fillRoundedRect(294, 130, 692, 230, 34);
    panel.strokeRoundedRect(294, 130, 692, 230, 34);

    this.add.image(383, 145, 'pink-shell').setDisplaySize(64, 48).setAngle(-12);
    this.add.image(906, 155, 'sparkle').setScale(0.85).setAngle(18);

    this.add
      .text(GAME_WIDTH / 2, 190, 'ひなちゃんと', {
        fontSize: '42px',
        color: '#2c6ea4',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 258, 'にじいろマーメイドの', {
        fontSize: '52px',
        color: '#7664b5',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 322, 'ぼうけん', {
        fontSize: '50px',
        color: '#2a8fbd',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
  }

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void, width = 350) {
    const button = this.add.container(x, y);
    const body = this.add.graphics();
    body.fillStyle(color, 1);
    body.lineStyle(5, 0xffffff, 0.95);
    body.fillRoundedRect(-width / 2, -42, width, 84, 34);
    body.strokeRoundedRect(-width / 2, -42, width, 84, 34);

    const text = this.add
      .text(0, 0, label, {
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    button.add([body, text]);
    button.setSize(width, 84);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 70,
        yoyo: true,
        onComplete: onClick,
      });
    });
  }
}
