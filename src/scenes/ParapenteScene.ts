import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { animKey, texKey } from '../art/pixels';
import { state } from '../systems/state';
import { VOL } from '../data/textes';
import { jouer } from '../systems/audio';
import { PixelText, measure } from '../ui/PixelText';

/**
 * **Le vol depuis le toit de la Tour de Bretagne jusqu'à la fenêtre de sa chambre.**
 *
 * Vu **vers l'avant**, comme une borne d'arcade : la ville vient vers nous, Nino se déplace
 * sur tout l'écran (haut, bas, gauche, droite) et le décor grandit à mesure qu'il approche.
 * C'était un vol de dix secondes vu de côté ; c'est maintenant une traversée d'une bonne
 * demi-minute, avec une ville en perspective et des hérons qui arrivent en face.
 *
 * **La perspective tient en deux lignes.** Chaque chose a une position dans le monde
 * (`x` latéral, `y` vertical, `z` la distance) et l'écran s'en déduit :
 *
 *     sx = 80 + x * FOCALE / z        sy = HORIZON + y * FOCALE / z
 *
 * Plus `z` est grand, plus la chose est petite et proche du point de fuite. Tout le reste — la
 * taille des immeubles, l'échelle des hérons, la fenêtre qui grossit à la fin — n'est que cette
 * division. Il n'y a pas de moteur 3D, il y a un rapport.
 *
 * **Toujours aucune punition.** Toucher un héron pousse Nino de côté d'un coup d'aile ;
 * manquer la fenêtre fait remonter tout le monde d'une rafale et la maison repart au loin. On
 * ne perd rien, jamais — la seule chose qui presse, c'est le jour qui se lève.
 */
/**
 * Il saute au petit matin : la ville est encore éteinte et sa fenêtre est la seule chose
 * claire. La palette de l'aube, comme le toit d'où il vient.
 */
const PALETTE = 'ville-aube' as const;

/** La perspective. `FOCALE` règle l'ouverture : plus grand = plus resserré. */
const FOCALE = 90;
const HORIZON = 50;
/** À quelle profondeur, sous l'axe du vol, se trouve le sol. */
const SOL = 46;

const AVANCE = 58; // unités de z par seconde
const PILOTAGE = 62; // px/s à l'écran
const RAFALE = 30; // poussée latérale du vent
const RAFALE_TOUS = 2600; // ms entre deux rafales
const HERON_POUSSE = 46; // le coup d'aile, en px/s
/** Le rebond sur une façade : plus fort qu'un héron, c'est un immeuble. */
const IMMEUBLE_POUSSE = 64;
/** À partir de quelle distance une façade peut cogner. */
const COGNE = 46;

/** La ville : quatorze immeubles recyclés, espacés en profondeur. */
const IMMEUBLES = 14;
const PAS_Z = 130;
/**
 * **Huit lignes de sol** qui foncent vers nous. C'est tout ce qui donne la sensation
 * d'avancer : sans elles, la ville glisse mais le sol est une masse immobile, et on ne sait
 * plus si on vole ou si on flotte.
 */
const LIGNES = 8;
const PAS_LIGNE = 90;
/** En dessous de cette distance, la chose est passée : on la renvoie au loin. */
const PROCHE = 30;

/** La maison, tout au bout : une bonne demi-minute de vol à `AVANCE` par seconde. */
const MAISON_Z = 1700;
/** Et si on la manque, elle repart un peu moins loin : on ne punit pas deux fois. */
const MAISON_Z_RETOUR = 900;
const MAISON_LARGE = 150;
const MAISON_HAUT = 60;
/** Les deux fenêtres de la façade, en unités du monde, depuis le centre de la maison. */
const CHAMBRE = { x: 26, y: -16, w: 26, h: 20 };
const PARENTS = { x: -26, y: -16, w: 26, h: 20 };
/**
 * **À quelle distance on décide.** Pas au dernier moment : en approchant, les deux fenêtres
 * s'écartent vers les bords (c'est la perspective), et trop près la sienne sortait de l'écran
 * — la cible devenait injoignable au moment de viser. À soixante-dix, elles sont encore toutes
 * les deux dans le cadre, bien grandes, et l'écart entre elles est franc.
 */
