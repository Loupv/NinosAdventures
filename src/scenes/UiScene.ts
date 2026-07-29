import Phaser from 'phaser';
import { GB } from '../config';
import { shade, shadeHex } from '../art/palette';
import { texKey } from '../art/pixels';
import { ITEMS, type ItemId } from '../data/items';
import { EV, bus, type Buttons, type DialogueRequest, type RoomBanner } from '../systems/bus';
import { state } from '../systems/state';
import { DialogueBox } from '../ui/DialogueBox';
import { PixelText, measure } from '../ui/PixelText';

/**
 * Tout ce qui se superpose au jeu : dialogue, bandeau de lieu, petite notification
 * d'objet, compteur du journal. Cette scène ne redémarre jamais.
 */
export class UiScene extends Phaser.Scene {
  private box!: DialogueBox;
  private bannerBox!: Phaser.GameObjects.Graphics;
  private bannerText!: PixelText;
  private toastBox!: Phaser.GameObjects.Graphics;
  private toastText!: PixelText;
  private toastIcon!: Phaser.GameObjects.Image;


  constructor() {
    super('Ui');
  }

  create(): void {
    this.box = new DialogueBox(this);

    this.bannerBox = this.add.graphics().setDepth(820).setVisible(false);
    this.bannerText = new PixelText(this, 'ui-banner', 0, 8, GB.W, 12);
    this.bannerText.image.setDepth(830).setVisible(false);

    this.toastBox = this.add.graphics().setDepth(840).setVisible(false);
    this.toastText = new PixelText(this, 'ui-toast', 0, 76, GB.W, 12);
    this.toastText.image.setDepth(850).setVisible(false);
    this.toastIcon = this.add.image(0, 0, texKey('pizza', state.palette)).setDepth(850).setVisible(false);

    const onDialogue = (req: DialogueRequest) => this.box.start(req);
    const onRoom = (b: RoomBanner) => this.showBanner(b);
    const onToast = (t: { text: string; item?: ItemId }) => this.showToast(t);
    const onInput = (b: Buttons) => {
      if (!this.box.active) return;
      if (this.box.isChoosing) {
        if (b.up) this.box.moveChoice(-1);
        if (b.down) this.box.moveChoice(1);
      }
      if (b.action) this.box.press();
    };

    bus.on(EV.dialogue, onDialogue);
    bus.on(EV.room, onRoom);
    bus.on(EV.toast, onToast);
    bus.on(EV.input, onInput);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off(EV.input, onInput);
      bus.off(EV.dialogue, onDialogue);
      bus.off(EV.room, onRoom);
      bus.off(EV.toast, onToast);
    });

  }

  update(_time: number, delta: number): void {
    this.box.tick(delta);
  }

  // ───────────────────────────────────────────────────────────────── compteur

  // ─────────────────────────────────────────────────────── bandeau de lieu

  private showBanner(b: RoomBanner): void {
    const dark = shade(state.palette, 0);
    const light = shade(state.palette, 3);
    const label = b.isNew ? `${b.name}  *` : b.name;
    const w = measure(label) + 12;
    const x = Math.round((GB.W - w) / 2);

    this.bannerBox.clear();
    this.bannerBox.fillStyle(dark, 1).fillRect(x, 4, w, 15);
    this.bannerBox.fillStyle(light, 1).fillRect(x + 1, 5, w - 2, 13);
    this.bannerBox.setVisible(true);

    this.bannerText.image.setPosition(x + 6, 8).setVisible(true);
    this.bannerText.setLines([label], shadeHex(state.palette, 0));

    this.time.delayedCall(b.isNew ? 2400 : 1400, () => {
      this.bannerBox.setVisible(false);
      this.bannerText.image.setVisible(false);
    });
  }

  // ──────────────────────────────────────────────────────── objet ramassé

  private showToast(t: { text: string; item?: ItemId }): void {
    const dark = shade(state.palette, 0);
    const light = shade(state.palette, 3);
    const iconW = t.item ? 12 : 0;
    const w = measure(t.text) + 12 + iconW;
    const x = Math.round((GB.W - w) / 2);
    const y = 70;

    this.toastBox.clear();
    this.toastBox.fillStyle(dark, 1).fillRect(x, y, w, 16);
    this.toastBox.fillStyle(light, 1).fillRect(x + 1, y + 1, w - 2, 14);
    this.toastBox.setVisible(true);

    if (t.item) {
      this.toastIcon
        .setTexture(texKey(ITEMS[t.item].sprite, state.palette))
        .setPosition(x + 5, y + 4)
        .setOrigin(0, 0)
        .setVisible(true);
    }
    this.toastText.image.setPosition(x + 6 + iconW, y + 4).setVisible(true);
    this.toastText.setLines([t.text], shadeHex(state.palette, 0));

    this.time.delayedCall(1800, () => {
      this.toastBox.setVisible(false);
      this.toastText.image.setVisible(false);
      this.toastIcon.setVisible(false);
    });
  }
}
