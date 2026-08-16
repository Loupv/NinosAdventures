import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { CREDITS, REGLAGES } from '../data/textes';
import { couperSon, jouer } from '../systems/audio';
import { enregistrerReglages, reglages } from '../systems/reglages';
import { ETAPES, preparerEtape, type Etape } from '../dev/etapes';
import { PixelText, measure } from '../ui/PixelText';
import { MANETTE } from '../ui/touches';

/**
 * **Le couvercle de la console.** Deux interrupteurs — le son, les raccourcis — et le
 * chemin du retour. Ce n'est pas un menu d'options : un jeu offert à un enfant de sept
 * ans n'en a pas besoin, et chaque ligne de plus serait une ligne à lire.
 *
 * On y entre avec START, de l'écran-titre comme du beau milieu d'une partie. La croix
 * choisit, A bascule, START referme — et **le choix est écrit sur le disque tout de
 * suite** : personne ne valide des réglages.
 *
 * **Une troisième ligne apparaît quand les raccourcis sont allumés** : la liste des
 * moments du jeu, à parcourir à la croix. Sur une tablette il n'y a pas de touches
 * numérotées, et un raccourci qu'on ne peut pas déclencher n'est pas un raccourci.
 */
const PALETTE = 'titre' as const;

/** Où commence la liste, et de combien on descend d'une ligne à l'autre. */
const HAUT = 32;
const PAS = 10;
/** Un nom d'étape plus long que ça sort de l'écran : on le coupe. */
const LARGEUR_NOM = 21;

interface Ligne {
  nom: string;
  aide: string;
  /** Ce qu'affiche la colonne de droite. Vide pour une ligne qui ouvre autre chose. */
  valeur: () => string;
  activer: (scene: ReglagesScene) => void;
}

/**
 * **« Aller à… » ne dépend de rien.** C'était la troisième ligne d'un réglage qui parle
 * de touches numérotées — or sur une tablette il n'y a pas de touches, et c'était
 * justement là que la liste servait. Elle est donc toujours offerte, et l'interrupteur
 * des raccourcis ne gouverne plus que les chiffres du clavier : il disparaît là où il
 * n'y a pas de clavier.
 */
const INTERRUPTEURS: Ligne[] = [
  {
    nom: REGLAGES.son,
    aide: REGLAGES.aideSon,
    valeur: () => (reglages.son ? REGLAGES.oui : REGLAGES.non),
    activer: (scene) => {
      reglages.son = !reglages.son;
      // Le son s'allume ou s'éteint sur-le-champ : c'est ce qui rend le réglage lisible.
      couperSon(scene, !reglages.son);
    },
  },
  ...(MANETTE
    ? []
    : [
        {
          nom: REGLAGES.raccourcis,
          aide: REGLAGES.aideRaccourcis,
          valeur: () => (reglages.raccourcis ? REGLAGES.oui : REGLAGES.non),
          activer: () => {
            reglages.raccourcis = !reglages.raccourcis;
          },
        },
      ]),
];

/** Les lignes visibles maintenant : « Aller à… » n'existe qu'une fois le jeu fini. */
function lignesVisibles(): Ligne[] {
  if (!reglages.fini) return INTERRUPTEURS;
  return [
    ...INTERRUPTEURS,
    {
      nom: REGLAGES.allerA,
      aide: REGLAGES.aideAllerA,
      valeur: () => '',
      activer: (scene) => scene.ouvrirLesEtapes(),
    },
  ];
}

/** Les étapes proposées : celles que le clavier atteint par un chiffre. */
const SAUTS: Etape[] = ETAPES.filter((e) => /^[0-9]$/.test(e.touche));

/** Le nom d'une étape, coupé à la largeur de l'écran. */
const court = (nom: string) =>
  nom.length <= LARGEUR_NOM ? nom : `${nom.slice(0, LARGEUR_NOM - 1)}…`;

export class ReglagesScene extends Phaser.Scene {
  /** La scène à réveiller en sortant : le monde si on vient d'une partie, sinon le titre. */
  private retour?: string;
  private page: 'reglages' | 'etapes' = 'reglages';
  /** L'étape choisie, en attente de confirmation : sauter efface la partie en cours. */
  private aConfirmer?: Etape;
  private choix = 0;
  private lignes: PixelText[] = [];
  private aide!: PixelText;
  private curseur!: Phaser.GameObjects.Rectangle;
  private titre!: PixelText;
  private pied!: PixelText;

  constructor() {
    super('Reglages');
  }

  create(data?: { retour?: string }): void {
    this.retour = data?.retour;
    this.page = 'reglages';
    this.choix = 0;
    this.lignes = [];
    this.cameras.main.setBackgroundColor(shadeHex(PALETTE, 0));

    this.titre = new PixelText(this, 'reg-titre', 0, 14, GB.W, 12);
    this.add.rectangle(28, 26, GB.W - 56, 1, shade(PALETTE, 1)).setOrigin(0, 0);
    // Le curseur : un carré plein devant la ligne choisie, qu'on déplace au lieu de le redessiner.
    this.curseur = this.add.rectangle(20, 0, 3, 3, shade(PALETTE, 3)).setOrigin(0, 0);
    // Assez de lignes pour la plus longue des deux pages. Dix étapes tiennent sous le
    // titre à condition de serrer l'interligne — c'est une liste, pas un poème.
    for (let i = 0; i < Math.max(INTERRUPTEURS.length, SAUTS.length); i++) {
      this.lignes.push(new PixelText(this, `reg-${i}`, 28, HAUT + i * PAS, GB.W - 34, 12));
    }
    this.aide = new PixelText(this, 'reg-aide', 0, 118, GB.W, 12);
    this.pied = new PixelText(this, 'reg-pied', 0, 131, GB.W, 12);

    const kb = this.input.keyboard!;
    for (const code of KEYS.up) kb.addKey(code).on('down', () => this.bouger(-1));
    for (const code of KEYS.down) kb.addKey(code).on('down', () => this.bouger(1));
    for (const code of KEYS.action) kb.addKey(code).on('down', () => this.activer());
    // On sort par où l'on est entré : START referme le menu, ÉCHAP aussi.
    for (const code of [...KEYS.cancel, ...KEYS.reglages]) {
      kb.addKey(code).on('down', () => this.sortir());
    }

    this.peindre();
  }

