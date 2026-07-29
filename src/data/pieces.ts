import { PIECES_TEXTE } from './textes';

/**
 * Les pièces à collectionner.
 *
 * On ne sait pas encore ce qu'elles veulent dire — et c'est volontaire : Nino les
 * ramasse d'abord, on comprendra après. Chacune vient d'un endroit où on n'était pas
 * censé aller. Leurs textes sont dans textes.ts.
 */
export interface PieceDef {
  id: string;
  name: string;
  /** D'où elle vient, pour le journal. */
  provenance: string;
}

export const PIECES: PieceDef[] = Object.entries(PIECES_TEXTE).map(([id, t]) => ({
  id,
  name: t.nom,
  provenance: t.provenance,
}));

export const piece = (id: string) => PIECES.find((p) => p.id === id);
