import Phaser from 'phaser';
import { GB } from '../config';
import { LINE_H, wrap } from '../art/font';
import { shade, shadeHex } from '../art/palette';
import { state } from '../systems/state';
import type { DialogueRequest } from '../systems/bus';
import { PixelText, measure } from './PixelText';
import { jouer, jouerVoix } from '../systems/audio';

const BOX = { x: 4, w: 152, h: 48 };
/**
 * Largeur de coupe du texte. Volontairement plus étroite que l'intérieur du cadre :
 * sans cette marge, une ligne pleine vient frôler le trait de droite et on a
 * l'impression qu'elle sort de l'écran.
 */
const TEXTE_W = 132;
/** En bas par défaut ; en haut quand l'action se passe dans la moitié basse. */
const BAS = 92;
const HAUT = 4;
/**
 * La fenêtre de choix, collée au dialogue, du côté de l'écran resté libre. Sa largeur
 * s'adapte à la plus longue réponse : « Oui / Non » garde exactement la même boîte
 * qu'avant, mais les réponses d'une énigme ont la place de tenir.
 */
const CHOICE = { droite: 156, min: 50, max: 130 };
const PAD = 6;
const MAX_LINES = 3;
const CHARS_PER_SEC = 34;

/**
 * La boîte de dialogue. Trois lignes max, frappées une lettre à la fois, petit
 * triangle clignotant quand la page est finie, et si besoin une fenêtre de choix
 * (oui / non) après la dernière page. Tout le jeu passe par elle.
 */
export class DialogueBox {
  private readonly frame: Phaser.GameObjects.Graphics;
  private readonly body: PixelText;
  private readonly name: PixelText;
  private readonly arrow: Phaser.GameObjects.Graphics;
  private readonly choiceFrame: Phaser.GameObjects.Graphics;
  private readonly choiceText: PixelText;

  /** Pages : chaque page = jusqu'à 3 lignes déjà découpées. */
  private pages: string[][] = [];
  private page = 0;
  private revealed = 0;
  private speaker?: string;
  private onDone?: (answer?: number) => void;
  private openedAt = 0;

  private choices?: string[];
  private choiceIndex = 0;
  /** Vrai quand la boîte est remontée en haut de l'écran. */
  private haut = false;
  /** Vrai quand la fenêtre de choix attend une réponse. */
  private choosing = false;

  active = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.frame = scene.add.graphics().setScrollFactor(0).setDepth(900).setVisible(false);
    this.name = new PixelText(scene, 'ui-name', BOX.x + PAD, BAS - 9, 100, 12);
    this.body = new PixelText(
      scene,
      'ui-body',
      BOX.x + PAD,
      BAS + 4,
      TEXTE_W,
      MAX_LINES * LINE_H + 2,
    );
    this.arrow = scene.add.graphics().setScrollFactor(0).setDepth(950).setVisible(false);
    this.name.image.setDepth(960).setVisible(false);
    this.body.image.setDepth(950).setVisible(false);

