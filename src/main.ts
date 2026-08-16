import Phaser from 'phaser';
import { GB } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { WorldScene } from './scenes/WorldScene';
import { UiScene } from './scenes/UiScene';
import { JournalScene } from './scenes/JournalScene';
import { FlappyScene } from './scenes/FlappyScene';
import { ParapenteScene } from './scenes/ParapenteScene';
import { FinScene } from './scenes/FinScene';
import { couperSon, estCoupe } from './systems/audio';

/**
 * Zoom entier uniquement : un pixel du jeu = N pixels de l'écran, jamais 1,5.
 *
 * Sur un écran tactile, la manette occupe le bas de la console : on lui réserve sa place
 * avant de calculer, sinon l'écran mangeait les boutons et Nino se retrouvait à jouer
 * sans croix directionnelle.
 */
const TACTILE = window.matchMedia('(pointer: coarse)').matches;

function bestZoom(): number {
  const w = window.innerWidth - 60;
  const h = window.innerHeight - (TACTILE ? 260 : 80);
  return Math.max(1, Math.min(6, Math.floor(Math.min(w / GB.W, h / GB.H))));
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GB.W,
  height: GB.H,
  zoom: bestZoom(),
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0f380f',
  scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
  // L'ordre compte : le monde, puis l'interface, puis le journal par-dessus.
  scene: [
    BootScene,
    TitleScene,
    WorldScene,
    FlappyScene,
    ParapenteScene,
    FinScene,
    UiScene,
    JournalScene,
  ],
});

window.addEventListener('resize', () => game.scale.setZoom(bestZoom()));

/**
 * ── Bouton du son : TEMPORAIRE ──
 *
 * **Le son est coupé au démarrage** : on développe en silence, et on l'allume pour
 * vérifier un bruitage. Le bouton est dans la page, sous l'écran — pas dans le jeu, pour
 * ne pas manger de pixels et pour qu'il suffise de retirer ce bloc et le <button> de
 * index.html le jour où on n'en veut plus. La touche **M** fait la même chose.
 */
const bouton = document.getElementById('son');
const majSon = () => {
  if (bouton) bouton.textContent = estCoupe() ? 'son : coupé' : 'son : allumé';
};
const basculerSon = () => {
  // La scène courante sert juste à relayer aux leviers de Phaser ; l'état vit dans audio.ts.
  couperSon(game.scene.scenes.find((s) => s.scene.isActive()), !estCoupe());
  majSon();
};
bouton?.addEventListener('click', () => {
  basculerSon();
  // Le clic rend aussi la main au clavier : sinon les flèches pilotent le bouton.
  (document.activeElement as HTMLElement | null)?.blur();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') basculerSon();
});
majSon();

/**
 * ── LA MANETTE TACTILE ──
 *
 * **Chaque bouton envoie une vraie touche du clavier.** Le jeu n'apprend pas qu'il existe
 * une manette : il continue d'écouter `keydown` et `keyup` comme sur un ordinateur, et il
 * n'y a donc jamais deux façons de jouer à tenir à jour. Tout tient dans le nom posé sur
 * le bouton (`data-touche`) et dans les quelques lignes qui suivent.
 *
 * Les événements de pointeur sont préférés à `touchstart` : ils couvrent le doigt, le
 * stylet et la souris d'un coup. Et **on relâche la capture implicite** — sans ça, un
 * doigt posé sur ◀ qui glisse vers ▶ garderait ◀ enfoncée jusqu'à ce qu'on le lève.
 */
function brancherLaManette(): void {
  const enfoncees = new Map<number, string>();

  const envoyer = (type: 'keydown' | 'keyup', code: string) => {
    const cle = code === 'SPACE' ? ' ' : code === 'ESCAPE' ? 'Escape' : code === 'ENTER' ? 'Enter' : code;
    window.dispatchEvent(
      new KeyboardEvent(type, {
        key: cle.length === 1 ? cle.toLowerCase() : cle,
        code: code === 'SPACE' ? 'Space' : code,
        keyCode: CODES[code] ?? 0,
        bubbles: true,
      }),
    );
  };

  /** Phaser lit encore `keyCode` : on le lui donne, faute de quoi rien ne répond. */
  const CODES: Record<string, number> = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,
    X: 88,
    ESCAPE: 27,
    ENTER: 13,
  };

  const relacher = (pointer: number) => {
    const code = enfoncees.get(pointer);
    if (!code) return;
    enfoncees.delete(pointer);
    envoyer('keyup', code);
  };

  const boutons = Array.from(document.querySelectorAll<HTMLElement>('[data-touche]'));
  for (const bouton of boutons) {
    const code = bouton.dataset.touche!;
    bouton.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      // Sans ça, le navigateur garde le doigt sur ce bouton même s'il glisse ailleurs.
      if (bouton.hasPointerCapture?.(e.pointerId)) bouton.releasePointerCapture(e.pointerId);
      relacher(e.pointerId);
      enfoncees.set(e.pointerId, code);
      envoyer('keydown', code);
    });
    // Entrer sur un bouton voisin en gardant le doigt posé : la direction suit.
    bouton.addEventListener('pointerenter', (e: PointerEvent) => {
      if (e.buttons === 0 && e.pointerType === 'mouse') return;
      if (!enfoncees.has(e.pointerId) && e.pointerType === 'mouse') return;
      if (enfoncees.get(e.pointerId) === code) return;
      relacher(e.pointerId);
      enfoncees.set(e.pointerId, code);
      envoyer('keydown', code);
    });
    for (const fin of ['pointerup', 'pointercancel', 'pointerleave'] as const) {
      bouton.addEventListener(fin, (e: PointerEvent) => relacher(e.pointerId));
    }
  }
  // Un doigt levé hors de la console ne doit pas laisser Nino marcher tout seul.
  window.addEventListener('pointerup', (e: PointerEvent) => relacher(e.pointerId));
  window.addEventListener('blur', () => {
    for (const pointer of [...enfoncees.keys()]) relacher(pointer);
  });
}

brancherLaManette();

// Poignée de développement : absente du build de production.
if (import.meta.env.DEV) (window as unknown as { jeu?: Phaser.Game }).jeu = game;
