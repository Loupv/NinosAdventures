/**
 * La quête du jeu, en un seul tableau : **tous les moyens de faire descendre la
 * température**. Il fait 34° et le jour est coincé ; chaque trouvaille gagne un
 * degré ou deux. Certaines idées réchauffent — c'est fait exprès, c'est la blague.
 *
 * Ce fichier est la source unique de vérité : il alimente la jauge, la page
 * « FRAIS » du journal, et il sert de liste de courses pour écrire le contenu.
 * Ajouter un moyen = une ligne ici + `cool: '<id>'` dans le dialogue concerné.
 */
import { FRAICHEURS_TEXTE } from './textes';

export interface Fraicheur {
  id: string;
  /** Négatif = ça rafraîchit. Positif = mauvaise idée. */
  degres: number;
  /** Vrai pour les gros moyens, ceux qui viennent d'un monde parallèle. */
  grand?: boolean;
}

/** Il fait 34° au réveil. */
export const TEMPERATURE_DEPART = 34;

/** En dessous, le jour peut enfin finir. */
export const TEMPERATURE_CIBLE = 20;

export const FRAICHEURS: Fraicheur[] = [
  // ── les petits moyens, ceux du quotidien ────────────────────────────────
  { id: 'volets', degres: -1 },
  { id: 'frigo-ouvert', degres: -1 },
  { id: 'eau-figure', degres: -1 },
  { id: 'baignoire-froide', degres: -1 },
  { id: 'armoire-fraiche', degres: -1 },
  { id: 'carrelage', degres: -1 },
  { id: 'ombre-reverbere', degres: -1 },
  { id: 'fenetre-cassee', degres: -1 },
  { id: 'glacon-hermione', degres: -1 },
  { id: 'pistolet', degres: -1 },

  // ── les mauvaises idées ─────────────────────────────────────────────────
  { id: 'recoucher', degres: 1 },
  { id: 'projecteur', degres: 1 },
  { id: 'chat-sur-genoux', degres: 1 },

  // ── les grands moyens, un par monde parallèle ───────────────────────────
  { id: 'pieds-erdre', degres: -3, grand: true },
  { id: 'ocean-evier', degres: -4, grand: true },
  { id: 'fond-armoire', degres: -4, grand: true },
  { id: 'dans-la-lumiere', degres: -4, grand: true },
  { id: 'terrain', degres: -4, grand: true },
  { id: 'elephant', degres: -5, grand: true },
];

const BY_ID = new Map(FRAICHEURS.map((f) => [f.id, f]));

/** Ce que le journal afficherait : la phrase vit dans textes.ts. */
export const labelFraicheur = (id: string) => FRAICHEURS_TEXTE[id] ?? id;

export const fraicheur = (id: string) => BY_ID.get(id);