    this.choiceFrame = scene.add.graphics().setScrollFactor(0).setDepth(970).setVisible(false);
    // La zone est dimensionnée large : c'est drawChoices qui la place et la borne.
    this.choiceText = new PixelText(scene, 'ui-choice', 0, 64, CHOICE.max, 4 * LINE_H + 2);
    this.choiceText.image.setDepth(980).setVisible(false);
  }

  start(req: DialogueRequest): void {
    this.pages = [];
    for (const raw of req.lines) {
      const lines = wrap(raw, TEXTE_W);
      for (let i = 0; i < lines.length; i += MAX_LINES) {
        this.pages.push(lines.slice(i, i + MAX_LINES));
      }
    }
    this.speaker = req.speaker;
    this.onDone = req.onDone;
    // On laisse l'action visible : si elle est en bas, le texte monte.
    this.haut = (req.focusY ?? 0) > GB.H / 2;
    this.choices = req.choices;
    this.choiceIndex = 0;
    this.choosing = false;
    this.page = 0;
    this.revealed = 0;
    this.active = true;
    this.openedAt = this.scene.time.now;
    state.locked = true;
    this.draw();
    this.setVisible(true);
    this.renderPage();
  }

  /** Appelé à chaque frame par la scène d'interface. */
  tick(deltaMs: number): void {
    if (!this.active) return;
    if (this.choosing) {
      this.drawArrow(false);
      return;
    }
    const target = this.charCount();
    if (this.revealed < target) {
      const avant = Math.floor(this.revealed);
      this.revealed = Math.min(target, this.revealed + (CHARS_PER_SEC * deltaMs) / 1000);
      this.parler(avant, Math.floor(this.revealed));
      this.renderPage();
    }
    this.drawArrow(this.revealed >= target);
  }

  /** Touche action : finit la frappe, page suivante, ou valide le choix. */
  press(): void {
    if (!this.active) return;
    // On ignore la touche qui vient d'ouvrir la boîte.
    if (this.scene.time.now - this.openedAt < 140) return;

    if (this.choosing) {
      jouer(this.scene, 'valider', { volume: 0.55 });
      this.close(this.choiceIndex);
      return;
    }

    if (this.revealed < this.charCount()) {
      this.revealed = this.charCount();
      this.renderPage();
      return;
    }

    if (this.page + 1 >= this.pages.length) {
      if (this.choices) {
        this.choosing = true;
        jouer(this.scene, 'menu', { volume: 0.5 });
        this.drawChoices();
        return;
      }
      this.close();
      return;
    }

    this.page += 1;
    this.revealed = 0;
    this.renderPage();
  }

  /** Flèches haut/bas dans la fenêtre de choix. */
  moveChoice(delta: number): void {
    if (!this.choosing || !this.choices) return;
    jouer(this.scene, 'menu', { volume: 0.5 });
    const n = this.choices.length;
    this.choiceIndex = (this.choiceIndex + delta + n) % n;
    this.drawChoices();
  }

  get isChoosing(): boolean {
    return this.choosing;
  }

  private close(answer?: number): void {
    this.active = false;
    this.choosing = false;
    this.setVisible(false);
    this.body.clear();
    this.name.clear();
    this.choiceText.clear();
    state.locked = false;
    const cb = this.onDone;
    this.onDone = undefined;
    cb?.(answer);
  }

  private charCount(): number {
    return this.pages[this.page]?.reduce((n, l) => n + l.length, 0) ?? 0;
  }

  private renderPage(): void {
    const lines = this.pages[this.page] ?? [];
    this.body.setLines(lines, shadeHex(state.palette, 0), this.revealed);
  }

  private setVisible(v: boolean): void {
    this.frame.setVisible(v);
    this.body.image.setVisible(v);
    this.arrow.setVisible(v);
    this.name.image.setVisible(v && !!this.speaker);
    if (!v) {
      this.choiceFrame.setVisible(false);
      this.choiceText.image.setVisible(false);
    }
  }

  private get boxY(): number {
    return this.haut ? HAUT : BAS;
  }

  /** Cadre à deux traits, comme les fenêtres de Pokémon. */
  private draw(): void {
    const g = this.frame;
    const y = this.boxY;
    const dark = shade(state.palette, 0);
    const light = shade(state.palette, 3);
    g.clear();
    g.fillStyle(dark, 1).fillRect(BOX.x, y, BOX.w, BOX.h);
    g.fillStyle(light, 1).fillRect(BOX.x + 1, y + 1, BOX.w - 2, BOX.h - 2);
    g.lineStyle(1, dark, 1).strokeRect(BOX.x + 3.5, y + 3.5, BOX.w - 7, BOX.h - 7);

    this.body.image.setPosition(BOX.x + PAD, y + 4);

    if (this.speaker) {
      // L'étiquette du nom se met du côté opposé au bord de l'écran.
      const w = measure(this.speaker) + PAD * 2;
      const ny = this.haut ? y + BOX.h - 1 : y - 11;
      g.fillStyle(dark, 1).fillRect(BOX.x + 2, ny, w, 12);
      g.fillStyle(light, 1).fillRect(BOX.x + 3, ny + 1, w - 2, 11);
      this.name.image.setPosition(BOX.x + PAD, ny + 2);
      this.name.setLines([this.speaker], shadeHex(state.palette, 0));
    }
  }

  /**
   * La voix : un bip toutes les deux lettres, à la hauteur du personnage qui parle.
   *
   * Un bip par caractère serait une mitraillette ; un sur deux donne le débit d'une phrase.
   * Les espaces et la ponctuation ne sonnent pas — c'est ce qui fait entendre les mots.
   */
  private parler(avant: number, apres: number): void {
    const texte = this.pages[this.page] ?? [];
    const plat = texte.join(' ');
    for (let i = avant; i < apres; i++) {
      if (i % 2 !== 0) continue;
      const c = plat[i];
      if (!c || !/[\p{L}\p{N}]/u.test(c)) continue;
      jouerVoix(this.scene, this.speaker);
    }
  }

  /** La petite fenêtre de choix, en haut à droite du dialogue. */
  private drawChoices(): void {
    if (!this.choices) return;
    const dark = shade(state.palette, 0);
    const light = shade(state.palette, 3);
    const h = 8 + this.choices.length * LINE_H;
    const large = Phaser.Math.Clamp(
      Math.max(...this.choices.map((c) => measure(c))) + 22,
      CHOICE.min,
      CHOICE.max,
    );
    const cx = CHOICE.droite - large;
    // Collée au dialogue, du côté resté libre.
    const cy0 = this.haut ? HAUT + BOX.h + 6 : BAS - h - 6;
    const g = this.choiceFrame;
    g.clear();
    g.fillStyle(dark, 1).fillRect(cx, cy0, large, h);
    g.fillStyle(light, 1).fillRect(cx + 1, cy0 + 1, large - 2, h - 2);

    // Le curseur : un petit triangle devant la ligne choisie.
    const cy = cy0 + 8 + this.choiceIndex * LINE_H;
    g.fillStyle(dark, 1);
    g.fillRect(cx + 6, cy, 1, 5);
    g.fillRect(cx + 7, cy + 1, 1, 3);
    g.fillRect(cx + 8, cy + 2, 1, 1);
    g.setVisible(true);

    this.choiceText.image.setPosition(cx + 14, cy0 + 6);
    this.choiceText.setLines(this.choices, shadeHex(state.palette, 0));
    this.choiceText.image.setVisible(true);
  }

  private drawArrow(show: boolean): void {
    const g = this.arrow;
    g.clear();
    if (!show) return;
    // Clignotement : visible ~2/3 du temps.
    if (Math.floor(this.scene.time.now / 260) % 3 === 2) return;
    const x = BOX.x + BOX.w - 12;
    const y = this.boxY + BOX.h - 11;
    g.fillStyle(shade(state.palette, 0), 1);
    g.fillRect(x, y, 5, 1);
    g.fillRect(x + 1, y + 1, 3, 1);
    g.fillRect(x + 2, y + 2, 1, 1);
  }
}
