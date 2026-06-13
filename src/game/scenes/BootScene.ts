import Phaser from 'phaser';
import blueFishImageUrl from '../../assets/images/aoisakana.png';
import bubbleImageUrl from '../../assets/images/awa.png';
import seaBackgroundImageUrl from '../../assets/images/backgrounds/sea-background.png';
import shellImageUrl from '../../assets/images/kaigara.png';
import tiaraGoldImageUrl from '../../assets/images/kinnothiara.png';
import clownFishImageUrl from '../../assets/images/kumanomi.png';
import mermaidImageUrl from '../../assets/images/mermaid.png';
import pinkFishImageUrl from '../../assets/images/pinkusakana.png';
import hairFlowerImageUrl from '../../assets/images/pink_hanakazari.png';
import coralImageUrl from '../../assets/images/sango.png';
import pearlImageUrl from '../../assets/images/shinju.png';
import treasureImageUrl from '../../assets/images/takarabako.png';
import { AUDIO_KEYS } from '../audio/audioKeys';

const optionalImageUrls = import.meta.glob('../../assets/images/{kame,oshiro}.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const turtleImageUrl = optionalImageUrls['../../assets/images/kame.png'];
const seaCastleImageUrl = optionalImageUrls['../../assets/images/oshiro.png'];
const optionalAudioUrls = import.meta.glob('../../assets/audio/mermaid_underwater_bgm.{mp3,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const mainBgmUrl =
  optionalAudioUrls['../../assets/audio/mermaid_underwater_bgm.mp3'] ??
  optionalAudioUrls['../../assets/audio/mermaid_underwater_bgm.ogg'] ??
  optionalAudioUrls['../../assets/audio/mermaid_underwater_bgm.wav'];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.registry.set('hasTurtleImage', false);
    this.registry.set('hasSeaCastle', false);
    this.registry.set('hasMainBgm', false);
    this.load.once('filecomplete-image-turtleImage', () => this.registry.set('hasTurtleImage', true));
    this.load.once('filecomplete-image-seaCastle', () => this.registry.set('hasSeaCastle', true));

    this.load.image('seaBackground', seaBackgroundImageUrl);
    if (turtleImageUrl) {
      this.load.image('turtleImage', turtleImageUrl);
    }
    if (seaCastleImageUrl) {
      this.load.image('seaCastle', seaCastleImageUrl);
    }
    this.load.image('mermaid-source', mermaidImageUrl);
    this.load.image('fish-clownfish-source', clownFishImageUrl);
    this.load.image('fish-bluefish-source', blueFishImageUrl);
    this.load.image('fish-pinkfish-source', pinkFishImageUrl);
    this.load.image('pink-shell-source', shellImageUrl);
    this.load.image('pearl-source', pearlImageUrl);
    this.load.image('treasure-source', treasureImageUrl);
    this.load.image('coral-pink-source', coralImageUrl);
    this.load.image('bubble-source', bubbleImageUrl);
    this.load.image('hair-flower-source', hairFlowerImageUrl);
    this.load.image('tiara-gold-source', tiaraGoldImageUrl);

    if (mainBgmUrl) {
      this.load.once(`filecomplete-audio-${AUDIO_KEYS.MAIN_BGM}`, () => this.registry.set('hasMainBgm', true));
      this.load.audio(AUDIO_KEYS.MAIN_BGM, mainBgmUrl);
    } else {
      console.warn('BGM file was not found. Add mermaid_underwater_bgm.wav to src/assets/audio/.');
    }
  }

  create() {
    this.createCroppedImageTextures();
    this.createTextures();
    this.scene.start('TitleScene');
  }

  private createCroppedImageTextures() {
    this.createCroppedTexture('mermaid-source', 'mermaid', 66, 312, 911, 709);
    this.createCroppedTexture('fish-clownfish-source', 'fish-clownfish', 274, 264, 943, 555);
    this.createCroppedTexture('fish-bluefish-source', 'fish-bluefish', 288, 152, 1003, 663);
    this.createCroppedTexture('fish-pinkfish-source', 'fish-pinkfish', 274, 264, 943, 555);
    this.createCroppedTexture('pink-shell-source', 'pink-shell', 302, 172, 967, 705);
    this.createCroppedTexture('pearl-source', 'pearl', 344, 172, 801, 701);
    this.createCroppedTexture('treasure-source', 'treasure', 260, 150, 949, 727);
    this.createCroppedTexture('coral-pink-source', 'coral-pink', 166, 114, 1109, 779);
    this.createCroppedTexture('bubble-source', 'bubble', 182, 210, 1215, 647);
    this.createCroppedTexture('hair-flower-source', 'hair-flower', 110, 428, 881, 601);
    this.createCroppedTexture('tiara-gold-source', 'tiara-gold', 42, 424, 933, 583);
  }

  private createCroppedTexture(sourceKey: string, targetKey: string, x: number, y: number, width: number, height: number) {
    const sourceImage = this.textures.get(sourceKey).getSourceImage() as CanvasImageSource;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.drawImage(sourceImage, x, y, width, height, 0, 0, width, height);
    this.textures.addCanvas(targetKey, canvas);
  }

  private createTextures() {
    this.createTurtleTexture();
    this.createFishTexture();
    this.createDressUpTextures();
    this.createCoralTextures();
    this.createDecorTextures();
  }

  private createMermaidTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xf6a2b5, 1);
    graphics.fillCircle(82, 42, 25);
    graphics.fillStyle(0xc85c6f, 1);
    graphics.fillEllipse(72, 34, 58, 34);
    graphics.fillStyle(0xffd7c8, 1);
    graphics.fillEllipse(104, 80, 54, 34);
    graphics.fillStyle(0x67d5d4, 1);
    graphics.fillEllipse(155, 96, 112, 34);
    graphics.fillStyle(0x8df1ee, 1);
    graphics.fillTriangle(205, 96, 265, 58, 248, 110);
    graphics.fillTriangle(205, 96, 265, 134, 248, 82);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(91, 35, 4);
    graphics.fillStyle(0x493047, 1);
    graphics.fillCircle(92, 36, 2);
    graphics.lineStyle(4, 0xffffff, 0.7);
    graphics.strokeCircle(122, 63, 9);
    graphics.generateTexture('mermaid', 280, 160);
    graphics.destroy();
  }

  private createTurtleTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x8ccf74, 1);
    graphics.fillEllipse(78, 58, 88, 64);
    graphics.fillStyle(0x5aa86a, 1);
    graphics.lineStyle(4, 0x3d8055, 1);
    graphics.strokeEllipse(78, 58, 88, 64);
    graphics.fillStyle(0xa6dc86, 1);
    graphics.fillCircle(136, 50, 25);
    graphics.fillEllipse(52, 24, 32, 18);
    graphics.fillEllipse(52, 91, 32, 18);
    graphics.fillEllipse(16, 58, 30, 20);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(145, 43, 5);
    graphics.fillStyle(0x43332a, 1);
    graphics.fillCircle(146, 43, 2);
    graphics.generateTexture('turtle', 170, 120);
    graphics.destroy();
  }

  private createFishTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffd35c, 1);
    graphics.fillEllipse(44, 28, 62, 38);
    graphics.fillStyle(0xff8aa4, 1);
    graphics.fillTriangle(13, 28, 0, 8, 0, 48);
    graphics.fillStyle(0x8fd9ff, 1);
    graphics.fillTriangle(48, 12, 70, 2, 58, 22);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(60, 24, 5);
    graphics.fillStyle(0x3a2f3f, 1);
    graphics.fillCircle(61, 24, 2);
    graphics.generateTexture('fish', 78, 56);
    graphics.destroy();
  }

  private createCompanionFishTextures() {
    this.createFishVariantTexture('fish-clownfish', 0xff9f43, 0xffffff);
    this.createFishVariantTexture('fish-bluefish', 0x4fb8ff, 0xfff7a1);
    this.createFishVariantTexture('fish-pinkfish', 0xff8fb6, 0xffe6f0);
  }

  private createFishVariantTexture(key: string, bodyColor: number, accentColor: number) {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(bodyColor, 1);
    graphics.fillEllipse(52, 34, 74, 42);
    graphics.fillStyle(accentColor, 1);
    graphics.fillTriangle(16, 34, 0, 10, 0, 58);
    graphics.fillTriangle(54, 14, 80, 2, 66, 24);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(67, 28, 6);
    graphics.fillStyle(0x382f3f, 1);
    graphics.fillCircle(68, 28, 2);
    graphics.lineStyle(4, accentColor, 0.85);
    graphics.lineBetween(41, 16, 41, 52);
    graphics.lineBetween(55, 15, 55, 53);
    graphics.generateTexture(key, 92, 68);
    graphics.destroy();
  }

  private createDressUpTextures() {
    this.createTailPatch('tail-aqua', 0x67d5d4);
    this.createTailPatch('tail-pink', 0xff8fb6);
    this.createTailPatch('tail-purple', 0x9d8df1);
    this.createFlowerPatch('hair-star', 0xffe082, 0xffffff);
    this.createFlowerPatch('hair-pearl', 0xfff7fb, 0xd9c8ff);
    this.createTiaraPatch('tiara-pearl', 0xf8f2ff);
    this.createTiaraPatch('tiara-star', 0xffee8a);
  }

  private createTailPatch(key: string, color: number) {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(8, 42, 84, 0, 62, 48);
    graphics.fillTriangle(8, 42, 84, 84, 62, 36);
    graphics.lineStyle(3, 0xffffff, 0.55);
    graphics.lineBetween(20, 42, 74, 18);
    graphics.lineBetween(20, 42, 74, 66);
    graphics.generateTexture(key, 92, 88);
    graphics.destroy();
  }

  private createFlowerPatch(key: string, color: number, centerColor: number) {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      graphics.fillEllipse(24 + Math.cos(angle) * 13, 24 + Math.sin(angle) * 13, 16, 22);
    }
    graphics.fillStyle(centerColor, 1);
    graphics.fillCircle(24, 24, 9);
    graphics.generateTexture(key, 52, 52);
    graphics.destroy();
  }

  private createTiaraPatch(key: string, color: number) {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(4, 38, 18, 10, 30, 38);
    graphics.fillTriangle(24, 38, 38, 4, 52, 38);
    graphics.fillTriangle(46, 38, 58, 12, 72, 38);
    graphics.fillRoundedRect(2, 34, 72, 12, 5);
    graphics.lineStyle(3, 0xffffff, 0.7);
    graphics.strokeRoundedRect(2, 34, 72, 12, 5);
    graphics.generateTexture(key, 78, 52);
    graphics.destroy();
  }

  private createShellTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xff9ab4, 1);
    graphics.fillCircle(44, 44, 31);
    graphics.fillStyle(0xffc1cf, 1);
    for (let i = 0; i < 5; i += 1) {
      graphics.fillEllipse(24 + i * 10, 40, 16, 42);
    }
    graphics.fillStyle(0x8b5a7b, 1);
    graphics.fillRoundedRect(18, 58, 52, 10, 6);
    graphics.generateTexture('pink-shell', 88, 88);
    graphics.destroy();
  }

  private createPearlTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xfff4f8, 1);
    graphics.fillCircle(36, 36, 26);
    graphics.fillStyle(0xdcb8ff, 0.6);
    graphics.fillCircle(45, 47, 10);
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(27, 25, 8);
    graphics.generateTexture('pearl', 72, 72);
    graphics.destroy();
  }

  private createTreasureTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x8f5b38, 1);
    graphics.fillRoundedRect(10, 42, 130, 62, 8);
    graphics.fillStyle(0xb56e3d, 1);
    graphics.fillRoundedRect(12, 18, 126, 56, 24);
    graphics.lineStyle(6, 0x653c2b, 1);
    graphics.strokeRoundedRect(10, 18, 130, 86, 12);
    graphics.fillStyle(0xffd36f, 1);
    graphics.fillRoundedRect(70, 45, 20, 36, 5);
    graphics.generateTexture('treasure', 150, 120);
    graphics.destroy();
  }

  private createCoralTextures() {
    const seaweed = this.make.graphics({ x: 0, y: 0 });
    seaweed.lineStyle(11, 0x74c779, 1);
    for (let i = 0; i < 5; i += 1) {
      seaweed.beginPath();
      seaweed.moveTo(18 + i * 18, 120);
      seaweed.lineTo(31 + i * 14, 82);
      seaweed.lineTo(22 + i * 17, 18);
      seaweed.strokePath();
    }
    seaweed.generateTexture('seaweed', 120, 135);
    seaweed.destroy();
  }

  private createDecorTextures() {
    const sparkle = this.make.graphics({ x: 0, y: 0 });
    sparkle.fillStyle(0xfff0a6, 1);
    sparkle.fillTriangle(18, 0, 24, 14, 38, 18);
    sparkle.fillTriangle(38, 18, 24, 24, 18, 38);
    sparkle.fillTriangle(18, 38, 14, 24, 0, 18);
    sparkle.fillTriangle(0, 18, 14, 14, 18, 0);
    sparkle.generateTexture('sparkle', 40, 40);
    sparkle.destroy();
  }
}
