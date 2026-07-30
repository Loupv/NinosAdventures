import { OBJETS } from './textes';

/**
 * **Les objets du projet d'art** sont tous des ItemId comme les autres : ce qui les distingue
 * est qu'ils ne servent à rien d'autre qu'à être offerts à la maîtresse. Voir `OFFRABLES`.
 */
export type ItemId =
  | 'pizza'
  | 'pistolet-eau'
  | 'parapente'
  | 'chaussure'
  | 'bouchon'
  | 'noisette'
  | 'ticket'
  | 'ballon-degonfle'
  | 'plume'
  | 'dessin';

export interface ItemDef {
  id: ItemId;
  name: string;
  sprite: string;
  /** Ce que le journal raconte de l'objet. */
  desc: string;
}

/** Quel dessin pour quel objet. Les mots, eux, sont dans textes.ts. */
const SPRITES: Record<ItemId, string> = {
  'pistolet-eau': 'pistolet',
  parapente: 'parapente',
  pizza: 'pizza',
  chaussure: 'chaussure',
  bouchon: 'bouchon',
  noisette: 'noisette',
  ticket: 'ticket',
  'ballon-degonfle': 'ballon',
  plume: 'plume',
  dessin: 'dessin',
};

const fiche = (id: ItemId): ItemDef => ({
  id,
  sprite: SPRITES[id],
  name: OBJETS[id].nom,
  desc: OBJETS[id].desc,
});

export const ITEMS: Record<ItemId, ItemDef> = {
  'pistolet-eau': fiche('pistolet-eau'),
  parapente: fiche('parapente'),
  pizza: fiche('pizza'),
  chaussure: fiche('chaussure'),
  bouchon: fiche('bouchon'),
  noisette: fiche('noisette'),
  ticket: fiche('ticket'),
  'ballon-degonfle': fiche('ballon-degonfle'),
  plume: fiche('plume'),
  dessin: fiche('dessin'),
};
