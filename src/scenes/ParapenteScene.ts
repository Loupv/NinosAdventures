import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { animKey, texKey } from '../art/pixels';
import { state } from '../systems/state';
import { VOL } from '../data/textes';
import { jouer } from '../systems/audio';
import { PixelText, measure } from '../ui/PixelText';

/**
 * Le vol depuis le toit de la Tour de Bretagne jusqu'à la fenêtre de sa chambre.
 *
 * Réglé comme le rêve de la fusée : **aucune punition**. Rater ne fait pas perdre, une
 * rafale remonte Nino et il recommence. Il y a deux fenêtres sur la façade, la sienne et
 * celle des parents — viser la mauvaise allume une lumière, et ça remonte aussi.
 *
 * **Les hérons** traversent l'écran pendant la descente. Les toucher ne fait pas perdre
 * non plus : le héron proteste et l'écarte d'un grand coup d'aile, ce qui suffit largement
 * à faire manquer la fenêtre. Ce sont les hérons de l'Erdre, et ils rentrent à la même
 * heure que lui.
 */
/**
 * Il saute au petit matin, la ville est encore éteinte et sa fenêtre est la seule chose
 * claire. La palette de l'aube, comme le toit d'où il vient.
 */
const PALETTE = 'ville-aube' as const;

const CHUTE = 15; // px/s de descente
const PILOTAGE = 52; // px/s en virage
const RAFALE = 26; // poussée latérale du vent, en px/s
const RAFALE_TOUS = 1400; // ms entre deux rafales
const TOIT = 104; // hauteur de la façade à l'écran
const DEPART = 10; // hauteur de départ du parapente

/** Les hérons : un toutes les deux secondes environ, et ils poussent fort. */
const HERON_TOUS = 2100; // ms entre deux hérons
const HERON_VITESSE = 44; // px/s
const HERON_POUSSE = 70; // px/s de coup d'aile

/** Les deux fenêtres de la façade, en pixels écran. */
const CHAMBRE = { x: 104, w: 20 };
const PARENTS = { x: 40, w: 20 };

export class ParapenteScene extends Phaser.Scene {
  private vol!: Phaser.GameObjects.Image;
  private vx = 0;
  private etat: 'attente' | 'vol' | 'fini' = 'attente';
  private titre!: PixelText;
  private sous!: PixelText;
  private message!: PixelText;
  private toits: Phaser.GameObjects.Rectangle[] = [];
  private prochaineRafale = RAFALE_TOUS;
  private herons: Phaser.GameObjects.Sprite[] = [];
  private prochainHeron = HERON_TOUS;
  /** Combien de hérons sont déjà passés : ça décide de leur hauteur, sans hasard.  */
  private heronsPasses = 0;
  private keys!: Record<'action' | 'left' | 'right', Phaser.Input.Keyboard.Key[]>;

  constructor() {
    super('Parapente');
  }

  create(): void {
    this.etat = 'attente';
    this.vx = 0;
    this.toits = [];
    this.prochaineRafale = RAFALE_TOUS;
    this.herons = [];
    this.prochainHeron = HERON_TOUS;
    this.heronsPasses = 0;
    state.palette = PALETTE;

    // **Le ciel prend le ton moyen, pas le plus clair** : à l'aube il fait gris, et surtout
    // c'est ce qui laisse le ton clair à la seule chose qui doit sauter aux yeux — sa
    // fenêtre. Tout le reste descend en silhouettes de plus en plus sombres.
    this.cameras.main.setBackgroundColor(shadeHex(PALETTE, 2));

    // La ville, loin en dessous : des toits qui glissent lentement.
    for (let i = 0; i < 9; i++) {
      const h = 6 + ((i * 7) % 14);
      const r = this.add
        .rectangle(i * 22, TOIT - 14 - h, 18, h, shade(PALETTE, 1))
        .setOrigin(0, 0)
        .setDepth(1);
      this.toits.push(r);
    }

    // La maison, en bas. Deux fenêtres : la sienne, éclairée, et celle des parents, éteinte.
    this.add
      .rectangle(0, TOIT, GB.W, GB.H - TOIT, shade(PALETTE, 0))
      .setOrigin(0, 0)
      .setDepth(5);
    this.add
      .rectangle(0, TOIT, GB.W, 2, shade(PALETTE, 1))
      .setOrigin(0, 0)
      .setDepth(6);
    for (const [f, nom] of [
      [PARENTS, 'parents'],
      [CHAMBRE, 'chambre'],
    ] as const) {
      this.add
        .rectangle(f.x, TOIT + 6, f.w, 16, shade(PALETTE, nom === 'chambre' ? 3 : 1))
        .setOrigin(0, 0)
        .setDepth(7);
      this.add
        .rectangle(f.x - 1, TOIT + 5, f.w + 2, 18, shade(PALETTE, 1))
        .setOrigin(0, 0)
        .setDepth(6);
    }

    this.vol = this.add
      .image(GB.W / 2, DEPART, texKey('parapente-vol', PALETTE))
      .setOrigin(0.5, 0)
      .setDepth(20);

    this.titre = new PixelText(this, 'pp-titre', 0, 44, GB.W, 12);
    this.sous = new PixelText(this, 'pp-sous', 0, 58, GB.W, 12);
    this.message = new PixelText(this, 'pp-msg', 0, 4, GB.W, 12);
    for (const t of [this.titre, this.sous, this.message]) t.image.setDepth(40);

    const kb = this.input.keyboard!;
    this.keys = {
      action: KEYS.action.map((c) => kb.addKey(c)),
      left: KEYS.left.map((c) => kb.addKey(c)),
      right: KEYS.right.map((c) => kb.addKey(c)),
    };

    this.annoncer(VOL.consigne, VOL.demarrer);
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const appui = this.keys.action.some((k) => Phaser.Input.Keyboard.JustDown(k));

    if (this.etat === 'attente') {
      if (appui) {
        this.etat = 'vol';
        this.annoncer('', '');
      }
      return;
    }
    if (this.etat === 'fini') return;

    // Pilotage : gauche / droite, et le vent qui s'en mêle.
    const gauche = this.keys.left.some((k) => k.isDown);
    const droite = this.keys.right.some((k) => k.isDown);
    this.vx = (gauche ? -PILOTAGE : 0) + (droite ? PILOTAGE : 0) + this.vx * 0.9;
    this.prochaineRafale -= delta;
    if (this.prochaineRafale <= 0) {
      this.prochaineRafale = RAFALE_TOUS;
      this.vx += Math.random() < 0.5 ? -RAFALE : RAFALE;
      jouer(this, 'rafale', { volume: 0.6 });
      this.dire(VOL.rafale);
    }

    this.vol.x = Phaser.Math.Clamp(this.vol.x + this.vx * dt, 12, GB.W - 12);
    this.vol.y += CHUTE * dt;
    this.lesHerons(delta, dt);

    // Les toits défilent : c'est ce qui donne l'altitude.
    for (const r of this.toits) {
      r.x -= 6 * dt;
      if (r.x < -20) r.x += 22 * 9;
    }

    // Arrivée : on regarde où sont ses pieds.
    if (this.vol.y + this.vol.height < TOIT + 8) return;
    const pieds = this.vol.x;
    if (pieds > CHAMBRE.x && pieds < CHAMBRE.x + CHAMBRE.w) this.rentrer();
    else if (pieds > PARENTS.x && pieds < PARENTS.x + PARENTS.w) this.remonter(VOL.lumiere);
    else this.remonter(VOL.rate);
  }