const ARRIVEE = 70;

const HERON_TOUS = 2400; // ms entre deux hérons
const HERON_Z = 1000;

interface Immeuble {
  x: number;
  z: number;
  w: number;
  h: number;
  /** Déjà cogné : on ne rebondit qu'une fois par immeuble. */
  cogne: boolean;
  mur: Phaser.GameObjects.Rectangle;
  toit: Phaser.GameObjects.Rectangle;
  fenetre: Phaser.GameObjects.Rectangle;
}

interface Oiseau {
  x: number;
  y: number;
  z: number;
  go: Phaser.GameObjects.Sprite;
}

export class ParapenteScene extends Phaser.Scene {
  private vol!: Phaser.GameObjects.Image;
  /** Position de Nino **à l'écran** : c'est ça qu'on pilote. */
  private px = GB.W / 2;
  private py = 60;
  private vx = 0;
  private etat: 'attente' | 'vol' | 'fini' = 'attente';
  private titre!: PixelText;
  private sous!: PixelText;
  private message!: PixelText;

  private immeubles: Immeuble[] = [];
  private lignes: { z: number; go: Phaser.GameObjects.Rectangle }[] = [];
  private herons: Oiseau[] = [];
  private maison!: Phaser.GameObjects.Rectangle;
  private maisonToit!: Phaser.GameObjects.Rectangle;
  private fenetres: Phaser.GameObjects.Rectangle[] = [];
  private maisonZ = MAISON_Z;
  private annoncee = false;

  private prochaineRafale = RAFALE_TOUS;
  private prochainHeron = HERON_TOUS;
  /** Compteurs : ils remplacent le hasard, pour que deux vols se ressemblent. */
  private nesImmeubles = 0;
  private nesHerons = 0;
  /** Combien de façades il a déjà prises : la deuxième fois, il s'excuse. */
  private cognes = 0;

  private keys!: Record<'action' | 'left' | 'right' | 'up' | 'down', Phaser.Input.Keyboard.Key[]>;

  constructor() {
    super('Parapente');
  }

