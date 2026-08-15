import type { ItemId } from './items';

export interface Effects {
  give?: ItemId;
  take?: ItemId;
  flag?: string;
  /** Une pièce à collectionner. La deuxième du jeu se trouve sous le frigo. */
  piece?: string;
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
  /**
   * Une réplique **particulière** pour certaines mauvaises réponses, par indice : c'est ce
   * qui permet à Moon de se vexer quand on le désigne, lui, comme celui qui ne brille pas.
   * Les autres mauvaises réponses retombent sur `faux`.
   */
  fauxPar?: Record<number, Branch>;
}

/**
 * **Une étape de devoir** : une question, des réponses, et pour chacune ce que la maîtresse
 * répond et ce que ça vaut en points.
 */
export interface EtapeDevoir {
  /**
   * La question. **Absente pour la première étape** : c'est la réplique d'accueil du beat qui
   * la porte, et les choix s'ouvrent dessus — sinon il faudrait valider une boîte pour rien.
   */
  lines?: string[];
  reponses: string[];
  /** Une entrée par réponse, dans le même ordre. */
  retours: Array<Branch & { points: number }>;
}

/**
 * **Un devoir noté.** Une petite discussion : deux ou trois questions à la suite, **aucune
 * mauvaise réponse**, et chaque choix ajoute des points. À la fin, le barème donne la note et
 * ce que la maîtresse en dit. C'est l'inverse d'une énigme — on ne cherche pas la bonne
 * réponse, on choisit ce qu'on a envie de dire, et le résultat n'est pas un verrou mais une
 * note. Rien ne se bloque jamais derrière un devoir.
 */
export interface Devoir {
  etapes: EtapeDevoir[];
}

/** Une ligne du barème : à partir de `min` points, cette note et ce qu'elle dit. */
export interface Bareme {
  min: number;
  note: number;
  lines: string[];
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
  devoir?: Devoir;
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
