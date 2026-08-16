import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { animKey, texKey } from '../art/pixels';
import { state } from '../systems/state';
import { jouer, jouerMusique } from '../systems/audio';
import { FUSEE } from '../data/textes';
import { PixelText, measure } from '../ui/PixelText';

/**
 * Le rêve du grand lit : Nino traverse un ciel sur une fusée.
 *
 * Réglé pour un enfant de sept ans : chute lente, battement d'ailes généreux, trous
 * larges, et **aucune punition** — quand on touche, on recommence d'un appui, sans
 * jamais rien perdre. Huit tuyaux passés et on gagne une pièce à collectionner.
 *
 * Ces huit tuyaux ne se ressemblent pas : le premier est large et lent, le dernier étroit et
 * rapide, et à partir du cinquième le passage se balance. C'est ce qui fait qu'on a envie de le
 * refaire — le rêve raconte une petite montée, pas cinq fois la même chose.
 */
const PALETTE = 'tv' as const;

const GRAVITE = 260; // px/s²
const BATTEMENT = 110; // px/s vers le haut
const SOL = 16; // bande de sol en bas
const OBJECTIF = 8; // tuyaux à passer
const NUAGES = 12; // px/s : ils défilent plus lentement que les tuyaux, donc plus loin

/**
 * **Ça se resserre à mesure qu'on avance.** Le rêve commençait et finissait à la même difficulté :
 * cinq tuyaux identiques, aucune raison de continuer autrement que pour compter. Maintenant le
 * défilement accélère, le passage rétrécit et les tuyaux se rapprochent — doucement, et jusqu'à un
 * plancher qui reste jouable à sept ans.
 *
 * `douceur` va de 0 (premier tuyau) à 1 (objectif atteint), et tout en découle.
 */
const VITESSE = { debut: 42, fin: 68 }; // px/s de défilement
const TROU = { debut: 52, fin: 36 }; // hauteur du passage
const ECART = { debut: 100, fin: 78 }; // distance entre deux tuyaux
/** À partir de ce score, les tuyaux se mettent à monter et descendre tout doucement. */
const DANSE = 4;
const DANSE_AMPLITUDE = 10;
const DANSE_VITESSE = 0.9;

interface Tuyau {
  haut: Phaser.GameObjects.TileSprite;
  bas: Phaser.GameObjects.TileSprite;
  /** Les deux embouts, à l'entrée du passage. */
  boutHaut: Phaser.GameObjects.Image;
  boutBas: Phaser.GameObjects.Image;
  /** Le milieu du passage, et la phase de son balancement. */
  trou: number;
  phase: number;
  /**
   * La hauteur de **son** passage, figée au moment où il est placé. Elle se lisait sur le score à
   * chaque image : le tuyau qu'on était en train de traverser rétrécissait au moment même où il
   * comptait un point, et on mourait dedans sans avoir bougé.
   */
  hauteur: number;
  /** Vrai quand le canard l'a déjà dépassé : on ne compte qu'une fois. */
  compte: boolean;
}

export class FlappyScene extends Phaser.Scene {
  private fusee!: Phaser.GameObjects.Sprite;
  private vy = 0;
  private tuyaux: Tuyau[] = [];
  private score = 0;
  private etat: 'attente' | 'vol' | 'perdu' | 'gagne' = 'attente';
  /** L'heure de la victoire : l'écran refuse de se fermer pendant la lecture. */
  private gagneA = 0;
  private titre!: PixelText;
  private sous!: PixelText;
  /** Le fond clair posé sous les deux lignes : sans lui, elles tombent sur un tuyau noir. */
  private bandeau!: Phaser.GameObjects.Rectangle;
  private compteur!: PixelText;
  private nuages: Phaser.GameObjects.Image[] = [];
  private touches!: { action: Phaser.Input.Keyboard.Key[]; sortie: Phaser.Input.Keyboard.Key[] };

  constructor() {
    super('Flappy');
  }

  create(): void {
    state.palette = PALETTE;
    // Le rêve a sa musique à lui — et tant que le fichier n'est pas posé, ça coupe
    // simplement celle de la maison : on rêve en silence.
    jouerMusique(this, 'musique-fusee');
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

    // Des nuages, très lents : c'est ce qui donne la sensation de voler. Un retournement sur deux,
    // pour qu'on ne voie pas que c'est quatre fois le même dessin.
    this.nuages = [
      this.add.image(30, 22, texKey('nuage', PALETTE)),
      this.add.image(96, 44, texKey('nuage', PALETTE)).setFlipX(true),
      this.add.image(140, 14, texKey('nuage', PALETTE)),
      this.add.image(60, 68, texKey('nuage', PALETTE)).setFlipX(true),
    ].map((n) => n.setOrigin(0, 0).setDepth(-50));

    this.fusee = this.add
      .sprite(40, 60, texKey('fusee', PALETTE), 'vol-0')
      .setOrigin(0.5, 0.5)
      // Deux fois le dessin : sinon Nino est illisible sur tout ce ciel.
      .setScale(2)
      .setDepth(20)
      .play(animKey('fusee-vol', PALETTE));

    this.compteur = new PixelText(this, 'fl-score', 6, 5, 40, 13);
    this.bandeau = this.add
      .rectangle(0, 96, GB.W, 30, ciel)
      .setOrigin(0, 0)
      .setDepth(55)
      .setVisible(false);
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
        // **On martèle ESPACE pour voler** : sans ce délai, l'appui suivant fermait
        // l'écran de victoire avant qu'on ait pu lire le nom de la pièce gagnée.
        if (this.etat === 'gagne' && this.time.now - this.gagneA > 1800) this.repartir();
        else if (this.etat === 'gagne') { /* trop tôt : on laisse lire */ }
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

    const v = this.entre(VITESSE);
    for (const t of this.tuyaux) {
      t.haut.x -= v * dt;
      // Passé quelques tuyaux, le passage se met à monter et descendre tout doucement.
      if (this.score >= DANSE) {
        t.phase += DANSE_VITESSE * dt;
        t.trou += Math.cos(t.phase) * DANSE_AMPLITUDE * DANSE_VITESSE * dt;
      }
      this.poser(t, t.haut.x);
      // On ne compte qu'une fois le tuyau **entièrement** derrière la boîte de collision : compté
      // au milieu du canard, le point tombait alors qu'un bout de tuyau le frôlait encore.
      if (!t.compte && t.haut.x + 16 < this.fusee.x - 5) {
        t.compte = true;
        this.score += 1;
        this.majCompteur();
        if (this.score >= OBJECTIF) {
          this.gagner();
          return;
        }
      }
      // Recyclage : le tuyau sorti à gauche repart à droite, à une hauteur neuve.
      if (t.haut.x + 16 < -4) this.replacer(t, this.plusADroite() + this.entre(ECART));
    }

    if (this.touche()) this.perdre();
  }

