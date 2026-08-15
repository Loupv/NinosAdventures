import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { animKey, texKey } from '../art/pixels';
import { state } from '../systems/state';
import { jouerAmbiance, jouerMusique } from '../systems/audio';
import { TITRE } from '../data/textes';
import { PixelText, measure } from '../ui/PixelText';

/** L'écran-titre. Nino et Moon devant un portail qui tourne. */
export class TitleScene extends Phaser.Scene {
  private prompt!: PixelText;
  private aussi?: PixelText;
  private blink = true;
  /** Vrai quand la question « tout effacer ? » est posée et attend une réponse. */
  private demande = false;

  constructor() {
    super('Title');
  }

  create(): void {
    const pal = 'titre' as const;
    state.palette = pal;
    // Les six notes de l'écran-titre — et le silence tant que le fichier n'est pas posé.
    jouerMusique(this, 'titre');
    jouerAmbiance(this, undefined);
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

    this.prompt = this.line('', 114, ink, 'ttl-3');
    this.aussi = this.line('', 127, ink, 'ttl-4');
    this.proposer();

    this.time.addEvent({
      delay: 480,
      loop: true,
      callback: () => {
        this.blink = !this.blink;
        // La question, elle, ne clignote pas : on ne fait pas clignoter ce qui efface une partie.
        this.prompt.image.setVisible(this.demande || this.blink);
      },
    });

    const kb = this.input.keyboard!;
    KEYS.action.forEach((c) =>
      kb.addKey(c).on('down', () => (this.demande ? this.begin(true) : this.begin(false))),
    );
    KEYS.cancel.forEach((c) => kb.addKey(c).on('down', () => this.demande && this.proposer()));
    kb.addKey('R').on('down', () => this.demander());
  }

  /**
   * L'état normal du titre : continuer si une partie existe, la commencer sinon — et, dans le
   * premier cas seulement, la façon de tout effacer.
   */
  private proposer(): void {
    this.demande = false;
    const garde = state.hasSave();
    this.ecrire(this.prompt, garde ? TITRE.continuer : TITRE.commencer, 114);
    this.ecrire(this.aussi!, garde ? TITRE.recommencer : '', 127);
  }

  /** La question. Tant qu'elle est posée, ESPACE efface et ÉCHAP renonce. */
  private demander(): void {
    if (this.demande) return;
    // Rien à effacer : on démarre une partie neuve sans poser de question.
    if (!state.hasSave()) {
      this.begin(true);
      return;
    }
    this.demande = true;
    this.ecrire(this.prompt, TITRE.effacer, 110);
    this.ecrire(this.aussi!, `${TITRE.effacerOui}   ${TITRE.effacerNon}`, 126);
  }

  private ecrire(t: PixelText, texte: string, y: number): void {
    t.image.setPosition(Math.round((GB.W - measure(texte)) / 2), y).setVisible(true);
    t.setLines([texte], shadeHex('titre', 3));
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
