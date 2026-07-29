/**
 * Tout le pixel art du jeu n'utilise que 4 indices (0 = plus sombre, 3 = plus clair),
 * comme la Game Boy. Franchir un seuil = rejouer le même art avec une autre palette.
 * C'est notre effet le plus fort, et il est gratuit.
 */
export type PaletteId =
  | 'real-chaud'
  | 'real'
  | 'real-doux'
  | 'real-soir'
  | 'ville'
  | 'ville-nuit'
  | 'eau'
  | 'eau-nuit'
  | 'tv';

export const PALETTES: Record<PaletteId, readonly [string, string, string, string]> = {
  /**
   * La maison, à quatre moments de la journée. C'est la jauge de la quête rendue
   * visible : plus la température descend, plus la lumière s'adoucit — du midi
   * blanchi jusqu'au bleu du soir. Aucun asset supplémentaire, juste 4 palettes.
   *
   * Deux écarts assumés avec la vraie DMG :
   *  - le **ton 2 est plus sombre** que le #8bac0f d'origine, où il était presque
   *    indistinguable du ton 3 : tapis, plans de travail et tissus y devenaient invisibles.
   *  - le **vert est désaturé de 40 %** vers son propre gris. Le vert acide de la DMG
   *    fatigue sur un écran moderne rétroéclairé ; ce vert-gris garde l'écart entre les
   *    quatre tons sans piquer les yeux.
   */
  'real-chaud': ['#2d3719', '#607233', '#a8b85d', '#e9eec1'],
  real: ['#193119', '#3c5a3c', '#739045', '#9cb048'],
  'real-doux': ['#231c0d', '#4a4520', '#8a8a3a', '#cfc984'],
  'real-soir': ['#0b1220', '#243050', '#4a6a86', '#93b0bf'],
  /** Nantes, dehors, la pierre chaude. */
  ville: ['#2b1a10', '#6b4a24', '#c99a5b', '#f2e0b8'],
  /**
   * La même ville la nuit. Elle reste un cran plus tiède que la maison nocturne : dehors
   * il y a des réverbères, dedans il n'y a personne qui allume.
   */
  'ville-nuit': ['#0f1218', '#2f3340', '#5f6474', '#a9a8b2'],
  /** L'Erdre, et tout ce qui sera aquatique. */
  eau: ['#04202c', '#0b4a5e', '#3f9fb5', '#c9f0f5'],
  /** L'Erdre de nuit : la même eau, sans le soleil dedans. */
  'eau-nuit': ['#04121c', '#0d2b3c', '#2c5566', '#7f9aa6'],
  /** Le Monde de la Télé (chapitre à venir). */
  tv: ['#101010', '#3a3a3a', '#a0a0a0', '#e8e8e8'],
};

export const PALETTE_IDS = Object.keys(PALETTES) as PaletteId[];

/** Couleur d'un indice, en nombre (pour les formes Phaser). */
export function shade(pal: PaletteId, index: 0 | 1 | 2 | 3): number {
  return Number.parseInt(PALETTES[pal][index].slice(1), 16);
}

export function shadeHex(pal: PaletteId, index: 0 | 1 | 2 | 3): string {
  return PALETTES[pal][index];
}

/** La lumière de la maison, selon la température. */
export function realStage(temp: number): PaletteId {
  if (temp >= 30) return 'real-chaud';
  if (temp >= 25) return 'real';
  if (temp >= 21) return 'real-doux';
  return 'real-soir';
}

/** Les lieux « réels » suivent la température ; les autres gardent leur palette. */
export function paletteFor(base: PaletteId, temp: number): PaletteId {
  return base === 'real' ? realStage(temp) : base;
}

/**
 * La version nocturne d'une palette.
 *
 * **Tout le jeu se passe la nuit**, jusqu'à ce que Nino rentre par la fenêtre : il s'est
 * réveillé au milieu de la nuit et il a traversé la ville pendant que ses parents
 * préparaient son anniversaire dans la cuisine. Le retour, lui, est au petit matin — et
 * c'est le seul moment où on voit les couleurs du jour.
 *
 * Les palettes qui n'ont pas de version de nuit (le rêve, le soir) restent elles-mêmes.
 */
const NUIT: Partial<Record<PaletteId, PaletteId>> = {
  real: 'real-soir',
  'real-chaud': 'real-soir',
  'real-doux': 'real-soir',
  ville: 'ville-nuit',
  eau: 'eau-nuit',
};

export const paletteNocturne = (base: PaletteId): PaletteId => NUIT[base] ?? base;
