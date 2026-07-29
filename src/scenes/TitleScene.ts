import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { animKey, texKey } from '../art/pixels';
import { state } from '../systems/state';
import { TITRE } from '../data/textes';
import { PixelText, measure } from '../ui/PixelText';

/** L'écran-titre. Nino et Moon devant un portail qui tourne. */
export class TitleScene extends Phaser.Scene {
  private prompt!: PixelText;
  private blink = true;

  constructor() {
    super('Title');
  }

  create(): void {
    const pal = 'real' as const;
    state.palette = pal;
    const ink = shadeHex(pal, 3);

    this.add
      .rectangle(0, 0, GB.W, GB.H, shade(pal, 0))
      .setOrigin(0, 0)
      .setDepth(-10);
    this.add
      .graphics()
      .lineStyle(1, shade(pal, 1), 1)
      .strokeRect(3.5, 3.5, GB.W - 7, GB.H - 7);

    this.bigLine(TITRE.ligne1, 20, ink, 'ttl-1');
    this.bigLine(TITRE.ligne2, 38, ink, 'ttl-2');

    this.add
      .sprite(GB.W / 2, 74, texKey('portail', pal), 'spin-0')
      .play(animKey('portail-spin', pal));

    this.add
      .sprite(66, 108, texKey('nino', pal), 'down-0')
      .setOrigin(0.5, 1)
      .play(animKey('nino-walk-down', pal));
    this.add
      .sprite(94, 108, texKey('moon', pal), 'idle-0')
      .setOrigin(0.5, 1)
      .play(animKey('moon-idle', pal));
    // Le sol sous leurs pieds.
    this.add.rectangle(24, 108, GB.W - 48, 1, shade(pal, 1)).setOrigin(0, 0);

    const hasSave = state.hasSave();
    this.prompt = this.line(
      hasSave ? TITRE.continuer : TITRE.commencer,
      114,
      ink,
      'ttl-3',
    );
    if (hasSave) this.line(TITRE.recommencer, 127, shadeHex(pal, 2), 'ttl-4');

    this.time.addEvent({
      delay: 480,
      loop: true,
      callback: () => {
        this.blink = !this.blink;
        this.prompt.image.setVisible(this.blink);
      },
    });

    const kb = this.input.keyboard!;
    KEYS.action.forEach((c) => kb.addKey(c).on('down', () => this.begin(false)));
    kb.addKey('R').on('down', () => this.begin(true));
  }

  private begin(fresh: boolean): void {
    if (fresh) {
      state.clearSave();
      state.reset();
    } else if (state.hasSave()) {
      state.load();
    } else {
      state.reset();
    }
    this.scene.start('World', { room: state.room });
  }

  private line(text: string, y: number, color: string, key: string): PixelText {
    const t = new PixelText(this, key, Math.round((GB.W - measure(text)) / 2), y, GB.W, 12);
    t.setLines([text], color);
    return t;
  }

  /** Le titre, en pixels deux fois plus gros. */
  private bigLine(text: string, y: number, color: string, key: string): void {
    const t = new PixelText(this, key, 0, 0, GB.W, 13);
    t.setLines([text], color);
    t.image.setScale(2).setPosition(Math.round((GB.W - measure(text) * 2) / 2), y);
  }
}