  /**
   * Les hérons traversent, et se font bousculer. Ils partent d'un bord au hasard du
   * compte — pas du hasard, pour que deux parties se ressemblent — à une hauteur qui ne
   * tombe jamais pile sur la précédente.
   */
  private lesHerons(delta: number, dt: number): void {
    this.prochainHeron -= delta;
    if (this.prochainHeron <= 0) {
      this.prochainHeron = HERON_TOUS;
      const versLaDroite = this.heronsPasses % 2 === 0;
      // Entre le toit de la tour et les toits de la ville : jamais dans les vingt derniers
      // pixels, sinon il n'y a plus moyen de viser la fenêtre.
      const y = 26 + ((this.heronsPasses * 17) % 52);
      const h = this.add
        .sprite(versLaDroite ? -14 : GB.W + 14, y, texKey('heron', PALETTE), 'vol-0')
        .setOrigin(0.5, 0.5)
        .setDepth(18)
        .setFlipX(!versLaDroite)
        .play(animKey('heron-vol', PALETTE));
      h.setData('vx', versLaDroite ? HERON_VITESSE : -HERON_VITESSE);
      this.herons.push(h);
      this.heronsPasses += 1;
      jouer(this, 'heron', { volume: 0.4 });
      this.dire(VOL.heron);
    }

    for (const h of [...this.herons]) {
      h.x += (h.getData('vx') as number) * dt;
      if (h.x < -20 || h.x > GB.W + 20) {
        h.destroy();
        this.herons = this.herons.filter((x) => x !== h);
        continue;
      }
      // Touché : il se fait écarter d'un coup d'aile, du côté où le héron allait.
      const dx = Math.abs(h.x - this.vol.x);
      const dy = Math.abs(h.y - (this.vol.y + this.vol.height / 2));
      if (dx < 10 && dy < 8) {
        this.vx = Math.sign(h.getData('vx') as number) * HERON_POUSSE;
        jouer(this, 'heron', { volume: 0.7 });
        this.dire(VOL.heronTouche);
        h.destroy();
        this.herons = this.herons.filter((x) => x !== h);
      }
    }
  }

  /** Rater ne coûte rien : le vent le remet en haut et il recommence. */
  private remonter(pourquoi: string): void {
    this.dire(pourquoi);
    this.vol.y = DEPART;
    this.vol.x = GB.W / 2;
    this.vx = 0;
    this.prochaineRafale = RAFALE_TOUS;
    this.prochainHeron = HERON_TOUS;
  }

  private rentrer(): void {
    this.etat = 'fini';
    // Le ciel se vide : l'écran d'arrivée n'a pas besoin d'un héron en travers du texte.
    for (const h of this.herons) h.destroy();
    this.herons = [];
    state.setFlag('parapente-rentre');
    state.give('parapente');
    state.save();
    jouer(this, 'objet-trouve', { volume: 0.6 });
    this.annoncer(VOL.reussi, VOL.atterrir);
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

  private annoncer(titre: string, sous: string): void {
    const ink = shadeHex(PALETTE, 0);
    this.titre.image.setPosition(Math.round((GB.W - measure(titre)) / 2), 44);
    this.titre.setLines([titre], ink);
    this.sous.image.setPosition(Math.round((GB.W - measure(sous)) / 2), 58);
    this.sous.setLines([sous], ink);
  }
}
