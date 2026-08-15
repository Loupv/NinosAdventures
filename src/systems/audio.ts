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
  // La musique est une boucle déjà lancée : le drapeau ne suffit pas, on la met en
  // pause — et on la reprend là où elle en était, pas au début.
  for (const canal of [musique, ambiance]) {
    if (!canal) continue;
    if (valeur) canal.boucle.pause();
    else if (canal.boucle.isPaused) canal.boucle.resume();
    else canal.boucle.play();
  }
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

/**
 * ── La musique ──
 *
 * **Une seule boucle à la fois, et elle appartient au jeu, pas à une scène** : le
 * gestionnaire de son de Phaser est global, donc la musique de la maison survit aux
 * changements de pièce — la chambre, le couloir et la cuisine se partagent la même
 * boucle sans qu'elle reparte du début.
 */
const VOLUME_MUSIQUE = 0.3;

let musique: { id: string; boucle: Phaser.Sound.BaseSound } | undefined;

/**
 * Joue la musique demandée — ou coupe tout avec `undefined`.
 *
 * Redemander celle qui joue déjà ne fait rien : c'est ce qui permet d'appeler cette
 * fonction à chaque arrivée dans une pièce sans jamais faire redémarrer la boucle.
 * Une musique dont le fichier n'est pas posé vaut un silence, sans erreur — comme tous
 * les sons du jeu.
 */
export function jouerMusique(scene: Phaser.Scene, id: string | undefined): void {
  const s = id ? son(id) : undefined;
  const voulu = s?.present ? id : undefined;
  if (musique?.id === voulu) return;
  if (musique) {
    musique.boucle.destroy();
    musique = undefined;
  }
  if (!voulu) return;
  const k = cle(voulu, 1);
  if (!scene.cache.audio.exists(k)) return;
  const boucle = scene.sound.add(k, { loop: true, volume: VOLUME_MUSIQUE });
  musique = { id: voulu, boucle };
  // Coupé, on garde la boucle prête sans la lancer : `couperSon(false)` la démarrera.
  if (!coupe) boucle.play();
}

/**
 * ── L'ambiance ──
 *
 * Un second canal de boucle, **par-dessus la musique** : les grillons de la nuit. Même
 * contrat que la musique — une seule à la fois, redemander celle qui joue ne fait rien,
 * fichier absent = silence.
 */
const VOLUME_AMBIANCE = 0.4;

let ambiance: { id: string; boucle: Phaser.Sound.BaseSound } | undefined;

export function jouerAmbiance(scene: Phaser.Scene, id: string | undefined): void {
  const s = id ? son(id) : undefined;
  const voulu = s?.present ? id : undefined;
  if (ambiance?.id === voulu) return;
  if (ambiance) {
    ambiance.boucle.destroy();
    ambiance = undefined;
  }
  if (!voulu) return;
  const k = cle(voulu, 1);
  if (!scene.cache.audio.exists(k)) return;
  const boucle = scene.sound.add(k, { loop: true, volume: VOLUME_AMBIANCE });
  ambiance = { id: voulu, boucle };
  if (!coupe) boucle.play();
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
  // Deux timbres pour deux rôles : le récit garde le triangle soufflé, les personnages ont
  // un carré filtré — le grain d'une bouche. Même hauteur par personnage qu'avant.
  const timbre = parleur && VOIX[parleur] ? 'voix' : 'texte';
  jouer(scene, timbre, { volume: v.volume, detune: v.detune, rate: v.rate });
}

/**
 * **Le cri de la bête, à l'ouverture de sa réplique.** Le poisson fait une bulle,
 * l'écureuil pépie, l'araignée fait deux petits pas secs, Moon miaule, l'Éléphant barrit —
 * une fois par boîte de dialogue, par-dessus le bip du texte qui continue de faire la
 * parole. Les humains n'ont pas de cri : ils ont déjà leur hauteur de voix.
 */
const CRIS_DE_BETES: Record<string, string> = {
  Moon: 'chat',
  'Le poisson': 'poisson',
  'L’araignée': 'araignee',
  'L’écureuil': 'ecureuil',
  'L’Éléphant': 'elephant',
};

export function jouerCri(scene: Phaser.Scene, parleur?: string): void {
  const id = parleur && CRIS_DE_BETES[parleur];
  if (id) jouer(scene, id, { volume: 0.5 });
}
