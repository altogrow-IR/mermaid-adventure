import Phaser from 'phaser';
import { Collectible } from '../objects/Collectible';
import { CompanionFishManager } from '../objects/CompanionFishManager';
import { GAME_HEIGHT, GAME_WIDTH } from '../createGameConfig';
import { defaultSaveData, loadSaveData, saveSaveData } from '../../stores/saveData';
import { grantNextReward } from '../systems/rewardSystem';
import type { SaveData } from '../../types/saveData';
import type { UiUpdatePayload } from './UIScene';
import { AudioManager } from '../audio/AudioManager';
import type { AudioSettings } from '../audio/audioSettings';

const WORLD_WIDTH = 15360;
const LEGACY_QUEST_ID = 'pink-shells-for-turtle';
const QUEST_ID_PREFIX = 'pink-shells-for-turtle';
const QUEST_COUNT = 10;
const QUEST_TARGET = 3;
const MOVE_SPEED = 355;
const MOVE_MIN_Y = 138;
const MOVE_MAX_Y = 612;
const ITEM_PICKUP_RADIUS = 120;
const TREASURE_PICKUP_RADIUS = 150;
const NPC_TALK_RADIUS = 360;
const SEA_CASTLE_X = 13040;
const SEA_CASTLE_Y = 330;
const SEA_CASTLE_WIDTH = 700;
const SEA_CASTLE_HEIGHT = 550;
const MOVE_BUTTON_Y_OFFSET = -56;

type Direction = 'up' | 'down' | 'left' | 'right';

type DirectionInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

type MainSeaSceneData = {
  continueGame?: boolean;
};

type WasdKeys = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
};

export class MainSeaScene extends Phaser.Scene {
  private mermaid?: Phaser.Physics.Arcade.Image;
  private companionFishManager?: CompanionFishManager;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: WasdKeys;
  private touchInput: DirectionInput = { up: false, down: false, left: false, right: false };
  private saveData: SaveData = structuredClone(defaultSaveData);
  private collectibles: Collectible[] = [];
  private bubbleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparkleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private questShells = 0;
  private questDone = false;
  private turtle?: Phaser.Physics.Arcade.Image;
  private treasures: { id: string; image: Phaser.Physics.Arcade.Image }[] = [];
  private dialogText?: Phaser.GameObjects.Text;
  private toastText?: Phaser.GameObjects.Text;

  constructor() {
    super('MainSeaScene');
  }

  init(data: MainSeaSceneData) {
    const currentSaveData = loadSaveData();
    this.saveData = data.continueGame
      ? currentSaveData
      : {
          ...structuredClone(defaultSaveData),
          audioSettings: currentSaveData.audioSettings,
        };
    this.updateQuestProgress();
    this.collectibles = [];
    this.treasures = [];
    this.touchInput = { up: false, down: false, left: false, right: false };
  }

