/** Résolution exacte d'un écran Game Boy. Tout le jeu est dessiné là-dedans. */
export const GB = {
  W: 160,
  H: 144,
  TILE: 8,
  /** Une pièce = un écran pile, comme dans le premier Zelda. */
  COLS: 20,
  ROWS: 18,
} as const;

export const SPEED = 46; // px/s — assez lent pour être lisible par un enfant

/** Vue de profil : gravité et détente. Un saut monte d'environ quatre tuiles. */
export const GRAVITY = 420;
/** Force du saut. Inutilisée pour l'instant : sur les quais on ne fait que marcher. */
export const JUMP = 175;

export const KEYS = {
  up: ['UP', 'W', 'Z'],
  down: ['DOWN', 'S'],
  left: ['LEFT', 'A', 'Q'],
  right: ['RIGHT', 'D'],
  action: ['SPACE', 'E'],
  /** Le pistolet à eau. Sa propre touche : sinon il volerait l'interaction de tout. */
  arroser: ['X'],
  cancel: ['ESC', 'BACKSPACE'],
  journal: ['ENTER', 'J'],
  /** Le menu de la console : START sur la manette, P au clavier. */
  reglages: ['P'],
} as const;
