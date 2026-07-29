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
  { room: 'cuisine', x: 78, y: 32, depth: 36 }, // derrière le frigo
  { room: 'chambre', x: 20, y: 40, depth: 42 }, // sous le lit de Nino
  { room: 'mezzanine', x: 46, y: 28, depth: 30 }, // derrière le carton
  // La cinquième ne se voit qu'une fois la baignoire vidée : c'est elle qui rend toute la
  // chaîne du poisson obligatoire.
  { room: 'sdb', x: 18, y: 38, depth: 42, revele: 'bouchon-retire' },

  // ── Les quatre du dehors, pour plus tard. Maman ne passe plus par la porte.
  { room: 'cour', x: 32, y: 35, depth: 38, vehicule: 'maman-velo' }, // derrière le vélo
  { room: 'nantes', x: 34, y: 54, depth: 56, vehicule: 'maman-helico' }, // derrière le réverbère
  { room: 'nantes', x: 24, y: 112, depth: 115, vehicule: 'maman-jetpack' }, // derrière les vélos à plat
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

/** Vrai quand toutes les cachettes ont été trouvées : Hermione suit Nino. */
export const hermioneSuit = (trouvees: number) => trouvees >= CACHETTES.length;
