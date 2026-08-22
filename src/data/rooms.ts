import type { PaletteId } from '../art/palette';
import type { ThemeId } from '../art/tiles';
import type { ItemId } from './items';
import { LIEUX } from './textes';

export interface Portal {
  room: string;
  x: number;
  y: number;
  /** Lance une scène de mini-jeu au lieu d'une pièce (le rêve du grand lit). */
  minijeu?: string;
  /** Objet requis pour ouvrir. */
  needs?: ItemId;
  /** Flag requis pour ouvrir (ex. le chat a parlé). */
  needsFlag?: string;
  /** Dialogue joué quand c'est encore fermé. */
  lockedDialogue?: string;
  /** Dialogue joué la première fois qu'on l'ouvre : on ne passe pas encore. */
  firstDialogue?: string;
  /** Flag posé par ce premier dialogue, qui marque le passage comme ouvert. */
  opensFlag?: string;
}

export interface RoomObject {
  /** Posé sur l'eau : il tangue doucement pendant le générique. */
  flotte0?: true;
  /** Penché, en degrés. Une épave n'est pas d'aplomb. */
  angle?: number;
  id: string;
  /** Coin haut-gauche, en pixels. */
  x: number;
  y: number;
  sprite?: string;
  frame?: string;
  /**
   * Règles [flag, frame] appliquées dans l'ordre : la dernière qui correspond gagne.
   * Ça permet un objet à plus de deux états — la baignoire vide, puis pleine, puis
   * vide à nouveau une fois le bouchon retiré.
   */
  frameIfFlag?: Array<[string, string]>;
  anim?: string;
  /** [flag, animation] : s'anime seulement une fois le flag posé. */
  animIfFlag?: [string, string];
  /** ...et plus du tout si celui-là est posé. L'eau de la baignoire finit par partir. */
  animSaufFlag?: string;
  /** true = tout le sprite bloque ; sinon rectangle [dx, dy, w, h]. */
  solid?: boolean | [number, number, number, number];
  /** Profondeur imposée. Sert quand un objet est posé SUR un meuble (Moon, canapé). */
  depth?: number;
  /**
   * Facteur d'agrandissement ENTIER (2, 3...). L'échelle entière préserve la grille
   * de pixels : c'est gratuit et ça évite de redessiner un sprite en plus grand.
   */
  scale?: number;
  /**
   * Un personnage qui ne reste pas planté : il va et vient autour de sa position de
   * départ, avec des pauses. `rayon` en pixels, `vitesse` en px/s (lente par défaut).
   */
  /**
   * Il ne tient pas en place : il vise un point au hasard dans son rayon, il y va, il attend.
   *
   * `apres` **retarde l'errance** jusqu'à ce que le drapeau soit posé : Moon dort sur son canapé,
   * et un chat qui dort ne fait pas les cent pas. Il ne se met à bouger qu'une fois réveillé.
   */
  errance?: { rayon: number; vitesse?: number; apres?: string };
  dialogue?: string;
  /**
   * Priorité d'interaction quand deux choses sont à portée : **2 = comme un personnage**,
   * 1 pour un meuble (la valeur par défaut). L'amarre du bateau en a besoin — sans ça,
   * papa, qui est juste au-dessus, lui volait l'interaction et la corde était injouable.
   */
  priorite?: number;
  /**
   * Distance à laquelle on peut l'actionner, en pixels. Par défaut : la marge de la vue
   * (large, parce qu'à sept ans on ne se place pas au pixel près). On la resserre quand
   * plusieurs choses se disputent le même bout de quai.
   */
  portee?: number;
  /** On peut taper dedans : il part dans la direction où regarde Nino et rebondit. */
  ballon?: boolean;
  /**
   * **Une zone d'interaction sans dessin.** L'objet existe, on peut s'en approcher et lui parler —
   * la bulle apparaît au-dessus — mais **on ne voit rien** : ce qu'on va chercher est censé être
   * hors de vue, sous un meuble ou derrière. Le `sprite` ne sert plus qu'à donner sa taille à la
   * zone.
   */
  zone?: boolean;
  /**
   * Un poisson : il saute d'un bord à l'autre et **disparaît sous l'eau entre deux
   * sauts**. `eau` est la ligne de flottaison en pixels — au-dessus il est visible,
   * en dessous il n'est plus là.
   */
  saute?: { gauche: number; droite: number; hauteur: number; eau: number };
  /**
   * **Il fait les cent pas**, entre `gauche` et `droite`, en `duree` millisecondes par trajet.
   * Un seul cas : papa sur le pont de son bateau. Nino s'arrête à cinquante pixels de sa mère,
   * et de là le bateau est au bord du cadre — s'il restait planté à la poupe, on ne verrait
   * jamais son père. Qu'il aille et vienne suffit à le mettre à l'écran.
   *
   * La cible d'interaction suit sa vraie position, comme pour tout ce qui bouge.
   */
  /**
   * **Où se perche un pigeon qu'on a dérangé six fois.** La chose la plus haute et la plus mal
   * choisie de l'écran. Il y va une fois, et il y reste.
   */
  perchoir?: { x: number; y: number };
  patrouille?: {
    gauche: number;
    droite: number;
    /** Le temps d'un trajet, en ms. */
    duree: number;
    /** Le temps qu'il reste arrêté à chaque bout, en ms. */
    pause?: number;
    /** L'animation en marchant, et celle à l'arrêt. */
    marche?: string;
    arret?: string;
  };
  /**
   * Le dessin sort du cadre de la pièce, et c'est voulu. Un seul cas : la Tour de Bretagne
   * vue d'en bas, dont on ne doit jamais voir le sommet.
   */
  deborde?: boolean;
  /**
   * Ligne de flottaison, en pixels : tout ce qui passe **sous** elle est sous l'eau, donc
   * découpé du dessin. C'est ce qui fait que la coque du bateau est à moitié immergée sans
   * qu'on ait à dessiner deux bateaux — et surtout ce qui fait qu'en descendant, il
   * *disparaît dans l'eau* au lieu de glisser par-dessus.
   */
  flotte?: number;
  portal?: Portal;
  showIfFlag?: string;
  hideIfFlag?: string;
}

export interface Door {
  x: number;
  y: number;
  w: number;
  h: number;
  to: { room: string; x: number; y: number };
  /** Tant que ce flag est posé, on ne passe pas : on se fait renvoyer. */
  blockedIfFlag?: string;
  /**
   * **Sauf si celui-là est posé** : le blocage se lève. Un obstacle raconté par une réplique
   * (« le chat les retient dans la cuisine ») ne peut pas durer tout le jeu — quand les gens dont
   * il parle sont deux kilomètres plus loin, il devient un mensonge.
   */
  blockedSaufFlag?: string;
  /** Et tant que celui-là manque, non plus. */
  needsFlag?: string;
  /** Les répliques jouées à la place du passage, dans l'ordre. */
  blockedDialogue?: string[];
  /** Le bruit du passage. Par défaut celui d'une porte ; les escaliers ont le leur. */
  son?: string;
}

export interface Room {
  id: string;
  palette: PaletteId;
  theme: ThemeId;
  /**
   * Vue de dessus par défaut. `'side'` passe la pièce de profil : gravité, saut,
   * déplacement horizontal, et la caméra suit si la pièce dépasse l'écran.
   */
  view?: 'top' | 'side';
  /**
   * Ce que la pièce fait à l'heure du jeu, une fois pour toutes en y entrant. La nuit
   * tombe sur la terrasse de la ville, et le jour se lève sur le toit de la tour : c'est
   * la pièce qui le dit, pas une liste d'identifiants dans la scène.
   */
  heure?: 'nuit' | 'aube';
  /**
   * **Un plateau de générique** : aucune porte n'y mène, aucun couloir du jeu ne le
   * traverse — il n'existe que pour un carton. Le vérificateur ne lui demande pas
   * d'être joignable.
   */
  plateau?: true;
  /** Où Nino apparaît si on entre dans la pièce sans venir d'une porte. */
  spawn: { x: number; y: number };
  tiles: string[];
  objects: RoomObject[];
  doors: Door[];
}

const T = 8;
/** Petit confort : placer en tuiles plutôt qu'en pixels. */
const at = (col: number, row: number) => ({ x: col * T, y: row * T });

/** Bandes pleine largeur de la pièce de profil (deux écrans de long). */
const SIDE_W = 40;
const band = (ch: string) => ch.repeat(SIDE_W);
const C = band('C');
const H = band('h');
const W1 = band('w');
const W2 = band('W');
const BERGE = band('B');
const QUAI = band('Q');
const MUR = band('M');

/**
 * Le ciel du toit : les étoiles sont posées à la main, irrégulièrement, sinon ça fait une
 * grille. Et le parapet, qui sépare la terrasse du vide.
 */
const CIEL = [
  'eEeeeeeEeeeEeeeeeeEe',
  'eeeeEeeeeeeeeEeeeeee',
  'EeeeeeeeeEeeeeeeeEee',
  'eeeeeeEeeeeeeeeeeEee',
  'eeEeeeeeeeeEeeeeeeee',
];
const PARAPET = '####################';

/**
 * Gabarit de palier pour la Tour de Bretagne : douze tuiles de large, du vide autour.
 * Les trois paliers sont identiques exprès — c'est ce qui donne l'impression de monter
 * très longtemps dans la même cage d'escalier.
 */
const PALIER = {
  mur: 'XXXX############XXXX',
  sol: 'XXXX#,,,,,,,,,,#XXXX',
  vide: 'XXXXXXXXXXXXXXXXXXXX',
};

/** Gabarit d'intérieur : deux rangées de mur en haut, une en bas. */
const INT = {
  wall: '####################',
  floor: '#..................#',
  rug: '#.....,,,,,,,,.....#',
  gapLeft: '...................#',
  gapRight: '#...................',
};

