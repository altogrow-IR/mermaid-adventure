import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainSeaScene } from './scenes/MainSeaScene';
import { TitleScene } from './scenes/TitleScene';
import { UIScene } from './scenes/UIScene';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#8bdcf4',
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    render: {
      antialias: true,
      pixelArt: false,
      powerPreference: 'low-power',
    },
    scene: [BootScene, TitleScene, MainSeaScene, UIScene],
  };
}
