import Phaser from 'phaser';
import { GAME_WIDTH } from '../createGameConfig';
import type { SaveData } from '../../types/saveData';

export type UiUpdatePayload = SaveData & {
  questShells: number;
  questDone: boolean;
  questCount: number;
  questNumber: number;
  questTarget: number;
};

export class UIScene extends Phaser.Scene {
  private pearlText?: Phaser.GameObjects.Text;
  private shellText?: Phaser.GameObjects.Text;
  private sparkleText?: Phaser.GameObjects.Text;
  private questText?: Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  create(data: UiUpdatePayload) {
    this.createTopBar(data);
    this.createMenuButtons();
    this.updateQuest(data);

    this.game.events.on('ui:update', this.updateUi, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('ui:update', this.updateUi, this);
    });
  }

  private createTopBar(data: UiUpdatePayload) {
    this.createCounter(24, 18, 'pearl', 'しんじゅ');
    this.pearlText = this.add.text(116, 54, `${data.collectedPearls}`, this.counterTextStyle()).setOrigin(0, 0.5);

    this.createCounter(228, 18, 'pink-shell', 'かいがら');
    this.shellText = this.add
      .text(320, 54, `${data.questShells} / ${data.questTarget}`, this.counterTextStyle())
      .setOrigin(0, 0.5);

    this.createCounter(GAME_WIDTH / 2 - 132, 18, 'sparkle', 'キラキラ');
    this.sparkleText = this.add.text(GAME_WIDTH / 2 - 18, 54, `${data.sparklePoint}`, this.counterTextStyle()).setOrigin(0, 0.5);
  }

  private createCounter(x: number, y: number, iconKey: string, label: string) {
    const panel = this.add.graphics();
    panel.fillStyle(0xfff5df, 0.94);
    panel.lineStyle(4, 0xffffff, 0.9);
    panel.fillRoundedRect(x, y, 186, 76, 18);
    panel.strokeRoundedRect(x, y, 186, 76, 18);
    this.add.image(x + 40, y + 42, iconKey).setDisplaySize(54, 42);
    this.add.text(x + 88, y + 13, label, { fontSize: '18px', color: '#65424d', fontStyle: 'bold' });
  }

  private createMenuButtons() {
    this.createRoundButton(GAME_WIDTH - 352, 56, 'おみせ', 'treasure', () => {
      window.dispatchEvent(new Event('mermaid:open-shop'));
    });
    this.createRoundButton(GAME_WIDTH - 238, 56, 'うみ', 'sparkle', () => {
      window.dispatchEvent(new Event('mermaid:open-stage-select'));
    });
    this.createRoundButton(GAME_WIDTH - 124, 56, 'BGM', 'sparkle', () => {
      window.dispatchEvent(new Event('mermaid:open-audio-settings'));
    });
    this.createRoundButton(GAME_WIDTH - 124, 166, 'なかま', 'fish-clownfish', () => {
      window.dispatchEvent(new Event('mermaid:open-companion'));
    });
  }

  private createRoundButton(x: number, y: number, label: string, iconKey: string, onClick: () => void) {
    const button = this.add.container(x, y);
    const circle = this.add.circle(0, 0, 48, 0xfff4dd, 0.96).setStrokeStyle(5, 0xffffff, 0.9);
    const mark = this.add.image(0, -10, iconKey).setDisplaySize(34, 28);
    const text = this.add.text(0, 24, label, { fontSize: '16px', color: '#765843', fontStyle: 'bold' }).setOrigin(0.5);
    button.add([circle, mark, text]);
    button.setSize(96, 96);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scale: 0.94,
        duration: 70,
        yoyo: true,
        onComplete: onClick,
      });
    });
  }

  private updateQuest(data: UiUpdatePayload) {
    if (!this.questText) {
      this.questText = this.add
        .text(GAME_WIDTH - 282, 142, '', {
          fontSize: '24px',
          color: '#66464c',
          fontStyle: 'bold',
          align: 'center',
          lineSpacing: 8,
          backgroundColor: 'rgba(255, 248, 223, 0.9)',
          padding: { x: 18, y: 14 },
        })
        .setOrigin(0.5, 0);
      this.questText.setStroke('#ffffff', 4);
    }

    this.questText.setText(
      data.questDone
        ? 'おねがい\nぜんぶ ありがとう！'
        : `おねがい ${data.questNumber} / ${data.questCount}\nかいがら\n${data.questShells} / ${data.questTarget}`,
    );
  }

  private updateUi(data: UiUpdatePayload) {
    this.pearlText?.setText(`${data.collectedPearls}`);
    this.shellText?.setText(`${data.questShells} / ${data.questTarget}`);
    this.sparkleText?.setText(`${data.sparklePoint}`);
    this.updateQuest(data);
  }

  private counterTextStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontSize: '34px',
      color: '#503643',
      fontStyle: 'bold',
    };
  }
}
