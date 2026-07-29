/**
 * Lecture, écriture et traitement de fichiers WAV, sans aucune bibliothèque.
 *
 * Sert aux deux outils du son : `adoucir.ts` qui filtre un fichier existant, et
 * `synthese.ts` qui fabrique les sons de toutes pièces. Tout est en PCM 16 bits mono,
 * comme le pack d'origine.
 */
import { readFileSync, writeFileSync } from 'node:fs';

export interface Wav {
  frequence: number;
  echantillons: Float64Array;
}

export const FREQUENCE = 44100;

/** Lit un WAV PCM 16 bits. Le stéréo est replié en mono. */
export function lire(chemin: string): Wav {
  const buf = readFileSync(chemin);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`${chemin} n'est pas un WAV`);
  }
  let pos = 12;
  let canaux = 1;
  let frequence = FREQUENCE;
  let bits = 16;
  let data: Buffer | undefined;
  while (pos + 8 <= buf.length) {
    const type = buf.toString('ascii', pos, pos + 4);
    const taille = buf.readUInt32LE(pos + 4);
    const corps = buf.subarray(pos + 8, pos + 8 + taille);
    if (type === 'fmt ') {
      canaux = corps.readUInt16LE(2);
      frequence = corps.readUInt32LE(4);
      bits = corps.readUInt16LE(14);
    } else if (type === 'data') {
      data = corps;
    }
    pos += 8 + taille + (taille % 2);
  }
  if (!data) throw new Error(`${chemin} : pas de bloc data`);
  if (bits !== 16) throw new Error(`${chemin} : seul le 16 bits est géré (ici ${bits})`);

  const total = Math.floor(data.length / 2 / canaux);
  const out = new Float64Array(total);
  for (let i = 0; i < total; i++) {
    let somme = 0;
    for (let c = 0; c < canaux; c++) somme += data.readInt16LE((i * canaux + c) * 2) / 32768;
    out[i] = somme / canaux;
  }
  return { frequence, echantillons: out };
}

export function ecrire(chemin: string, w: Wav): void {
  const n = w.echantillons.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8, 'ascii');
  buf.write('fmt ', 12, 'ascii');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(w.frequence, 24);
  buf.writeUInt32LE(w.frequence * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, w.echantillons[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  writeFileSync(chemin, buf);
}

/**
 * Passe-bas : moyenne glissante sur trois points, appliquée `passes` fois. Rustique, sans
 * dépendance, et parfaitement suffisant pour arrondir un bip carré — chaque passe enlève
 * un peu plus d'aigu.
 */
export function passeBas(x: Float64Array, passes: number): Float64Array {
  let a = x;
  for (let p = 0; p < passes; p++) {
    const b = new Float64Array(a.length);
    for (let i = 0; i < a.length; i++) {
      const g = i > 0 ? a[i - 1] : a[i];
      const d = i < a.length - 1 ? a[i + 1] : a[i];
      b[i] = (g + 2 * a[i] + d) / 4;
    }
    a = b;
  }
  return a;
}

/**
 * Fondus aux deux bouts, en millisecondes. Sans eux, la coupure franche d'un échantillon
 * fait un clic — et c'est souvent *ça* qu'on entend comme agressif, pas la note.
 */
export function fondus(x: Float64Array, sr: number, attaqueMs: number, chuteMs: number): Float64Array {
  const a = Math.max(1, Math.round((attaqueMs / 1000) * sr));
  const c = Math.max(1, Math.round((chuteMs / 1000) * sr));
  const out = Float64Array.from(x);
  for (let i = 0; i < a && i < out.length; i++) out[i] *= i / a;
  for (let i = 0; i < c && i < out.length; i++) out[out.length - 1 - i] *= i / c;
  return out;
}

/** Décroissance exponentielle : `demiVie` en millisecondes. */
export function decroissance(x: Float64Array, sr: number, demiVieMs: number): Float64Array {
  const k = Math.LN2 / ((demiVieMs / 1000) * sr);
  return Float64Array.from(x, (v, i) => v * Math.exp(-k * i));
}

/** Ramène la crête à `niveau`. */
export function gain(x: Float64Array, niveau: number): Float64Array {
  const pic = crete(x) || 1;
  return Float64Array.from(x, (v) => (v / pic) * niveau);
}

export const crete = (x: Float64Array) => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

/**
 * Indice de brillance : énergie des écarts entre échantillons voisins, rapportée à
 * l'énergie totale. Proche de 0 = doux, au-delà de 1 = ça pique. C'est ce qui permet de
 * comparer deux sons sans les écouter.
 */
export function brillance(x: Float64Array): number {
  let diff = 0;
  let total = 0;
  for (let i = 1; i < x.length; i++) {
    diff += (x[i] - x[i - 1]) ** 2;
    total += x[i] ** 2;
  }
  return total > 0 ? diff / total : 0;
}

// ── générateurs ──────────────────────────────────────────────────────────────

const echantillons = (ms: number, sr = FREQUENCE) => Math.round((ms / 1000) * sr);

/** Bruit blanc. Le canal « noise » d'une Game Boy : aucune note, juste de la matière. */
export function bruitBlanc(ms: number, graine = 1): Float64Array {
  // Générateur déterministe : deux exécutions donnent le même fichier.
  let e = graine * 2654435761;
  return Float64Array.from({ length: echantillons(ms) }, () => {
    e = (e * 1103515245 + 12345) & 0x7fffffff;
    return (e / 0x3fffffff) - 1;
  });
}

/** Carré, comme les canaux 1 et 2 de la console. */
export function carre(ms: number, hz: number): Float64Array {
  const sr = FREQUENCE;
  return Float64Array.from({ length: echantillons(ms) }, (_, i) =>
    Math.sin((2 * Math.PI * hz * i) / sr) >= 0 ? 1 : -1,
  );
}

/** Triangle : le même timbre en beaucoup moins d'harmoniques, donc beaucoup plus doux. */
export function triangle(ms: number, hz: number): Float64Array {
  const sr = FREQUENCE;
  return Float64Array.from({ length: echantillons(ms) }, (_, i) => {
    const phase = ((hz * i) / sr) % 1;
    return 4 * Math.abs(phase - 0.5) - 1;
  });
}

/** Met des sons bout à bout. */
export function coller(...morceaux: Float64Array[]): Float64Array {
  const total = morceaux.reduce((n, m) => n + m.length, 0);
  const out = new Float64Array(total);
  let pos = 0;
  for (const m of morceaux) {
    out.set(m, pos);
    pos += m.length;
  }
  return out;
}
