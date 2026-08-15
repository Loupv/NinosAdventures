import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { animKey, texKey } from '../art/pixels';
import { state } from '../systems/state';
import { VOL } from '../data/textes';
import { jouer, jouerAmbiance, jouerMusique } from '../systems/audio';
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
/**
 * **La rafale.** C'était une impulsion d'un coup sur la vitesse latérale : amortie en deux
 * dixièmes de seconde et complètement noyée dès qu'on tenait une flèche, elle ne faisait rien
 * du tout. C'est maintenant **un vent qui souffle pendant une seconde** — il pousse de côté et
 * il soulève, et il faut corriger pendant qu'il dure. On peut lutter contre : le pilotage est
 * plus fort que le vent, mais il faut s'en occuper.
 */
const RAFALE_X = 42; // px/s de côté, pendant toute la rafale
const RAFALE_Y = 24; // px/s de haut en bas
const RAFALE_DUREE = 1100; // ms
const RAFALE_TOUS = 3600; // ms entre deux rafales
const HERON_POUSSE = 46; // le coup d'aile, en px/s
/** Le rebond sur une façade : plus fort qu'un héron, c'est un immeuble. */
const IMMEUBLE_POUSSE = 64;
/**
 * À partir de quelle distance une façade peut cogner. **Large exprès** : le rebond doit partir
 * à la première image où le mur touche Nino à l'écran, pas plus tard. C'était réglé si serré
 * que la façade lui passait dessus pendant un bon moment avant que quoi que ce soit n'arrive —
 * on avait déjà l'impression de s'être écrasé, et le jeu ne réagissait qu'après.
 */
const COGNE = 96;

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
const HERON_Z = 700;
/**
 * **Un parapente ne monte pas tout seul.** La flèche du haut n'existe plus : Nino descend
 * doucement, tout le temps — et il remonte dans les **colonnes d'air chaud**, des courants
 * ascendants qu'on voit venir de loin et qu'on va chercher au pilotage. La flèche du bas
 * pique, pour descendre plus vite exprès. C'est le vrai jeu du vol.
 */
const CHUTE = 8; // px/s : la descente permanente
const PORTANCE = 62; // px/s vers le haut, dans une colonne
const PIQUE = 46; // px/s de plus, flèche du bas
const THERMIQUE_TOUS = 2000; // ms entre deux colonnes
const THERMIQUE_Z = 850;
/** Demi-largeur d'une colonne, en unités du monde. */
const THERMIQUE_LARGE = 13;
/**
 * **Le vol accélère en approchant.** Le début est une promenade, la fin demande de piloter :
 * la vitesse d'avance gagne un tiers entre le saut et la maison, et les hérons suivent.
 */