export const ROOMS: Record<string, Room> = {
  // ═════════════════════════════════════════════════ chapitre 2 : la Tour de Bretagne
  /**
   * Le hall. L'ascenseur est hors service — c'est ce qui justifie les trente-deux étages
   * à pied, et personne ne s'en étonne.
   */
  'tour-hall': {
    id: 'tour-hall',
    palette: 'ville',
    theme: 'ville',
    heure: 'nuit',
    spawn: { x: 32, y: 128 },
    tiles: [
      INT.wall,
      INT.wall,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      '###..###############',
    ],
    objects: [
      { id: 'ascenseur', x: 16, y: 16, sprite: 'ascenseur', solid: true, dialogue: 'ascenseur' },
      { id: 'plan-tour', x: 56, y: 18, sprite: 'panneau', solid: true, dialogue: 'plan-tour' },
      {
        id: 'escalier-haut',
        x: 120,
        y: 16,
        sprite: 'escalier',
        depth: 20,
        // Il n'y a pas d'escalier avant que le poisson accepte : c'est l'énigme qui le fait apparaître.
        showIfFlag: 'enigme-poisson',
      },
      // **Le poisson, dans un seau, au milieu du hall.** Il revient tout juste de la mer, et
      // personne ne demande comment il est arrivé là — ni comment il compte monter.
      {
        id: 'poisson-seau',
        // **Au centre de l'écran, comme un boss de fin de jeu** : tous les gardiens de la
        // tour se présentent face à l'arrivant — sauf l'éléphant, qui déborde de partout.
        x: 68,
        y: 40,
        sprite: 'seau',
        frame: 'eau-0',
        // L'eau scintille en continu. Avant l'énigme, rien ne dit qu'il y a quelqu'un
        // dedans : la tête ne sort que pendant qu'on lui parle (montre), et le vrai saut
        // est un poisson entier, à part, comme dans la baignoire.
        anim: 'seau-eau',
        priorite: 2,
        dialogue: 'poisson-tour',
      },
      /**
       * **Le poisson entier, qui saute hors du seau** — une fois son énigme résolue. Le même
       * mécanisme que la baignoire : visible seulement en l'air, un petit plouf à chaque
       * plongeon.
       */
      {
        id: 'poisson-seau-saut',
        x: 71,
        y: 44,
        sprite: 'poisson',
        frame: 'saut-0',
        anim: 'poisson-saut',
        depth: 70,
        // `eau` est la ligne d'eau **dessinée** de la bassine (rang 8 du dessin, y 40+8) :
        // plus bas, le poisson s'enfonçait sous la surface avant de disparaître.
        saute: { gauche: 71, droite: 81, hauteur: 16, eau: 48 },
        showIfFlag: 'enigme-poisson',
      },
      {
        id: 'plante-hall',
        ...at(17, 14),
        sprite: 'plante',
        frame: 'normale',
        frameIfFlag: [['arrosee-plante-hall', 'radieuse']],
        solid: true,
        dialogue: 'plante',
      },
    ],
    doors: [
      { x: 24, y: 136, w: 16, h: 8, to: { room: 'tour-pied', x: 228, y: 104 } },
      // On monte en marchant dans l'escalier. Moon garde la marche : sans son énigme,
      // il nous renvoie au pied des marches.
      {
        x: 120,
        y: 16,
        w: 16,
        h: 17,
        to: { room: 'tour-13', x: 52, y: 108 },
        needsFlag: 'enigme-poisson',
        blockedDialogue: ['escalier-garde'],
        son: 'escalier',
      },
    ],
  },

  'tour-13': {
    id: 'tour-13',
    palette: 'ville',
    theme: 'ville',
    heure: 'nuit',
    spawn: { x: 52, y: 108 },
    tiles: [
      PALIER.vide,
      PALIER.vide,
      PALIER.vide,
      PALIER.mur,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.mur,
      PALIER.vide,
      PALIER.vide,
      PALIER.vide,
    ],
    objects: [
      { id: 'escalier-bas', x: 44, y: 84, sprite: 'escalier', depth: 88 },
      {
        id: 'escalier-haut',
        x: 100,
        y: 36,
        sprite: 'escalier',
        depth: 40,
        showIfFlag: 'enigme-ecureuil',
      },
      {
        id: 'ecureuil-tour',
        // Centré, en boss : dix pixels de large, le milieu de l'écran est à 80.
        x: 75,
        y: 60,
        sprite: 'ecureuil',
        frame: 'queue-0',
        anim: 'ecureuil-queue',
        dialogue: 'ecureuil-tour',
      },
      { id: 'porte-cabinet', x: 56, y: 32, sprite: 'porte', solid: true, dialogue: 'porte-cabinet' },
      // **Une fenêtre par étage.** Les trois paliers sont identiques au pixel près ; c'est le
      // paysage qui dit qu'on monte, et lui seul.
      {
        id: 'fenetre-tour',
        x: 80,
        y: 32,
        sprite: 'fenetre',
        frame: 'ouverte',
        solid: true,
        dialogue: 'fenetre-13',
      },
      // **En plastique**, et elle ne compte pas dans les sept : elle ne boit pas. Arroser du
      // plastique donne une réplique, pas une fleur.
      {
        id: 'plante-13',
        x: 108,
        y: 88,
        sprite: 'plante',
        frame: 'normale',
        solid: true,
        dialogue: 'plante-tour',
      },
    ],
    doors: [
      { x: 44, y: 84, w: 16, h: 17, to: { room: 'tour-hall', x: 128, y: 44 }, son: 'escalier' },
      {
        x: 100,
        y: 36,
        w: 16,
        h: 17,
        to: { room: 'tour-27', x: 52, y: 108 },
        needsFlag: 'enigme-ecureuil',
        blockedDialogue: ['escalier-garde'],
        son: 'escalier',
      },
    ],
  },

  'tour-27': {
    id: 'tour-27',
    palette: 'ville',
    theme: 'ville',
    heure: 'nuit',
    spawn: { x: 52, y: 108 },
    tiles: [
      PALIER.vide,
      PALIER.vide,
      PALIER.vide,
      PALIER.mur,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.mur,
      PALIER.vide,
      PALIER.vide,
      PALIER.vide,
    ],
    objects: [
      { id: 'escalier-bas', x: 44, y: 84, sprite: 'escalier', depth: 88 },
      {
        id: 'escalier-haut',
        x: 100,
        y: 36,
        sprite: 'escalier',
        depth: 40,
        showIfFlag: 'enigme-araignee',
      },
      {
        id: 'fenetre-tour',
        x: 72,
        y: 32,
        sprite: 'fenetre',
        frame: 'ouverte',
        solid: true,
        dialogue: 'fenetre-27',
      },
      // Voilà où elle était passée.
      {
        id: 'araignee',
        x: 72,
        y: 72,
        sprite: 'araignee',
        frame: 'pattes-0',
        anim: 'araignee-pattes',
        scale: 2,
        dialogue: 'araignee-tour',
      },
    ],
    doors: [
      { x: 44, y: 84, w: 16, h: 17, to: { room: 'tour-13', x: 108, y: 62 }, son: 'escalier' },
      {
        x: 100,
        y: 36,
        w: 16,
        h: 17,
        to: { room: 'tour-31', x: 52, y: 108 },
        needsFlag: 'enigme-araignee',
        blockedDialogue: ['escalier-garde'],
        son: 'escalier',
      },
    ],
  },

  /**
   * Trente-et-unième. L'Éléphant des Machines est là, il remplit le palier, et personne
   * n'explique comment il est monté.
   */
  'tour-31': {
    id: 'tour-31',
    palette: 'ville',
    theme: 'ville',
    heure: 'nuit',
    spawn: { x: 52, y: 108 },
    tiles: [
      PALIER.vide,
      PALIER.vide,
      PALIER.vide,
      PALIER.mur,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.sol,
      PALIER.mur,
      PALIER.vide,
      PALIER.vide,
      PALIER.vide,
    ],
    objects: [
      { id: 'escalier-bas', x: 44, y: 84, sprite: 'escalier', depth: 88 },
      // **Pas de fenêtre au 31e** : l'éléphant tient tout le mur du fond, et elle se
      // dessinait par-dessus lui. À cet étage, la vue, c'est lui.
      /**
       * **Le second escalier s'ouvre en bas à droite**, contre le mur : du même côté que celui
       * d'arrivée, mais à l'autre bout du palier. On débouche des marches, on lève la tête sur un
       * éléphant qui occupe tout le fond, et il n'y a qu'à longer le bas de la pièce — pas à faire
       * le tour d'un animal de douze mètres.
       */
      {
        id: 'escalier-haut',
        x: 104,
        y: 84,
        sprite: 'escalier',
        depth: 88,
        showIfFlag: 'enigme-elephant',
      },
      /**
       * **Inutilement gros, mais pas absurde.** Trois fois le dessin — quatre-vingt-dix pixels de
       * long, la moitié du palier, une tête et demie de plus qu'un éléphant normal. C'est ce qu'il
       * faut pour poser sans l'écrire la question qu'on ne pose jamais : il ne rentre visiblement
       * pas ici. À cinq fois, il remplissait l'écran entier et on ne voyait plus la pièce — ça ne
       * ressemblait plus à un éléphant trop grand, ça ressemblait à un bug.
       *
       * Le palier ne fait que **quatre-vingts pixels de large** entre ses deux murs : à
       * quatre-vingt-dix, il est **coincé entre les deux**, et il dépasse d'autant de chaque côté
       * sans jamais sortir dans le noir. C'est précisément le bon effet — il ne rentre pas.
       *
       * Il tient **la moitié haute du palier**, et il **dépasse par le haut** — sa tête mange le mur
       * du fond et la bande noire au-dessus. Ce n'est pas un défaut : c'est le seul endroit où il
       * pouvait déborder sans avoir l'air d'un bug, et ça dégage tout le bas pour les deux escaliers
       * et pour Nino, qui marche devant lui sans avoir à en faire le tour.
       *
       * Il **ne boit pas** : il n'y a pas d'eau à cet étage. Seule l'oreille bat, très lentement, la trompe reste où elle est.
       * Et il est dessiné **derrière Nino** : à cette taille, sa profondeur naturelle l'aurait fait
       * passer devant lui.
       */
      {
        id: 'elephant',
        x: 35,
        y: 22,
        sprite: 'elephant',
        frame: 'boit',
        anim: 'elephant-oreille',
        scale: 3,
        depth: 40,
        priorite: 2,
        dialogue: 'elephant',
      },
    ],
    doors: [
      { x: 44, y: 84, w: 16, h: 17, to: { room: 'tour-27', x: 108, y: 62 }, son: 'escalier' },
      {
        x: 104,
        y: 84,
        w: 16,
        h: 17,
        to: { room: 'tour-toit', x: 78, y: 114 },
        needsFlag: 'enigme-elephant',
        blockedDialogue: ['escalier-garde'],
        son: 'escalier',
      },
    ],
  },

  /**
   * Le toit. Le parapente est appuyé contre le parapet, et au-dessus il y a **le ciel
   * étoilé** : c'est le seul écran du jeu où l'on voit le ciel en entier, et c'est ce qui
   * dit sans commentaire depuis combien de temps Nino est debout.
   */
  'tour-toit': {
    id: 'tour-toit',
    palette: 'ville',
    theme: 'ville',
    heure: 'aube',
    spawn: { x: 78, y: 114 },
    tiles: [
      ...CIEL,
      PARAPET,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      // L'escalier redescend par le bas de l'écran, sous le trône : le mur se perce là.
      '#########..#########',
      '#########..#########',
    ],
    objects: [
      { id: 'escalier-bas', x: 72, y: 118, sprite: 'escalier', depth: 60 },
      // **La composition du toit est un tableau** : le trône et Moon au centre de l'écran,
      // Nino aligné en dessous par le travelling — et la lune un peu à gauche, comme les
      // vraies lunes, qui ne se placent jamais où on veut. C'est elle que Moon garde : on
      // l'apprend au bout de trente-deux étages, et personne ne demande depuis quand.
      // On peut lui parler — c'est Moon qui répond : son histoire avec elle se raconte
      // ici, en la regardant. Portée longue : elle est dans le ciel, on lui parle d'en bas.
      { id: 'lune', x: 40, y: 14, sprite: 'lune', depth: -60, portee: 44, dialogue: 'lune' },
      { id: 'trone', x: 73, y: 70, sprite: 'trone', depth: 78, solid: true },
      /**
       * **Moon, le dernier gardien, sur son trône, sous sa lune.** Il explique enfin son nom,
       * il pose la plus difficile de toutes les questions, et c'est lui qui donne le
       * parapente. Personne ne demande comment il est monté : c'est le principe.
       */
      {
        id: 'moon-toit',
        x: 74,
        y: 66,
        sprite: 'moon',
        frame: 'idle-0',
        anim: 'moon-idle',
        depth: 90,
        priorite: 2,
        portee: 16,
        dialogue: 'moon-toit',
      },
      { id: 'antenne', x: 132, y: 56, sprite: 'reverbere', solid: true, dialogue: 'antenne' },
      { id: 'vue', x: 116, y: 92, sprite: 'panneau', solid: true, dialogue: 'vue-tour' },
      // Une étoile un peu plus grosse que les autres, posée dans le ciel : de quoi
      // regarder en haut plutôt qu'en bas.
      { id: 'ciel', x: 108, y: 32, sprite: 'etoile', depth: -50, dialogue: 'ciel-tour' },
      {
        // Pas un portail : la scène s'en occupe, pour que « Sauter ? Oui » fasse sauter
        // tout de suite au lieu de demander un deuxième appui.
        id: 'parapente',
        // **Derrière Moon, contre le parapet.** Pour sauter, il faut monter sur le rebord,
        // dans le dos du gardien : on contourne le trône, et on se retrouve au bord du vide.
        x: 74,
        y: 44,
        depth: 48,
        sprite: 'parapente',
        priorite: 2,
        dialogue: 'parapente',
        // Il n'apparaît qu'une fois la question de Moon résolue : c'est lui la récompense.
        showIfFlag: 'enigme-moon-toit',
        // Et une fois rentré, il est sous le lit de Nino — son texte le disait, mais le
        // dessin restait sur le toit.
        hideIfFlag: 'parapente-rentre',
      },
    ],
    doors: [{ x: 72, y: 132, w: 16, h: 12, to: { room: 'tour-31', x: 108, y: 62 }, son: 'escalier' }],
  },

  // ═══════════════════════════════════════════════════════ chapitre 1 : la maison
  chambre: {
    id: 'chambre',
    palette: 'real',
    theme: 'home',
    spawn: { x: 80, y: 110 },
    tiles: [
      INT.wall,
      INT.wall,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      '###..###############',
    ],
    objects: [
      {
        id: 'fenetre-chambre',
        x: 72,
        y: 1,
        sprite: 'fenetre',
        frame: 'fermee',
        solid: true,
        dialogue: 'fenetre-chambre',
      },
      { id: 'lit', ...at(2, 2), sprite: 'lit', solid: true, dialogue: 'lit' },
      {
        id: 'coffre',
        ...at(15, 3),
        sprite: 'coffre',
        frame: 'ferme',
        frameIfFlag: [['coffre-ouvert', 'ouvert']],
        solid: true,
        dialogue: 'coffre',
      },
      {
        // **Le poster, sur le mur du fond**, à la place du ventilateur qui ne servait plus
        // qu'à une ligne de l'écran de fin. Un dessin de Nino qui vole, accroché là depuis
        // un anniversaire d'avant : la seule chose de cette chambre qui sait comment la
        // nuit va finir.
        id: 'poster',
        ...at(11, 1),
        sprite: 'poster',
        dialogue: 'poster',
        portee: 20,
      },
      {
        id: 'plante-chambre',
        ...at(1, 15),
        sprite: 'plante',
        frame: 'normale',
        frameIfFlag: [['arrosee-plante-chambre', 'radieuse']],
        solid: true,
        dialogue: 'plante',
      },
      // L'œuf de Pâques : s'il a traîné au lit, il dégouline en sortant. Trois flaques
      // au pied du lit, et ça sèche au bout de trois écrans.
      {
        id: 'goutte-1',
        x: 46,
        y: 52,
        sprite: 'goutte',
        depth: 20,
        showIfFlag: 'sueur',
        hideIfFlag: 'sueur-sechee',
      },
      {
        id: 'goutte-2',
        x: 42,
        y: 62,
        sprite: 'goutte',
        depth: 20,
        showIfFlag: 'sueur',
        hideIfFlag: 'sueur-sechee',
      },
      {
        id: 'goutte-3',
        x: 38,
        y: 72,
        sprite: 'goutte',
        depth: 20,
        showIfFlag: 'sueur',
        hideIfFlag: 'sueur-sechee',
      },
    ],
    doors: [{ x: 24, y: 136, w: 16, h: 8, to: { room: 'couloir', x: 96, y: 26 } }],
  },

  /**
   * Le couloir : un boyau vertical. En haut, les deux chambres côte à côte ; sur
   * la gauche l'escalier puis la salle de bain ; en bas la cuisine et le salon.
   */
  couloir: {
    id: 'couloir',
    palette: 'real',
    theme: 'home',
    spawn: { x: 96, y: 26 },
    tiles: [
      'XXXXXX########XXXXXX',
      'XXXXXX#..##..#XXXXXX',
      'XXXXXX#......#XXXXXX',
      // L'escalier de la mezzanine est **dans le mur de gauche**, pas au milieu du
      // passage : on monte en marchant dessus, sans rien avoir à presser.
      'XXXXXX.......#XXXXXX',
      'XXXXXX.......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX.......#XXXXXX',
      'XXXXXX.......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX#......#XXXXXX',
      'XXXXXX#..#####XXXXXX',
    ],
    objects: [
      {
        id: 'escalier',
        x: 44,
        y: 24,
        sprite: 'escalier',
        depth: 28,
      },
      /**
       * **La plante du couloir**, la seule qu'on peut arroser. Le couloir était le dernier écran
       * du jeu où rien ne répondait : cinq portes, un escalier et une plante muette. Elle a soif,
       * et un enfant avec un pistolet à eau finit toujours par comprendre ce qu'il a à faire.
       */
      {
        id: 'plante-couloir',
        ...at(12, 12),
        sprite: 'plante',
        frame: 'normale',
        frameIfFlag: [['arrosee-plante-couloir', 'radieuse']],
        solid: true,
        dialogue: 'plante',
      },
    ],
    doors: [
      { x: 88, y: 8, w: 16, h: 8, to: { room: 'chambre', x: 32, y: 128 } },
      {
        x: 56,
        y: 8,
        w: 16,
        h: 8,
        to: { room: 'chambre-parents', x: 128, y: 128 },
      },
      // On monte à la mezzanine en marchant dans l'escalier, à gauche.
      { x: 48, y: 24, w: 8, h: 16, to: { room: 'mezzanine', x: 100, y: 42 }, son: 'escalier' },
      { x: 48, y: 72, w: 8, h: 16, to: { room: 'sdb', x: 144, y: 72 } },
      { x: 56, y: 136, w: 16, h: 8, to: { room: 'cuisine', x: 112, y: 28 } },
    ],
  },

  'chambre-parents': {
    id: 'chambre-parents',
    palette: 'real',
    theme: 'home',
    spawn: { x: 80, y: 110 },
    tiles: [
      INT.wall,
      INT.wall,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      '###############..###',
    ],
    objects: [
      {
        id: 'grand-lit',
        ...at(6, 3),
        sprite: 'grand-lit',
        solid: true,
        // Pas un portail : c'est la scène qui enchaîne, pour que **fermer les yeux
        // démarre le rêve tout de suite** au lieu de demander un deuxième appui.
        dialogue: 'grand-lit',
      },
      {
        id: 'armoire',
        ...at(15, 2),
        sprite: 'armoire',
        solid: true,
        dialogue: 'armoire',
      },
      { id: 'carton', ...at(2, 13), sprite: 'carton', solid: true },
      /**
       * **La nuit du retour.** Nino rentre en parapente, la maison dort : Papa et Maman dans
       * le grand lit — deux têtes sur l'oreiller — et Hermione dans son lit de bébé. Tout ça
       * n'existe que cette nuit-là : au matin, la chambre redevient la chambre.
       */
      {
        id: 'parents-dorment',
        x: 56,
        y: 24,
        sprite: 'parents-dorment',
        depth: 64,
        priorite: 2,
        portee: 16,
        dialogue: 'parents-dorment',
        showIfFlag: 'parapente-rentre',
        hideIfFlag: 'matin',
      },
      {
        id: 'lit-bebe',
        x: 20,
        y: 82,
        sprite: 'lit-bebe',
        solid: true,
        dialogue: 'lit-bebe',
        showIfFlag: 'parapente-rentre',
        hideIfFlag: 'matin',
      },
    ],
    doors: [{ x: 120, y: 136, w: 16, h: 8, to: { room: 'couloir', x: 64, y: 26 } }],
  },

  /**
   * La mezzanine : petite, étroite, verticale. Le lit de camp à gauche, les livres à
   * droite, et l'espace pour redescendre en haut à droite. Les tuiles `X` autour font
   * le hors-plan : la pièce ne remplit pas l'écran, et c'est ce qui la rend petite.
   */
  mezzanine: {
    id: 'mezzanine',
    palette: 'real',
    theme: 'home',
    spawn: { x: 112, y: 42 },
    tiles: [
      'XXXX############XXXX',
      'XXXX############XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX#..........#XXXX',
      'XXXX############XXXX',
    ],
    objects: [
      {
        id: 'escalier',
        x: 104,
        y: 16,
        sprite: 'escalier',
        depth: 20,
      },
      // Tout en bas de la pièce, centrée : loin de l'arrivée, on ne lui tombe plus dessus.
      {
        id: 'araignee',
        x: 60,
        y: 104,
        sprite: 'araignee',
        frame: 'pattes-0',
        anim: 'araignee-pattes',
        // Géante : deux fois la taille du dessin, donc plus large que Nino n'est haut.
        scale: 2,
        dialogue: 'araignee',
        errance: { rayon: 10, vitesse: 9 },
        // Une fois qu'elle a chanté et dansé, elle n'est plus là. On la retrouvera ailleurs.
        hideIfFlag: 'araignee-partie',
      },
      {
        id: 'lit',
        x: 40,
        y: 68,
        sprite: 'lit',
        solid: true,
        dialogue: 'lit-camp',
      },
      // Contre le mur de droite, au milieu de ce bord.
      {
        id: 'bibliotheque',
        x: 88,
        y: 62,
        sprite: 'bibliotheque',
        solid: true,
        dialogue: 'bibliotheque',
      },
      { id: 'carton', x: 40, y: 24, sprite: 'carton', solid: true },
      // Le harnais d'escalade, posé sur l'étagère avec ce qui ne sert qu'une fois par an.
      {
        id: 'harnais',
        x: 92,
        y: 46,
        sprite: 'harnais',
        dialogue: 'harnais',
        hideIfFlag: 'harnais-pris',
        portee: 16,
      },
    ],
    doors: [
      // On redescend en marchant dans l'escalier, en haut à droite.
      { x: 104, y: 20, w: 16, h: 16, to: { room: 'couloir', x: 66, y: 52 }, son: 'escalier' },
    ],
  },

  /**
   * La salle de bain : étroite mais horizontale. Baignoire en haut à gauche,
   * toilettes en bas à gauche, évier en bas. On sort par la droite.
   */
  sdb: {
    id: 'sdb',
    palette: 'real',
    theme: 'home',
    spawn: { x: 120, y: 96 },
    tiles: [
      'XXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
      INT.wall,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.gapRight,
      INT.gapRight,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.wall,
      'XXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
    ],
    objects: [
      {
        id: 'baignoire',
        x: 16,
        y: 44,
        sprite: 'baignoire',
        frame: 'vide',
        frameIfFlag: [
          ['eau-coule', 'pleine'],
          ['bouchon-retire', 'vide'],
        ],
        // L'eau bouge tant qu'il y en a.
        animIfFlag: ['eau-coule', 'baignoire-eau'],
        animSaufFlag: 'bouchon-retire',
        // La boîte solide commence cinq pixels sous le haut du dessin : sans ça, le couloir
        // entre le mur et la baignoire faisait quatre pixels, et Hermione — cachée derrière —
        // était presque impossible à atteindre.
        solid: [0, 5, 24, 11],
        dialogue: 'baignoire',
      },
      {
        // Il n'est là que quand la baignoire est pleine, et il s'en va avec l'eau.
        id: 'poisson',
        x: 24,
        y: 48,
        sprite: 'poisson',
        frame: 'saut-0',
        anim: 'poisson-saut',
        depth: 70,
        // Il saute d'un bout à l'autre de la baignoire, plus haut que le rebord.
        saute: { gauche: 18, droite: 30, hauteur: 12, eau: 50 },
        dialogue: 'poisson',
        hideIfFlag: 'bouchon-retire',
        // Il n'arrive qu'une fois l'eau coulée, et quelques écrans plus tard.
        showIfFlag: 'poisson-arrive',
      },
      { id: 'wc', x: 16, y: 88, sprite: 'wc', solid: true, dialogue: 'wc' },
      // Le bouchon, posé au pied de la baignoire qu'il vient de quitter : il n'existe
      // qu'une fois retiré, et on le trouve là où on l'a enlevé — pas à l'autre bout de
      // la pièce.
      {
        id: 'bouchon',
        x: 44,
        y: 56,
        sprite: 'bouchon',
        // Prioritaire sur la baignoire, sa voisine directe : sinon elle volait l'interaction.
        priorite: 2,
        dialogue: 'bouchon',
        showIfFlag: 'bouchon-retire',
        hideIfFlag: 'bouchon-pris',
      },
      {
        id: 'lavabo',
        x: 72,
        y: 88,
        sprite: 'lavabo',
        solid: true,
        dialogue: 'lavabo',
      },
    ],
    doors: [{ x: 152, y: 64, w: 8, h: 16, to: { room: 'couloir', x: 62, y: 84 } }],
  },

  /**
   * La cuisine : plan de travail en L le long du mur haut-gauche et du mur gauche,
   * frigo centré en haut. Trois sorties : le couloir en haut à droite, le salon sur
   * le flanc gauche, et la porte du bas qui donne sur la cour — la sortie de la maison.
   */
  cuisine: {
    id: 'cuisine',
    palette: 'real',
    theme: 'home',
    spawn: { x: 112, y: 28 },
    tiles: [
      INT.wall,
      '#############..#####',
      '#TTTTTT............#',
      INT.gapRight,
      INT.gapRight,
      INT.floor,
      '#V.................#',
      '#V.................#',
      '#V.................#',
      '#V.................#',
      '#V.................#',
      '#V.................#',
      '#V.................#',
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.wall,
    ],
    objects: [
      {
        // La sortie de la maison. Fermée à clé tant que les parents sont dans le salon.
        id: 'porte-cour',
        x: 72,
        y: 124,
        sprite: 'porte',
        solid: true,
        portal: {
          room: 'cour',
          x: 96,
          y: 30,
          needsFlag: 'parents-sortis',
          lockedDialogue: 'porte-cour',
        },
      },
      /**
       * **Ce qui brille sous le frigo**, et qu'on n'attrape qu'en venant par le côté. C'est une
       * **zone invisible** : la pièce est sous le frigo, on ne la voit pas depuis la cuisine, et la
       * faire apparaître sur le carrelage aurait tout gâché — on l'aurait vue arriver. Seule la
       * bulle d'interaction dit qu'il y a quelque chose à tenter là.
       *
       * La zone n'existe pas tant qu'on ne s'est pas allongé : c'est le renseignement qui la crée,
       * et elle disparaît une fois la pièce dans la poche.
       */
      {
        id: 'cote-frigo',
        x: 84,
        y: 30,
        sprite: 'piece',
        zone: true,
        depth: 40,
        portee: 12,
        showIfFlag: 'sous-le-frigo',
        hideIfFlag: 'piece-frigo-prise',
        dialogue: 'cote-frigo',
      },
      {
        id: 'frigo',
        ...at(8, 1),
        sprite: 'frigo',
        frame: 'ferme',
        frameIfFlag: [['pizza-prise', 'ouvert']],
        solid: true,
        dialogue: 'frigo',
      },
      {
        id: 'evier-cuisine',
        x: 24,
        y: 10,
        sprite: 'lavabo',
        dialogue: 'evier-cuisine',
      },
      {
        id: 'table',
        ...at(12, 9),
        sprite: 'table',
        solid: true,
        dialogue: 'carrelage',
      },
      // Elle cherche Hermione, et elle garde le frigo. Elle ne montera au salon que
      // quand elle aura renoncé — c'est-à-dire quand on l'aura trouvée partout.
      {
        id: 'maman',
        ...at(13, 13),
        sprite: 'maman',
        dialogue: 'maman',
        errance: { rayon: 20 },
        hideIfFlag: 'maman-au-salon',
      },
      // Tout ça était en préparation depuis le matin.
      { id: 'gateau', x: 100, y: 66, sprite: 'gateau', depth: 90, showIfFlag: 'anniversaire' },
      {
        id: 'maman-fete',
        x: 76,
        y: 58,
        sprite: 'maman',
        dialogue: 'maman-fete',
        showIfFlag: 'anniversaire',
      },
      {
        id: 'papa-fete',
        x: 128,
        y: 58,
        sprite: 'papa',
        dialogue: 'papa-fete',
        showIfFlag: 'anniversaire',
      },
      {
        id: 'hermione-fete',
        // Entre Maman et la table : la petite est au premier rang, comme il se doit.
        x: 88,
        y: 64,
        sprite: 'hermione',
        frame: 'idle-0',
        anim: 'hermione-idle',
        dialogue: 'hermione-fete',
        showIfFlag: 'anniversaire',
      },
      {
        id: 'plante-cuisine',
        x: 140,
        y: 110,
        sprite: 'plante',
        frame: 'normale',
        frameIfFlag: [['arrosee-plante-cuisine', 'radieuse']],
        solid: true,
        dialogue: 'plante',
      },
      {
        id: 'panneau-sortie',
        ...at(11, 15),
        sprite: 'panneau',
        solid: true,
        dialogue: 'panneau-sortie',
      },
    ],
    doors: [
      { x: 104, y: 8, w: 16, h: 8, to: { room: 'couloir', x: 64, y: 128 } },
      { x: 152, y: 24, w: 8, h: 16, to: { room: 'salon', x: 20, y: 52 } },
    ],
  },

  /**
   * Le salon : une seule entrée, en haut du flanc gauche (elle vient de la cuisine).
   * Table ronde centrée en haut, bibliothèque à gauche du mur du haut, canapé en bas
   * à gauche avec le vidéoprojecteur qui pointe vers le mur de droite.
   */
  salon: {
    id: 'salon',
    palette: 'real',
    theme: 'home',
    spawn: { x: 20, y: 52 },
    tiles: [
      INT.wall,
      INT.wall,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.gapLeft,
      INT.gapLeft,
      INT.floor,
      INT.floor,
      INT.rug,
      INT.rug,
      INT.rug,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.wall,
    ],
    objects: [
      {
        id: 'bibliotheque',
        x: 8,
        y: 18,
        sprite: 'bibliotheque',
        solid: true,
        dialogue: 'bibliotheque',
      },

      // **Le caillou aux cristaux**, posé sur la bibliothèque. Un cadeau d'un autre
      // anniversaire, qu'on a cassé un jour pour voir — et qui s'est révélé plein
      // d'étoiles. C'est le seul objet du jeu qui vaille vingt sur vingt.
      {
        // **Tout en haut de la bibliothèque, hors d'atteinte.** Il ne se ramasse pas : il
        // se fait tomber, au pistolet à eau. Deux gestes au lieu d'un — l'indice est dans
        // les livres, la solution dans le coffre à jouets — et le vingt sur vingt se
        // mérite au lieu de traîner sur une étagère au début du jeu.
        id: 'caillou',
        x: 26,
        y: 20,
        sprite: 'caillou',
        dialogue: 'caillou',
        showIfFlag: 'caillou-tombe',
        hideIfFlag: 'caillou-pris',
        portee: 16,
      },
      {
        id: 'table-ronde',
        x: 116,
        y: 16,
        sprite: 'table-ronde',
        solid: true,
        dialogue: 'table-ronde',
      },
      // Deux bols du petit déjeuner. Moon en fera tomber un.
      { id: 'bol-1', x: 122, y: 20, sprite: 'bol', depth: 44 },
      {
        id: 'bol-2',
        x: 134,
        y: 20,
        sprite: 'bol',
        depth: 44,
        hideIfFlag: 'parents-sortis',
      },
      // Celui qui est tombé reste par terre, pour toujours.
      {
        id: 'bol-tombe',
        x: 140,
        y: 48,
        sprite: 'bol',
        depth: 60,
        showIfFlag: 'parents-sortis',
      },
      // Les parents tiennent le salon. Impossible d'enjamber une fenêtre devant eux :
      // c'est Moon qui les fera sortir, contre un bout de pizza.
      {
        id: 'maman-salon',
        showIfFlag: 'maman-au-salon',
        x: 108,
        y: 56,
        sprite: 'maman',
        dialogue: 'maman-salon',
        errance: { rayon: 12 },
        hideIfFlag: 'parents-sortis',
      },
      {
        id: 'papa-salon',
        x: 128,
        y: 56,
        sprite: 'papa',
        dialogue: 'papa-salon',
        errance: { rayon: 12 },
        hideIfFlag: 'parents-sortis',
      },
      {
        // La fenêtre par laquelle on sort : en bas, au milieu du mur.
        id: 'fenetre-salon',
        x: 72,
        y: 130,
        sprite: 'fenetre',
        frame: 'fermee',
        frameIfFlag: [['fenetre-ouverte', 'ouverte']],
        solid: true,
        portal: {
          // Elle donne sur la cour : c'est la même fenêtre qu'on voit de dehors.
          room: 'cour',
          x: 128,
          y: 30,
          needsFlag: 'parents-sortis',
          lockedDialogue: 'fenetre-salon',
          firstDialogue: 'fenetre-salon-ouvre',
          opensFlag: 'fenetre-ouverte',
        },
      },
      {
        id: 'canape',
        x: 8,
        y: 88,
        sprite: 'canape-vertical',
        solid: true,
        dialogue: 'canape',
      },
      {
        id: 'moon',
        x: 16,
        y: 104,
        depth: 130,
        sprite: 'moon',
        frame: 'dort',
        animIfFlag: ['chat-parle', 'moon-idle'],
        dialogue: 'moon',
        // Il dort : il ne bouge qu'une fois réveillé, c'est-à-dire payé en pizza.
        errance: { rayon: 8, vitesse: 11, apres: 'chat-parle' },
        // Il est sorti en courant avec les parents : il n'est plus là.
        hideIfFlag: 'parents-sortis',
      },
      {
        id: 'videoprojecteur',
        x: 12,
        y: 130,
        sprite: 'videoprojecteur',
        solid: true,
        dialogue: 'videoprojecteur',
      },
      {
        id: 'plante-salon',
        ...at(17, 13),
        sprite: 'plante',
        frame: 'normale',
        frameIfFlag: [['arrosee-plante-salon', 'radieuse']],
        solid: true,
        dialogue: 'plante',
      },
    ],
    doors: [
      {
        x: 0,
        y: 40,
        w: 8,
        h: 16,
        to: { room: 'cuisine', x: 146, y: 36 },
        // Une fois les parents lancés, on ne repart pas en arrière : Moon les retient dans la
        // cuisine, et on entend très bien comment ça se passe pour lui. **Mais seulement le temps
        // de sortir** : dès que Nino a enjambé la fenêtre, la maison est vide, et un chat qui
        // retiendrait des parents partis depuis une heure n'a plus aucun sens.
        blockedIfFlag: 'parents-sortis',
        blockedSaufFlag: 'fenetre-ouverte',
        blockedDialogue: ['moon-retient', 'papa-attrape'],
      },
    ],
  },

  /**
   * La cour. Trois entrées sur le mur du haut, et chacune mène ailleurs : un trou dans
   * la haie vers la ville, la porte de la maison vers la cuisine, et la fenêtre du
   * salon juste à sa droite.
   */
  cour: {
    id: 'cour',
    palette: 'real',
    theme: 'nature',
    spawn: { x: 96, y: 30 },
    tiles: [
      '#####..####..##..###',
      '#####..####..##..###',
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.wall,
    ],
    objects: [
      { id: 'porte-maison', x: 88, y: 0, sprite: 'porte' },
      {
        id: 'fenetre-cour',
        x: 120,
        y: 2,
        sprite: 'fenetre',
        frame: 'fermee',
        frameIfFlag: [
          ['fenetre-ouverte', 'ouverte'],
          ['fenetre-cassee', 'cassee'],
        ],
      },
      {
        id: 'velo',
        ...at(3, 5),
        sprite: 'velo',
        frame: 'droit',
        solid: true,
        dialogue: 'velo',
      },
      // Une noisette, dans un coin. L'écureuil n'est pas loin.
      {
        // **Loin de l'écureuil.** Elle était posée à huit pixels de lui — et comme un
        // personnage l'emporte toujours sur un objet quand on vise, c'est lui qu'on
        // attrapait à chaque fois : la noisette était introuvable. Elle a aussi une
        // portée à elle : elle fait huit pixels de côté, la marge de visée en fait six.
        id: 'noisette',
        x: 44,
        y: 78,
        sprite: 'noisette',
        dialogue: 'noisette',
        hideIfFlag: 'noisette-prise',
        portee: 14,
      },
      { id: 'ballon', ...at(9, 11), sprite: 'ballon', ballon: true },
      {
        id: 'reverbere',
        ...at(2, 13),
        sprite: 'reverbere',
        solid: true
      },
      { id: 'carton', ...at(16, 14), sprite: 'carton', solid: true },
      // Derrière le carton, dans le coin : on ne le voit qu'à moitié, et il ne bouge
      // jamais de là. Il n'est pas solide — un écureuil, on lui marche dessus.
      {
        id: 'ecureuil',
        x: 124,
        y: 104,
        sprite: 'ecureuil',
        frame: 'queue-0',
        anim: 'ecureuil-queue',
        dialogue: 'ecureuil',
      },
    ],
    doors: [
      { x: 40, y: 8, w: 16, h: 8, to: { room: 'nantes', x: 48, y: 128 } },
      /**
       * **Les deux entrées de la maison se ferment quand Maman rentre.** L'éléphant a fait pleuvoir,
       * elle est repartie s'abriter avec Hermione : à partir de là, il y a quelqu'un derrière ces
       * murs, et Nino est dehors à une heure où il devrait être couché. Rentrer, c'est se faire
       * prendre — et tout le reste du jeu tient sur le fait qu'il n'est pas rentré.
       */
      {
        x: 88,
        y: 8,
        w: 16,
        h: 8,
        to: { room: 'cuisine', x: 80, y: 118 },
        // **La maison se rouvre une fois Nino rentré.** Bloquée « pour toujours », elle
        // enfermait dehors qui ressortait la nuit du retour : plus de lit, plus de
        // gâteau, plus de fin — et la sauvegarde écrite à chaque pièce traversée.
        blockedIfFlag: 'maman-quai-partie',
        blockedSaufFlag: 'parapente-rentre',
        blockedDialogue: ['maison-fermee'],
      },
      {
        x: 120,
        y: 8,
        w: 16,
        h: 8,
        to: { room: 'salon', x: 80, y: 124 },
        blockedIfFlag: 'maman-quai-partie',
        blockedSaufFlag: 'parapente-rentre',
        blockedDialogue: ['maison-fermee'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════ chapitre 2 : par la fenêtre
  nantes: {
    id: 'nantes',
    palette: 'ville',
    theme: 'ville',
    spawn: { x: 80, y: 84 },
    tiles: [
      // La rue de l'école part vers le haut, au milieu.
      '########....########',
      '########....########',
      INT.floor,
      INT.floor,
      '#,,,,,,,,,,,,,,,,,,#',
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.gapRight,
      INT.gapRight,
      INT.floor,
      '#,,,,,,,,,,,,,,,,,,#',
      INT.floor,
      '######..############',
    ],
    objects: [
      {
        id: 'reverbere',
        x: 8,
        y: 64,
        sprite: 'reverbere',
        solid: true
      },
      // **Un tramway arrêté.** Nantes en est pleine, et celui-là ne va nulle part : il fait
      // trop chaud. C'est la chose la plus grosse de l'écran, et elle ne sert à rien — c'est
      // exactement ce qu'on veut d'une place de ville.
      { id: 'tram', x: 30, y: 20, sprite: 'tram', solid: [2, 8, 68, 20], dialogue: 'tram' },
      {
        id: 'ticket',
        x: 44,
        y: 60,
        sprite: 'ticket',
        dialogue: 'ticket',
        hideIfFlag: 'ticket-pris',
        portee: 14,
      },
      {
        id: 'conducteur',
        x: 108,
        y: 58,
        sprite: 'copain',
        priorite: 2,
        dialogue: 'conducteur-tram',
      },
      {
        id: 'accordeon',
        x: 120,
        y: 62,
        sprite: 'copain',
        dialogue: 'accordeon',
      },
      {
        id: 'passant',
        ...at(3, 8),
        sprite: 'copain',
        dialogue: 'passant',
        errance: { rayon: 30, vitesse: 26 },
      },
      /**
       * **L'employé des Machines de l'île.** Il est posté à l'entrée de la place, il n'a l'air
       * de rien, et il porte la plus grosse information du jeu : l'éléphant s'est échappé.
       * Personne ne la lui demande, et Nino ne fera jamais le rapprochement — c'est la règle.
       */
      {
        id: 'machines',
        x: 28,
        y: 122,
        sprite: 'copain',
        priorite: 2,
        errance: { rayon: 8, vitesse: 10 },
        dialogue: 'machines',
      },
      { id: 'poubelle', x: 132, y: 30, sprite: 'poubelle', solid: true, dialogue: 'poubelle' },
      {
        id: 'pigeon',
        x: 108,
        y: 100,
        // Le toit du tram : la chose la plus haute et la plus mal choisie de la place.
        perchoir: { x: 46, y: 12 },
        sprite: 'pigeon',
        dialogue: 'pigeon',
        // Il marche tout le temps, tout seul, sans jamais nous regarder.
        errance: { rayon: 26, vitesse: 14 },
      },
      /**
       * **Le jardinier.** Il se plaint de la chaleur et n'arrive pas à suivre — c'est tout ce qu'il
       * fait, et c'est ce qui donne leur sens aux sept plantes qui ont soif ailleurs. Il ne demande
       * rien : personne ne distribue de quête dans ce jeu.
       */
      {
        id: 'jardinier',
        x: 96,
        y: 92,
        sprite: 'jardinier',
        priorite: 2,
        errance: { rayon: 10, vitesse: 12 },
        dialogue: 'jardinier',
      },
      {
        id: 'panneau-directions',
        ...at(16, 11),
        sprite: 'panneau',
        solid: true,
        dialogue: 'panneau-directions',
      },
      {
        id: 'velos-ville-1',
        ...at(2, 13),
        sprite: 'velo',
        frame: 'plat',
        solid: true,
        dialogue: 'velos-ville',
      },
      {
        id: 'velos-ville-2',
        ...at(5, 13),
        sprite: 'velo',
        frame: 'plat',
        solid: true,
        dialogue: 'velos-ville',
      },
      {
        id: 'velos-ville-3',
        ...at(8, 13),
        sprite: 'velo',
        frame: 'plat',
        solid: true,
        dialogue: 'velos-ville',
      },
    ],
    doors: [
      // L'école est **en haut**, l'Erdre à droite, la maison en bas.
      { x: 64, y: 0, w: 32, h: 8, to: { room: 'ecole', x: 80, y: 128 } },
      { x: 152, y: 96, w: 8, h: 16, to: { room: 'erdre', x: 24, y: 96 } },
      { x: 48, y: 136, w: 16, h: 8, to: { room: 'cour', x: 48, y: 30 } },
    ],
  },

  /**
   * **L'école, au nord de la place.** On n'y entre pas : on longe la rue, et la cour est
   * derrière une grille. Un jour sans classe, la grille est fermée, et il y a quand même du
   * monde dedans — la maîtresse et trois enfants, à qui on parle à travers les barreaux.
   *
   * Les trois copains n'ont pas encore de nom : ils sont dans le casting comme ça, et c'est
   * volontaire — ce sont ceux de la vraie vie, ils se nommeront tout seuls.
   */
  ecole: {
    id: 'ecole',
    palette: 'ville',
    theme: 'ville',
    spawn: { x: 80, y: 128 },
    /**
     * **La rue en bas, la cour derrière la grille.** Nino ne rentre pas dans l'école : il longe
     * le trottoir, et il parle à travers les barreaux. C'est ce qui rend la scène juste — un
     * jour sans classe, la grille est fermée, et il y a quand même du monde dedans.
     */
    tiles: [
      INT.wall,
      INT.wall,
      INT.floor,
      INT.floor,
      INT.floor,
      '#,,,,,,,,,,,,,,,,,,#',
      INT.floor,
      INT.floor,
      INT.floor,
      '#GGGGGGGGGGGGGGGGGG#',
      INT.floor,
      INT.floor,
      INT.floor,
      '#,,,,,,,,,,,,,,,,,,#',
      INT.floor,
      INT.floor,
      INT.floor,
      '######......########',
    ],
    objects: [
      // ── derrière la grille : le bâtiment, puis la cour ──
      // Il est au fond, dessiné derrière tout le monde, et on ne l'atteint jamais.
      { id: 'batiment-ecole', x: 32, y: 4, sprite: 'batiment-ecole', depth: -20 },
      { id: 'maitresse', x: 56, y: 54, sprite: 'maitresse', priorite: 2, portee: 22, dialogue: 'maitresse' },
      {
        id: 'copain1',
        x: 28,
        y: 52,
        sprite: 'copine',
        priorite: 2,
        portee: 24,
        dialogue: 'copain1',
        // Rayon serré et ancre remontée : sinon il finit les pieds dans la grille.
        errance: { rayon: 10, vitesse: 20 },
      },
      { id: 'copain2', x: 88, y: 57, sprite: 'copain', priorite: 2, portee: 20, dialogue: 'copain2' },
      { id: 'copain3', x: 140, y: 52, sprite: 'copain', priorite: 2, portee: 20, dialogue: 'copain3' },
      // Le seul arbre du jeu, dans le coin gauche de la cour.
      { id: 'arbre', x: 8, y: 24, sprite: 'arbre', dialogue: 'arbre' },
      { id: 'banc', x: 108, y: 46, sprite: 'banc' },
      // ── dans la rue : le panneau, et le ballon passé par-dessus la grille ──
      { id: 'panneau-ecole', x: 28, y: 68, sprite: 'panneau', solid: true, dialogue: 'panneau-ecole' },
      {
        id: 'plante-ecole',
        x: 142,
        y: 92,
        sprite: 'plante',
        frame: 'normale',
        frameIfFlag: [['arrosee-plante-ecole', 'radieuse']],
        solid: true,
        dialogue: 'plante',
      },
      { id: 'ballon-ecole', x: 120, y: 100, sprite: 'ballon', dialogue: 'ballon-ecole', hideIfFlag: 'ballon-pris' },
      // Celle-ci a quelque chose dedans : le dessin froissé.
      { id: 'poubelle', x: 52, y: 92, sprite: 'poubelle', solid: true, dialogue: 'poubelle-ecole' },
      {
        id: 'pigeon',
        x: 88,
        y: 120,
        // Le mur de l'école, au-dessus des grilles. Personne ne lui demande comment.
        perchoir: { x: 96, y: 44 },
        sprite: 'pigeon',
        dialogue: 'pigeon',
        // Il marche tout le temps, tout seul, sans jamais nous regarder.
        errance: { rayon: 26, vitesse: 14 },
      },
    ],
    doors: [{ x: 48, y: 136, w: 48, h: 8, to: { room: 'nantes', x: 80, y: 26 } }],
  },

  /**
   * **Le pied de la Tour de Bretagne.** Un écran entier pour une seule information : c'est
   * très haut. On arrive par la gauche, on marche longtemps le long du socle, on monte les
   * marches, et la façade sort du cadre par le haut sans qu'on en voie jamais le sommet.
   *
   * De profil, comme l'Erdre : **déplacement horizontal seulement**. Il n'y a rien à faire
   * d'autre que d'avancer, et c'est le but — ce plan-là est là pour qu'on lève la tête.
   */
  'tour-pied': {
    id: 'tour-pied',
    palette: 'ville',
    theme: 'ville',
    view: 'side',
    heure: 'nuit',
    spawn: { x: 16, y: 104 },
    /**
     * **La tour est faite de tuiles** (`T`, solide), colonne 30 et au-delà, du haut de l'écran
     * jusqu'au sol : c'est ce qui la rend immense sans rien dessiner de géant, et elle sort du
     * cadre par le haut. Une brèche d'une tuile à son pied, c'est l'entrée — et comme le reste
     * du mur bloque, c'est le seul passage.
     */
    tiles: [
      'eeeeEeeeeeeeeeeeeeeeeeeeeeeeeeTTTTTTTTTT',
      'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeTTTTTTTTTT',
      'eeeeeeeeeeeEeeeeeeeeeeeeeeeeeeTTTTTTTTTT',
      'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeTTTTTTTTTT',
      'eeEeeeeeeeeeeeeeeeeeeEeeeeeeeeTTTTTTTTTT',
      'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeTTTTTTTTTT',
      'eeeeeeeeeeeeeeeeeEeeeeeeeeeeeeTTTTTTTTTT',
      'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeTTTTTTTTTT',
      'eeeeeeeEeeeeeeeeeeeeeeeeeEeeeeTTTTTTTTTT',
      'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeTTTTTTTTTT',
      'eeeeeeeeeeeeeeEeeeeeeeeeeeeeeeTTTTTTTTTT',
      'eeeeeeeeeeeeeeeeeeeeeeeeeeeeee.TTTTTTTTT',
      'eeeeeeeeeeeeeeeeeeeeeeeeeeeeee.TTTTTTTTT',
      band('V'),
      band('V'),
      band('#'),
      band('#'),
      band('#'),
    ],
    objects: [
      // La porte porte aussi le regard vers le haut : la première fois qu'on la touche,
      // Nino lève la tête avant d'entrer.
      { id: 'porte-tour', x: 240, y: 88, sprite: 'porte', depth: -20, dialogue: 'porte-tour' },
      { id: 'panneau-tour', x: 136, y: 88, sprite: 'panneau', dialogue: 'panneau-tour' },
      // **Quatre réverbères tout le long du parvis.** De nuit, sans eux, l'écran était noir
      // et la marche jusqu'à l'entrée se faisait à l'aveugle.
      { id: 'reverbere', x: 36, y: 76, sprite: 'reverbere' },
      { id: 'reverbere-2', x: 96, y: 76, sprite: 'reverbere' },
      { id: 'reverbere-3', x: 164, y: 76, sprite: 'reverbere' },
      { id: 'reverbere-4', x: 196, y: 76, sprite: 'reverbere' },
      { id: 'carton-tour', x: 68, y: 96, sprite: 'carton', dialogue: 'carton-tour' },
      { id: 'banc', x: 116, y: 92, sprite: 'banc' },
      {
        id: 'pigeon',
        x: 152,
        y: 96,
        // La table où boivent deux adultes. Il ne les regarde pas.
        perchoir: { x: 100, y: 44 },
        sprite: 'pigeon',
        dialogue: 'pigeon',
        // Il marche tout le temps, tout seul, sans jamais nous regarder.
        errance: { rayon: 26, vitesse: 14 },
      },
    ],
    doors: [
      { x: 0, y: 88, w: 8, h: 16, to: { room: 'terrasse', x: 144, y: 104 } },
      { x: 240, y: 88, w: 8, h: 16, to: { room: 'tour-hall', x: 32, y: 128 } },
    ],
  },

  /**
   * **La rue des bars**, entre la place et la rivière. Rien à y faire : deux terrasses,
   * trois personnes qui ne vont nulle part, et une rue qui continue. C'est exprès — entre
   * deux morceaux d'histoire, un écran où l'on ne fait que traverser et écouter des gens
   * dire n'importe chose donne au trajet une longueur.
   */
  bars: {
    id: 'bars',
    palette: 'ville',
    theme: 'ville',
    spawn: { x: 16, y: 104 },
    tiles: [
      INT.wall,
      INT.wall,
      INT.wall,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      '#,,,,,,,,,,,,,,,,,,#',
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      '....................',
      '....................',
      INT.floor,
      INT.floor,
      '#,,,,,,,,,,,,,,,,,,#',
      INT.wall,
    ],
    objects: [
      // Deux devantures, dans le mur du haut. On n'entre pas : à sept ans, on n'entre pas.
      { id: 'bar-1', x: 24, y: 16, sprite: 'porte', solid: true, dialogue: 'bar-porte' },
      { id: 'enseigne-1', x: 48, y: 18, sprite: 'panneau', solid: true, dialogue: 'enseigne-bar' },
      { id: 'bar-2', x: 112, y: 16, sprite: 'porte', solid: true, dialogue: 'bar-porte-2' },
      // Les terrasses.
      { id: 'table-bar-1', x: 32, y: 44, sprite: 'table-bar', frame: 'pleine', solid: true, dialogue: 'table-bar' },
      { id: 'table-bar-2', x: 96, y: 52, sprite: 'table-bar', frame: 'pleine', solid: true, dialogue: 'table-bar' },
      // Trois personnes très occupées.
      {
        id: 'compteur-de-fenetres',
        x: 72,
        y: 30,
        sprite: 'copain',
        dialogue: 'compteur-de-fenetres',
      },
      {
        id: 'dame-baguettes',
        x: 120,
        y: 88,
        sprite: 'copain',
        dialogue: 'dame-baguettes',
        errance: { rayon: 30, vitesse: 22 },
      },
      {
        id: 'plante-bars',
        x: 108,
        y: 96,
        sprite: 'plante',
        frame: 'normale',
        frameIfFlag: [['arrosee-plante-bars', 'radieuse']],
        solid: true,
        dialogue: 'plante',
      },
      { id: 'monsieur-immobile', x: 64, y: 104, sprite: 'copain', dialogue: 'monsieur-immobile' },
      { id: 'reverbere', x: 136, y: 36, sprite: 'reverbere', solid: true },
      { id: 'poubelle', x: 84, y: 16, sprite: 'poubelle', solid: true, dialogue: 'poubelle' },
      {
        id: 'pigeon',
        x: 68,
        y: 116,
        // La table du bar, entre les deux verres.
        perchoir: { x: 40, y: 40 },
        sprite: 'pigeon',
        dialogue: 'pigeon',
        // Il marche tout le temps, tout seul, sans jamais nous regarder.
        errance: { rayon: 26, vitesse: 14 },
      },
    ],
    doors: [
      { x: 0, y: 96, w: 8, h: 16, to: { room: 'erdre', x: 296, y: 96 } },
      { x: 152, y: 96, w: 8, h: 16, to: { room: 'terrasse', x: 16, y: 104 } },
    ],
  },

  /**
   * **La terrasse**, entre la rivière et la tour. Papa et le parrain boivent un verre à une table,
   * alors que papa vient d'être repêché un écran plus tôt — et comme d'habitude, personne ne
   * trouve ça bizarre.
   *
   * **Il y fait encore jour**, comme dans la rue des bars juste avant : deux écrans qui se
   * touchent ne peuvent pas être l'un en plein jour et l'autre en pleine nuit. La nuit tombe au
   * pied de la tour, et nulle part ailleurs.
   */
  terrasse: {
    id: 'terrasse',
    palette: 'ville',
    theme: 'ville',
    // Le soleil se couche ici : papa dit lui-même « il est couché à cette heure-ci ».
    heure: 'nuit',
    spawn: { x: 16, y: 104 },
    tiles: [
      INT.wall,
      INT.wall,
      INT.wall,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      INT.floor,
      '#,,,,,,,,,,,,,,,,,,#',
      INT.floor,
      INT.floor,
      INT.floor,
      '....................',
      '....................',
      INT.floor,
      INT.floor,
      '#,,,,,,,,,,,,,,,,,,#',
      INT.wall,
    ],
    objects: [
      { id: 'bar-nuit', x: 32, y: 16, sprite: 'porte', solid: true, dialogue: 'bar-nuit' },
      { id: 'enseigne-nuit', x: 60, y: 18, sprite: 'panneau', solid: true, dialogue: 'enseigne-bar' },
      // La table de papa, et eux deux de chaque côté. Ils sont posés assez haut pour que
      // le plateau leur coupe les jambes : à cette taille, c'est tout ce qu'il faut pour
      // qu'on les voie assis.
      {
        id: 'table-papa',
        x: 64,
        y: 52,
        sprite: 'table-bar',
        frame: 'pleine',
        // Après le passage du pigeon, la table reste sans verres : le dessin est l'archive.
        frameIfFlag: [['verres-tombes', 'vide']],
        solid: true,
        // **Muette** : le texte des tables du bar dit « Personne à cette table », et à
        // celle-ci il y a papa et le parrain. On leur parle à eux.
      },
      {
        id: 'papa-terrasse',
        x: 52,
        y: 48,
        sprite: 'papa',
        priorite: 2,
        dialogue: 'papa-terrasse',
      },
      { id: 'parrain', x: 84, y: 48, sprite: 'parrain', priorite: 2, dialogue: 'parrain' },
      {
        id: 'serveur',
        x: 120,
        y: 88,
        sprite: 'copain',
        dialogue: 'serveur',
        errance: { rayon: 26, vitesse: 24 },
      },
      { id: 'reverbere', x: 132, y: 36, sprite: 'reverbere', solid: true },
      { id: 'banc', x: 20, y: 60, sprite: 'banc', solid: true },
      { id: 'poubelle', x: 104, y: 16, sprite: 'poubelle', solid: true, dialogue: 'poubelle' },
      /**
       * **Le pigeon de la terrasse.** C'est lui que l'écureuil fait viser : arrosé, il décolle
       * par-dessus la table de papa et emporte les deux verres. Après ça, il a quitté le
       * quartier — et la table reste vide pour toujours.
       */
      {
        id: 'pigeon-terrasse',
        x: 96,
        y: 100,
        // La table où boivent deux adultes : la chose la plus mal choisie de l'écran.
        perchoir: { x: 70, y: 42 },
        sprite: 'pigeon',
        dialogue: 'pigeon',
        errance: { rayon: 24, vitesse: 14 },
        hideIfFlag: 'verres-tombes',
      },
      /**
       * **Le même écureuil, troisième coin.** Derrière le banc, la queue qui dépasse. Il propose,
       * il insiste, il nie — comme pour la fenêtre, comme pour le bateau. Il ne gagne toujours
       * rien.
       */
      {
        id: 'ecureuil-terrasse',
        x: 26,
        y: 56,
        sprite: 'ecureuil',
        frame: 'queue-0',
        anim: 'ecureuil-queue',
        depth: 58,
        priorite: 2,
        dialogue: 'ecureuil-terrasse',
      },
    ],
    doors: [
      { x: 0, y: 96, w: 8, h: 16, to: { room: 'bars', x: 144, y: 104 } },
      { x: 152, y: 96, w: 8, h: 16, to: { room: 'tour-pied', x: 16, y: 104 } },
    ],
  },

  /**
   * Le bord de l'Erdre, **vu de profil** : deux écrans de long, on marche à l'horizontale. Le
   * bateau de papa est tout au bout du quai, et l'Éléphant des Machines boit au second plan.
   */
  erdre: {
    id: 'erdre',
    palette: 'eau',
    theme: 'erdre',
    view: 'side',
    spawn: { x: 24, y: 96 },
    tiles: [C, C, C, C, C, H, W1, W1, W2, W2, BERGE, BERGE, QUAI, MUR, MUR, MUR, MUR, MUR],
    objects: [
      // ── second plan : l'eau, le bateau, papa ──
      {
        // Il a promis qu'on se reverrait.
        id: 'poisson-erdre',
        x: 140,
        y: 76,
        sprite: 'poisson',
        // Dans la bande d'eau du bas, celle qui touche la berge : c'est le plan le plus
        // proche de Nino. Plus haut, il avait l'air d'être au milieu de la rivière.
        saute: { gauche: 124, droite: 168, hauteur: 16, eau: 64 },
        // Il part pour la mer, dans la trompe de l'éléphant : après ça, l'Erdre est sans poisson.
        hideIfFlag: 'poisson-parti',
        portee: 20,
        frame: 'saut-0',
        anim: 'poisson-saut',
        depth: -10,
        // **Pas de dialogue** : il saute, il est occupé. Tout se dit à l'éléphant — c'est
        // lui qu'on regarde, et la scène du départ se déclenche sur lui.
        showIfFlag: 'bouchon-retire',
      },
      // **L'Éléphant des Machines, la première fois.** Au second plan, dans l'eau, en train de
      // boire. On le reverra trente-et-un étages plus haut, et personne ne demandera comment.
      {
        id: 'elephant-erdre',
        x: 140,
        y: 26,
        sprite: 'elephant',
        frame: 'boit',
        anim: 'elephant-boit',
        scale: 2,
        // **Il est dans l'eau, pas dessus** — mais il faut encore le reconnaître. La surface passe
        // à la cheville : les pattes plongent, le bout de la trompe trempe, et tout ce qui fait
        // l'éléphant reste dehors. Coupé sous le ventre, ce n'était plus qu'une caisse.
        flotte: 58,
        depth: -25,
        portee: 30,
        dialogue: 'elephant-erdre',
      },
      { id: 'roseaux', x: 36, y: 76, sprite: 'roseaux', depth: -15 },
      { id: 'roseaux2', x: 168, y: 76, sprite: 'roseaux', depth: -15 },
      // **Le bateau est déjà là**, tout au bout du quai, et il est énorme : on le voit en
      // arrivant, et c'est ce qui donne envie d'aller jusque là. La moitié basse de la coque
      // est sous l'eau (`flotte`), et c'est par là qu'il s'en va.
      {
        id: 'bateau',
        x: 248,
        y: 38,
        sprite: 'bateau',
        depth: -20,
        flotte: 64,
        // Large : de loin, c'est le bateau qu'on regarde. Papa et la corde, plus précis,
        // lui prennent la parole quand on est à côté d'eux.
        portee: 40,
        dialogue: 'bateau',
        // **Un bateau coulé reste coulé.** Papa et la corde avaient leur drapeau, pas la
        // coque : on revenait de nuit et le bateau flottait à nouveau, tout neuf.
        hideIfFlag: 'bateau-coule',
      },
      // Debout au bastingage, et il n'en descendra pas.
      {
        id: 'papa-capitaine',
        x: 284,
        y: 39,
        sprite: 'papa-capitaine',
        depth: -19,
        flotte: 64,
        // Il est haut sur son pont : sans ça, on ne peut pas lui parler depuis le quai.
        portee: 44,
        // Il va et vient sur son pont, lentement : c'est ce qui le rend visible depuis l'endroit
        // où Nino s'arrête, et ça dit qu'il cherche quelque chose dans sa coque.
        frame: 'marche-0',
        patrouille: {
          gauche: 250,
          droite: 288,
          duree: 5200,
          pause: 2600,
          marche: 'papa-marche',
          arret: 'papa-bricole',
        },
        // **Pas de dialogue** : il ne lève pas la tête, il ne nous voit pas — il marmonne
        // tout seul. La révélation (« Nino. Ne dis pas à ta mère. ») vient au naufrage.
        hideIfFlag: 'papa-sauve',
      },
      // ── premier plan : le quai ──
      // L'amarre, tendue entre le quai et la coque. Tant que le bateau flotte.
      {
        id: 'corde',
        x: 242,
        y: 58,
        sprite: 'corde',
        depth: -18,
        priorite: 2,
        // Très serrée : il faut être contre la coque — au-delà, c'est à papa qu'on parle.
        // Et surtout, la bulle n'apparaît qu'une fois le bateau en plein écran : elle se
        // déclenchait avant qu'on le voie bien, et une corde sans bateau ne dit rien.
        portee: 10,
        dialogue: 'corde',
        hideIfFlag: 'bateau-coule',
      },
      // **Et il ne revient pas.** Il part à la nage vers la droite et sort du cadre : le quai
      // reste vide, et on le retrouve un verre à la main deux écrans plus loin. Le repêcher ici
      // enlevait tout le sel de la terrasse — un père trempé qu'on a déjà vu sortir de l'eau ne
      // surprend plus personne.
      // L'écureuil revient avec une nouvelle idée. **En pleine vue, au pied de la corde** :
      // caché dans les roseaux, on ne le voyait pas, et c'est lui qui donne la clé du naufrage.
      {
        id: 'ecureuil-erdre',
        x: 300,
        y: 80,
        sprite: 'ecureuil',
        frame: 'queue-0',
        anim: 'ecureuil-queue',
        priorite: 2,
        portee: 14,
        dialogue: 'ecureuil-erdre',
      },
      // **Le bout du quai est gardé, et c'est Maman qui garde.** Assise sur son banc avec
      // Hermione, elle attend papa qui bricole — et elle voit tout ce qui passe. Il faudra
      // qu'elle s'en aille d'elle-même : c'est l'éléphant qui s'en chargera.
      // Le banc reste quand ils sont partis : c'est le quai qui se vide, pas le décor.
      { id: 'banc-quai', x: 256, y: 82, sprite: 'banc', depth: 96 },
      {
        id: 'maman-quai',
        x: 264,
        y: 72,
        sprite: 'maman',
        depth: 97,
        priorite: 2,
        // **Pas de dialogue** : Nino s'arrête bien avant sa portée. On la voit, elle ne le voit
        // pas, et il n'y a rien à lui dire de cinquante pixels.
        hideIfFlag: 'maman-quai-partie',
      },
      {
        id: 'hermione-bras',
        x: 267,
        y: 76,
        sprite: 'hermione',
        frame: 'idle-0',
        anim: 'hermione-idle',
        depth: 98,
        priorite: 2,
        hideIfFlag: 'maman-quai-partie',
      },
      { id: 'bouee', x: 56, y: 88, sprite: 'bouee', dialogue: 'quai' },
      /**
       * **Le monsieur qui n'ira pas se baigner.** Il regarde l'eau depuis le quai, il a une raison
       * de ne pas y entrer, et elle ne tient pas debout. Après l'averse, il commente l'odeur de la
       * pluie et rien d'autre.
       */
      {
        id: 'baigneur',
        x: 34,
        y: 84,
        sprite: 'copain',
        priorite: 2,
        portee: 14,
        dialogue: 'baigneur',
      },
      {
        id: 'plume',
        x: 192,
        y: 84,
        sprite: 'plume',
        dialogue: 'plume',
        hideIfFlag: 'plume-prise',
        portee: 14,
      },
      // Le projet d'art de Nino, qui ne le sait pas encore.
      {
        id: 'panneau-erdre',
        x: 80,
        y: 86,
        sprite: 'panneau',
        // Pas solide : sur le quai on ne saute plus, un meuble en travers fermerait
        // définitivement l'accès au poisson et au bateau.
        dialogue: 'panneau-erdre',
      },
      {
        id: 'reverbere',
        x: 120,
        y: 76,
        sprite: 'reverbere'
      },
    ],
    doors: [
      { x: 0, y: 88, w: 8, h: 16, to: { room: 'nantes', x: 144, y: 104 } },
      // Vers l'est, la ville. C'est ce que le naufrage permet : papa ne regarde plus
      // par ici. C'était la promesse de toute la chaîne du poisson.
      {
        x: 312,
        y: 88,
        w: 8,
        h: 16,
        to: { room: 'bars', x: 16, y: 104 },
        needsFlag: 'maman-quai-partie',
        blockedDialogue: ['quai-est'],
      },
    ],
  },

  /**
   * **La mer.** Un plateau de générique : de l'eau à perte de vue, deux nuages — et la
   * bassine de Gérard qui flotte au milieu. Il est allé jusqu'à la mer pour continuer à
   * sauter dans son eau douce : le sel, ça gratte, il l'a toujours dit.
   */
  /**
   * **Le fond de l'Erdre.** Un plateau de générique, comme la mer : on y voit l'épave du
   * bateau de papa, posée dans la vase, et des poissons qui la visitent. Il n'existe que
   * si le bateau a coulé — c'est-à-dire toujours, mais le générique ne présume rien.
   */
  epave: {
    id: 'epave',
    // **En vert, pas en bleu.** L'eau du jeu est bleue, mais cette eau-là est celle d'un
    // fond de rivière verte, et le vert est la couleur du jeu : la mer garde le bleu, à
    // qui il reste le grand large.
    palette: 'real',
    theme: 'erdre',
    view: 'side',
    plateau: true,
    spawn: { x: 80, y: 132 },
    tiles: [
      'wwwwwwwwwwwwwwwwwwww',
      'WWWWWWWWWWWWWWWWWWWW',
      'wwwwwwwwwwwwwwwwwwww',
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'wwwwwwwwwwwwwwwwwwww',
      'WWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWW',
      'wwwwwwwwwwwwwwwwwwww',
      'WWWWWWWWWWWWWWWWWWWW',
      'BBBBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBBBB',
      'BBBBBBBBBBBBBBBBBBBB',
    ],
    objects: [
      // L'épave, **couchée** dans la vase : bien droite, elle avait l'air de flotter.
      { id: 'epave-bateau', x: 30, y: 58, sprite: 'bateau', depth: 40, angle: 14 },
      // Les visiteurs. Ils tournent autour sans se presser : c'est chez eux, maintenant.
      {
        id: 'poisson-epave-1',
        x: 116,
        y: 70,
        sprite: 'poisson',
        frame: 'saut-0',
        anim: 'poisson-saut',
        errance: { rayon: 18, vitesse: 9 },
        depth: 60,
      },
      {
        id: 'poisson-epave-2',
        x: 132,
        y: 92,
        sprite: 'poisson',
        frame: 'saut-0',
        anim: 'poisson-saut',
        errance: { rayon: 14, vitesse: 7 },
        depth: 60,
      },
      {
        id: 'poisson-epave-3',
        x: 96,
        y: 46,
        sprite: 'poisson',
        frame: 'saut-0',
        anim: 'poisson-saut',
        errance: { rayon: 20, vitesse: 11 },
        depth: 60,
      },
    ],
    doors: [],
  },

  mer: {
    id: 'mer',
    palette: 'eau',
    theme: 'erdre',
    view: 'side',
    plateau: true,
    spawn: { x: 80, y: 132 },
    // Un seul écran de large : les bandes de l'Erdre font vingt tuiles, et la caméra
    // partait en travelling en laissant la bassine hors champ.
    tiles: [
      'CCCCCCCCCCCCCCCCCCCC'.slice(0, 20),
      'CCCCCCCCCCCCCCCCCCCC'.slice(0, 20),
      'CCCCCCCCCCCCCCCCCCCC'.slice(0, 20),
      'CCCCCCCCCCCCCCCCCCCC'.slice(0, 20),
      'hhhhhhhhhhhhhhhhhhhh'.slice(0, 20),
      'wwwwwwwwwwwwwwwwwwww'.slice(0, 20),
      'WWWWWWWWWWWWWWWWWWWW'.slice(0, 20),
      'wwwwwwwwwwwwwwwwwwww'.slice(0, 20),
      'WWWWWWWWWWWWWWWWWWWW'.slice(0, 20),
      'WWWWWWWWWWWWWWWWWWWW'.slice(0, 20),
      'wwwwwwwwwwwwwwwwwwww'.slice(0, 20),
      'WWWWWWWWWWWWWWWWWWWW'.slice(0, 20),
      'WWWWWWWWWWWWWWWWWWWW'.slice(0, 20),
      'wwwwwwwwwwwwwwwwwwww'.slice(0, 20),
      'WWWWWWWWWWWWWWWWWWWW'.slice(0, 20),
      'WWWWWWWWWWWWWWWWWWWW'.slice(0, 20),
      'wwwwwwwwwwwwwwwwwwww'.slice(0, 20),
      'WWWWWWWWWWWWWWWWWWWW'.slice(0, 20),
    ],
    objects: [
      { id: 'nuage-mer-1', x: 20, y: 10, sprite: 'nuage' },
      { id: 'nuage-mer-2', x: 112, y: 20, sprite: 'nuage' },
      // La bassine, posée sur la houle. Personne ne demande comment elle est arrivée là.
      // Juste sous l'horizon : le carton vit en bas de cet écran, et tout le saut doit
      // tenir au-dessus de lui, en pleine mer.
      { id: 'bassine-mer', x: 68, y: 56, sprite: 'seau', frame: 'eau-0', anim: 'seau-eau', depth: 80, flotte0: true },
      {
        id: 'gerard-mer',
        x: 74,
        y: 64,
        sprite: 'poisson',
        frame: 'saut-0',
        anim: 'poisson-saut',
        // Les mêmes bonds que dans le hall de la tour : c'est la même bassine.
        saute: { gauche: 71, droite: 81, hauteur: 16, eau: 64 },
        depth: 85,
      },
    ],
    doors: [],
  },
};

/** Ordre d'apparition dans le journal. */
/** Le nom affiché en bandeau. Il vit dans textes.ts, avec tous les autres mots. */
export const nomDuLieu = (id: string) => LIEUX[id] ?? id;

export const LIEUX_ORDER = [
  'chambre',
  'couloir',
  'chambre-parents',
  'mezzanine',
  'sdb',
  'cuisine',
  'salon',
  'cour',
  'nantes',
  'ecole',
  'erdre',
  'bars',
  'terrasse',
  'tour-pied',
  'tour-hall',
  'tour-13',
  'tour-27',
  'tour-31',
  'tour-toit',
];
