import type { Art } from './pixels';

/**
 * Un "thème" = le jeu de tuiles 8x8 d'un lieu. Les mêmes caractères existent
 * partout ('#' bloc, '.' sol, ',' variante, '~' eau) : une carte peut donc être
 * rejouée dans un autre décor sans être redessinée.
 */
export type ThemeId = 'home' | 'ville' | 'nature' | 'erdre';

/**
 * 'X' = hors-plan : le noir autour d'une pièce qui ne remplit pas l'écran.
 * Sans lui, un couloir étroit ressemble à un labyrinthe de briques.
 */
const VOID: Art = [
  '00000000',
  '00000000',
  '00000000',
  '00000000',
  '00000000',
  '00000000',
  '00000000',
  '00000000',
];

const HOME: Record<string, Art> = {
  // mur de briques
  '#': [
    '00000000',
    '01111110',
    '01111110',
    '00000000',
    '11011111',
    '11011111',
    '11011111',
    '00000000',
  ],
  // carrelage : un liseré plus sombre dessine la trame du sol
  '.': [
    '33333332',
    '33333332',
    '33333332',
    '33333332',
    '33333332',
    '33333332',
    '33333332',
    '22222222',
  ],
  /*
   * Plan de travail. Dessus clair + façade sombre en dessous : c'est comme ça que
   * la Game Boy signalait qu'un meuble a du volume. 'T' pour un run horizontal,
   * 'V' pour un run vertical (la façade passe alors sur le côté).
   */
  T: [
    '00000000',
    '22222222',
    '22222222',
    '22222222',
    '00000000',
    '11111111',
    '11111111',
    '00000000',
  ],
  V: [
    '02222110',
    '02222110',
    '02222110',
    '02222110',
    '02222110',
    '02222110',
    '02222110',
    '02222110',
  ],
  // tapis : ton moyen semé de points clairs, pour trancher avec le sol
  ',': [
    '22222222',
    '22322232',
    '22222222',
    '23222322',
    '22222222',
    '22322232',
    '22222222',
    '23222322',
  ],
};

const VILLE: Record<string, Art> = {
  // façade en pierre de tuffeau
  '#': [
    '00000000',
    '01122110',
    '01122110',
    '00000000',
    '22001122',
    '22001122',
    '11001122',
    '00000000',
  ],
  // pavés
  '.': [
    '22222222',
    '23333332',
    '23333332',
    '22222222',
    '33222333',
    '33222333',
    '22222222',
    '23333332',
  ],
  /**
   * Le ciel du toit de la tour, en deux tuiles : `e` vide et `E` avec une étoile. C'est la
   * **ligne écrite dans la pièce** qui les alterne irrégulièrement — une seule tuile
   * étoilée répétée dessinait une grille, et une grille ne ressemble pas à un ciel.
   */
  e: [
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
  ],
  E: [
    '00000000',
    '00000000',
    '00030000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
    '00000000',
  ],
  // trottoir
  ',': [
    '33333333',
    '33333333',
    '33333333',
    '32222223',
    '33333333',
    '33333333',
    '33333333',
    '32222223',
  ],
};

const NATURE: Record<string, Art> = {
  // haie
  '#': [
    '01100110',
    '11011011',
    '01100110',
    '11011011',
    '01100110',
    '11011011',
    '01100110',
    '11011011',
  ],
  // herbe
  '.': [
    '33333333',
    '33233332',
    '33333333',
    '32333333',
    '33333323',
    '33333333',
    '32333333',
    '33333333',
  ],
  // quai / gravier
  ',': [
    '22222222',
    '23222322',
    '22232223',
    '22222222',
    '32223222',
    '22322232',
    '22222222',
    '23222322',
  ],
  // eau (infranchissable)
  '~': [
    '22222222',
    '21122112',
    '22222222',
    '22222222',
    '12211221',
    '22222222',
    '22222222',
    '21122112',
  ],
};

/**
 * Le bord de l'Erdre, vu **de profil** : ciel en haut, rive lointaine, l'eau, puis
 * le quai sur lequel Nino marche. Plus c'est haut à l'écran, plus c'est loin — la
 * convention 2D habituelle.
 */
const ERDRE: Record<string, Art> = {
  // ciel
  C: [
    '33333333',
    '33333333',
    '33333333',
    '33333333',
    '33333333',
    '33333333',
    '33333333',
    '33333333',
  ],
  // rive lointaine : une ligne d'arbres à la silhouette bosselée
  h: [
    '33333333',
    '32222223',
    '22222222',
    '21122112',
    '11111111',
    '11111111',
    '11111111',
    '11111111',
  ],
  // surface de l'eau : claire, avec ses reflets
  w: [
    '33333333',
    '33233323',
    '33333333',
    '32333233',
    '33333333',
    '33233323',
    '33333333',
    '32333233',
  ],
  // eau plus loin, un ton en dessous
  W: [
    '22222222',
    '22122212',
    '22222222',
    '21222122',
    '22222222',
    '22122212',
    '22222222',
    '21222122',
  ],
  // mur du quai, en arrière-plan : c'est ce qu'on a derrière soi quand on marche.
  // Surtout pas franchissable : Nino se tient devant.
  B: [
    '22222222',
    '22222222',
    '11111111',
    '22222222',
    '22222222',
    '11111111',
    '22222222',
    '22222222',
  ],
  // dessus du quai : c'est là qu'on marche
  Q: [
    '33333333',
    '32222223',
    '00000000',
    '11111111',
    '11111111',
    '11111111',
    '11111111',
    '11111111',
  ],
  // maçonnerie du quai
  M: [
    '11111111',
    '10111011',
    '11111111',
    '00000000',
    '11101111',
    '11101111',
    '11101111',
    '00000000',
  ],
};

export const THEMES: Record<ThemeId, Record<string, Art>> = {
  home: { ...HOME, X: VOID },
  ville: { ...VILLE, X: VOID },
  nature: { ...NATURE, X: VOID },
  erdre: { ...ERDRE, X: VOID },
};

/** Caractères qui bloquent le passage. */
export const SOLID = new Set(['#', '~', 'X', 'T', 'V', 'Q', 'M']);