  create(): void {
    this.etat = 'attente';
    this.px = GB.W / 2;
    this.py = 60;
    this.vx = 0;
    this.maisonZ = MAISON_Z;
    this.annoncee = false;
    this.prochaineRafale = RAFALE_TOUS;
    this.prochainHeron = HERON_TOUS;
    this.nesImmeubles = 0;
    this.nesHerons = 0;
    this.cognes = 0;
    this.immeubles = [];
    this.lignes = [];
    this.herons = [];
    this.fenetres = [];
    state.palette = PALETTE;

    // Le ciel prend le ton moyen : ça laisse le ton clair aux fenêtres allumées, qui sont les
    // seules choses qu'on doit chercher des yeux.
    this.cameras.main.setBackgroundColor(shadeHex(PALETTE, 2));

    // Quelques étoiles qui s'éteignent, au-dessus de l'horizon. Posées à la main.
    for (const [x, y] of [
      [18, 12],
      [52, 26],
      [74, 8],
      [108, 20],
      [136, 14],
      [92, 34],
    ] as const) {
      this.add.rectangle(x, y, 1, 1, shade(PALETTE, 3)).setOrigin(0, 0).setDepth(1);
    }

    // Le sol : tout ce qui est sous l'horizon. C'est la ville éteinte, vue de très haut.
    this.add
      .rectangle(0, HORIZON, GB.W, GB.H - HORIZON, shade(PALETTE, 0))
      .setOrigin(0, 0)
      .setDepth(2);

    for (let i = 0; i < LIGNES; i++) {
      this.lignes.push({
        z: PROCHE + i * PAS_LIGNE,
        go: this.add.rectangle(0, 0, GB.W, 1, shade(PALETTE, 1)).setOrigin(0, 0).setDepth(3),
      });
    }

    for (let i = 0; i < IMMEUBLES; i++) {
      const b: Immeuble = {
        x: 0,
        z: 0,
        w: 0,
        h: 0,
        cogne: false,
        mur: this.add.rectangle(0, 0, 1, 1, shade(PALETTE, 1)).setOrigin(0, 0),
        toit: this.add.rectangle(0, 0, 1, 1, shade(PALETTE, 2)).setOrigin(0, 0),
        fenetre: this.add.rectangle(0, 0, 1, 1, shade(PALETTE, 3)).setOrigin(0, 0),
      };
      this.neuf(b, PROCHE + i * PAS_Z);
      this.immeubles.push(b);
    }

    // La maison, au bout. On ne la voit que de loin, mais elle avance depuis le début.
    this.maison = this.add.rectangle(0, 0, 1, 1, shade(PALETTE, 0)).setOrigin(0, 0).setDepth(900);
    this.maisonToit = this.add
      .rectangle(0, 0, 1, 1, shade(PALETTE, 1))
      .setOrigin(0, 0)
      .setDepth(901);
    for (const f of [PARENTS, CHAMBRE]) {
      this.fenetres.push(
        this.add
          .rectangle(0, 0, 1, 1, shade(PALETTE, f === CHAMBRE ? 3 : 1))
          .setOrigin(0, 0)
          .setDepth(902),
      );
    }

    this.vol = this.add
      .image(this.px, this.py, texKey('parapente-vol', PALETTE))
      .setOrigin(0.5, 0.5)
      .setDepth(1000);

    this.titre = new PixelText(this, 'pp-titre', 0, 44, GB.W, 12);
    this.sous = new PixelText(this, 'pp-sous', 0, 58, GB.W, 12);
    this.message = new PixelText(this, 'pp-msg', 0, 4, GB.W, 12);
    for (const t of [this.titre, this.sous, this.message]) t.image.setDepth(1100);

    const kb = this.input.keyboard!;
    this.keys = {
      action: KEYS.action.map((c) => kb.addKey(c)),
      left: KEYS.left.map((c) => kb.addKey(c)),
      right: KEYS.right.map((c) => kb.addKey(c)),
      up: KEYS.up.map((c) => kb.addKey(c)),
      down: KEYS.down.map((c) => kb.addKey(c)),
    };

    this.dessiner();
    this.annoncer(VOL.consigne, VOL.demarrer);
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const appui = this.keys.action.some((k) => Phaser.Input.Keyboard.JustDown(k));

    if (this.etat === 'attente') {
      // Il flotte sur place en attendant qu'on se décide.
      this.py = 60 + Math.sin(this.time.now / 300) * 2;
      this.dessiner();
      if (appui) {
        this.etat = 'vol';
        this.annoncer('', '');
      }
      return;
    }
    if (this.etat === 'fini') return;

    this.piloter(delta, dt);
    this.avancerLaVille(dt);
    this.lesHerons(delta, dt);
    this.laMaison(dt);
    this.dessiner();
  }

  // ───────────────────────────────────────────────────────────── le pilotage

  private piloter(delta: number, dt: number): void {
    const gauche = this.keys.left.some((k) => k.isDown);
    const droite = this.keys.right.some((k) => k.isDown);
    const haut = this.keys.up.some((k) => k.isDown);
    const bas = this.keys.down.some((k) => k.isDown);

    this.vx = (gauche ? -PILOTAGE : 0) + (droite ? PILOTAGE : 0) + this.vx * 0.86;
    this.prochaineRafale -= delta;
    if (this.prochaineRafale <= 0) {
      this.prochaineRafale = RAFALE_TOUS;
      this.vx += this.nesHerons % 2 === 0 ? -RAFALE : RAFALE;
      jouer(this, 'rafale', { volume: 0.6 });
      this.dire(VOL.rafale);
    }

    this.px = Phaser.Math.Clamp(this.px + this.vx * dt, 14, GB.W - 14);
    // En hauteur, pas d'inertie : à sept ans, on veut que la flèche du haut fasse monter.
    const vy = (haut ? -PILOTAGE * 0.8 : 0) + (bas ? PILOTAGE * 0.8 : 0);
    this.py = Phaser.Math.Clamp(this.py + vy * dt, 18, GB.H - 26);
  }

