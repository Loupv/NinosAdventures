import Phaser from 'phaser';
import { GB } from '../config';
import { shade, type PaletteId } from '../art/palette';
import { texKey } from '../art/pixels';

/**
 * Les effets. Contrainte de style : la Game Boy ne sait pas faire de fondu en
 * alpha, elle décale sa palette. Nos fondus sont donc "en escalier", 4 tons.
 */

const STEP = 70;

export function gbFade(
  scene: Phaser.Scene,
  pal: PaletteId,
  dir: 'in' | 'out',
  onDone?: () => void,
): Phaser.GameObjects.Rectangle {
  const steps: (0 | 1 | 2)[] = dir === 'out' ? [2, 1, 0] : [0, 1, 2];
  const rect = scene.add
    .rectangle(0, 0, GB.W, GB.H, shade(pal, steps[0]))
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(2000);

  let i = 0;
  const tick = () => {
    i += 1;
    if (i < steps.length) {
      rect.setFillStyle(shade(pal, steps[i]));
      scene.time.delayedCall(STEP, tick);
      return;
    }
    if (dir === 'in') rect.destroy();
    onDone?.();
  };
  scene.time.delayedCall(STEP, tick);
  return rect;
}

/** Le passage d'un monde à l'autre : anneaux qui avalent l'écran + secousse. */
export function portalWarp(scene: Phaser.Scene, pal: PaletteId, onDone: () => void): void {
  scene.cameras.main.shake(520, 0.006);
  const g = scene.add.graphics().setScrollFactor(0).setDepth(2000);
  const cx = GB.W / 2;
  const cy = GB.H / 2;
  let frame = 0;
  const total = 18;

  scene.time.addEvent({
    delay: 32,
    repeat: total - 1,
    callback: () => {
      frame += 1;
      const r = frame * 7;
      g.clear();
      for (let k = 0; k < 4; k++) {
        const rr = r - k * 9;
        if (rr <= 0) continue;
        g.lineStyle(3, shade(pal, (k % 3) as 0 | 1 | 2), 1);
        g.strokeCircle(cx, cy, rr);
      }
      if (frame >= total) {
        g.clear();
        g.fillStyle(shade(pal, 0), 1).fillRect(0, 0, GB.W, GB.H);
        scene.time.delayedCall(90, () => {
          g.destroy();
          onDone();
        });
      }
    },
  });
}

/** Petite étincelle : ramassage d'objet, apparition, clin d'œil. */
export function sparkle(scene: Phaser.Scene, pal: PaletteId, x: number, y: number): void {
  const s = scene.add
    .sprite(x, y, texKey('etincelle', pal), 'pop-0')
    .setDepth(1500)
    .play(`etincelle-pop@${pal}`);
  s.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => s.destroy());
}

/** Le petit plouf du poisson qui traverse la surface. */
export function splash(scene: Phaser.Scene, pal: PaletteId, x: number, y: number): void {
  const s = scene.add
    .sprite(x, y, texKey('splash', pal), 'plouf-0')
    .setOrigin(0.5, 0.5)
    .setDepth(1400)
    .play(`splash-plouf@${pal}`);
  s.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => s.destroy());
}

/** Flash 1 frame, pour souligner un événement. */
export function flash(scene: Phaser.Scene, pal: PaletteId): void {
  const r = scene.add
    .rectangle(0, 0, GB.W, GB.H, shade(pal, 3))
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(1900);
  scene.time.delayedCall(70, () => r.destroy());
}