  // ─────────────────────────────────────────────────────────────── mécanique

  /**
   * **Où en est la difficulté**, de 0 au premier tuyau à 1 à l'objectif. Tout ce qui se resserre —
   * la vitesse, le passage, l'écart — se lit sur cette même courbe.
   */
  private entre(bornes: { debut: number; fin: number }): number {
    const t = Phaser.Math.Clamp(this.score / OBJECTIF, 0, 1);
    return bornes.debut + (bornes.fin - bornes.debut) * t;
  }

  private reinitialiser(): void {
    this.tuyaux.forEach((t) => {
      t.haut.destroy();
      t.bas.destroy();
      t.boutHaut.destroy();
      t.boutBas.destroy();
    });
    this.tuyaux = [];
    this.score = 0;
    this.vy = 0;
    this.fusee.setPosition(40, 60).setAngle(0);
    const ecart = this.entre(ECART);
    for (let i = 0; i < 3; i++) this.tuyaux.push(this.nouveauTuyau(GB.W + 20 + i * ecart));
    this.majCompteur();
  }

  /**
   * **Un tuyau dessiné, pas deux rectangles.** Le corps se répète à l'infini (`tileSprite`) et
   * l'embout marque l'entrée du passage : c'est lui qu'on regarde en visant.
   */
  private nouveauTuyau(x: number): Tuyau {
    const corps = () =>
      this.add
        .tileSprite(x, 0, 16, 8, texKey('tuyau-corps', PALETTE))
        .setOrigin(0, 0)
        .setDepth(10);
    const bout = () =>
      this.add.image(x, 0, texKey('tuyau-bout', PALETTE)).setOrigin(0, 0).setDepth(11);
    const t: Tuyau = {
      haut: corps(),
      bas: corps(),
      boutHaut: bout(),
      boutBas: bout(),
      trou: GB.H / 2,
      phase: 0,
      hauteur: this.entre(TROU),
      compte: false,
    };
    this.replacer(t, x);
    return t;
  }

  /** Repositionne un tuyau à droite, avec un passage à une hauteur tirée au hasard. */
  private replacer(t: Tuyau, x: number): void {
    t.hauteur = this.entre(TROU);
    const marge = 14 + t.hauteur / 2;
    t.trou = Phaser.Math.Between(marge, GB.H - SOL - marge);
    t.phase = Math.random() * Math.PI * 2;
    t.compte = false;
    this.poser(t, x);
  }

  /** Redessine un tuyau là où il en est : deux colonnes, deux embouts, un passage au milieu. */
  private poser(t: Tuyau, x: number): void {
    const marge = 14 + t.hauteur / 2;
    t.trou = Phaser.Math.Clamp(t.trou, marge, GB.H - SOL - marge);
    const haut = Math.round(t.trou - t.hauteur / 2);
    const bas = Math.round(t.trou + t.hauteur / 2);
    t.haut.setPosition(x, 0).setSize(16, Math.max(1, haut - 6));
    t.boutHaut.setPosition(x, haut - 6).setFlipY(true);
    t.bas.setPosition(x, bas + 6).setSize(16, Math.max(1, GB.H - SOL - bas - 6));
    t.boutBas.setPosition(x, bas);
  }

  private plusADroite(): number {
    return this.tuyaux.reduce((m, t) => Math.max(m, t.haut.x), 0);
  }

  /** Boîte de collision volontairement plus petite que le dessin : on pardonne. */
  private touche(): boolean {
    if (this.fusee.y < 4 || this.fusee.y > GB.H - SOL - 4) return true;
    const c = new Phaser.Geom.Rectangle(this.fusee.x - 4, this.fusee.y - 3, 8, 6);
    // Les embouts font partie du tuyau : sans eux, on passait au travers des deux becs.
    return this.tuyaux.some((t) =>
      [t.haut, t.bas, t.boutHaut, t.boutBas].some((p) =>
        Phaser.Geom.Intersects.RectangleToRectangle(c, p.getBounds()),
      ),
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
    this.gagneA = this.time.now;
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
    this.bandeau.setVisible(titre !== '' || sous !== '');
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