  // ─────────────────────────────────────────────────────────────── la ville

  /** Redonne à un immeuble une taille et une place, et l'envoie à la distance `z`. */
  private neuf(b: Immeuble, z: number): void {
    const n = this.nesImmeubles++;
    // Deux suites qui ne retombent pas en phase : ça suffit à ce qu'on ne voie pas la boucle.
    b.x = ((n * 53) % 240) - 120;
    b.w = 22 + ((n * 17) % 26);
    // Hautes : il faut qu'une bonne moitié d'entre elles **dépasse l'horizon**, sinon on ne
    // survole pas une ville, on survole des dalles.
    b.h = 44 + ((n * 29) % 60);
    b.z = z;
    b.cogne = false;
  }

  private avancerLaVille(dt: number): void {
    for (const b of this.immeubles) {
      b.z -= AVANCE * dt;
      if (b.z < COGNE && !b.cogne) this.cogner(b);
      if (b.z < PROCHE) this.neuf(b, b.z + IMMEUBLES * PAS_Z);
    }
    for (const l of this.lignes) {
      l.z -= AVANCE * dt;
      if (l.z < PROCHE) l.z += LIGNES * PAS_LIGNE;
    }
  }

  /**
   * **Rentrer dans un immeuble.** Ça ne faisait rien du tout, et la ville n'était donc qu'un
   * papier peint. Maintenant on rebondit : un coup de caméra, le bruit du rebond, Nino est
   * poussé du côté où il y a de la place et il perd un peu d'altitude. Comme pour le héron,
   * ça ne fait pas perdre — ça suffit largement à manquer la fenêtre.
   *
   * On ne teste que **la façade**, et seulement quand elle est tout près : de loin, un
   * immeuble minuscule au milieu de l'écran n'a jamais gêné personne. Et une fois cogné, un
   * immeuble ne cogne plus : il est déjà derrière.
   */
  private cogner(b: Immeuble): void {
    const g = this.ecranX(b.x - b.w / 2, b.z);
    const d = this.ecranX(b.x + b.w / 2, b.z);
    const bas = this.ecranY(SOL, b.z);
    const haut = this.ecranY(SOL - b.h, b.z);
    // La boîte de Nino, resserrée sur son corps : la voile ne compte pas.
    if (this.px + 6 < g || this.px - 6 > d || this.py + 8 < haut || this.py - 8 > bas) return;
    b.cogne = true;
    this.vx = (this.px < (g + d) / 2 ? -1 : 1) * IMMEUBLE_POUSSE;
    this.py = Phaser.Math.Clamp(this.py + 12, 18, GB.H - 26);
    this.cameras.main.shake(180, 0.01);
    jouer(this, 'rebond', { volume: 0.7 });
    this.cognes += 1;
    this.dire(this.cognes > 1 ? VOL.immeubleEncore : VOL.immeuble);
  }

  // ────────────────────────────────────────────────────────────── les hérons

