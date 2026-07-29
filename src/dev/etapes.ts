import type { ItemId } from '../data/items';

/**
 * Raccourcis de développement : **une touche chiffrée = un moment du jeu**, posé dans
 * l'état qu'il faut pour que ce soit jouable tout de suite.
 *
 * Sauter dans une pièce ne suffit pas : arriver dans la cour sans `parents-sortis`
 * donnerait une maison où le chat est encore sur le canapé et où la porte de la cuisine
 * est fermée à clé. Chaque étape emporte donc ce que Nino est censé avoir déjà fait.
 *
 * **Chaque saut repart de zéro** et ne pose que ce que l'étape déclare. Sinon les états
 * s'empilent : après un saut chez Hermione, elle suivait Nino jusque dans la mezzanine.
 * Un raccourci de debug qui ne donne pas deux fois la même chose ne sert à rien.
 * Corollaire : ça écrase la partie en cours.
 *
 * Absent du jeu construit : ces touches ne répondent qu'en développement.
 */
export interface Etape {
  /** La touche, de « 1 » à « 9 ». */
  touche: string;
  nom: string;
  room: string;
  /** Point d'arrivée, si le spawn de la pièce ne convient pas. */
  x?: number;
  y?: number;
  /** Ce que Nino a déjà fait pour arriver là. */
  flags?: string[];
  items?: ItemId[];
  /** Haïkus déjà entendus. 10 = l'araignée n'en a plus, elle danse. */
  haiku?: number;
  /** Fois où Hermione a été retrouvée. 19 = elle suit Nino. */
  hermione?: number;
  /** Le robinet coule depuis longtemps : le poisson est déjà arrivé. */
  eauVieille?: boolean;
  /** Lance un mini-jeu au lieu d'une pièce. */
  minijeu?: string;
}

/**
 * Ce que Moon a déclenché : les parents dehors, les deux sorties ouvertes. Avec tout ce
 * qu'il a fallu faire avant — la chasse à Hermione finie, Maman montée au salon, le
 * poisson vu et libéré — sinon la maison est dans un état impossible.
 */
const DEHORS = [
  'reveil',
  'poisson-vu',
  'bouchon-retire',
  'maman-au-salon',
  'chat-parle',
  'parents-sortis',
  'fenetre-ouverte',
];

/** Tout le chapitre 1 : le poisson sauvé, le bateau coulé, la ville ouverte à l'est. */
const APRES_LE_NAUFRAGE = [...DEHORS, 'bateau-arrive', 'bateau-coule'];

/** Les quatre énigmes de la tour résolues. */
const ENIGMES = ['enigme-moon', 'enigme-ecureuil', 'enigme-araignee', 'enigme-elephant'];

export const ETAPES: Etape[] = [
  { touche: '1', nom: 'Le réveil', room: 'chambre' },
  { touche: '2', nom: 'La cour', room: 'cour', flags: DEHORS },
  { touche: '3', nom: 'Nantes', room: 'nantes', flags: DEHORS },
  { touche: '4', nom: 'L’Erdre', room: 'erdre', flags: [...DEHORS, 'bouchon-retire'] },
  { touche: '5', nom: 'L’araignée', room: 'mezzanine', flags: ['reveil'], haiku: 0 },
  { touche: '6', nom: 'La danse', room: 'mezzanine', flags: ['reveil'], haiku: 10 },
  {
    touche: '7',
    nom: 'Le poisson',
    room: 'sdb',
    flags: ['reveil'],
    eauVieille: true,
  },
  { touche: '8', nom: 'La fusée', room: 'chambre-parents', minijeu: 'Flappy' },
  {
    touche: '9',
    nom: 'Hermione suit',
    room: 'chambre',
    flags: ['reveil', 'bouchon-retire', 'maman-au-salon'],
    hermione: 9,
  },
  { touche: '0', nom: 'La tour', room: 'tour-hall', flags: APRES_LE_NAUFRAGE },
  {
    touche: 'p',
    nom: 'Le toit, le parapente',
    room: 'tour-toit',
    flags: [...APRES_LE_NAUFRAGE, ...ENIGMES],
  },
  {
    touche: 'f',
    nom: 'La fin',
    room: 'chambre',
    x: 80,
    y: 108,
    flags: [...APRES_LE_NAUFRAGE, ...ENIGMES, 'parapente-pris', 'parapente-rentre'],
    items: ['parapente'],
  },
];
