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
import { ReglagesScene } from './scenes/ReglagesScene';
import { couperSon, estCoupe } from './systems/audio';
import { enregistrerReglages, reglages } from './systems/reglages';

const TACTILE = window.matchMedia('(pointer: coarse)').matches;

/**
 * **Sur un ordinateur : un zoom entier, jamais 1,5.** Un pixel du jeu vaut N pixels de
 * l'écran, sans quoi la grille se déforme et le dessin bave.
 */
function bestZoom(): number {
  const w = window.innerWidth - 60;
  const h = window.innerHeight - 80;
  return Math.max(1, Math.min(6, Math.floor(Math.min(w / GB.W, h / GB.H))));
}

/**
 * **Sur un téléphone : l'écran prend toute la place qu'il peut.** Un zoom entier y perdait
 * la moitié de la largeur — 375 pixels de large ne font que deux fois 160 — et le jeu
 * s'affichait en timbre-poste au milieu d'une grande console grise. On étire donc le
 * canevas en CSS, sans toucher à sa résolution interne : le rendu reste `pixelated`, les
 * pixels ne sont juste plus tous de la même taille. À bout de bras, ça ne se voit pas ;
 * un écran deux fois trop petit, si.
 *
 * La manette et la marque gardent leur place : on mesure ce qui reste, et on prend le
 * plus petit des deux côtés pour ne jamais déborder.
 */
function ajusterEcranTactile(): void {
  const canvas = document.getElementById('game')?.querySelector('canvas');
  if (!canvas) return;
  const manette = document.getElementById('manette');
  const bas = document.getElementById('bas');
  const pris = (manette?.offsetHeight ?? 0) + (bas?.offsetHeight ?? 0) + 60;
  const large = Math.min(window.innerWidth - 36, ((window.innerHeight - pris) * GB.W) / GB.H);
  canvas.style.width = `${Math.floor(large)}px`;
  canvas.style.height = `${Math.floor((large * GB.H) / GB.W)}px`;
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GB.W,
  height: GB.H,
  zoom: TACTILE ? 1 : bestZoom(),
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0f380f',
  // Sur tactile, c'est le CSS qui étire et centre le canevas : le centrage de Phaser
  // calcule ses marges sur la taille d'origine et décalait l'écran hors de la console.
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: TACTILE ? Phaser.Scale.NO_CENTER : Phaser.Scale.CENTER_BOTH,
  },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
  // L'ordre compte : le monde, puis l'interface, puis le journal par-dessus.
  scene: [
    BootScene,
    TitleScene,
    ReglagesScene,
    WorldScene,
    FlappyScene,
    ParapenteScene,
    FinScene,
    UiScene,
    JournalScene,
  ],
});

const ajuster = () => {
  if (TACTILE) ajusterEcranTactile();
  else game.scale.setZoom(bestZoom());
};
window.addEventListener('resize', ajuster);
window.addEventListener('orientationchange', () => setTimeout(ajuster, 120));
// Le canevas n'existe pas encore quand ce fichier s'exécute : on attend qu'il soit là.
game.events.once('ready', ajuster);

/**
 * **La touche M coupe le son**, et c'est tout ce qui en reste dans la page : le bouton
 * gris sous l'écran a rejoint les réglages du jeu (ÉCHAP sur l'écran-titre), où il a sa
 * place. Une console n'a pas d'étiquette « son : coupé » collée sur sa façade.
 */
window.addEventListener('keydown', (e) => {
  if (e.key !== 'm' && e.key !== 'M') return;
  reglages.son = estCoupe();
  couperSon(game.scene.scenes.find((s) => s.scene.isActive()), !reglages.son);
  enregistrerReglages();
});

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
    P: 80,
  };

  /**
   * **SELECT change de sens avec l'écran.** Dans le monde, c'est le journal ; dans un
   * mini-jeu, c'est « revenir » — un carnet de trouvailles n'a aucun sens au milieu d'un
   * vol en parapente, et le vol, lui, a besoin d'une porte de sortie. Un seul bouton, la
   * seule chose qu'il puisse vouloir dire à cet instant.
   */
  const MINI_JEUX = ['Flappy', 'Parapente'];
  const sensDeSelect = () =>
    game.scene.getScenes(true).some((s) => MINI_JEUX.includes(s.scene.key)) ? 'ESCAPE' : 'ENTER';

  const relacher = (pointer: number) => {
    const code = enfoncees.get(pointer);
    if (!code) return;
    enfoncees.delete(pointer);
    envoyer('keyup', code);
  };

  const boutons = Array.from(document.querySelectorAll<HTMLElement>('[data-touche]'));
  for (const bouton of boutons) {
    const ecrit = bouton.dataset.touche!;
    // `SELECT` n'est pas une touche : c'est un bouton dont le sens dépend de l'écran.
    const touche = () => (ecrit === 'SELECT' ? sensDeSelect() : ecrit);
    bouton.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      // Sans ça, le navigateur garde le doigt sur ce bouton même s'il glisse ailleurs.
      if (bouton.hasPointerCapture?.(e.pointerId)) bouton.releasePointerCapture(e.pointerId);
      relacher(e.pointerId);
      const code = touche();
      enfoncees.set(e.pointerId, code);
      envoyer('keydown', code);
    });
    // Entrer sur un bouton voisin en gardant le doigt posé : la direction suit.
    bouton.addEventListener('pointerenter', (e: PointerEvent) => {
      if (e.buttons === 0 && e.pointerType === 'mouse') return;
      if (!enfoncees.has(e.pointerId) && e.pointerType === 'mouse') return;
      const code = touche();
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
