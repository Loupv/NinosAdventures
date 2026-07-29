import type { PaletteId } from '../art/palette';
import { FRAICHEURS, TEMPERATURE_DEPART, fraicheur } from '../data/fraicheur';
import type { ItemId } from '../data/items';

const SAVE_KEY = 'ninos-adventures/save/v1';

export interface Snapshot {
  items: ItemId[];
  flags: string[];
  lieux: string[];
  fraicheurs: string[];
  pieces: string[];
  haiku: number;
  hermione: number;
  ecrans: number;
  eauDepuis: number;
  sueurDepuis: number;
  room: string;
}

/**
 * L'état du jeu, en un seul objet. Volontairement plat : un enfant de 7 ans
 * n'a pas besoin de dix systèmes, et nous non plus.
 */
class GameState {
  items = new Set<ItemId>();
  flags = new Set<string>();
  /** Lieux déjà visités. */
  lieux = new Set<string>();
  /** Moyens de se rafraîchir déjà trouvés. C'est la quête du jeu. */
  fraicheurs = new Set<string>();
  /** Pièces à collectionner. On ne sait pas encore ce qu'elles veulent dire. */
  pieces = new Set<string>();
  /** Nombre de haïkus déjà entendus. L'araignée en dit un nouveau à chaque visite. */
  haiku = 0;
  /** Nombre d'écrans traversés depuis le début. Sert à faire arriver les choses « plus tard ». */
  ecrans = 0;
  /** Valeur d'`ecrans` au moment où on a ouvert le robinet de la baignoire. */
  eauDepuis = 0;
  /** Valeur d'`ecrans` au moment où Nino s'est mis à dégouliner. */
  sueurDepuis = 0;
  /** Nombre de fois où Hermione a été retrouvée. Détermine sa cachette suivante. */
  hermione = 0;
  room = 'chambre';
  /** Palette de la pièce courante : l'interface s'y accorde. Non sauvegardé. */
  palette: PaletteId = 'real';
  /** Vrai quand une boîte de dialogue ou un menu a la main. */
  locked = false;

  has(item: ItemId) {
    return this.items.has(item);
  }
  flag(name: string) {
    return this.flags.has(name);
  }
  vu(lieu: string) {
    return this.lieux.has(lieu);
  }
  give(item: ItemId) {
    this.items.add(item);
  }
  take(item: ItemId) {
    this.items.delete(item);
  }
  setFlag(name: string) {
    this.flags.add(name);
  }
  visit(lieu: string) {
    this.lieux.add(lieu);
  }

  /**
   * La température n'est pas stockée : elle se recalcule depuis les moyens trouvés.
   * Impossible qu'elle dérive de la sauvegarde ou d'un double comptage.
   */
  get temperature(): number {
    let t = TEMPERATURE_DEPART;
    for (const id of this.fraicheurs) t += fraicheur(id)?.degres ?? 0;
    return t;
  }

  /** Enregistre un moyen. Renvoie les degrés gagnés, ou 0 s'il était déjà connu. */
  trouveFraicheur(id: string): number {
    if (this.fraicheurs.has(id) || !fraicheur(id)) return 0;
    this.fraicheurs.add(id);
    return fraicheur(id)!.degres;
  }

  /** Nombre de moyens restant à découvrir. */
  get fraicheursRestantes(): number {
    return FRAICHEURS.length - this.fraicheurs.size;
  }

  reset() {
    this.items.clear();
    this.flags.clear();
    this.lieux.clear();
    this.fraicheurs.clear();
    this.pieces.clear();
    this.haiku = 0;
    this.ecrans = 0;
    this.eauDepuis = 0;
    this.sueurDepuis = 0;
    this.hermione = 0;
    this.room = 'chambre';
    this.palette = 'real';
    this.locked = false;
  }

  save() {
    const snap: Snapshot = {
      items: [...this.items],
      flags: [...this.flags],
      lieux: [...this.lieux],
      fraicheurs: [...this.fraicheurs],
      pieces: [...this.pieces],
      haiku: this.haiku,
      hermione: this.hermione,
      ecrans: this.ecrans,
      eauDepuis: this.eauDepuis,
      sueurDepuis: this.sueurDepuis,
      room: this.room,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(snap));
  }

  /** Vrai si une partie a été chargée. */
  load(): boolean {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
      const snap = JSON.parse(raw) as Snapshot;
      this.reset();
      snap.items.forEach((i) => this.items.add(i));
      snap.flags.forEach((f) => this.flags.add(f));
      snap.lieux.forEach((l) => this.lieux.add(l));
      (snap.fraicheurs ?? []).forEach((f) => this.fraicheurs.add(f));
      (snap.pieces ?? []).forEach((p) => this.pieces.add(p));
      this.haiku = snap.haiku ?? 0;
      this.hermione = snap.hermione ?? 0;
      this.ecrans = snap.ecrans ?? 0;
      this.eauDepuis = snap.eauDepuis ?? 0;
      this.sueurDepuis = snap.sueurDepuis ?? 0;
      this.room = snap.room;
      return true;
    } catch {
      return false;
    }
  }

  hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  clearSave() {
    localStorage.removeItem(SAVE_KEY);
  }
}

export const state = new GameState();