  private lesHerons(delta: number, dt: number): void {
    this.prochainHeron -= delta;
    if (this.prochainHeron <= 0) {
      this.prochainHeron = HERON_TOUS;
      const n = this.nesHerons++;
      const go = this.add
        .sprite(0, 0, texKey('heron', PALETTE), 'vol-0')
        .setOrigin(0.5, 0.5)
        .setDepth(950)
        .setFlipX(n % 2 === 0)
        .play(animKey('heron-vol', PALETTE));
      // Ils arrivent en face, à des hauteurs et des côtés qui tournent sans se répéter.
      this.herons.push({ x: ((n * 37) % 120) - 60, y: ((n * 23) % 60) - 34, z: HERON_Z, go });
      jouer(this, 'heron', { volume: 0.35 });
      // Le premier est annoncé, les suivants non : on a compris, et on les voit venir.
      if (n === 0) this.dire(VOL.heron);
    }

    for (const h of [...this.herons]) {
      // Ils volent vers nous : leur vitesse s'ajoute à la nôtre.
      h.z -= (AVANCE + 40) * dt;
      // Et ils dérivent un peu, sinon on les éviterait sans y penser.
      h.x += Math.sin(h.z / 90) * 12 * dt;
      if (h.z >= 14) continue;
      const sx = this.ecranX(h.x, 14);
      const sy = this.ecranY(h.y, 14);
      if (Math.abs(sx - this.px) < 16 && Math.abs(sy - this.py) < 14) {
        this.vx = Math.sign(this.px - sx || 1) * HERON_POUSSE;
        jouer(this, 'heron', { volume: 0.7 });
        this.dire(VOL.heronTouche);
      }
      h.go.destroy();
      this.herons = this.herons.filter((o) => o !== h);
    }
  }

  // ───────────────────────────────────────────────────────────── la maison

  private laMaison(dt: number): void {
    this.maisonZ -= AVANCE * dt;
    if (!this.annoncee && this.maisonZ < 420) {
      this.annoncee = true;
      this.dire(VOL.maison);
    }
    if (this.maisonZ > ARRIVEE) return;

    // Arrivée : on regarde où est Nino par rapport aux deux fenêtres, à l'écran.
    const dans = (f: typeof CHAMBRE) =>
      this.px > this.ecranX(f.x - f.w / 2, this.maisonZ) &&
      this.px < this.ecranX(f.x + f.w / 2, this.maisonZ) &&
      this.py > this.ecranY(f.y - f.h / 2, this.maisonZ) &&
      this.py < this.ecranY(f.y + f.h / 2, this.maisonZ);
    if (dans(CHAMBRE)) this.rentrer();
    else this.remonter(dans(PARENTS) ? VOL.lumiere : VOL.rate);
  }

  /** Rater ne coûte rien : une rafale le remonte, et la maison repart au loin. */
  private remonter(pourquoi: string): void {
    this.dire(pourquoi);
    this.maisonZ = MAISON_Z_RETOUR;
    this.annoncee = false;
    this.px = GB.W / 2;
    this.py = 60;
    this.vx = 0;
    this.prochaineRafale = RAFALE_TOUS;
  }

  // ───────────────────────────────────────────────────────────── le dessin

  private ecranX(x: number, z: number): number {
    return GB.W / 2 + (x * FOCALE) / z;
  }

  private ecranY(y: number, z: number): number {
    return HORIZON + (y * FOCALE) / z;
  }

