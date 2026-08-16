import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade as shadeNum, shadeHex } from '../art/palette';
import { animKey, texKey } from '../art/pixels';
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
    // **Pas de gâteau ici** : on vient de le souffler, et la troupe le remplace mieux
    // qu'un dessin de plus. Le nom de la page lui reste, c'est la page du gâteau.
    this.laTroupe();

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

  /**
   * **Toute la troupe est venue pour l'anniversaire**, comme sur l'écran-titre rempli :
   * ceux qu'on a rencontrés seulement, alignés sous le gâteau sur une même ligne de sol.
   *
   * Les places sont **fixes et espacées de vingt pixels** : aucun ne se marche dessus,
   * quel que soit le nombre de présents. L'éléphant n'entre pas dans le rang — il est au
   * fond, derrière tout le monde, et sa tête sort du cadre comme sur l'affiche.
   */
  private laTroupe(): void {
    const SOL = 72;
    if (state.flag('elephant-vu')) {
      // **Il est le décor, comme sur l'affiche** : du sol jusqu'au-delà du haut de
      // l'écran, derrière tout le monde, la tête hors cadre. Personne ne trouve ça
      // bizarre, et toute la troupe pose devant lui.
      this.ecran.push(
        this.add
          .sprite(GB.W + 10, SOL + 2, texKey('elephant', PALETTE), 'boit')
          .setOrigin(1, 1)
          .setScale(5)
          .setDepth(-6)
          .play(animKey('elephant-oreille', PALETTE)),
      );
    }
    /** Les invités, de gauche à droite, avec ce qui les fait exister. */
    const troupe: Array<[number, string, string, string | undefined, boolean]> = [
      [14, 'ecureuil', 'queue-0', 'ecureuil-queue', state.flag('ecureuil-vu')],
      [32, 'araignee', 'pattes-0', 'araignee-pattes', state.haiku > 0],
      [50, 'hermione', 'idle-0', 'hermione-idle', state.hermione > 0],
      [68, 'nino', 'down-0', 'nino-walk-down', true],
      [86, 'moon', 'idle-0', 'moon-idle', true],
      [106, 'papa-capitaine', 'marche-0', undefined, state.flag('papa-capitaine-vu')],
      [130, 'seau', 'eau-0', 'seau-saute', state.flag('poisson-arrive')],
    ];
    for (const [x, sprite, frame, anim, la] of troupe) {
      if (!la) continue;
      const s = this.add.sprite(x, SOL, texKey(sprite, PALETTE), frame).setOrigin(0.5, 1);
      if (anim) s.play(animKey(anim, PALETTE));
      this.ecran.push(s);
    }
    // Le sol sous leurs pieds, comme sur l'affiche.
    this.ecran.push(this.add.rectangle(8, SOL, GB.W - 16, 1, shadeNum(PALETTE, 1)).setOrigin(0, 0));
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
