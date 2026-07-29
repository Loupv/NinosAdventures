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

/** Zoom entier uniquement : un pixel du jeu = N pixels de l'écran, jamais 1,5. */
function bestZoom(): number {
  const w = window.innerWidth - 60;
  const h = window.innerHeight - 80;
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

// Poignée de développement : absente du build de production.
if (import.meta.env.DEV) (window as unknown as { jeu?: Phaser.Game }).jeu = game;
