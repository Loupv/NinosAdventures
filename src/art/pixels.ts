import Phaser from 'phaser';
import { PALETTES, type PaletteId } from './palette';

/**
 * Un dessin = un tableau de lignes de texte.
 * '.' (ou ' ') = transparent, '0'..'3' = indice de palette.
 * On peut donc éditer les sprites directement dans le code, à la main.
 */
export type Art = readonly string[];

export const artWidth = (art: Art) => Math.max(...art.map((r) => r.length));
export const artHeight = (art: Art) => art.length;

function paint(
  ctx: CanvasRenderingContext2D,
  art: Art,
  pal: PaletteId,
  ox: number,
  oy: number,
): void {
  const colors = PALETTES[pal];
  for (let y = 0; y < art.length; y++) {
    const row = art[y];
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === '.' || c === ' ') continue;
      ctx.fillStyle = colors[Number(c) as 0 | 1 | 2 | 3];
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

function freshCanvas(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
): Phaser.Textures.CanvasTexture {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) throw new Error(`Impossible de créer la texture "${key}"`);
  return tex;
}

/** Clé d'une texture pour une palette donnée : "nino@socks". */
export const texKey = (name: string, pal: PaletteId) => `${name}@${pal}`;

/** Même convention pour les animations : "nino-walk-down@socks". */
export const animKey = texKey;

/** Cuit un dessin unique en texture (une seule frame). */
export function bakeImage(scene: Phaser.Scene, name: string, art: Art, pal: PaletteId): void {
  const tex = freshCanvas(scene, texKey(name, pal), artWidth(art), artHeight(art));
  paint(tex.getContext(), art, pal, 0, 0);
  tex.refresh();
}

/**
 * Cuit plusieurs dessins dans une seule texture, avec des frames nommées
 * (ce dont Phaser a besoin pour les animations).
 */
export function bakeSheet(
  scene: Phaser.Scene,
  name: string,
  frames: Record<string, Art>,
  pal: PaletteId,
): void {
  const entries = Object.entries(frames);
  const cellW = Math.max(...entries.map(([, a]) => artWidth(a)));
  const cellH = Math.max(...entries.map(([, a]) => artHeight(a)));
  const tex = freshCanvas(scene, texKey(name, pal), cellW * entries.length, cellH);
  const ctx = tex.getContext();
  entries.forEach(([frame, art], i) => {
    paint(ctx, art, pal, i * cellW, 0);
    tex.add(frame, 0, i * cellW, 0, cellW, cellH);
  });
  tex.refresh();
}

/** Un canevas vide réutilisable, pour composer une pièce ou du texte. */
export function blankCanvas(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
): Phaser.Textures.CanvasTexture {
  if (scene.textures.exists(key)) {
    const tex = scene.textures.get(key) as Phaser.Textures.CanvasTexture;
    if (tex.width === w && tex.height === h) {
      tex.clear();
      return tex;
    }
  }
  return freshCanvas(scene, key, w, h);
}

export { paint as paintArt };
