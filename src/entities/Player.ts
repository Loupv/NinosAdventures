import Phaser from 'phaser';
import { SPEED } from '../config';
import { animKey, texKey } from '../art/pixels';
import type { PaletteId } from '../art/palette';

export type Facing = 'up' | 'down' | 'left' | 'right';

/** Vue de dessus (la maison, la ville) ou de profil (le bord de l'Erdre). */
export type ViewMode = 'top' | 'side';

export interface MoveInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/** Nino. Quatre directions, deux frames de marche, rien de plus. */
export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  facing: Facing = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number, private pal: PaletteId) {
    this.sprite = scene.physics.add.sprite(x, y, texKey('nino', pal), 'down-0');
    this.sprite.setOrigin(0.5, 1); // ancré aux pieds : le tri par profondeur devient trivial
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(6, 5);
    body.setOffset(1, 10);
    this.sprite.setCollideWorldBounds(true);
  }

  /** Le point que Nino « regarde » : c'est là qu'on cherche avec quoi interagir. */
  probe(): { x: number; y: number } {
    const x = this.sprite.x;
    const y = this.sprite.y - 4;
    const d = 8;
    if (this.facing === 'up') return { x, y: y - d };
    if (this.facing === 'down') return { x, y: y + d };
    if (this.facing === 'left') return { x: x - d, y };
    return { x: x + d, y };
  }

  move(input: MoveInput, mode: ViewMode = 'top'): void {
    if (mode === 'side') {
      this.moveSide(input);
      return;
    }
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;
    if (input.left) vx -= 1;
    if (input.right) vx += 1;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;

    // Pas de diagonale plus rapide que la ligne droite.
    const len = Math.hypot(vx, vy) || 1;
    body.setVelocity((vx / len) * SPEED, (vy / len) * SPEED);

    if (vx !== 0 || vy !== 0) {
      // La direction verticale gagne : c'est ce qui se lit le mieux.
      if (vy < 0) this.facing = 'up';
      else if (vy > 0) this.facing = 'down';
      else if (vx < 0) this.facing = 'left';
      else this.facing = 'right';
      this.playWalk();
    } else {
      this.stand();
    }

    this.sprite.setDepth(this.sprite.y);
  }

  /**
   * De profil, on ne coupe que la vitesse horizontale : couper la verticale
   * ferait flotter Nino en plein saut pendant un dialogue.
   */
  freeze(mode: ViewMode = 'top'): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (mode === 'side') body.setVelocityX(0);
    else body.setVelocity(0, 0);
    this.stand();
  }

  /** De profil : gauche/droite, et la flèche haut saute. */
  private moveSide(input: MoveInput): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(input.left ? -SPEED : input.right ? SPEED : 0);

    // Sur les quais on ne fait que marcher : pas de saut, rien à sauter, et un enfant
    // qui saute au bord de l'eau n'est pas ce qu'on veut montrer.
    const auSol = body.blocked.down || body.touching.down;

    if (input.left) this.facing = 'left';
    else if (input.right) this.facing = 'right';
    this.sprite.setFlipX(this.facing === 'left');

    if (!auSol) {
      this.sprite.anims.stop();
      this.sprite.setFrame('side-0');
    } else if (body.velocity.x !== 0) {
      const key = animKey('nino-walk-side', this.pal);
      const anims = this.sprite.anims;
      if (anims.currentAnim?.key !== key || !anims.isPlaying) this.sprite.play(key);
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame('side-0');
    }
  }

  /**
   * **Il faut aussi relancer une animation à l'arrêt.** `stand()` coupe l'animation mais laisse
   * `currentAnim` en place : repartir dans **la même direction** ne rappelait donc jamais `play`, et
   * Nino glissait sans bouger les jambes jusqu'à ce qu'on change de sens. C'est le bug le plus visible
   * du jeu, et il tient dans la condition ci-dessous.
   */
  private playWalk(): void {
    const set = this.facing === 'up' ? 'up' : this.facing === 'down' ? 'down' : 'side';
    this.sprite.setFlipX(this.facing === 'left');
    const key = animKey(`nino-walk-${set}`, this.pal);
    const anims = this.sprite.anims;
    if (anims.currentAnim?.key !== key || !anims.isPlaying) this.sprite.play(key);
  }

  private stand(): void {
    const set = this.facing === 'up' ? 'up' : this.facing === 'down' ? 'down' : 'side';
    this.sprite.anims.stop();
    this.sprite.setFlipX(this.facing === 'left');
    this.sprite.setFrame(`${set}-0`);
  }
}
