/**
 * Police 1-bit maison.
 *
 * On dessine chaque glyphe une fois, en GROS (quatre fois la taille finale), puis
 * on réduit en comptant la surface d'encre de chaque bloc de 4x4 : au-dessus d'un
 * seuil, le pixel est plein. Ce suréchantillonnage donne des lettres beaucoup plus
 * régulières que de demander directement à la police du système de se dessiner en
 * 9 pixels de haut — et on récupère les accents français gratuitement.
 *
 * Si un jour tu veux une police dessinée à la main, c'est le seul fichier à changer.
 */

const CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  'abcdefghijklmnopqrstuvwxyz' +
  '0123456789' +
  'ÀÂÇÈÉÊËÎÏÔÙÛÜŒàâçèéêëîïôöùûüœ' +
  // Les apostrophes et tirets typographiques comptent : tout le texte français
  // du jeu utilise ’ et —, qui s'afficheraient sinon comme des blancs.
  ".,;:!?'\"’‘“”()[]-–—+*/=<>%&#@$€…«»°_~^ ";

/** Hauteur nominale du glyphe final, en pixels écran. */
const SIZE = 9;
const SS = 4; // facteur de suréchantillonnage
/** Part de la surface qui doit être encrée pour allumer le pixel. */
const INK = 0.36;

const CELL = 16; // cellule de mesure, en pixels finaux
const BASELINE = 12;

type Glyph = { w: number; bits: Uint8Array }; // bits : CELL lignes de w pixels

const glyphs = new Map<string, Glyph>();
let top = 0; // première ligne encrée, toutes lettres confondues
let bottom = CELL - 1;

export let FONT_H = 9;
export const LINE_H = 12;
export const SPACE_W = 3;
export const LETTER_SPACING = 1;

export function bakeFont(): void {
  if (glyphs.size > 0) return;

  const canvas = document.createElement('canvas');
  canvas.width = CELL * SS;
  canvas.height = CELL * SS;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Pas de contexte 2d pour cuire la police');
  ctx.font = `${SIZE * SS}px Menlo, Monaco, "DejaVu Sans Mono", monospace`;
  ctx.textBaseline = 'alphabetic';

  let minRow = CELL;
  let maxRow = 0;

  for (const ch of CHARSET) {
    ctx.clearRect(0, 0, CELL * SS, CELL * SS);
    ctx.fillStyle = '#fff';
    ctx.fillText(ch, 2 * SS, BASELINE * SS);
    const data = ctx.getImageData(0, 0, CELL * SS, CELL * SS).data;

    // Réduction : la couverture moyenne du bloc décide du pixel.
    const mask = new Uint8Array(CELL * CELL);
    let minX = CELL;
    let maxX = -1;
    for (let y = 0; y < CELL; y++) {
      for (let x = 0; x < CELL; x++) {
        let sum = 0;
        for (let sy = 0; sy < SS; sy++) {
          const row = (y * SS + sy) * CELL * SS;
          for (let sx = 0; sx < SS; sx++) {
            sum += data[(row + x * SS + sx) * 4 + 3];
          }
        }
        if (sum / (SS * SS * 255) < INK) continue;
        mask[y * CELL + x] = 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minRow) minRow = y;
        if (y > maxRow) maxRow = y;
      }
    }

    if (maxX < 0) {
      glyphs.set(ch, { w: SPACE_W, bits: new Uint8Array(0) });
      continue;
    }

    const w = maxX - minX + 1;
    const bits = new Uint8Array(CELL * w);
    for (let y = 0; y < CELL; y++) {
      for (let x = 0; x < w; x++) bits[y * w + x] = mask[y * CELL + (minX + x)];
    }
    glyphs.set(ch, { w, bits });
  }

  top = minRow;
  bottom = maxRow;
  FONT_H = bottom - top + 1;
}

export function charWidth(ch: string): number {
  return glyphs.get(ch)?.w ?? SPACE_W;
}

export function textWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += charWidth(ch) + LETTER_SPACING;
  return Math.max(0, w - LETTER_SPACING);
}

/** Découpe un texte en lignes qui tiennent dans `maxWidth` pixels. */
export function wrap(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(candidate) <= maxWidth || !line) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Écrit une ligne de texte dans un contexte 2d, en couleur pleine. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
): void {
  ctx.fillStyle = color;
  let cx = x;
  for (const ch of text) {
    const g = glyphs.get(ch);
    if (!g) {
      cx += SPACE_W + LETTER_SPACING;
      continue;
    }
    for (let gy = top; gy <= bottom; gy++) {
      for (let gx = 0; gx < g.w; gx++) {
        if (g.bits[gy * g.w + gx]) ctx.fillRect(cx + gx, y + (gy - top), 1, 1);
      }
    }
    cx += g.w + LETTER_SPACING;
  }
}
