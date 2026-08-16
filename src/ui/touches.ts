/**
 * **Le jeu nomme les touches qu'on a sous les doigts.**
 *
 * Au clavier, une consigne dit *« ESPACE : CONTINUER »*. Sur une tablette, il n'y a pas
 * d'espace : il y a un bouton rond marqué **A**, et un enfant de sept ans qui lit
 * « ESPACE » cherchera une touche qui n'existe pas. Les consignes disent donc **A**,
 * **B**, **START** et **SELECT** dès que la manette tactile est là.
 *
 * La traduction se fait **au dernier moment, à l'affichage** (voir `PixelText`), et non
 * dans les textes eux-mêmes : ils restent écrits une seule fois, en français, dans
 * [textes.ts](../data/textes.ts) — et rien n'est oublié, pas même les consignes que
 * j'écrirai demain.
 */

/** Vrai quand on joue au doigt : c'est le même test que celui qui affiche la manette. */
export const MANETTE =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/**
 * Du plus long au plus court : « ÉCHAP » avant « ESPACE » n'a pas d'importance ici, mais
 * l'ordre comptera le jour où deux noms se chevaucheront.
 */
const NOMS: ReadonlyArray<readonly [RegExp, string]> = [
  [/ESPACE/g, 'A'],
  // SELECT porte les deux : « revenir » dans un mini-jeu, le journal ailleurs.
  [/ÉCHAP/g, 'SELECT'],
  [/ENTRÉE/g, 'SELECT'],
  // Les flèches du clavier sont la croix de la console.
  [/FLÈCHES/g, 'LA CROIX'],
  // « APPUIE SUR UNE TOUCHE » : on n'appuie pas sur une touche, on appuie sur un bouton.
  [/UNE TOUCHE/g, 'UN BOUTON'],
];

/**
 * **Les jetons `%REG%` et `%EFF%`** : la touche du menu et celle qui efface une partie
 * n'ont pas de nom commun entre les deux mondes — c'est **P** et **R** au clavier,
 * **START** et **B** sur la manette. Aucun remplacement de mot ne pouvait deviner ça :
 * un « P » ou un « R » se promènent dans trop de phrases.
 */
export function enTouchesDeLaConsole(ligne: string): string {
  let sortie = ligne
    .replace(/%REG%/g, MANETTE ? 'START' : 'P')
    .replace(/%EFF%/g, MANETTE ? 'B' : 'R');
  if (!MANETTE) return sortie;
  for (const [motif, remplacement] of NOMS) sortie = sortie.replace(motif, remplacement);
  return sortie;
}
