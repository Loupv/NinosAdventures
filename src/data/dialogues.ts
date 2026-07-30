import type { ItemId } from './items';

export interface Effects {
  give?: ItemId;
  take?: ItemId;
  flag?: string;
}

/**
 * Un sprite affiché pendant la réplique. Sert aux petites mises en scène : Nino
 * couché dans son lit, par exemple — sans ça il se confond avec la couverture.
 */
export interface Montre {
  sprite: string;
  frame?: string;
  x: number;
  y: number;
  depth?: number;
  /** Cache Nino pendant la réplique : il est déjà représenté par le sprite montré. */
  cacheNino?: boolean;
}

/** Une branche de réponse : ce qui se dit, et ce que ça change. */
export interface Branch {
  lines: string[];
  effects?: Effects;
  montre?: Montre;
}

/**
 * Une énigme : plusieurs réponses proposées, une seule ouvre la suite. Les mauvaises
 * réponses ne coûtent rien — on peut redemander autant de fois qu'on veut, ce qui est
 * la seule façon de poser une énigme à un enfant de sept ans sans le bloquer.
 */
export interface Enigme {
  reponses: string[];
  /** Indice de la bonne réponse dans `reponses`. */
  bonne: number;
  juste: Branch;
  faux: Branch;
}

export interface DialogueBeat {
  /** Première condition vraie = réplique jouée. Sans condition = repli. */
  when?: () => boolean;
  speaker?: string;
  lines: string[];
  effects?: Effects;
  montre?: Montre;
  /**
   * Si présent, une fenêtre Oui / Non s'ouvre après la dernière ligne — qui doit
   * donc être une question.
   */
  choice?: { oui: Branch; non: Branch };
  enigme?: Enigme;
}

/**
 * ── Les mots sont ailleurs ──
 *
 * Toutes les phrases du jeu vivent dans **[textes.ts](./textes.ts)** : c'est le seul
 * fichier à ouvrir pour réécrire un dialogue. Ce fichier-ci ne décrit que la mécanique
 * qui les entoure — quand une réplique sort, ce qu'elle change — et la fonction qui
 * choisit laquelle jouer.
 */
import { DIALOGUES } from './textes';

export { DIALOGUES };

/** Choisit la réplique à jouer pour un interlocuteur, selon l'état du jeu. */
export function pickBeat(id: string): DialogueBeat | undefined {
  return DIALOGUES[id]?.find((b) => !b.when || b.when());
}
