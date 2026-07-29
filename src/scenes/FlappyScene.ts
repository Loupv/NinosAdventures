import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { animKey, texKey } from '../art/pixels';
import { state } from '../systems/state';
import { jouer } from '../systems/audio';
import { FUSEE } from '../data/textes';
import { PixelText, measure } from '../ui/PixelText';

/**
 * Le rêve du grand lit : Nino traverse un ciel sur une fusée.
 *
 * Réglé pour un enfant de sept ans : chute lente, battement d'ailes généreux, trous
 * larges, et **aucune punition** — quand on touche, on recommence d'un appui, sans
 * jamais rien perdre. Cinq tuyaux passés et on gagne une pièce à collectionner.
 */
const PALETTE = 'tv' as const;

const GRAVITE = 260; // px/s²
const BATTEMENT = 110; // px/s vers le haut
const VITESSE = 42; // px/s de défilement
const ECART = 96; // distance entre deux tuyaux
const TROU = 48; // hauteur du passage
const SOL = 16; // bande de sol en bas
const OBJECTIF = 5; // tuyaux à passer
const NUAGES = 12; // px/s : ils défilent plus lentement que les tuyaux, donc plus loin

interface Tuyau {
  haut: Phaser.GameObjects.Rectangle;
  bas: Phaser.GameObjects.Rectangle;
  /** Vrai quand le canard l'a déjà dépassé : on ne compte qu'une fois. */
  compte: boolean;
}

export class FlappyScene extends Phaser.Scene {
  private fusee!: Phaser.GameObjects.Sprite;
  private vy = 0;
  private tuyaux: Tuyau[] = [];
  private score = 0;
  private etat: 'attente' | 'vol' | 'perdu' | 'gagne' = 'attente';
  private titre!: PixelText;
  private sous!: PixelText;
  private compteur!: PixelText;
  private nuages: Phaser.GameObjects.Rectangle[] = [];
  private touches!: { action: Phaser.Input.Keyboard.Key[]; sortie: Phaser.Input.Keyboard.Key[] };

  constructor() {
    super('Flappy');
  }

  create(): void {
    state.palette = PALETTE;
    const ciel = shade(PALETTE, 3);

    this.add.rectangle(0, 0, GB.W, GB.H, ciel).setOrigin(0, 0).setDepth(-100);
    // Le sol, et le trait qui le sépare du ciel.
    this.add
      .rectangle(0, GB.H - SOL, GB.W, SOL, shade(PALETTE, 1))
      .setOrigin(0, 0)
      .setDepth(50);
    this.add
      .rectangle(0, GB.H - SOL, GB.W, 1, shade(PALETTE, 0))
      .setOrigin(0, 0)
      .setDepth(51);

    // Des nuages, très lents : c'est ce qui donne la sensation de voler.
    this.nuages = [
      this.add.rectangle(30, 24, 20, 4, shade(PALETTE, 2)),
      this.add.rectangle(96, 40, 14, 3, shade(PALETTE, 2)),
      this.add.rectangle(140, 18, 24, 4, shade(PALETTE, 2)),
      this.add.rectangle(60, 70, 16, 3, shade(PALETTE, 2)),
    ].map((n) => n.setOrigin(0, 0).setDepth(-50));

    this.fusee = this.add
      .sprite(40, 60, texKey('fusee', PALETTE), 'vol-0')
      .setOrigin(0.5, 0.5)
      // Deux fois le dessin : sinon Nino est illisible sur tout ce ciel.
      .setScale(2)
      .setDepth(20)
      .play(animKey('fusee-vol', PALETTE));

    this.compteur = new PixelText(this, 'fl-score', 6, 5, 40, 13);
    // Dans le bas de l'écran : le canard vole en haut, le texte ne doit pas le couvrir.
    this.titre = new PixelText(this, 'fl-titre', 0, 98, GB.W, 13);
    this.sous = new PixelText(this, 'fl-sous', 0, 112, GB.W, 13);
    this.titre.image.setDepth(60);
    this.sous.image.setDepth(60);
    this.compteur.image.setDepth(60);

    const kb = this.input.keyboard!;
    this.touches = {
      action: [...KEYS.action, ...KEYS.up].map((c) => kb.addKey(c)),
      sortie: KEYS.cancel.map((c) => kb.addKey(c)),
    };

    this.reinitialiser();
    this.annoncer(FUSEE.consigne, FUSEE.demarrer);
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const appui = this.touches.action
      .map((k) => Phaser.Input.Keyboard.JustDown(k))
      .some(Boolean);
    const sortie = this.touches.sortie
      .map((k) => Phaser.Input.Keyboard.JustDown(k))
      .some(Boolean);

    // **On peut toujours se réveiller** : ÉCHAP sort du rêve à tout moment, gagné ou pas.
    // Sans ça, un joueur qui n'arrive pas à passer cinq tuyaux resterait enfermé dedans.
    if (sortie) {
      this.repartir();
      return;
    }

    for (const n of this.nuages) {
      n.x -= NUAGES * dt;
      if (n.x + n.width < 0) {
        n.x = GB.W + Phaser.Math.Between(0, 40);
        n.y = Phaser.Math.Between(10, 80);
      }
    }

    if (this.etat === 'attente') {
      // Il flotte sur place, en attendant qu'on se décide.
      this.fusee.y = 60 + Math.sin(this.time.now / 260) * 3;
      if (appui) {
        this.etat = 'vol';
        this.vy = -BATTEMENT;
        jouer(this, 'prout', { volume: 0.9 });
        this.annoncer('', '');
      }
      return;
    }

    if (this.etat !== 'vol') {
      if (appui) {
        if (this.etat === 'gagne') this.repartir();
        else {
          this.reinitialiser();
          this.annoncer(FUSEE.score(this.score), `${FUSEE.reessayer}   ${FUSEE.abandonner}`);
          this.etat = 'attente';
        }
      }
      return;
    }

    if (appui) {
      this.vy = -BATTEMENT;
      // La fonctionnalité la plus importante du projet.
      jouer(this, 'prout', { volume: 0.9 });
    }
    this.vy += GRAVITE * dt;
    this.fusee.y += this.vy * dt;
    this.fusee.setAngle(Phaser.Math.Clamp(this.vy * 0.12, -20, 45));

    for (const t of this.tuyaux) {
      t.haut.x -= VITESSE * dt;
      t.bas.x = t.haut.x;
      if (!t.compte && t.haut.x + t.haut.width < this.fusee.x) {
        t.compte = true;
        this.score += 1;
        this.majCompteur();
        if (this.score >= OBJECTIF) {
          this.gagner();
          return;
        }
      }
      // Recyclage : le tuyau sorti à gauche repart à droite, à une hauteur neuve.
      if (t.haut.x + t.haut.width < -4) this.replacer(t, this.plusADroite() + ECART);
    }

    if (this.touche()) this.perdre();
  }

