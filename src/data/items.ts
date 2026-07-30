import { OBJETS } from './textes';

export type ItemId = 'pizza' | 'pistolet-eau' | 'parapente' | 'chaussure';

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
};
