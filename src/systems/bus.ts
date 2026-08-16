import Phaser from 'phaser';
import type { ItemId } from '../data/items';

/** Le canal unique entre le monde (WorldScene) et l'interface (UiScene). */
export const bus = new Phaser.Events.EventEmitter();

export interface DialogueRequest {
  /** Nom affiché au-dessus de la boîte, ou undefined pour une narration. */
  speaker?: string;
  lines: string[];
  /** Si présent, une petite fenêtre de choix s'ouvre après la dernière page. */
  choices?: string[];
  /**
   * Ordonnée (monde) de ce qu'il faut voir pendant la réplique. La boîte se place à
   * l'opposé : si l'action est en bas de l'écran, le texte monte en haut.
   */
  focusY?: number;
  /** `answer` = index du choix retenu, ou undefined s'il n'y avait pas de choix. */
  onDone?: (answer?: number) => void;
}

export interface RoomBanner {
  name: string;
  /** Vrai si Nino découvre le lieu maintenant. */
  isNew: boolean;
}

/**
 * L'état des boutons pour une frame. Une seule scène lit le clavier (le monde)
 * et le rediffuse ici : sinon deux scènes se volent la même touche et un
 * dialogue peut rester bloqué.
 */
export interface Buttons {
  action: boolean;
  journal: boolean;
  /** START : le menu de la console. */
  reglages: boolean;
  cancel: boolean;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export const EV = {
  dialogue: 'dialogue',
  prompt: 'prompt',
  toast: 'toast',
  hud: 'hud',
  room: 'room',
  input: 'input',
} as const;

export function say(req: DialogueRequest): void {
  bus.emit(EV.dialogue, req);
}

export function toast(text: string, item?: ItemId): void {
  bus.emit(EV.toast, { text, item });
}
