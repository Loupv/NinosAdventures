/**
 * Hermione, la petite sœur de Nino. Un an.
 *
 * Elle est cachée un peu partout, une cachette à la fois, et elle change de cachette
 * dès qu'on l'a trouvée. **La rencontre est toujours la même** : « ... », puis Maman
 * qui débarque en criant et la remporte. Le comique vient du rythme et de l'endroit
 * où on la trouve — surtout pas d'un commentaire qui explique la scène.
 *
 * Quand Nino l'a retrouvée dans toutes les cachettes, Maman renonce : Hermione reste,
 * et elle le suit à quatre pattes.
 *
 * Ajouter une cachette = une ligne ici.
 *
 * **Ses textes sont dans [textes.ts](./textes.ts)** — ici, seulement les endroits.
 */
export interface Cachette {
  /**
   * Le sprite de Maman à son arrivée. Dehors, elle emploie ce qu'elle a sous la main —
   * vélo, hélicoptère, jetpack, sous-marin — et personne ne relève jamais.
   */
  vehicule?: string;
  /**
   * Cachette **révélée par un flag** : avant lui, Hermione n'y est pas — la baignoire est
   * pleine, on ne voit pas ce qu'il y a derrière. C'est ce qui rend la chaîne du poisson
   * obligatoire : sans elle, la chasse ne peut pas se terminer, et Maman ne quitte jamais
   * la cuisine.
   *
   * Deux cachettes s'en servent, et chaque fois pour rendre une scène obligatoire : le rêve
   * de la fusée, et le poisson de la baignoire.
   */
  revele?: string;
  room: string;
  x: number;
  y: number;
  /** Profondeur imposée, si on veut la glisser derrière un meuble. */
  depth?: number;
}

/** Ce que Nino dit en la trouvant. Toujours ça. */
export const CACHETTES: Cachette[] = [
  // ── Les cinq de la maison. Ce sont elles qui comptent : quand Maman a renoncé
  // ── sur celles-là, elle monte au salon et le frigo est libre.
  // derrière la plante, un côté qui dépasse
  { room: 'couloir', x: 91, y: 100, depth: 104 },
  // **Pas dans la cuisine** : Maman y cherche justement Hermione jusqu'au bout de la
  // chasse, et une petite sœur cachée dans la pièce où sa mère la cherche, ça ne tient pas
  // debout. Elle est donc chez les parents — et elle n'y est **qu'au sortir du rêve de la
  // fusée** : elle a rampé jusqu'au grand lit pendant qu'il dormait. Nino ouvre les yeux,
  // et elle est là, à dépasser du bord du lit.
  //
  // C'est ce qui rend le rêve obligatoire, comme la baignoire rend le poisson obligatoire.
  // Le grand lit est la seule chose à faire dans cette chambre : personne ne peut rester
  // bloqué longtemps. Et se réveiller sans avoir gagné suffit — le rêve ne demande aucune
  // adresse, seulement d'y être allé.
  {
    room: 'chambre-parents',
    x: 85,
    y: 24,
    depth: 28,
    revele: 'reve-fait'
  },
  // sous le lit de Nino
  { room: 'chambre', x: 20, y: 40, depth: 42 },
  // derrière le carton
  {
    room: 'mezzanine',
    x: 46,
    y: 28,
    depth: 30
  },
  // La cinquième ne se voit qu'une fois la baignoire vidée : c'est elle qui rend toute la
  // chaîne du poisson obligatoire.
  {
    room: 'sdb',
    x: 18,
    y: 38,
    depth: 42,
    revele: 'bouchon-retire'
  },

  // ── Et c'est tout : **la chasse s'arrête à la porte de la maison.**
  //
  // Il y avait deux cachettes dehors, dans la cour et au bord de l'Erdre, avec Maman qui arrivait
  // à vélo puis en sous-marin. C'était drôle une fois, et ça cassait le chapitre : dehors, Nino
  // est seul, et sa sœur n'a rien à y faire. Cinq cachettes dans la maison suffisent — la chasse
  // se termine là où elle a commencé, et Hermione suit son frère jusqu'à ce qu'il sorte.
  //
  // Les dessins de Maman à vélo et en sous-marin restent dans le jeu, prêts à resservir : il
  // suffirait de déclarer une cachette dehors avec son `vehicule`.
];

/**
 * Combien de cachettes sont **dans la maison** — c'est-à-dire toutes. C'est le seuil de
 * l'ouverture du jeu : à la cinquième, Maman renonce, monte au salon, libère le frigo et rend
 * le pistolet à eau confisqué.
 *
 * La constante reste séparée de `CACHETTES.length` : le jour où une cachette se rajoute dehors,
 * c'est ce chiffre-là qui décide de la capitulation, pas la longueur de la liste.
 */
export const CACHETTES_MAISON = 5;



import { CRIS } from './textes';

/** Où elle se cache maintenant, selon le nombre de fois où on l'a déjà trouvée. */
export const cachetteActuelle = (trouvees: number): Cachette | undefined =>
  CACHETTES[trouvees];

/**
 * **Ce que Maman crie, selon l'endroit où la petite était.** C'est le lieu qui fait la réplique, pas
 * le compteur : les mots sont dans [textes.ts](./textes.ts), rangés par pièce.
 */
export const rappel = (trouvees: number): string[] => {
  const ou = CACHETTES[trouvees]?.room ?? CACHETTES[CACHETTES.length - 1].room;
  return CRIS[ou] ?? CRIS[CACHETTES[CACHETTES.length - 1].room];
};

/** Vrai quand Maman a renoncé pour la maison : elle monte au salon. */
export const mamanRenonce = (trouvees: number) => trouvees >= CACHETTES_MAISON;

/**
 * **Les pièces de la maison.** Hermione y suit son frère dès que Maman a renoncé, et elle n'en
 * sort pas : dehors, elle redevient introuvable.
 */
const MAISON = ['chambre', 'couloir', 'chambre-parents', 'mezzanine', 'sdb', 'cuisine', 'salon'];

/**
 * **Vrai quand Hermione suit Nino.** Deux conditions : la chasse de la maison est finie — donc
 * Maman a renoncé — et on est **dans la maison**. C'est toute la seconde moitié du chapitre 1
 * qu'elle passe à quatre pattes derrière lui.
 *
 * Dès qu'il sort, elle reste dedans. Et dehors elle est de nouveau cachée, dans la cour puis au
 * bord de l'Erdre, sans que personne n'explique comment elle y est arrivée — c'est le principe
 * du personnage, et c'est la seule chose qu'on ne commente jamais.
 */
export const hermioneSuit = (trouvees: number, room: string) =>
  trouvees >= CACHETTES_MAISON && MAISON.includes(room);
