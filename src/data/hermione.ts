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
  room: string;
  x: number;
  y: number;
  /** Profondeur imposée, si on veut la glisser derrière un meuble. */
  depth?: number;
}

/** Ce que Nino dit en la trouvant. Toujours ça. */
export const CACHETTES: Cachette[] = [
  // `y` est le HAUT du sprite (8x10), comme partout ailleurs dans le moteur.
  // Chaque cachette chevauche un meuble et lui passe dessous en profondeur :
  // Hermione est donc **toujours à moitié masquée**, jamais plantée au milieu du sol.
  // La chambre de Nino n'arrive qu'en sixième : elle ne s'y cache pas dès le début,
  // il faut y être retourné.
  { room: 'couloir', x: 64, y: 31, depth: 35 }, // sous l'escalier
  { room: 'cuisine', x: 78, y: 32, depth: 36 }, // derrière le frigo
  { room: 'salon', x: 25, y: 105, depth: 105 }, // derrière le canapé
  { room: 'sdb', x: 34, y: 52, depth: 55 }, // dans la baignoire
  { room: 'chambre-parents', x: 116, y: 30, depth: 34 }, // derrière l'armoire
  { room: 'chambre', x: 117, y: 34, depth: 38 }, // derrière le coffre à jouets
  { room: 'chambre', x: 20, y: 38, depth: 42 }, // sous le lit de Nino
  { room: 'cuisine', x: 104, y: 78, depth: 82 }, // sous la table de la cuisine
  { room: 'mezzanine', x: 46, y: 28, depth: 30 }, // derrière le carton
  { room: 'sdb', x: 24, y: 94, depth: 96 }, // derrière les toilettes
  { room: 'couloir', x: 92, y: 105, depth: 108 }, // derrière la plante du couloir
  { room: 'salon', x: 122, y: 34, depth: 38 }, // sous la table ronde
  { room: 'chambre-parents', x: 56, y: 47, depth: 50 }, // dans le grand lit
  { room: 'mezzanine', x: 46, y: 88, depth: 92 }, // sous le lit de camp
  { room: 'cour', x: 32, y: 35, depth: 38 }, // derrière le vélo
  { room: 'cour', x: 126, y: 114, depth: 118 }, // derrière le carton de la cour
  { room: 'nantes', x: 34, y: 54, depth: 56 }, // derrière le réverbère
  { room: 'nantes', x: 24, y: 107, depth: 110 }, // derrière le vélo, à Nantes
  { room: 'erdre', x: 68, y: 86, depth: 90 }, // derrière la plaque du quai
];

import { RAPPELS, RAPPEL_FINAL } from './textes';

/** Où elle se cache maintenant, selon le nombre de fois où on l'a déjà trouvée. */
export const cachetteActuelle = (trouvees: number): Cachette | undefined =>
  CACHETTES[trouvees];

/** Ce que Maman crie à la nième trouvaille. */
export const rappel = (trouvees: number): string[] =>
  trouvees + 1 >= CACHETTES.length ? RAPPEL_FINAL : RAPPELS[trouvees % RAPPELS.length];

/** Vrai quand toutes les cachettes ont été trouvées : Hermione suit Nino. */
export const hermioneSuit = (trouvees: number) => trouvees >= CACHETTES.length;
