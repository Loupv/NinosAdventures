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
  errance?: { rayon: number; vitesse?: number };
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
   * Un poisson : il saute d'un bord à l'autre et **disparaît sous l'eau entre deux
   * sauts**. `eau` est la ligne de flottaison en pixels — au-dessus il est visible,
   * en dessous il n'est plus là.
   */
  saute?: { gauche: number; droite: number; hauteur: number; eau: number };
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
        // Il n'y a pas d'escalier avant que Moon accepte : c'est l'énigme qui le fait apparaître.
        showIfFlag: 'enigme-moon',
      },
      // Il est arrivé avant lui. Personne ne demande comment.
      {
        id: 'moon',
        x: 104,
        y: 48,
        sprite: 'moon',
        frame: 'idle-0',
        anim: 'moon-idle',
        errance: { rayon: 12 },
        dialogue: 'moon-tour',
      },
      { id: 'plante', ...at(17, 14), sprite: 'plante', solid: true },
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
        needsFlag: 'enigme-moon',
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
        x: 84,
        y: 60,
        sprite: 'ecureuil',
        frame: 'queue-0',
        anim: 'ecureuil-queue',
        dialogue: 'ecureuil-tour',
      },
      { id: 'porte-cabinet', x: 56, y: 32, sprite: 'porte', solid: true, dialogue: 'porte-cabinet' },
      { id: 'plante', x: 108, y: 88, sprite: 'plante', solid: true, dialogue: 'plante-tour' },
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
        dialogue: 'fenetre-tour',
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
      {
        id: 'escalier-haut',
        x: 100,
        y: 36,
        sprite: 'escalier',
        depth: 40,
        showIfFlag: 'enigme-elephant',
      },
      {
        id: 'elephant',
        x: 44,
        y: 34,
        sprite: 'elephant',
        scale: 2,
        priorite: 2,
        dialogue: 'elephant',
      },
    ],
    doors: [
      { x: 44, y: 84, w: 16, h: 17, to: { room: 'tour-27', x: 108, y: 62 }, son: 'escalier' },
      {
        x: 100,
        y: 36,
        w: 16,
        h: 17,
        to: { room: 'tour-toit', x: 40, y: 120 },
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
    spawn: { x: 40, y: 120 },
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
      INT.wall,
      INT.wall,
    ],
    objects: [
      { id: 'escalier-bas', x: 24, y: 52, sprite: 'escalier', depth: 56 },
      { id: 'antenne', x: 132, y: 56, sprite: 'reverbere', solid: true, dialogue: 'antenne' },
      { id: 'vue', x: 72, y: 50, sprite: 'panneau', solid: true, dialogue: 'vue-tour' },
      // Une étoile un peu plus grosse que les autres, posée dans le ciel : de quoi
      // regarder en haut plutôt qu'en bas.
      { id: 'ciel', x: 108, y: 32, sprite: 'etoile', depth: -50, dialogue: 'ciel-tour' },
      {
        // Pas un portail : la scène s'en occupe, pour que « Sauter ? Oui » fasse sauter
        // tout de suite au lieu de demander un deuxième appui.
        id: 'parapente',
        x: 96,
        y: 108,
        sprite: 'parapente',
        priorite: 2,
        dialogue: 'parapente',
      },
    ],
    doors: [{ x: 24, y: 52, w: 16, h: 17, to: { room: 'tour-31', x: 108, y: 62 }, son: 'escalier' }],
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
        id: 'ventilo',
        ...at(17, 13),
        sprite: 'ventilo',
        solid: true,
        dialogue: 'ventilo',
      },
      { id: 'plante', ...at(1, 15), sprite: 'plante', solid: true },
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
      { id: 'plante', ...at(12, 12), sprite: 'plante', solid: true },
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
        solid: true,
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
        x: 104,
        y: 88,
        sprite: 'hermione',
        frame: 'idle-0',
        anim: 'hermione-idle',
        dialogue: 'hermione-fete',
        showIfFlag: 'anniversaire',
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
        errance: { rayon: 8, vitesse: 11 },
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
      { id: 'plante', ...at(17, 13), sprite: 'plante', solid: true },
    ],
    doors: [
      {
        x: 0,
        y: 40,
        w: 8,
        h: 16,
        to: { room: 'cuisine', x: 146, y: 36 },
        // Une fois les parents lancés, on ne repart pas en arrière : Moon les retient
        // dans la cuisine, et on entend très bien comment ça se passe pour lui.
        blockedIfFlag: 'parents-sortis',
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
      { id: 'ballon', ...at(9, 11), sprite: 'ballon', ballon: true },
      {
        id: 'reverbere',
        ...at(2, 13),
        sprite: 'reverbere',
        solid: true,
        dialogue: 'reverbere',
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
      { x: 88, y: 8, w: 16, h: 8, to: { room: 'cuisine', x: 80, y: 118 } },
      { x: 120, y: 8, w: 16, h: 8, to: { room: 'salon', x: 80, y: 124 } },
    ],
  },

  // ═══════════════════════════════════════════════════ chapitre 2 : par la fenêtre
  nantes: {
    id: 'nantes',
    palette: 'ville',
    theme: 'ville',
    spawn: { x: 80, y: 56 },
    tiles: [
      INT.wall,
      INT.wall,
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
        ...at(4, 5),
        sprite: 'reverbere',
        solid: true,
        dialogue: 'reverbere',
      },
      // **Un tramway arrêté.** Nantes en est pleine, et celui-là ne va nulle part : il fait
      // trop chaud. C'est la chose la plus grosse de l'écran, et elle ne sert à rien — c'est
      // exactement ce qu'on veut d'une place de ville.
      { id: 'tram', x: 40, y: 30, sprite: 'tram', solid: true, dialogue: 'tram' },
      {
        id: 'conducteur',
        x: 92,
        y: 50,
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
      { x: 152, y: 96, w: 8, h: 16, to: { room: 'ecole', x: 16, y: 104 } },
      { x: 48, y: 136, w: 16, h: 8, to: { room: 'cour', x: 48, y: 30 } },
    ],
  },

  /**
   * Le bord de l'Erdre, **vu de profil** : deux écrans de long, on marche à
   * l'horizontale et on saute. Le bateau de papa flotte au second plan, derrière
   * Nino, plus haut à l'écran — donc plus loin.
   */
  /**
   * **La cour de l'école**, entre la place et la rivière. On n'y va pas pour l'école : on
   * passe devant, et il y a du monde dans la cour un jour où il n'y a pas classe. Personne ne
   * s'en étonne, la maîtresse non plus.
   *
   * Les trois copains n'ont pas encore de nom — ils sont dans le casting comme ça, et c'est
   * volontaire : ce sont ceux de la vraie vie, ils se nommeront tout seuls.
   */
  ecole: {
    id: 'ecole',
    palette: 'ville',
    theme: 'ville',
    spawn: { x: 16, y: 104 },
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
      { id: 'grille', x: 72, y: 16, sprite: 'porte', solid: true, dialogue: 'grille-ecole' },
      { id: 'panneau-ecole', x: 32, y: 18, sprite: 'panneau', solid: true, dialogue: 'panneau-ecole' },
      { id: 'maitresse', x: 76, y: 52, sprite: 'maitresse', priorite: 2, dialogue: 'maitresse' },
      {
        id: 'copain1',
        x: 36,
        y: 60,
        sprite: 'copain',
        priorite: 2,
        dialogue: 'copain1',
        errance: { rayon: 20, vitesse: 24 },
      },
      { id: 'copain2', x: 112, y: 40, sprite: 'copain', priorite: 2, dialogue: 'copain2' },
      { id: 'copain3', x: 128, y: 88, sprite: 'copain', priorite: 2, dialogue: 'copain3' },
      { id: 'ballon-ecole', x: 60, y: 96, sprite: 'ballon', dialogue: 'ballon-ecole' },
      { id: 'plante', x: 20, y: 84, sprite: 'plante', solid: true },
    ],
    doors: [
      { x: 0, y: 96, w: 8, h: 16, to: { room: 'nantes', x: 144, y: 104 } },
      { x: 152, y: 96, w: 8, h: 16, to: { room: 'erdre', x: 24, y: 96 } },
    ],
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
      // Les marches du parvis, en grand : on les monte en marchant vers la droite, et c'est
      // en s'arrêtant dessus qu'on lève la tête.
      {
        id: 'marches',
        x: 208,
        y: 70,
        sprite: 'escalier',
        scale: 2,
        depth: -30,
        portee: 24,
        dialogue: 'tour-vue',
      },
      { id: 'porte-tour', x: 240, y: 88, sprite: 'porte', depth: -20, dialogue: 'porte-tour' },
      { id: 'panneau-tour', x: 136, y: 88, sprite: 'panneau', dialogue: 'panneau-tour' },
      // **Quatre réverbères tout le long du parvis.** De nuit, sans eux, l'écran était noir
      // et la marche jusqu'à l'entrée se faisait à l'aveugle.
      { id: 'reverbere', x: 36, y: 76, sprite: 'reverbere', dialogue: 'reverbere' },
      { id: 'reverbere-2', x: 96, y: 76, sprite: 'reverbere', dialogue: 'reverbere' },
      { id: 'reverbere-3', x: 164, y: 76, sprite: 'reverbere', dialogue: 'reverbere' },
      { id: 'reverbere-4', x: 196, y: 76, sprite: 'reverbere', dialogue: 'reverbere' },
      { id: 'carton-tour', x: 68, y: 96, sprite: 'carton', dialogue: 'carton-tour' },
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
      { id: 'table-bar-1', x: 32, y: 44, sprite: 'table-bar', solid: true, dialogue: 'table-bar' },
      { id: 'table-bar-2', x: 96, y: 52, sprite: 'table-bar', solid: true, dialogue: 'table-bar' },
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
      { id: 'monsieur-immobile', x: 64, y: 104, sprite: 'copain', dialogue: 'monsieur-immobile' },
      { id: 'reverbere', x: 136, y: 36, sprite: 'reverbere', solid: true, dialogue: 'reverbere' },
    ],
    doors: [
      { x: 0, y: 96, w: 8, h: 16, to: { room: 'erdre', x: 296, y: 96 } },
      { x: 152, y: 96, w: 8, h: 16, to: { room: 'terrasse', x: 16, y: 104 } },
    ],
  },

  /**
   * **La terrasse**, entre la rivière et la tour. C'est ici que la nuit tombe : personne ne
   * la voit tomber, on sort du quai et il fait noir. Papa et le parrain boivent un verre à
   * une table, alors que papa vient d'être repêché un écran plus tôt — et comme d'habitude,
   * personne ne trouve ça bizarre.
   */
  terrasse: {
    id: 'terrasse',
    palette: 'ville',
    theme: 'ville',
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
        solid: true,
        // Serrée : sinon la table leur volait la parole à tous les deux.
        portee: 4,
        dialogue: 'table-bar',
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
      { id: 'reverbere', x: 132, y: 36, sprite: 'reverbere', solid: true, dialogue: 'reverbere' },
    ],
    doors: [
      { x: 0, y: 96, w: 8, h: 16, to: { room: 'bars', x: 144, y: 104 } },
      { x: 152, y: 96, w: 8, h: 16, to: { room: 'tour-pied', x: 16, y: 104 } },
    ],
  },

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
        portee: 20,
        frame: 'saut-0',
        anim: 'poisson-saut',
        depth: -10,
        dialogue: 'poisson-erdre',
        showIfFlag: 'bouchon-retire',
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
        dialogue: 'papa-capitaine',
        hideIfFlag: 'papa-sauve',
      },
      // ── premier plan : le quai ──
      // L'amarre, tendue entre le quai et la coque. Tant que le bateau flotte.
      {
        id: 'corde',
        x: 236,
        y: 58,
        sprite: 'corde',
        depth: -18,
        priorite: 2,
        // Serrée : au-delà, c'est à papa qu'on parle, puis au poisson.
        portee: 16,
        dialogue: 'corde',
        hideIfFlag: 'bateau-coule',
      },
      // Repêché. Il a gardé le chapeau.
      {
        id: 'papa-repeche',
        x: 216,
        y: 81,
        sprite: 'papa-capitaine',
        dialogue: 'papa-repeche',
        showIfFlag: 'papa-sauve',
      },
      // L'écureuil revient avec une nouvelle idée. **En pleine vue, au pied de la corde** :
      // caché dans les roseaux, on ne le voyait pas, et c'est lui qui donne la clé du naufrage.
      {
        id: 'ecureuil-erdre',
        x: 222,
        y: 80,
        sprite: 'ecureuil',
        frame: 'queue-0',
        anim: 'ecureuil-queue',
        priorite: 2,
        portee: 14,
        dialogue: 'ecureuil-erdre',
      },
      { id: 'bouee', x: 40, y: 88, sprite: 'bouee', dialogue: 'quai' },
      // Le projet d'art de Nino, qui ne le sait pas encore.
      {
        id: 'chaussure',
        x: 96,
        y: 86,
        sprite: 'chaussure',
        dialogue: 'chaussure',
        hideIfFlag: 'chaussure-prise',
      },
      {
        id: 'panneau-erdre',
        x: 64,
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
        sprite: 'reverbere',
        dialogue: 'reverbere',
      },
    ],
    doors: [
      { x: 0, y: 88, w: 8, h: 16, to: { room: 'ecole', x: 144, y: 104 } },
      // Vers l'est, la ville. C'est ce que le naufrage permet : papa ne regarde plus
      // par ici. C'était la promesse de toute la chaîne du poisson.
      {
        x: 312,
        y: 88,
        w: 8,
        h: 16,
        to: { room: 'bars', x: 16, y: 104 },
        needsFlag: 'bateau-coule',
        blockedDialogue: ['quai-est'],
      },
    ],
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
  'erdre',
  'tour-hall',
  'tour-13',
  'tour-27',
  'tour-31',
  'tour-toit',
];
