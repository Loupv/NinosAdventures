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
  { room: 'couloir', x: 91, y: 100, depth: 104 }, // derrière la plante, un côté qui dépasse
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
  { room: 'chambre-parents', x: 85, y: 24, depth: 28, revele: 'reve-fait' },
  { room: 'chambre', x: 20, y: 40, depth: 42 }, // sous le lit de Nino
  { room: 'mezzanine', x: 46, y: 28, depth: 30 }, // derrière le carton
  // La cinquième ne se voit qu'une fois la baignoire vidée : c'est elle qui rend toute la
  // chaîne du poisson obligatoire.
  { room: 'sdb', x: 18, y: 38, depth: 42, revele: 'bouchon-retire' },

  // ── Les deux du dehors. Maman ne passe plus par la porte.
  //
  // **Rien dans Nantes** : la ville est le moment où Nino est seul, et sa sœur n'a rien à y
  // faire. Il reste la cour, qui touche la maison, et le bord de l'Erdre — assez loin pour que
  // le sous-marin soit une vraie question.
  { room: 'cour', x: 32, y: 35, depth: 38, vehicule: 'maman-velo' }, // derrière le vélo
  { room: 'erdre', x: 70, y: 90, depth: 92, vehicule: 'maman-sousmarin' }, // derrière le panneau du quai
];

/**
 * Combien de cachettes sont **dans la maison**. C'est le seuil qui compte pour l'ouverture
 * du jeu : au-delà, Maman renonce, monte au salon et libère le frigo. Les suivantes sont
 * dehors, et se trouvent après être sorti — sans elles on ne pourrait pas sortir, et sans
 * être sorti on ne pourrait pas les trouver.
 */
export const CACHETTES_MAISON = 5;

import { RAPPELS, RAPPEL_FINAL } from './textes';

/** Où elle se cache maintenant, selon le nombre de fois où on l'a déjà trouvée. */
export const cachetteActuelle = (trouvees: number): Cachette | undefined =>
  CACHETTES[trouvees];

/** Ce que Maman crie à la nième trouvaille. */
export const rappel = (trouvees: number): string[] =>
  trouvees + 1 >= CACHETTES.length ? RAPPEL_FINAL : RAPPELS[trouvees % RAPPELS.length];

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