  /** La liste des moments du jeu, quand les raccourcis sont allumés. */
  ouvrirLesEtapes(): void {
    this.page = 'etapes';
    this.aConfirmer = undefined;
    this.choix = 0;
    this.peindre();
  }

  private get combien(): number {
    return this.page === 'etapes' ? SAUTS.length : lignesVisibles().length;
  }

  private bouger(sens: number): void {
    const n = this.combien;
    this.choix = (this.choix + sens + n) % n;
    jouer(this, 'menu', { volume: 0.5 });
    this.peindre();
  }

  private activer(): void {
    jouer(this, 'valider', { volume: 0.6 });
    // **On demande avant de sauter.** Une étape repart de zéro : elle écrase la partie
    // en cours, exactement comme « repartir à zéro » sur l'écran-titre, qui pose la
    // question. Un enfant qui explore le menu ne doit pas perdre sa nuit d'un appui.
    if (this.aConfirmer) {
      this.sauter(this.aConfirmer);
      return;
    }
    if (this.page === 'etapes') {
      this.aConfirmer = SAUTS[this.choix];
      this.peindre();
      return;
    }
    lignesVisibles()[this.choix].activer(this);
    enregistrerReglages();
    this.peindre();
  }

  /** Poser l'état de l'étape, puis ouvrir l'écran qu'elle demande. */
  private sauter(e: Etape): void {
    preparerEtape(e);
    this.scene.stop('Ui');
    if (e.minijeu) {
      this.scene.start(e.minijeu);
      return;
    }
    if (e.cinema) {
      this.scene.start('World', { room: CREDITS[0].room, cinema: 0 });
      return;
    }
    this.scene.start('World', { room: e.room, x: e.x, y: e.y });
  }

  private peindre(): void {
    const etapes = this.page === 'etapes';
    this.centrer(this.titre, etapes ? REGLAGES.etapes : REGLAGES.titre, 14);

    // La question posée, la liste s'efface : on ne choisit plus, on répond.
    if (this.aConfirmer) {
      this.lignes.forEach((t) => t.setLines([''], shadeHex(PALETTE, 3)));
      this.curseur.setVisible(false);
      this.centrer(this.lignes[1], court(this.aConfirmer.nom), 44);
      this.centrer(this.lignes[3], REGLAGES.confirmer, 66);
      this.centrer(this.aide, REGLAGES.confirmerOui, 100, 3);
      this.centrer(this.pied, REGLAGES.confirmerNon, 114);
      return;
    }
    this.curseur.setVisible(true);

    this.lignes.forEach((t, i) => {
      if (i >= this.combien) {
        t.setLines([''], shadeHex(PALETTE, 3));
        return;
      }
      const texte = etapes
        ? court(SAUTS[i].nom)
        : `${lignesVisibles()[i].nom}${this.remplissage(i)}${lignesVisibles()[i].valeur()}`;
      t.setLines([texte], shadeHex(PALETTE, 3));
    });

    this.curseur.setY(HAUT + 4 + this.choix * PAS);
    // La liste occupe tout l'écran : son aide et son pied de page céderaient la place à
    // une ligne de trop, et on sait déjà comment revenir — on vient d'entrer.
    this.centrer(this.aide, etapes ? '' : lignesVisibles()[this.choix].aide, 118, 2);
    this.centrer(this.pied, etapes ? '' : REGLAGES.sortir, 131);
  }

  /** L'espace entre le nom et sa valeur, pour que la colonne de droite s'aligne. */
  private remplissage(i: number): string {
    const l = lignesVisibles()[i];
    const large = 20 - l.nom.length - l.valeur().length;
    return ' '.repeat(Math.max(1, large));
  }

  private sortir(): void {
    jouer(this, 'menu', { volume: 0.5 });
    // On renonce au saut avant de quitter la liste : un retour à la fois.
    if (this.aConfirmer) {
      this.aConfirmer = undefined;
      this.peindre();
      return;
    }
    // Depuis la liste, on remonte d'abord aux réglages : un écran, un retour.
    if (this.page === 'etapes') {
      this.page = 'reglages';
      this.choix = lignesVisibles().length - 1;  // sur « Aller à… », d'où l'on vient
      this.peindre();
      return;
    }
    if (!this.retour) {
      this.scene.start('Title');
      return;
    }
    // La partie reprend là où elle en était, interface comprise.
    this.scene.stop();
    this.scene.resume(this.retour);
    this.scene.resume('Ui');
  }

  private centrer(t: PixelText, texte: string, y: number, ton: 0 | 1 | 2 | 3 = 3): void {
    t.image.setPosition(Math.round((GB.W - measure(texte)) / 2), y);
    t.setLines([texte], shadeHex(PALETTE, ton));
  }
}