  // ─────────────────────────────────────────────────────────────── mécanique

  private reinitialiser(): void {
    this.tuyaux.forEach((t) => {
      t.haut.destroy();
      t.bas.destroy();
    });
    this.tuyaux = [];
    this.score = 0;
    this.vy = 0;
    this.fusee.setPosition(40, 60).setAngle(0);
    for (let i = 0; i < 3; i++) this.tuyaux.push(this.nouveauTuyau(GB.W + 20 + i * ECART));
    this.majCompteur();
  }

  private nouveauTuyau(x: number): Tuyau {
    const dark = shade(PALETTE, 0);
    const light = shade(PALETTE, 2);
    const faire = () =>
      this.add.rectangle(x, 0, 16, 8, light).setOrigin(0, 0).setDepth(10).setStrokeStyle(1, dark);
    const t: Tuyau = { haut: faire(), bas: faire(), compte: false };
    this.replacer(t, x);
    return t;
  }

  /** Repositionne un tuyau à droite, avec un trou à une hauteur tirée au hasard. */
  private replacer(t: Tuyau, x: number): void {
    const hautMin = 12;
    const hautMax = GB.H - SOL - TROU - 12;
    const y = Phaser.Math.Between(hautMin, hautMax);
    t.haut.setPosition(x, 0).setSize(16, y);
    t.bas.setPosition(x, y + TROU).setSize(16, GB.H - SOL - (y + TROU));
    t.compte = false;
  }

  private plusADroite(): number {
    return this.tuyaux.reduce((m, t) => Math.max(m, t.haut.x), 0);
  }

  /** Boîte de collision volontairement plus petite que le dessin : on pardonne. */
  private touche(): boolean {
    if (this.fusee.y < 4 || this.fusee.y > GB.H - SOL - 4) return true;
    const c = new Phaser.Geom.Rectangle(this.fusee.x - 4, this.fusee.y - 3, 8, 6);
    return this.tuyaux.some(
      (t) =>
        Phaser.Geom.Intersects.RectangleToRectangle(c, t.haut.getBounds()) ||
        Phaser.Geom.Intersects.RectangleToRectangle(c, t.bas.getBounds()),
    );
  }

  // ──────────────────────────────────────────────────────────────── écrans

  private perdre(): void {
    this.etat = 'perdu';
    this.cameras.main.shake(200, 0.008);
    this.annoncer(FUSEE.score(this.score), `${FUSEE.reessayer}   ${FUSEE.abandonner}`);
  }

  private gagner(): void {
    this.etat = 'gagne';
    const neuve = !state.pieces.has('reve');
    state.pieces.add('reve');
    jouer(this, 'piece', { volume: 0.8 });
    state.save();
    this.add
      .image(GB.W / 2 - 8, 60, texKey('piece', PALETTE))
      .setOrigin(0, 0)
      .setScale(2)
      .setDepth(30);
    this.annoncer(
      neuve ? FUSEE.gagnePiece : FUSEE.gagneEncore,
      FUSEE.reveil,
    );
  }

  private annoncer(titre: string, sous: string): void {
    const ink = shadeHex(PALETTE, 0);
    this.titre.image.setPosition(Math.round((GB.W - measure(titre)) / 2), 98);
    this.titre.setLines([titre], ink);
    this.sous.image.setPosition(Math.round((GB.W - measure(sous)) / 2), 112);
    this.sous.setLines([sous], ink);
  }

  private majCompteur(): void {
    this.compteur.setLines([`${this.score}/${OBJECTIF}`], shadeHex(PALETTE, 0));
  }

  /**
   * Retour dans la chambre des parents : Nino se réveille.
   *
   * **On pose le flag du rêve dans les deux cas**, qu'on ait gagné la pièce ou qu'on se soit
   * réveillé en cours de route : c'est lui qui fait apparaître Hermione au bord du lit, et
   * la chasse ne doit jamais dépendre de l'adresse de personne.
   */
  private repartir(): void {
    state.setFlag('reve-fait');
    state.save();
    state.locked = false;
    this.scene.start('World', { room: 'chambre-parents', x: 80, y: 70 });
  }
}