  /** Une seule passe : chaque chose du monde prend sa place et sa taille à l'écran. */
  private dessiner(): void {
    for (const l of this.lignes) {
      const y = this.ecranY(SOL, l.z);
      l.go.setPosition(0, Math.round(y)).setSize(GB.W, l.z < 200 ? 2 : 1);
      l.go.setVisible(y < GB.H);
    }

    for (const b of this.immeubles) {
      const g = this.ecranX(b.x - b.w / 2, b.z);
      const d = this.ecranX(b.x + b.w / 2, b.z);
      const bas = this.ecranY(SOL, b.z);
      const haut = this.ecranY(SOL - b.h, b.z);
      const large = Math.max(1, Math.round(d - g));
      const hauteur = Math.max(1, Math.round(bas - haut));
      b.mur.setPosition(Math.round(g), Math.round(haut)).setSize(large, hauteur);
      b.mur.setDepth(100 + Math.round(1000 - b.z));
      // Le haut du mur, d'un ton plus clair : c'est ce qui donne le relief.
      b.toit
        .setPosition(Math.round(g), Math.round(haut))
        .setSize(large, Math.max(1, Math.round(hauteur / 8)));
      b.toit.setDepth(b.mur.depth + 1);
      // Une fenêtre allumée, quand l'immeuble est assez proche pour qu'on la voie.
      const allumee = b.z < 520 && large > 6;
      b.fenetre.setVisible(allumee);
      if (allumee) {
        b.fenetre
          .setPosition(Math.round(g + large / 3), Math.round(haut + hauteur / 3))
          .setSize(Math.max(1, Math.round(large / 4)), Math.max(1, Math.round(hauteur / 6)));
        b.fenetre.setDepth(b.mur.depth + 2);
      }
    }

    for (const h of this.herons) {
      h.go.setPosition(Math.round(this.ecranX(h.x, h.z)), Math.round(this.ecranY(h.y, h.z)));
      h.go.setScale(Phaser.Math.Clamp((FOCALE / h.z) * 2.4, 0.25, 3));
      h.go.setDepth(100 + Math.round(1000 - h.z));
    }

    const visible = this.maisonZ < 900;
    this.maison.setVisible(visible);
    this.maisonToit.setVisible(visible);
    for (const f of this.fenetres) f.setVisible(visible);
    if (!visible) {
      this.vol.setPosition(Math.round(this.px), Math.round(this.py));
      return;
    }
    const z = Math.max(this.maisonZ, ARRIVEE);
    const g = this.ecranX(-MAISON_LARGE / 2, z);
    const d = this.ecranX(MAISON_LARGE / 2, z);
    const bas = this.ecranY(SOL, z);
    const haut = this.ecranY(-MAISON_HAUT / 2, z);
    this.maison
      .setPosition(Math.round(g), Math.round(haut))
      .setSize(Math.max(1, Math.round(d - g)), Math.max(1, Math.round(bas - haut)));
    this.maisonToit
      .setPosition(Math.round(g), Math.round(haut))
      .setSize(Math.max(1, Math.round(d - g)), Math.max(1, Math.round((bas - haut) / 10)));
    [PARENTS, CHAMBRE].forEach((f, i) => {
      const fg = this.ecranX(f.x - f.w / 2, z);
      const fd = this.ecranX(f.x + f.w / 2, z);
      const fh = this.ecranY(f.y - f.h / 2, z);
      const fb = this.ecranY(f.y + f.h / 2, z);
      this.fenetres[i]
        .setPosition(Math.round(fg), Math.round(fh))
        .setSize(Math.max(1, Math.round(fd - fg)), Math.max(1, Math.round(fb - fh)));
    });

    this.vol.setPosition(Math.round(this.px), Math.round(this.py));
  }

  // ───────────────────────────────────────────────────────────────── la fin

  private rentrer(): void {
    this.etat = 'fini';
    for (const h of this.herons) h.go.destroy();
    this.herons = [];
    state.setFlag('parapente-rentre');
    state.give('parapente');
    state.save();
    jouer(this, 'objet-trouve', { volume: 0.6 });
    // **En clair** : à l'arrivée, la façade sombre remplit l'écran, et le texte du départ
    // (encre sombre sur ciel gris) y devenait invisible.
    this.annoncer(VOL.reussi, VOL.atterrir, true);
    this.input.keyboard!.once('keydown-SPACE', () => this.repartir());
    this.time.delayedCall(400, () => {
      this.input.keyboard!.once('keydown-E', () => this.repartir());
    });
  }

  private repartir(): void {
    state.locked = false;
    this.scene.start('World', { room: 'chambre', x: 80, y: 108 });
  }

  private dire(texte: string): void {
    this.message.image.setPosition(Math.round((GB.W - measure(texte)) / 2), 4);
    this.message.setLines([texte], shadeHex(PALETTE, 0));
    this.time.delayedCall(900, () => this.message.setLines([''], shadeHex(PALETTE, 0)));
  }

  private annoncer(titre: string, sous: string, clair = false): void {
    const ink = shadeHex(PALETTE, clair ? 3 : 0);
    this.titre.image.setPosition(Math.round((GB.W - measure(titre)) / 2), 44);
    this.titre.setLines([titre], ink);
    this.sous.image.setPosition(Math.round((GB.W - measure(sous)) / 2), 58);
    this.sous.setLines([sous], ink);
  }
}
