import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shadeHex } from '../art/palette';
import { texKey } from '../art/pixels';
import { state } from '../systems/state';
import { jouerAmbiance, jouerMusique } from '../systems/audio';
import { CACHETTES } from '../data/hermione';
import { PIECES } from '../data/pieces';
import { CETTE_NUIT, FIN } from '../data/textes';
import { PixelText, measure } from '../ui/PixelText';

/**
 * L'écran de fin, **en deux pages**. Palette du jour : c'est le seul écran, avec la cuisine de
 * la fête, où le soleil est levé — tout le reste du jeu se passe pendant la nuit blanche de la
 * veille.
 *
 * La première page compte ce que Nino a trouvé, pas ce qu'il a réussi : il n'y a pas de score
 * dans ce jeu, seulement des choses vues. La seconde raconte **ce qu'il a fait cette nuit-là**,
 * une ligne par chose qui a réellement eu lieu — deux chiffres ne disaient rien d'une nuit où
 * l'on a coulé le bateau de son père et envoyé un poisson à la mer.
 */
const PALETTE = 'real' as const;

/** Hauteur d'une ligne de la seconde page, et hauteur du premier item. En pixels. */
const LIGNE = 9;
const HAUT = 26;

export class FinScene extends Phaser.Scene {
  private page = 0;
  private ecran: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('Fin');
  }

  create(): void {
    state.palette = PALETTE;
    // La mélodie de la maison, mais du soir. Tant que le fichier n'est pas posé : silence,
    // ce qui va très bien à un enfant endormi.
    jouerMusique(this, 'musique-fin');
    jouerAmbiance(this, undefined);
    state.locked = true;
    this.page = 0;
    this.ecran = [];
    this.cameras.main.setBackgroundColor(shadeHex(PALETTE, 0));
    this.gateau();

    const kb = this.input.keyboard!;
    for (const code of KEYS.action) kb.addKey(code).on('down', () => this.suite());
  }

  /** Une ligne centrée, retenue pour pouvoir vider la page. */
  private centre(nom: string, texte: string, y: number): void {
    const t = new PixelText(this, nom, Math.round((GB.W - measure(texte)) / 2), y, GB.W, 12);
    t.setLines([texte], shadeHex(PALETTE, 3));
    this.ecran.push(t.image);
  }

  private vider(): void {
    for (const o of this.ecran) o.destroy();
    this.ecran = [];
  }

  // ───────────────────────────────────────────────────────── page 1 : le gâteau

  private gateau(): void {
    this.ecran.push(
      this.add
        .image(GB.W / 2 - 16, 26, texKey('gateau', PALETTE))
        .setOrigin(0, 0)
        .setScale(2),
    );

    this.centre('fin-titre', FIN.titre, 76);
    this.centre('fin-bon', FIN.voeu, 92);
    this.centre(
      'fin-compte',
      FIN.compte(`${state.hermione}/${CACHETTES.length}`, `${state.pieces.size}/${PIECES.length}`),
      108,
    );
    // La note du projet d'art, s'il l'a rendu. Sinon la ligne n'existe pas : on ne compte
    // que ce qui a eu lieu.
    if (state.note > 0) this.centre('fin-note', FIN.note(state.note), 118);
    this.centre('fin-suite', FIN.suite, 130);
  }

  // ──────────────────────────────────────── page 2 : ce qu'il a fait cette nuit-là

  /**
   * **Une ligne par chose faite, et rien d'autre.** Les lignes possibles sont dans
   * [textes.ts](../data/textes.ts) avec leur drapeau : celles qui n'ont pas eu lieu n'existent
   * pas, donc deux parties ne donnent pas la même page, et aucune ne reproche l'absence d'une
   * autre. La liste part du haut : onze lignes doivent tenir sous le titre sans toucher le bas.
   */
  private cetteNuit(): void {
    const faits = CETTE_NUIT.filter((f) => state.flag(f.flag));
    this.centre('nuit-titre', FIN.titre2, 12);
    // Aligné en haut, neuf pixels par ligne : les onze lignes possibles doivent tenir sous le
    // titre sans jamais toucher le « ESPACE » du bas, et une liste de quatre lignes tient aussi.
    faits.forEach((f, i) => this.centre(`nuit-${i}`, f.ligne, HAUT + i * LIGNE));
    this.centre('nuit-suite', FIN.suite, 132);
  }

  /** ESPACE : le gâteau, puis la nuit, puis on rend la main à l'écran-titre. */
  private suite(): void {
    this.page += 1;
    this.vider();
    if (this.page === 1) {
      this.cetteNuit();
      return;
    }
    state.locked = false;
    this.scene.start('Title');
  }
}
