import Phaser from 'phaser';
import { GB } from '../config';
import { wrap } from '../art/font';
import { shade, shadeHex } from '../art/palette';
import { texKey } from '../art/pixels';
import { ITEMS } from '../data/items';
import { CACHETTES } from '../data/hermione';
import { PIECES } from '../data/pieces';
import { LIEUX_ORDER, nomDuLieu } from '../data/rooms';
import { JOURNAL, PLANTES, arrosee } from '../data/textes';
import { EV, bus, type Buttons } from '../systems/bus';
import { state } from '../systems/state';
import { PixelText, measure } from '../ui/PixelText';

/**
 * Les lieux, puis le sac, puis les pièces. **Le nombre de pages de lieux se calcule** sur
 * `LIEUX_ORDER` : quand j'ai écrit deux pages en dur, les quatre écrans de ville ajoutés
 * ensuite n'apparaissaient plus nulle part dans le journal.
 */
const PER_PAGE = 5;
const PAGES_LIEUX = Math.ceil(LIEUX_ORDER.length / PER_PAGE);
const PAGES = [
  ...Array.from({ length: PAGES_LIEUX }, () => JOURNAL.pageLieux),
  JOURNAL.pageSac,
  JOURNAL.pagePieces,
  JOURNAL.pagePlantes,
];

/**
 * Le journal : la mémoire de Nino. C'est là qu'on voit ce qui a été découvert,
 * et c'est la récompense du jeu — il n'y a ni points de vie ni score.
 */
export class JournalScene extends Phaser.Scene {
  private page = 0;
  private frame!: Phaser.GameObjects.Graphics;
  private title!: PixelText;
  private bodyText!: PixelText;
  private footer!: PixelText;
  private icons: Phaser.GameObjects.Image[] = [];
  private openedAt = 0;

  constructor() {
    super('Journal');
  }

  create(): void {
    this.page = 0;
    this.openedAt = this.time.now;
    this.icons = [];

    this.frame = this.add.graphics().setDepth(1000);
    this.title = new PixelText(this, 'jr-title', 0, 6, GB.W, 12);
    this.title.image.setDepth(1010);
    this.bodyText = new PixelText(this, 'jr-body', 10, 25, 140, 102);
    this.bodyText.image.setDepth(1010);
    this.footer = new PixelText(this, 'jr-footer', 0, 126, GB.W, 12);
    this.footer.image.setDepth(1010);

    // Le clavier est lu par la scène de jeu, qui rediffuse les boutons.
    const onInput = (b: Buttons) => {
      if (this.time.now - this.openedAt < 160) return;
      if (b.action || b.journal || b.cancel) {
        state.locked = false;
        this.scene.stop();
        return;
      }
      if (b.left || b.right) {
        // Le pied de page annonce « < > » : la flèche gauche doit reculer, faute de quoi
        // il fallait refaire le tour complet des cinq pages pour revenir d'une.
        const sens = b.left ? -1 : 1;
        this.page = (this.page + sens + PAGES.length) % PAGES.length;
        this.render();
      }
    };
    bus.on(EV.input, onInput);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => bus.off(EV.input, onInput));

    this.render();
  }

  private render(): void {
    const dark = shade(state.palette, 0);
    const light = shade(state.palette, 3);
    const ink = shadeHex(state.palette, 0);

    this.frame.clear();
    this.frame.fillStyle(dark, 1).fillRect(0, 0, GB.W, GB.H);
    this.frame.fillStyle(light, 1).fillRect(2, 2, GB.W - 4, GB.H - 4);
    this.frame.lineStyle(1, dark, 1).strokeRect(4.5, 4.5, GB.W - 9, GB.H - 9);
    this.frame.fillStyle(dark, 1).fillRect(5, 19, GB.W - 10, 1);

    const heading = `${JOURNAL.titre}  -  ${PAGES[this.page]}`;
    this.title.image.setPosition(Math.round((GB.W - measure(heading)) / 2), 8);
    this.title.setLines([heading], ink);

    this.icons.forEach((i) => i.destroy());
    this.icons = [];

    const lines =
      this.page < PAGES_LIEUX
        ? this.lieuxLines(this.page)
        : this.page === PAGES_LIEUX
          ? this.sacLines()
          : this.page === PAGES_LIEUX + 1
            ? this.piecesLines()
            : this.plantesLines();
    this.bodyText.setLines(lines.slice(0, 8), ink);

    const foot = `< >  ${this.page + 1}/${PAGES.length}   ${JOURNAL.pied}`;
    this.footer.image.setPosition(Math.round((GB.W - measure(foot)) / 2), 126);
    this.footer.setLines([foot], ink);
  }

  private lieuxLines(page: number): string[] {
    return LIEUX_ORDER.slice(page * PER_PAGE, (page + 1) * PER_PAGE).map((id) =>
      state.vu(id) ? `* ${nomDuLieu(id)}` : JOURNAL.lieuInconnu,
    );
  }

  /**
   * **Les plantes arrosées.** Le compte d'abord, puis celles qui vont mieux ; les autres restent
   * des pointillés — on sait combien il en reste, pas où elles sont. C'est la seule collection du
   * jeu qui se voie dans le décor, et la seule qu'un jardinier remarque.
   */
  private plantesLines(): string[] {
    const sauvees = PLANTES.filter((p) => state.flag(arrosee(p.id)));
    if (sauvees.length === 0) return [...JOURNAL.aucunePlante];
    // Huit lignes maximum sur une page : le compte plus les sept plantes, sans ligne vide entre
    // les deux. Avec le blanc, la septième plante tombait hors de la page.
    return [
      JOURNAL.plantesComptees(sauvees.length, PLANTES.length),
      ...PLANTES.map((p) => (state.flag(arrosee(p.id)) ? `* ${p.ou}` : JOURNAL.lieuInconnu)),
    ];
  }

  /** Les pièces ramassées. On ne sait pas encore ce qu'elles veulent dire. */
  private piecesLines(): string[] {
    const trouvees = PIECES.filter((p) => state.pieces.has(p.id));
    if (trouvees.length === 0) return [...JOURNAL.aucunePiece];
    const lines: string[] = [];
    for (const p of trouvees) {
      lines.push(`* ${p.name}`);
      lines.push(...wrap(p.provenance, 132).slice(0, 2));
      lines.push('');
    }
    return lines;
  }

  private sacLines(): string[] {
    const soeur = JOURNAL.soeurComptee(state.hermione, CACHETTES.length);
    // La note du projet d'art n'apparaît qu'une fois rendu : avant, la ligne n'existe pas.
    const entete = state.note > 0 ? [soeur, JOURNAL.noteComptee(state.note)] : [soeur];
    const owned = [...state.items];
    if (owned.length === 0) return [...entete, '', ...JOURNAL.sacVide];
    const lines: string[] = [...entete, ''];
    owned.forEach((id, i) => {
      const item = ITEMS[id];
      lines.push(`   ${item.name}`);
      // L'icône est posée par-dessus la ligne du nom.
      const icon = this.add
        .image(12, 49 + i * 36, texKey(item.sprite, state.palette))
        .setOrigin(0, 0)
        .setDepth(1010);
      this.icons.push(icon);
      lines.push(...wrap(item.desc, 140).slice(0, 2));
    });
    return lines;
  }
}