  create() {
    AudioManager.get(this).playMainBgm();
    this.physics.world.setBounds(0, MOVE_MIN_Y, WORLD_WIDTH, MOVE_MAX_Y - MOVE_MIN_Y);
    this.createBackground();
    this.createWorldDecorations();
    this.createMermaid();
    this.createNpc();
    this.createTreasure();
    this.createCollectibles();
    this.createControls();
    this.createEffects();
    this.createCamera();
    this.createDialog();
    this.createCompanions();

    this.scene.launch('UIScene', this.getUiPayload());
    this.game.events.on('ui:toast', this.showToast, this);
    window.addEventListener('mermaid:save-updated', this.handleSaveUpdated);
    window.addEventListener('mermaid:audio-settings-changed', this.handleAudioSettingsChanged);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('ui:toast', this.showToast, this);
      window.removeEventListener('mermaid:save-updated', this.handleSaveUpdated);
      window.removeEventListener('mermaid:audio-settings-changed', this.handleAudioSettingsChanged);
      this.companionFishManager?.destroy();
      this.scene.stop('UIScene');
    });
  }

  update(time: number, delta: number) {
    this.updateMermaid(delta);
    this.updateCompanions(time);
    this.updateAmbientFish(time, delta);
    this.updateCollectibles(time);
    this.checkGenerousPickup();
    this.checkNpcDistance();
  }

  private createBackground() {
    if (this.textures.exists('seaBackground')) {
      this.tileSeaBackground();
      return;
    }

    this.createFallbackOceanBackground();
  }

  private tileSeaBackground() {
    const texture = this.textures.get('seaBackground').getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const scale = Math.max(GAME_WIDTH / texture.width, GAME_HEIGHT / texture.height);
    const tileWidth = texture.width * scale;
    const tileHeight = texture.height * scale;
    const tileCount = Math.ceil(WORLD_WIDTH / tileWidth) + 1;

    for (let i = 0; i < tileCount; i += 1) {
      this.add
        .image(i * tileWidth, GAME_HEIGHT / 2, 'seaBackground')
        .setOrigin(0, 0.5)
        .setDisplaySize(tileWidth + 1, tileHeight)
        .setDepth(-20);
    }
  }

  private createFallbackOceanBackground() {
    this.add.rectangle(0, 0, WORLD_WIDTH, GAME_HEIGHT, 0x8cddf3).setOrigin(0).setDepth(-30);
    this.add.rectangle(0, GAME_HEIGHT * 0.52, WORLD_WIDTH, GAME_HEIGHT * 0.48, 0x9fd8ee, 0.72).setOrigin(0).setDepth(-29);

    for (let i = 0; i < 28; i += 1) {
      const ray = this.add
        .polygon(
          120 + i * 185,
          -20,
          [0, 0, 70, 0, 210, GAME_HEIGHT, -110, GAME_HEIGHT],
          0xfffbce,
          0.12,
        )
        .setScrollFactor(0.35)
        .setDepth(-28);
      ray.setBlendMode(Phaser.BlendModes.ADD);
    }
  }

  private createWorldDecorations() {
    for (let x = 180; x < WORLD_WIDTH; x += 420) {
      this.add.image(x, 665 + Phaser.Math.Between(-8, 8), 'coral-pink').setDisplaySize(140, 100).setDepth(5).setAlpha(0.86);
    }

    for (let x = 620; x < WORLD_WIDTH; x += 620) {
      this.add.image(x, 660 + Phaser.Math.Between(-6, 6), 'seaweed').setScale(1.05).setDepth(5).setAlpha(0.8);
    }

    this.createCastle();

    for (let i = 0; i < 90; i += 1) {
      this.add
        .image(Phaser.Math.Between(80, WORLD_WIDTH - 80), Phaser.Math.Between(125, 560), 'fish')
        .setScale(Phaser.Math.FloatBetween(0.5, 0.95))
        .setAlpha(0.58)
        .setDepth(4);
    }
  }

  private createCastle() {
    const hasSeaCastle = this.registry.get('hasSeaCastle') === true && this.textures.exists('seaCastle');
    if (hasSeaCastle) {
      this.add
        .image(SEA_CASTLE_X, SEA_CASTLE_Y, 'seaCastle')
        .setDisplaySize(SEA_CASTLE_WIDTH, SEA_CASTLE_HEIGHT)
        .setDepth(2)
        .setAlpha(0.92);
      return;
    }

    this.add
      .text(4300, 150, 'うみの\nおしろ', {
        fontSize: '34px',
        color: '#eaf8ff',
        fontStyle: 'bold',
        align: 'center',
      })
      .setDepth(3)
      .setAlpha(0.78);

    const castle = this.add.graphics().setDepth(2).setAlpha(0.46);
    castle.fillStyle(0xd7f4ff, 1);
    castle.fillRoundedRect(4220, 210, 230, 260, 22);
    castle.fillTriangle(4220, 210, 4335, 112, 4450, 210);
    castle.fillRoundedRect(4282, 140, 82, 330, 18);
    castle.fillTriangle(4282, 140, 4323, 74, 4364, 140);
  }

  private createMermaid() {
    this.mermaid = this.physics.add.image(210, 360, 'mermaid');
    this.mermaid.setDisplaySize(300, 234);
    this.mermaid.setCollideWorldBounds(true);
    this.mermaid.setDepth(40);
    this.mermaid.setSize(220, 155);
    this.mermaid.setOffset(40, 40);
    this.mermaid.setDrag(700, 700);
    this.mermaid.setMaxVelocity(430, 430);
  }

  private createNpc() {
    const hasTurtleImage = this.registry.get('hasTurtleImage') === true && this.textures.exists('turtleImage');
    const textureKey = hasTurtleImage ? 'turtleImage' : 'turtle';
    this.turtle = this.physics.add.image(1460, 382, textureKey);
    this.turtle.setImmovable(true);
    this.turtle.setDepth(35);
    this.turtle.setDisplaySize(hasTurtleImage ? 170 : 150, hasTurtleImage ? 130 : 106);
    this.turtle.setCircle(70, 20, 0);
  }

  private createTreasure() {
    const treasurePositions = [
      [3900, 494],
      [5850, 306],
      [7350, 526],
      [9200, 368],
      [10980, 512],
      [12640, 344],
      [14320, 502],
    ];

    treasurePositions.forEach(([x, y], index) => {
      const id = `sea-treasure-${index + 1}`;
      if (this.saveData.openedTreasureIds.includes(id)) {
        return;
      }

      const image = this.physics.add.image(x, y, 'treasure');
      image.setImmovable(true);
      image.setDepth(10);
      image.setDisplaySize(150, 115);
      this.treasures.push({ id, image });
    });
  }

  private createCollectibles() {
    const shellPositions = [
      [520, 462],
      [1060, 318],
      [1700, 468],
      [2540, 280],
      [3420, 522],
      [4540, 390],
      [5320, 512],
      [6040, 274],
      [6820, 452],
      [7480, 330],
      [8160, 538],
      [8920, 292],
      [9580, 466],
      [10360, 348],
      [11120, 520],
      [11840, 304],
      [12520, 448],
      [13280, 272],
      [14020, 510],
      [14840, 386],
      [5800, 548],
      [6520, 356],
      [7240, 246],
      [9880, 540],
      [10680, 262],
      [11560, 452],
      [12160, 560],
      [13660, 404],
      [14460, 298],
      [15120, 520],
    ];
    const pearlPositions = [
      [780, 540],
      [1320, 250],
      [2200, 452],
      [3100, 330],
      [4300, 528],
      [5020, 302],
      [5700, 446],
      [6440, 536],
      [7180, 294],
      [8020, 420],
      [8840, 552],
      [9660, 276],
      [10480, 502],
      [11260, 338],
      [12020, 540],
      [12880, 290],
      [13720, 472],
      [14580, 344],
      [15220, 528],
    ];

    shellPositions.forEach(([x, y]) => this.addCollectible(x, y, 'shell'));
    pearlPositions.forEach(([x, y]) => this.addCollectible(x, y, 'pearl'));
  }

  private addCollectible(x: number, y: number, kind: 'shell' | 'pearl') {
    const item = new Collectible(this, x, y, kind);
    this.collectibles.push(item);
  }

  private createControls() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasdKeys = this.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as WasdKeys | undefined;

    this.createMoveButton(168, 500 + MOVE_BUTTON_Y_OFFSET, '↑', 'up');
    this.createMoveButton(168, 640 + MOVE_BUTTON_Y_OFFSET, '↓', 'down');
    this.createMoveButton(88, 608 + MOVE_BUTTON_Y_OFFSET, '←', 'left');
    this.createMoveButton(248, 608 + MOVE_BUTTON_Y_OFFSET, '→', 'right');
  }

  private createMoveButton(x: number, y: number, label: string, direction: Direction) {
    const button = this.add.container(x, y).setScrollFactor(0).setDepth(120);
    const color = direction === 'up' || direction === 'down' ? 0x87d4ef : direction === 'left' ? 0xb4a7f0 : 0xff86a8;
    const circle = this.add.circle(0, 0, 44, color, 0.92);
    circle.setStrokeStyle(6, 0xffffff, 0.95);
    const text = this.add.text(0, -5, label, { fontSize: '52px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    button.add([circle, text]);
    button.setSize(92, 92);
    button.setInteractive({ useHandCursor: true });

    const setState = (pressed: boolean) => {
      this.touchInput[direction] = pressed;
      button.setScale(pressed ? 0.94 : 1);
    };

    button.on('pointerdown', () => setState(true));
    button.on('pointerup', () => setState(false));
    button.on('pointerout', () => setState(false));
    button.on('pointerupoutside', () => setState(false));
  }

  private createEffects() {
    this.add
      .particles(0, 0, 'bubble', {
        x: { min: 0, max: WORLD_WIDTH },
        y: GAME_HEIGHT + 20,
        lifespan: 9000,
        speedY: { min: -28, max: -12 },
        speedX: { min: -8, max: 8 },
        scale: { start: 0.026, end: 0.004 },
        alpha: { start: 0.45, end: 0 },
        frequency: 310,
        quantity: 1,
      })
      .setDepth(18);

    this.bubbleEmitter = this.add
      .particles(0, 0, 'bubble', {
        lifespan: 720,
        speedX: { min: -90, max: -30 },
        speedY: { min: -42, max: 18 },
        scale: { start: 0.026, end: 0.004 },
        alpha: { start: 0.66, end: 0 },
        emitting: false,
      })
      .setDepth(45);

    this.sparkleEmitter = this.add
      .particles(0, 0, 'sparkle', {
        lifespan: 620,
        speed: { min: 45, max: 150 },
        scale: { start: 0.55, end: 0 },
        alpha: { start: 1, end: 0 },
        rotate: { min: -160, max: 160 },
        emitting: false,
      })
      .setDepth(70);
  }

  private createCamera() {
    if (!this.mermaid) {
      return;
    }

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
    this.cameras.main.startFollow(this.mermaid, true, 0.08, 0.08, -120, 80);
  }

  private createDialog() {
    this.dialogText = this.add
      .text(1460, 250, 'ピンクの\nかいがらを 3こ\nもってきてほしいな♪', {
        fontSize: '25px',
        color: '#674046',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 7,
        backgroundColor: 'rgba(255, 249, 228, 0.92)',
        padding: { x: 18, y: 16 },
      })
      .setOrigin(0.5)
      .setDepth(65);
    this.dialogText.setText(this.getQuestDialogText());
    this.dialogText.setStroke('#ffffff', 4);
  }

  private createCompanions() {
    this.companionFishManager = new CompanionFishManager(this);
    this.companionFishManager.setSelectedFish(this.saveData.companionFish.selectedIds);
  }

  private updateMermaid(delta: number) {
    if (!this.mermaid) {
      return;
    }

    const input = this.getDirectionInput();
    const vector = new Phaser.Math.Vector2(Number(input.right) - Number(input.left), Number(input.down) - Number(input.up));

    if (vector.lengthSq() > 0) {
      vector.normalize().scale(MOVE_SPEED);
      this.mermaid.setVelocity(vector.x, vector.y);
      if (Math.abs(vector.x) > 0.1) {
        this.mermaid.setFlipX(vector.x < 0);
      }
      this.emitSwimParticles();
    } else {
      this.mermaid.setVelocity(0, 0);
    }

    const idleWave = Math.sin(this.time.now / 280) * 0.45;
    this.mermaid.y = Phaser.Math.Clamp(this.mermaid.y + idleWave * delta * 0.01, MOVE_MIN_Y, MOVE_MAX_Y);
    this.mermaid.rotation = Math.sin(this.time.now / 360) * 0.025;
  }

  private getDirectionInput(): DirectionInput {
    return {
      up: this.touchInput.up || Boolean(this.cursors?.up.isDown) || Boolean(this.wasdKeys?.up.isDown),
      down: this.touchInput.down || Boolean(this.cursors?.down.isDown) || Boolean(this.wasdKeys?.down.isDown),
      left: this.touchInput.left || Boolean(this.cursors?.left.isDown) || Boolean(this.wasdKeys?.left.isDown),
      right: this.touchInput.right || Boolean(this.cursors?.right.isDown) || Boolean(this.wasdKeys?.right.isDown),
    };
  }

  private updateCompanions(time: number) {
    if (this.mermaid) {
      this.companionFishManager?.update(this.mermaid, time);
    }
  }

  private emitSwimParticles() {
    if (!this.mermaid || !this.bubbleEmitter || !this.sparkleEmitter) {
      return;
    }

    const offset = this.mermaid.flipX ? 80 : -80;
    this.bubbleEmitter.emitParticleAt(this.mermaid.x + offset, this.mermaid.y + 22, 1);
    if (Phaser.Math.Between(0, 9) === 0) {
      this.sparkleEmitter.emitParticleAt(this.mermaid.x + offset * 0.5, this.mermaid.y - 20, 1);
    }
  }

  private updateAmbientFish(time: number, delta: number) {
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Image && child.texture.key === 'fish') {
        child.x += delta * 0.018 * child.scaleX;
        child.y += Math.sin(time / 900 + child.x) * 0.02;
        if (child.x > WORLD_WIDTH + 80) {
          child.x = -80;
        }
      }
    });
  }

  private updateCollectibles(time: number) {
    this.collectibles.forEach((item) => item.active && item.update(time));
  }

  private checkGenerousPickup() {
    if (!this.mermaid) {
      return;
    }

    this.collectibles.forEach((item) => {
      if (!item.active) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(this.mermaid!.x, this.mermaid!.y, item.x, item.y);
      if (distance <= ITEM_PICKUP_RADIUS) {
        this.collectItem(item);
      }
    });

    this.treasures.forEach((treasure) => {
      if (!treasure.image.active) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(this.mermaid!.x, this.mermaid!.y, treasure.image.x, treasure.image.y);
      if (distance <= TREASURE_PICKUP_RADIUS) {
        this.collectTreasure(treasure);
      }
    });
  }

  private collectItem(item: Collectible) {
    if (!item.active) {
      return;
    }

    item.disableBody(true, true);
    this.sparkleEmitter?.explode(14, item.x, item.y);
    this.bubbleEmitter?.explode(12, item.x, item.y);

    if (item.kind === 'shell') {
      this.saveData.collectedShells += 1;
      this.updateQuestProgress();
      this.saveData.sparklePoint += 10;
    } else {
      this.saveData.collectedPearls += 1;
      this.saveData.sparklePoint += 20;
    }

    this.playPickupSound();
    this.tryCompleteQuest();
    this.persistAndUpdateUi();
  }

  private collectTreasure(treasure: { id: string; image: Phaser.Physics.Arcade.Image }) {
    if (!treasure.image.active || this.saveData.openedTreasureIds.includes(treasure.id)) {
      return;
    }

    const x = treasure.image.x;
    const y = treasure.image.y;
    treasure.image.disableBody(true, true);
    this.saveData.openedTreasureIds = [...this.saveData.openedTreasureIds, treasure.id];
    const reward = grantNextReward(this.saveData);
    this.sparkleEmitter?.explode(42, x, y);
    this.bubbleEmitter?.explode(18, x, y);
    this.showRewardMessage(reward.message, x, y - 90);
    this.persistAndUpdateUi();
  }

  private playPickupSound() {
    const audioWindow = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    try {
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1180, audioContext.currentTime + 0.09);
      gain.gain.setValueAtTime(0.001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.14);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.16);
      oscillator.onended = () => {
        void audioContext.close();
      };
    } catch (error) {
      console.warn('Pickup sound could not be played:', error);
    }
  }

  private tryCompleteQuest() {
    if (this.questDone || this.questShells < QUEST_TARGET) {
      return;
    }

    const questId = this.getCurrentQuestId();
    if (!questId) {
      this.updateQuestProgress();
      return;
    }

    this.saveData.clearedQuestIds = Array.from(new Set([...this.saveData.clearedQuestIds, questId]));
    this.updateQuestProgress();
    this.saveData.sparklePoint += 50;
    const reward = grantNextReward(this.saveData);
    this.showClearMessage(reward.message);
  }

  private updateQuestProgress() {
    const completedCount = this.getCompletedQuestCount();
    this.questShells = Math.min(QUEST_TARGET, Math.max(0, this.saveData.collectedShells - completedCount * QUEST_TARGET));
    this.questDone = completedCount >= QUEST_COUNT;
  }

  private getCompletedQuestCount() {
    const legacyCompletedCount = this.saveData.clearedQuestIds.includes(LEGACY_QUEST_ID) ? 1 : 0;
    const startQuestNumber = legacyCompletedCount > 0 ? 2 : 1;
    const modernCompletedCount = Array.from({ length: QUEST_COUNT - startQuestNumber + 1 }, (_, index) =>
      this.saveData.clearedQuestIds.includes(this.getQuestId(startQuestNumber + index)),
    ).filter(Boolean).length;

    return Math.min(QUEST_COUNT, legacyCompletedCount + modernCompletedCount);
  }

  private getCurrentQuestId() {
    const nextQuestNumber = this.getCompletedQuestCount() + 1;
    return nextQuestNumber <= QUEST_COUNT ? this.getQuestId(nextQuestNumber) : undefined;
  }

  private getQuestId(questNumber: number) {
    return `${QUEST_ID_PREFIX}-${questNumber}`;
  }

  private showClearMessage(rewardMessage: string) {
    const x = this.cameras.main.scrollX + GAME_WIDTH / 2;
    const panel = this.add
      .text(x, 260, `ありがとう！\n${rewardMessage}`, {
        fontSize: '42px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 10,
        backgroundColor: 'rgba(255, 126, 165, 0.86)',
        padding: { x: 38, y: 24 },
      })
      .setOrigin(0.5)
      .setDepth(200);
    panel.setStroke('#8f4b73', 7);
    this.sparkleEmitter?.explode(60, x, 340);

    this.tweens.add({
      targets: panel,
      y: 236,
      scale: 1.06,
      duration: 520,
      yoyo: true,
      repeat: 1,
      onComplete: () => panel.destroy(),
    });
  }

  private showRewardMessage(message: string, x: number, y: number) {
    const panel = this.add
      .text(x, y, message, {
        fontSize: '34px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        backgroundColor: 'rgba(95, 201, 137, 0.9)',
        padding: { x: 28, y: 18 },
      })
      .setOrigin(0.5)
      .setDepth(205);
    panel.setStroke('#3f8064', 6);
    this.tweens.add({
      targets: panel,
      y: y - 28,
      alpha: 0,
      delay: 1100,
      duration: 700,
      onComplete: () => panel.destroy(),
    });
  }

  private checkNpcDistance() {
    if (!this.mermaid || !this.turtle || !this.dialogText) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.mermaid.x, this.mermaid.y, this.turtle.x, this.turtle.y);
    this.dialogText.setVisible(distance < NPC_TALK_RADIUS || !this.questDone);
    this.dialogText.setText(
      this.questDone ? 'ありがとう！\nとっても\nうれしいよ♪' : 'ピンクの\nかいがらを 3こ\nもってきてほしいな♪',
    );
    this.dialogText.setText(this.getQuestDialogText());
  }

  private getQuestDialogText() {
    if (this.questDone) {
      return 'ありがとう！\nぜんぶの おねがい\nたすかったよ';
    }

    return `おねがい ${this.getCompletedQuestCount() + 1} / ${QUEST_COUNT}\nかいがらを ${QUEST_TARGET}こ\nもってきてね`;
  }

  private showToast(message: string) {
    this.toastText?.destroy();
    this.toastText = this.add
      .text(this.cameras.main.scrollX + GAME_WIDTH / 2, 118, message, {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: 'rgba(64, 126, 164, 0.75)',
        padding: { x: 24, y: 14 },
      })
      .setOrigin(0.5)
      .setDepth(210);
    this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      delay: 900,
      duration: 500,
      onComplete: () => this.toastText?.destroy(),
    });
  }

  private persistAndUpdateUi() {
    saveSaveData(this.saveData);
    this.updateUi();
    this.companionFishManager?.setSelectedFish(this.saveData.companionFish.selectedIds);
  }

  private handleSaveUpdated = (event: Event) => {
    const saveEvent = event as CustomEvent<SaveData>;
    this.saveData = saveEvent.detail;
    this.companionFishManager?.setSelectedFish(this.saveData.companionFish.selectedIds);
    this.updateUi();
  };

  private handleAudioSettingsChanged = (event: Event) => {
    AudioManager.get(this).applySettings((event as CustomEvent<AudioSettings>).detail);
  };

  private updateUi() {
    this.game.events.emit('ui:update', this.getUiPayload());
  }

  private getUiPayload(): UiUpdatePayload {
    return {
      ...this.saveData,
      questShells: this.questShells,
      questDone: this.questDone,
      questCount: QUEST_COUNT,
      questNumber: Math.min(QUEST_COUNT, this.getCompletedQuestCount() + 1),
      questTarget: QUEST_TARGET,
    };
  }
}
