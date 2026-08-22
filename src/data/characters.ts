import { CASTING } from './textes';

/**
 * Le casting : à quoi ressemble chacun, et où on le croise. **Les noms et les rôles
 * sont dans [textes.ts](./textes.ts)** — ici, seulement les dessins et les lieux.
 *
 * Règle du jeu : **un personnage peut être à plusieurs endroits en même temps**, et
 * personne ne le relève jamais. Papa travaille dans la mezzanine et il est capitaine sur
 * l'Erdre. D'où `lieux` et `sprites` au pluriel.
 */
export interface CharacterDef {
  id: string;
  name: string;
  /** Les apparences du personnage, dans l'ordre où on les rencontre. */
  sprites: string[];
  role: string;
  /** Tous les lieux où on peut le croiser. */
  lieux: string[];
}

/** Dessins et lieux, par personnage. Le reste est du texte. */
const FICHES: Record<string, { sprites: string[]; lieux: string[] }> = {
  nino: { sprites: ['nino'], lieux: ['partout'] },
  moon: { sprites: ['moon'], lieux: ['salon', 'tour-hall'] },
  hermione: { sprites: ['hermione'], lieux: ['partout, une à la fois'] },
  poisson: { sprites: ['poisson'], lieux: ['sdb', 'erdre'] },
  araignee: { sprites: ['araignee'], lieux: ['mezzanine', 'tour-27'] },
  ecureuil: { sprites: ['ecureuil'], lieux: ['cour', 'erdre', 'tour-13'] },
  elephant: { sprites: ['elephant'], lieux: ['erdre', 'tour-31'] },
  maman: { sprites: ['maman'], lieux: ['cuisine', 'salon', 'erdre'] },
  papa: { sprites: ['papa', 'papa-capitaine'], lieux: ['salon', 'erdre', 'terrasse'] },
  parrain: { sprites: ['parrain'], lieux: ['terrasse'] },
  jardinier: { sprites: ['jardinier'], lieux: ['nantes'] },
  maitresse: { sprites: ['maitresse'], lieux: ['ecole'] },
  copain1: { sprites: ['copine'], lieux: ['ecole'] },
  copain2: { sprites: ['copain'], lieux: ['ecole'] },
  copain3: { sprites: ['copain'], lieux: ['ecole'] },
};

export const CHARACTERS: Record<string, CharacterDef> = Object.fromEntries(
  Object.entries(FICHES).map(([id, f]) => [
    id,
    { id, sprites: f.sprites, lieux: f.lieux, name: CASTING[id].nom, role: CASTING[id].role },
  ]),
);

/**
 * Toutes les apparences de personnage, à plat. Le jeu s'en sert pour donner la
 * priorité d'interaction à un personnage plutôt qu'à un meuble : sans ça, le canapé
 * volait l'interaction destinée à Moon.
 */
export const CHARACTER_SPRITES = new Set(
  Object.values(CHARACTERS).flatMap((c) => c.sprites),
);

/**
 * **Ce qui réagit au pistolet à eau : ce qui est vivant.** Les personnages, les pigeons — qui n'en
 * sont pas tout à fait, mais qui ont un avis — et **la plante du couloir**, qui est le seul décor du
 * jeu à avoir soif. Tout le reste s'en fiche : dans ce jeu un vélo, un banc et un tram ont un
 * dialogue, et arroser un vélo ne peut pas lui arracher une réplique blasée. On mouille ce qui
 * boit, pas du mobilier.
 */
export const ARROSABLES = new Set([...CHARACTER_SPRITES, 'pigeon', 'plante', 'parents-dorment', 'lit-bebe']);
