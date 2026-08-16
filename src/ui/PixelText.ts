import Phaser from 'phaser';
import { blankCanvas } from '../art/pixels';
import { LINE_H, drawText, wrap, textWidth } from '../art/font';
import { enTouchesDeLaConsole } from './touches';

/**
 * Un bloc de texte pixel, redessiné dans son propre canevas.
 * Le rendu caractère par caractère du dialogue passe par `setLines(..., visible)`.
 */
export class PixelText {
  private readonly tex: Phaser.Textures.CanvasTexture;
  readonly image: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    key: string,
    x: number,
    y: number,
    private readonly w: number,
    private readonly h: number,
  ) {
    this.tex = blankCanvas(scene, key, w, h);
    this.image = scene.add.image(x, y, key).setOrigin(0, 0).setScrollFactor(0);
  }

  /** `visible` = nombre de caractères révélés (Infinity = tout). */
  setLines(lines: string[], color: string, visible = Infinity, lineHeight = LINE_H): void {
    const ctx = this.tex.getContext();
    ctx.clearRect(0, 0, this.w, this.h);
    let left = visible;
    // **Sur une tablette, ESPACE devient A.** La traduction vit ici, au dernier moment :
    // les textes s'écrivent une fois pour toutes, et aucune consigne ne peut l'oublier.
    lines.map(enTouchesDeLaConsole).forEach((line, i) => {
      if (left <= 0) return;
      const shown = left >= line.length ? line : line.slice(0, Math.floor(left));
      left -= line.length;
      drawText(ctx, shown, 0, i * lineHeight, color);
    });
    this.tex.refresh();
  }

  setText(text: string, color: string, visible = Infinity): void {
    this.setLines(wrap(text, this.w), color, visible);
  }

  clear(): void {
    const ctx = this.tex.getContext();
    ctx.clearRect(0, 0, this.w, this.h);
    this.tex.refresh();
  }

  destroy(): void {
    this.image.destroy();
  }
}

/** Largeur d'un texte, pour centrer à la main. */
/**
 * La largeur d'un texte **tel qu'il sera affiché** : tout le jeu s'en sert pour centrer,
 * et sur une tablette « ESPACE : CONTINUER » devient « A : CONTINUER » — cinq lettres de
 * moins. Mesurer la version d'origine décalait toutes les consignes vers la droite.
 */
export const measure = (texte: string) => textWidth(enTouchesDeLaConsole(texte));
