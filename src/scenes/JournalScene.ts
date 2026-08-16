import Phaser from 'phaser';
import { GB } from '../config';
import { LINE_H, wrap } from '../art/font';
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

/**
 * **Le sac se pagine comme les lieux.** Il tenait sur une page unique coupée à huit
 * lignes : passé le deuxième objet, les suivants n'apparaissaient nulle part — alors
 * qu'il y en a dix à porter. Chaque objet prend deux lignes (son nom, puis une ligne de
 * ce qu'il est), et la première page porte en plus le compte d'Hermione et la note.
 */
const SAC_LIGNES = 8;
const OBJET_LIGNES = 2;

function pagesDuSac(): number {
  const objets = state.items.size;
  if (objets === 0) return 1;
  // L'en-tête (deux lignes plus un blanc) ne mange que la première page.
  const surLaPremiere = Math.max(1, Math.floor((SAC_LIGNES - 3) / OBJET_LIGNES));
  const reste = Math.max(0, objets - surLaPremiere);
  return 1 + Math.ceil(reste / Math.floor(SAC_LIGNES / OBJET_LIGNES));
}

/** Les pages du journal, telles qu'elles sont maintenant : le sac gonfle avec le sac. */
function pages(): string[] {
  return [
    ...Array.from({ length: PAGES_LIEUX }, () => JOURNAL.pageLieux),
    ...Array.from({ length: pagesDuSac() }, () => JOURNAL.pageSac),
    JOURNAL.pagePieces,
    JOURNAL.pagePlantes,
  ];
}

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
        this.page = (this.page + sens + pages().length) % pages().length;
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

    const heading = `${JOURNAL.titre}  -  ${pages()[this.page]}`;
    this.title.image.setPosition(Math.round((GB.W - measure(heading)) / 2), 8);
    this.title.setLines([heading], ink);

    this.icons.forEach((i) => i.destroy());
    this.icons = [];

    const finDuSac = PAGES_LIEUX + pagesDuSac();
    const lines =
      this.page < PAGES_LIEUX
        ? this.lieuxLines(this.page)
        : this.page < finDuSac
          ? this.sacLines(this.page - PAGES_LIEUX)
          : this.page === finDuSac
            ? this.piecesLines()
            : this.plantesLines();
    this.bodyText.setLines(lines.slice(0, SAC_LIGNES), ink);

    const foot = `< >  ${this.page + 1}/${pages().length}   ${JOURNAL.pied}`;
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

  private sacLines(page: number): string[] {
    const soeur = JOURNAL.soeurComptee(state.hermione, CACHETTES.length);
    // La note du projet d'art n'apparaît qu'une fois rendu : avant, la ligne n'existe pas.
    const entete = page === 0 ? [soeur, ...(state.note > 0 ? [JOURNAL.noteComptee(state.note)] : []), ''] : [];
    const owned = [...state.items];
    if (owned.length === 0) return [...entete, ...JOURNAL.sacVide];

    // Ce que cette page-ci porte, sachant que la première a moins de place.
    const surLaPremiere = Math.max(1, Math.floor((SAC_LIGNES - 3) / OBJET_LIGNES));
    const parPage = Math.floor(SAC_LIGNES / OBJET_LIGNES);
    const debut = page === 0 ? 0 : surLaPremiere + (page - 1) * parPage;
    const combien = page === 0 ? surLaPremiere : parPage;

    const lines: string[] = [...entete];
    for (const id of owned.slice(debut, debut + combien)) {
      const item = ITEMS[id];
      // **Un objet inconnu ne fait pas tomber le journal.** Une sauvegarde écrite par une
      // version d'avant peut nommer un objet qui n'existe plus : on l'ignore.
      if (!item) continue;
      // **L'icône suit la ligne du nom**, calculée et non devinée : elle était posée à
      // une hauteur en dur qui ne valait que pour un en-tête d'une seule ligne, et
      // glissait d'un cran dès que la note existait.
      const y = 25 + LINE_H * lines.length;
      // Quatre espaces : l'icône fait seize pixels de large et mordait sur la première
      // lettre du nom. Et la description qui déborde se termine par des points de
      // suspension plutôt que par une coupure au milieu d'un mot.
      const desc = wrap(item.desc, 116);
      lines.push(`    ${item.name}`);
      lines.push(`    ${desc[0]}${desc.length > 1 ? '…' : ''}`);
      this.icons.push(
        this.add.image(12, y, texKey(item.sprite, state.palette)).setOrigin(0, 0).setDepth(1010),
      );
    }
    return lines;
  }
}