const AVANCE_FIN = 24; // unités de z par seconde, en plus, à l'arrivée

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
  /** Le premier héron qu'on VOIT est annoncé — pas le premier qui naît, invisible au loin. */
  private heronAnnonce = false;

  private immeubles: Immeuble[] = [];
  private lignes: { z: number; go: Phaser.GameObjects.Rectangle }[] = [];
  private herons: Oiseau[] = [];
  /** Les colonnes d'air : trois tirets lumineux qui montent, et de la portance dedans. */
  private thermiques: { x: number; z: number; tirets: Phaser.GameObjects.Rectangle[] }[] = [];
  private prochainThermique = 1400;
  private nesThermiques = 0;
  private thermiqueDit = false;
  private porteDit = false;
  /** Les étoiles s'éteignent une à une à mesure que le jour approche. */
  private etoiles: Phaser.GameObjects.Rectangle[] = [];
  /** Les traînées du vent : visibles pendant une rafale, elles montrent d'où il pousse. */
  private trainees: Phaser.GameObjects.Rectangle[] = [];
  /** L'Erdre, qu'on survole à mi-vol : le seul repère que Nino connaît. */
  private riviere!: Phaser.GameObjects.Rectangle;
  private riviereZ = 0;
  private riviereDite = false;
  /** Le bandeau clair sous les annonces : sans lui, l'encre sombre se perdait sur le sol sombre. */
  private bandeau!: Phaser.GameObjects.Rectangle;
  private maison!: Phaser.GameObjects.Rectangle;
  private maisonToit!: Phaser.GameObjects.Rectangle;
  private porte!: Phaser.GameObjects.Rectangle;
  private cheminee!: Phaser.GameObjects.Rectangle;
  private fenetres: Phaser.GameObjects.Rectangle[] = [];
  private maisonZ = MAISON_Z;
  private annoncee = false;

  private prochaineRafale = RAFALE_TOUS;
  /** Le vent en cours : direction, et ce qu'il lui reste à souffler. */
  private vent = { x: 0, y: 0 };
  private ventReste = 0;
  private prochainHeron = HERON_TOUS;
  /** Compteurs : ils remplacent le hasard, pour que deux vols se ressemblent. */
  private nesImmeubles = 0;
  private nesHerons = 0;
  /** Combien de façades il a déjà prises : la deuxième fois, il s'excuse. */
  private cognes = 0;
  /** Combien de rafales ont soufflé : elles alternent de côté. */
  private rafales = 0;

  private keys!: Record<'action' | 'sortie' | 'left' | 'right' | 'up' | 'down', Phaser.Input.Keyboard.Key[]>;

  constructor() {
    super('Parapente');
  }

  create(): void {
    // De l'arcade, du saut à l'atterrissage : le vol est un jeu, sa musique le dit.
    jouerMusique(this, 'musique-parapente');
    // Pas de grillons à trois cents mètres : l'ambiance de nuit reprend à l'atterrissage.
    jouerAmbiance(this, undefined);
    this.etat = 'attente';
    this.px = GB.W / 2;
    this.py = 60;
    this.vx = 0;
    this.maisonZ = MAISON_Z;
    this.annoncee = false;
    this.prochaineRafale = RAFALE_TOUS;
    this.vent = { x: 0, y: 0 };
    this.ventReste = 0;
    this.prochainHeron = HERON_TOUS;
    this.thermiques = [];
    this.prochainThermique = 1400;
    this.nesThermiques = 0;
    this.thermiqueDit = false;
    this.porteDit = false;
    this.nesImmeubles = 0;
    this.nesHerons = 0;
    this.cognes = 0;
    this.rafales = 0;
    this.heronAnnonce = false;
    this.immeubles = [];
    this.lignes = [];
    this.herons = [];
    this.fenetres = [];
    this.etoiles = [];
    this.trainees = [];
    this.riviereZ = 950;
    this.riviereDite = false;
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
      this.etoiles.push(
        this.add.rectangle(x, y, 1, 1, shade(PALETTE, 3)).setOrigin(0, 0).setDepth(1),
      );
    }

    // La lune de Moon, encore là dans le ciel de l'aube : elle veille jusqu'au bout.
    this.add.image(20, 10, texKey('lune', PALETTE)).setOrigin(0, 0).setDepth(1);
    // Une lueur au ras de l'horizon : le jour arrive, c'est pour ça qu'on se presse.
    this.add.rectangle(0, HORIZON - 2, GB.W, 2, shade(PALETTE, 3)).setOrigin(0, 0).setDepth(2);

    // Le sol : tout ce qui est sous l'horizon. C'est la ville éteinte, vue de très haut.
    this.add
      .rectangle(0, HORIZON, GB.W, GB.H - HORIZON, shade(PALETTE, 0))
      .setOrigin(0, 0)
      .setDepth(2);

    // L'Erdre : une bande d'eau claire en travers du sol, qu'on survole à mi-vol.
    this.riviere = this.add.rectangle(0, 0, GB.W, 1, shade(PALETTE, 2)).setOrigin(0, 0).setDepth(4);

    // Trois traînées de vent, cachées : elles filent pendant une rafale, dans son sens.
    for (const y of [28, 66, 96]) {
      this.trainees.push(
        this.add.rectangle(0, y, 10, 1, shade(PALETTE, 3)).setOrigin(0, 0).setDepth(60).setVisible(false),
      );
    }

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
    // Une porte et une cheminée : trois rectangles font une maison, cinq en font une vraie.
    this.porte = this.add.rectangle(0, 0, 1, 1, shade(PALETTE, 1)).setOrigin(0, 0).setDepth(902);
    this.cheminee = this.add.rectangle(0, 0, 1, 1, shade(PALETTE, 1)).setOrigin(0, 0).setDepth(901);

    this.vol = this.add
      .image(this.px, this.py, texKey('parapente-vol', PALETTE))
      .setOrigin(0.5, 0.5)
      // **Toujours devant tout.** C'est lui qu'on regarde, et un immeuble qui lui passe par
      // dessus se lit comme un choc — alors que dans cette perspective, rien ne peut jamais
      // passer devant le point de vue.
      .setDepth(2000);

    this.bandeau = this.add
      .rectangle(0, 40, GB.W, 34, shade(PALETTE, 2))
      .setOrigin(0, 0)
      .setDepth(2090)
      .setVisible(false);
    this.titre = new PixelText(this, 'pp-titre', 0, 44, GB.W, 12);
    this.sous = new PixelText(this, 'pp-sous', 0, 58, GB.W, 12);
    this.message = new PixelText(this, 'pp-msg', 0, 4, GB.W, 12);
    for (const t of [this.titre, this.sous, this.message]) t.image.setDepth(2100);

    const kb = this.input.keyboard!;
    this.keys = {
      action: KEYS.action.map((c) => kb.addKey(c)),
      sortie: KEYS.cancel.map((c) => kb.addKey(c)),
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
    // ÉCHAP à tout moment : on n'est jamais enfermé dans le vol.
    if (this.etat !== 'fini' && this.keys.sortie.some((k) => Phaser.Input.Keyboard.JustDown(k))) {
      this.reposerSurLeToit();
      return;
    }

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
    this.lesThermiques(delta, dt);
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
      this.ventReste = RAFALE_DUREE;
      // Un compteur plutôt que le hasard : les rafales alternent, et elles soulèvent une fois
      // sur deux. Deux vols se ressemblent, c'est la règle de tout ce mini-jeu.
      const n = this.rafales++;
      this.vent = {
        x: n % 2 === 0 ? -RAFALE_X : RAFALE_X,
        y: n % 4 < 2 ? -RAFALE_Y : RAFALE_Y,
      };
      jouer(this, 'rafale', { volume: 0.6 });
      this.dire(VOL.rafale);
    }
    if (this.ventReste > 0) this.ventReste -= delta;

    const souffle = this.ventReste > 0 ? this.vent : { x: 0, y: 0 };
    // Les traînées : on voit le vent pendant qu'il souffle, et d'où il pousse.
    for (const t of this.trainees) {
      t.setVisible(this.ventReste > 0);
      if (this.ventReste > 0) {
        t.x = ((t.x + souffle.x * 4 * dt) % GB.W + GB.W) % GB.W;
      }
    }
    this.px = Phaser.Math.Clamp(this.px + (this.vx + souffle.x) * dt, 14, GB.W - 14);
    /**
     * **Plus de montée manuelle.** Nino descend doucement, tout le temps ; la flèche du
     * bas pique ; et la seule façon de remonter, c'est une colonne d'air — la portance
     * s'applique tant qu'on est dedans, et elle gagne largement sur la chute.
     */
    void haut;
    const portance = this.dansUneColonne() ? -PORTANCE : 0;
    const vy = CHUTE + (bas ? PIQUE : 0) + portance;
    this.py = Phaser.Math.Clamp(this.py + (vy + souffle.y) * dt, 18, GB.H - 26);
  }

  /** Vrai quand Nino est dans une colonne d'air proche : c'est là que ça monte. */
  private dansUneColonne(): boolean {
    for (const t of this.thermiques) {
      if (t.z > 110 || t.z < PROCHE - 6) continue;
      const sx = this.ecranX(t.x, Math.max(t.z, 32));
      const demi = Math.max(10, (THERMIQUE_LARGE * FOCALE) / Math.max(t.z, 32));
      if (Math.abs(sx - this.px) < demi) {
        if (!this.porteDit) {
          this.porteDit = true;
          this.dire(VOL.porte);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * **Les colonnes d'air.** Elles naissent au loin à des positions qui tournent sans se
   * répéter, elles viennent vers nous comme le reste du monde, et on les voit de très
   * loin : trois tirets qui montent, du sol vers le ciel. Le jeu du vol, c'est d'aller
   * les chercher.
   */
  private lesThermiques(delta: number, dt: number): void {
    this.prochainThermique -= delta;
    if (this.prochainThermique <= 0) {
      this.prochainThermique = THERMIQUE_TOUS;
      const n = this.nesThermiques++;
      const tirets = [0, 1, 2].map(() =>
        this.add.rectangle(0, 0, 2, 4, shade(PALETTE, 3)).setOrigin(0.5, 0).setDepth(80).setVisible(false),
      );
      this.thermiques.push({ x: ((n * 61) % 150) - 75, z: THERMIQUE_Z, tirets });
    }
    for (const t of [...this.thermiques]) {
      t.z -= this.allure() * dt;
      if (!this.thermiqueDit && t.z < 420) {
        this.thermiqueDit = true;
        this.dire(VOL.thermique);
      }
      if (t.z < PROCHE - 6) {
        t.tirets.forEach((d) => d.destroy());
        this.thermiques = this.thermiques.filter((x) => x !== t);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────── la ville

  /** Redonne à un immeuble une taille et une place, et l'envoie à la distance `z`. */
  private neuf(b: Immeuble, z: number): void {
    const n = this.nesImmeubles++;
    // Deux suites qui ne retombent pas en phase : ça suffit à ce qu'on ne voie pas la boucle.
    b.x = ((n * 53) % 200) - 100;
    // **À l'approche de la maison, la ville s'écarte.** Un immeuble qui renaît devant la
    // façade — avec sa fenêtre allumée — faisait concurrence à la cible au pire moment :
    // dans la dernière ligne droite, les nouveaux venus se rangent sur les bords.
    if (this.maisonZ < 420) b.x = (n % 2 === 0 ? -1 : 1) * (78 + ((n * 13) % 40));
    b.w = 22 + ((n * 17) % 26);
    // Hautes : il faut qu'une bonne moitié d'entre elles **dépasse l'horizon**, sinon on ne
    // survole pas une ville, on survole des dalles.
    b.h = 44 + ((n * 29) % 60);
    b.z = z;
    b.cogne = false;
  }

  /** La vitesse d'avance du moment : une promenade au saut, un vrai vol à l'arrivée. */
  private allure(): number {
    return AVANCE + AVANCE_FIN * (1 - Phaser.Math.Clamp(this.maisonZ / MAISON_Z, 0, 1));
  }

  private avancerLaVille(dt: number): void {
    for (const b of this.immeubles) {
      b.z -= this.allure() * dt;
      if (b.z < COGNE && !b.cogne) this.cogner(b);
      if (b.z < PROCHE) this.neuf(b, b.z + IMMEUBLES * PAS_Z);
    }
    for (const l of this.lignes) {
      l.z -= this.allure() * dt;
      if (l.z < PROCHE) l.z += LIGNES * PAS_LIGNE;
    }
    // L'Erdre passe une fois, à mi-vol. Le seul repère que Nino connaît : il le dit.
    if (this.riviereZ > 0) {
      this.riviereZ -= this.allure() * dt;
      if (!this.riviereDite && this.riviereZ < 340) {
        this.riviereDite = true;
        this.dire(VOL.erdre);
      }
      if (this.riviereZ < PROCHE) {
        this.riviereZ = -1;
        this.riviere.setVisible(false);
      }
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
      // Ils viennent plus souvent à mesure qu'on approche : la fin demande de piloter.
      this.prochainHeron =
        HERON_TOUS - 800 * (1 - Phaser.Math.Clamp(this.maisonZ / MAISON_Z, 0, 1));
      const n = this.nesHerons++;
      const go = this.add
        .sprite(0, 0, texKey('heron', PALETTE), 'vol-0')
        .setOrigin(0.5, 0.5)
        .setDepth(950)
        .setFlipX(n % 2 === 0)
        .play(animKey('heron-vol', PALETTE));
      // Ils arrivent en face, à des hauteurs et des côtés qui tournent sans se répéter.
      this.herons.push({ x: ((n * 37) % 120) - 60, y: ((n * 23) % 60) - 34, z: HERON_Z, go });
    }

    for (const h of [...this.herons]) {
      // Ils volent vers nous : leur vitesse s'ajoute à la nôtre.
      h.z -= (this.allure() + 40) * dt;
      // Le premier qu'on VOIT est annoncé — pas le premier qui naît, petit point invisible
      // au loin. « Des hérons ! » sort quand il y a un héron à l'écran.
      if (!this.heronAnnonce && h.z < 320) {
        this.heronAnnonce = true;
        jouer(this, 'heron', { volume: 0.5 });
        this.dire(VOL.heron);
      }
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
    this.maisonZ -= this.allure() * dt;
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

  /**
   * **Rater ne coûte rien, autant de fois qu'on veut.** Une rafale le remonte, la maison
   * repart un peu moins loin, et on recommence — un retry classique. ÉCHAP reste la seule
   * porte de sortie, à la demande.
   */
  private remonter(pourquoi: string): void {
    this.dire(pourquoi);
    this.maisonZ = MAISON_Z_RETOUR;
    this.annoncee = false;
    this.px = GB.W / 2;
    this.py = 60;
    this.vx = 0;
    this.ventReste = 0;
    this.prochaineRafale = RAFALE_TOUS;
  }

  /** ÉCHAP : le vent le ramène d'où il vient, et il repart quand il veut. */
  private reposerSurLeToit(): void {
    this.etat = 'fini';
    for (const h of this.herons) h.go.destroy();
    this.herons = [];
    jouer(this, 'rafale', { volume: 0.7 });
    this.annoncer(VOL.repose, VOL.reposeSuite, true);
    this.input.keyboard!.once('keydown-SPACE', () => {
      state.locked = false;
      this.scene.start('World', { room: 'tour-toit', x: 96, y: 122 });
    });
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
    // Le jour approche avec la maison : les étoiles s'éteignent une à une.
    const jour = 1 - Phaser.Math.Clamp(this.maisonZ / MAISON_Z, 0, 1);
    this.etoiles.forEach((e, i) => e.setVisible(jour < (i + 1) / 7));

    if (this.riviereZ > 0) {
      const y = this.ecranY(SOL, this.riviereZ);
      const epais = Math.max(2, Math.round((FOCALE * 26) / this.riviereZ));
      this.riviere.setPosition(0, Math.round(y - epais / 2)).setSize(GB.W, epais);
      this.riviere.setVisible(y < GB.H + epais);
    }

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

    for (const t of this.thermiques) {
      const zAffiche = Math.max(t.z, 32);
      const sx = Math.round(this.ecranX(t.x, zAffiche));
      const bas = this.ecranY(SOL, zAffiche);
      const haut = Math.max(14, HORIZON - (FOCALE * 30) / zAffiche);
      const visible = t.z < 640 && sx > -4 && sx < GB.W + 4 && bas > haut;
      t.tirets.forEach((d, i) => {
        d.setVisible(visible);
        if (!visible) return;
        // Chaque tiret monte en boucle, décalé d'un tiers : la colonne s'anime sans
        // dessin de plus.
        const cycle = ((this.time.now / 900 + i / 3) % 1 + 1) % 1;
        d.setPosition(sx, Math.round(Phaser.Math.Linear(bas, haut, cycle)));
        d.setSize(Math.max(1, Math.round((FOCALE * 2.4) / zAffiche)), 4);
        d.setDepth(80 + Math.round(1000 - t.z));
      });
    }

    for (const h of this.herons) {
      h.go.setPosition(Math.round(this.ecranX(h.x, h.z)), Math.round(this.ecranY(h.y, h.z)));
      h.go.setScale(Phaser.Math.Clamp((FOCALE / h.z) * 2.4, 0.5, 3));
      h.go.setDepth(100 + Math.round(1000 - h.z));
    }

    // Nino se penche du côté où il va : c'est un parapente, pas un ascenseur.
    this.vol.setAngle(Phaser.Math.Clamp(this.vx * 0.25, -16, 16));

    const visible = this.maisonZ < 900;
    this.maison.setVisible(visible);
    this.maisonToit.setVisible(visible);
    this.porte.setVisible(visible);
    this.cheminee.setVisible(visible);
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
    // **La cible clignote.** La fenêtre de Nino s'allume et s'éteint trois fois par seconde :
    // c'est ce qui la distingue de celle des parents, et c'est ce que le message annonce.
    this.fenetres[1].setFillStyle(
      shade(PALETTE, Math.floor(this.time.now / 320) % 2 === 0 ? 3 : 2),
    );
    // La porte, au milieu du rez-de-chaussée, et la cheminée sur le toit à gauche.
    const pg = this.ecranX(-6, z);
    const pd = this.ecranX(6, z);
    const ph = this.ecranY(SOL - 18, z);
    const pb = this.ecranY(SOL, z);
    this.porte
      .setPosition(Math.round(pg), Math.round(ph))
      .setSize(Math.max(1, Math.round(pd - pg)), Math.max(1, Math.round(pb - ph)));
    const cg = this.ecranX(-MAISON_LARGE / 2 + 20, z);
    const cd = this.ecranX(-MAISON_LARGE / 2 + 34, z);
    const ch = this.ecranY(-MAISON_HAUT / 2 - 14, z);
    const cb = this.ecranY(-MAISON_HAUT / 2, z);
    this.cheminee
      .setPosition(Math.round(cg), Math.round(ch))
      .setSize(Math.max(1, Math.round(cd - cg)), Math.max(1, Math.round(cb - ch)));

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

  private annoncer(titre: string, sous: string, _clair = false): void {
    // Toujours l'encre sombre, toujours sur le bandeau clair : lisible sur ciel comme sur sol.
    this.bandeau.setVisible(titre !== '' || sous !== '');
    const ink = shadeHex(PALETTE, 0);
    this.titre.image.setPosition(Math.round((GB.W - measure(titre)) / 2), 44);
    this.titre.setLines([titre], ink);
    this.sous.image.setPosition(Math.round((GB.W - measure(sous)) / 2), 58);
    this.sous.setLines([sous], ink);
  }
}
