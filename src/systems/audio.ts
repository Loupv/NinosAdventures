import Phaser from 'phaser';
import { DOSSIER, SONS, VOIX, piocher, son } from '../data/sons';

/**
 * Le son du jeu, en trois fonctions.
 *
 * **Rien n'est obligatoire** : un son dont le fichier n'est pas encore là ne fait rien du
 * tout, sans erreur et sans silence gênant. On peut donc poser les fichiers un par un.
 *
 * Le chargement ne demande que les sons marqués `present` dans le manifeste — sinon le
 * navigateur irait chercher soixante-huit fichiers absents à chaque démarrage.
 */

/** Clé Phaser d'une variante : `texte-1`, `prout-3`… */
const cle = (id: string, n: number) => `${id}-${n}`;

/**
 * Le son est-il coupé ? **Notre propre drapeau**, et c'est volontaire : dans cette version
 * de Phaser, `game.sound.mute` et `game.sound.volume` ne se relisent pas après une
 * affectation — le setter n'alimente pas le getter. Comme tous les sons du jeu passent par
 * `jouer()`, un booléen ici coupe tout, à coup sûr, sans dépendre de ces entrailles.
 *
 * **Coupé au démarrage, le temps du développement** : on travaille en silence, et on
 * l'allume pour vérifier un bruitage.
 */
let coupe = true;

export const estCoupe = () => coupe;

/** Coupe ou rallume tout le son. Renvoie l'état obtenu. */
export function couperSon(scene: Phaser.Scene | undefined, valeur: boolean): boolean {
  coupe = valeur;
  // Par acquit de conscience, on essaie aussi les leviers de Phaser : ils n'ont aucun
  // effet ici, mais ils couperont les boucles déjà lancées le jour où il y aura des
  // musiques, sur une version où ils fonctionnent.
  if (scene) {
    scene.sound.mute = valeur;
    const noeud = (scene.sound as { masterMuteNode?: GainNode }).masterMuteNode;
    if (noeud) noeud.gain.value = valeur ? 0 : 1;
  }
  return coupe;
}

/** À appeler dans le `preload` du Boot. */
export function chargerSons(scene: Phaser.Scene): void {
  for (const s of SONS.filter((x) => x.present)) {
    const ext = s.boucle ? 'ogg' : 'wav';
    for (let n = 1; n <= s.variantes; n++) {
      scene.load.audio(cle(s.id, n), `${DOSSIER}/${s.id}-${n}.${ext}`);
    }
  }
}

/**
 * Joue un son, en piochant une variante au hasard — jamais celle qui vient d'être jouée.
 * `options.detune` est en centièmes de demi-ton (1200 = une octave au-dessus).
 */
export function jouer(
  scene: Phaser.Scene,
  id: string,
  options: { volume?: number; detune?: number; rate?: number } = {},
): void {
  if (coupe) return;
  const s = son(id);
  if (!s?.present) return;
  const n = piocher(id);
  if (!n) return;
  const k = cle(id, n);
  if (!scene.cache.audio.exists(k)) return;
  scene.sound.play(k, {
    volume: options.volume ?? 1,
    detune: options.detune ?? 0,
    rate: options.rate ?? 1,
  });
}

/**
 * La voix d'un personnage : **le même bip, à une autre hauteur**.
 *
 * C'est tout ce qu'il faut pour que chacun ait sa voix — Moon parle haut et vite, l'Éléphant
 * très bas et lent — et ça coûte un seul fichier de 43 ms. Aucun mot n'est prononcé : c'est
 * le rythme du texte qui fait la parole, comme sur la console d'origine.
 */
export function jouerVoix(scene: Phaser.Scene, parleur?: string): void {
  const v = (parleur && VOIX[parleur]) || VOIX.recit;
  jouer(scene, 'texte', { volume: v.volume, detune: v.detune, rate: v.rate });
}
