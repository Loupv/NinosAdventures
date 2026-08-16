import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { REGLAGES } from '../data/textes';
import { couperSon } from '../systems/audio';
import { enregistrerReglages, reglages } from '../systems/reglages';
import { PixelText, measure } from '../ui/PixelText';

/**
 * **Le couvercle de la console.** Deux interrupteurs — le son, les raccourcis — et le
 * chemin du retour. Ce n'est pas un menu d'options : un jeu offert à un enfant de sept
 * ans n'en a pas besoin, et chaque ligne de plus serait une ligne à lire.
 *
 * On y entre depuis l'écran-titre, avec ÉCHAP ou SELECT — l'endroit et le geste où l'on
 * règle une console avant d'y jouer. La flèche haut ou bas choisit, ESPACE bascule, et
 * **le choix est écrit sur le disque tout de suite** : personne ne valide des réglages.
 */
const PALETTE = 'titre' as const;

interface Ligne {
  nom: string;
  aide: string;
  lu: () => boolean;
  bascule: (scene: Phaser.Scene) => void;
}

const LIGNES: Ligne[] = [
  {
    nom: REGLAGES.son,
    aide: REGLAGES.aideSon,
    lu: () => reglages.son,
    bascule: (scene) => {
      reglages.son = !reglages.son;
      // Le son s'allume ou s'éteint sur-le-champ : c'est ce qui rend le réglage lisible.
      couperSon(scene, !reglages.son);
    },
  },
  {
    nom: REGLAGES.raccourcis,
    aide: REGLAGES.aideRaccourcis,
    lu: () => reglages.raccourcis,
    bascule: () => {
      reglages.raccourcis = !reglages.raccourcis;
    },
  },
];

export class ReglagesScene extends Phaser.Scene {
  private choix = 0;
  private lignes: PixelText[] = [];
  private aide!: PixelText;
  private fleche!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('Reglages');
  }

  create(): void {
    this.choix = 0;
    this.lignes = [];
    this.cameras.main.setBackgroundColor(shadeHex(PALETTE, 0));

    this.centrer('reg-titre', REGLAGES.titre, 22);
    this.add.rectangle(28, 34, GB.W - 56, 1, shade(PALETTE, 1)).setOrigin(0, 0);

    // Le curseur : un carré plein devant la ligne choisie, qu'on déplace au lieu de le redessiner.
    this.fleche = this.add.rectangle(26, 0, 3, 3, shade(PALETTE, 3)).setOrigin(0, 0);
    LIGNES.forEach((_, i) => {
      this.lignes.push(new PixelText(this, `reg-${i}`, 34, 48 + i * 16, GB.W - 40, 12));
    });
    this.aide = new PixelText(this, 'reg-aide', 0, 104, GB.W, 12);
    this.centrer('reg-sortir', REGLAGES.sortir, 126);

    const kb = this.input.keyboard!;
    for (const code of [...KEYS.up, ...KEYS.down]) {
      kb.addKey(code).on('down', () => {
        this.choix = (this.choix + 1) % LIGNES.length;
        this.peindre();
      });
    }
    for (const code of KEYS.action) {
      kb.addKey(code).on('down', () => {
        LIGNES[this.choix].bascule(this);
        enregistrerReglages();
        this.peindre();
      });
    }
    for (const code of KEYS.cancel) kb.addKey(code).on('down', () => this.scene.start('Title'));

    this.peindre();
  }

  /** Une ligne : son nom à gauche, sa valeur à droite, et l'aide de celle qu'on a choisie. */
  private peindre(): void {
    LIGNES.forEach((l, i) => {
      const valeur = l.lu() ? REGLAGES.oui : REGLAGES.non;
      const espace = ' '.repeat(Math.max(1, 18 - l.nom.length - valeur.length));
      this.lignes[i].setLines([`${l.nom}${espace}${valeur}`], shadeHex(PALETTE, 3));
    });
    this.fleche.setY(52 + this.choix * 16);
    const aide = LIGNES[this.choix].aide;
    this.aide.image.setPosition(Math.round((GB.W - measure(aide)) / 2), 104);
    this.aide.setLines([aide], shadeHex(PALETTE, 2));
  }

  private centrer(nom: string, texte: string, y: number): void {
    const t = new PixelText(this, nom, 0, y, GB.W, 12);
    t.image.setPosition(Math.round((GB.W - measure(texte)) / 2), y);
    t.setLines([texte], shadeHex(PALETTE, 3));
  }
}
