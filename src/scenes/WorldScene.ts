import Phaser from 'phaser';
import { GB, GRAVITY, KEYS } from '../config';
import { THEMES, SOLID } from '../art/tiles';
import { paletteNocturne, shadeHex, type PaletteId } from '../art/palette';
import { animKey, blankCanvas, paintArt, texKey } from '../art/pixels';
import { ROOMS, nomDuLieu, type Door, type Room, type RoomObject } from '../data/rooms';
import { CHARACTER_SPRITES } from '../data/characters';
import { ITEMS } from '../data/items';
import { pickBeat, type Effects, type Montre } from '../data/dialogues';
import { fraicheur, labelFraicheur } from '../data/fraicheur';
import {
  ANNONCES,
  ARAIGNEE_PARTIE,
  CHALEUR,
  CHANSON,
  COUPLETS,
  DIVERSION,
  FETE,
  HAIKUS,
  LE_CHAT,
  PARENTS,
  POISSON,
  PRESENTATION_ARAIGNEE,
  REFUS,
  RENCONTRE,
  RETIRE,
  SAUVE_MOI,
  SEMBLANT,
  SORTIR_DU_LIT,
  VIE,
} from '../data/textes';
import { CACHETTES, cachetteActuelle, hermioneSuit, rappel } from '../data/hermione';
import { state } from '../systems/state';
import { EV, bus, say, toast, type Buttons } from '../systems/bus';
import { gbFade, portalWarp, sparkle, splash } from '../systems/fx';
import { jouer } from '../systems/audio';
import { Player, type ViewMode } from '../entities/Player';
import { ETAPES, type Etape } from '../dev/etapes';
import { PixelText, measure } from '../ui/PixelText';

/**
 * Hermione suit Nino sur ses traces : on garde ses positions passées, et elle avance
 * dessus. `TRACE` est la longueur de cette mémoire, `ECART` la distance en dessous de
 * laquelle elle s'arrête — sans ça, dès que Nino s'immobilise, elle lui monte dessus.
 */
const TRACE = 34;
const ECART = 16;

interface Live {
  def: RoomObject;
  go: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
}

/**
 * Un personnage qui ne reste pas planté : il vise un point au hasard autour de son
 * point d'origine, y va lentement, souffle un moment, puis recommence.
 */
interface Errant {
  live: Live;
  ancreX: number;
  ancreY: number;
  cibleX: number;
  cibleY: number;
  /** Millisecondes de pause restantes. */
  attente: number;
  rayon: number;
  vitesse: number;
}

/**
 * Un poisson en train de sauter. `t` avance de 0 à 1 le long de l'arc ; `attente` est
 * le temps qu'il lui reste à passer sous l'eau, invisible.
 */
interface Sauteur {
  live: Live;
  saute: { gauche: number; droite: number; hauteur: number; eau: number };
  t: number;
  attente: number;
  versDroite: boolean;
}

/** Vitesse d'errance par défaut, en px/s. Bien plus lent que Nino. */
const ERRANCE_VITESSE = 15;

/**
 * Le ballon de la cour. Il part sec quand on rentre dedans, rebondit sans rien perdre
 * sur les murs, et s'arrête tout seul sur le béton. `CASSE` est la vitesse en dessous
 * de laquelle il ne fait que taper dans la vitre au lieu de la casser.
 */
const BALLON_TIR = 130;
const BALLON_FROTTEMENT = 45;
/**
 * Seuil de casse. Bas exprès : la seule façon d'entrer dans l'embrasure est un tir vers
 * le haut, donc un ballon qui arrive là a forcément été frappé. Avec un seuil élevé, un
 * tir un peu mou depuis l'autre bout de la cour arrivait à bout de course et **rebondissait
 * sur la vitre sans la casser** — le joueur voyait juste son ballon revenir.
 */
const BALLON_CASSE = 15;
/**
 * L'angle du tir vient de l'endroit où on frappe : `ECART` est le décalage, en pixels,
 * entre le pied et le centre du ballon qui donne l'angle maximum `ANGLE`. Pile en face,
 * il part droit ; frappé sur le côté, il repart de biais, du côté où on l'a touché.
 */
const BALLON_ECART = 6;
const BALLON_ANGLE = 0.9;
/** Portée du coup de pied : on ne vise pas un ballon, on est à côté ou on n'y est pas. */
const BALLON_PORTEE = 13;

/** Un saut de poisson, et le temps qu'il passe sous l'eau entre deux. En ms. */
const SAUT_DUREE = 850;
const SAUT_PAUSE = 700;

/**
 * L'eau ne reste pas immobile : le décor est cuit deux fois, la deuxième avec les tuiles
 * d'eau décalées de deux pixels, et on alterne. Deux phases suffisent — les motifs de
 * ripple ont un motif de quatre pixels, une troisième phase redonnerait la première.
 */
const EAU = new Set(['~', 'w', 'W']);
const EAU_PHASES = 2;
const EAU_DECALAGE = 2;
const EAU_VITESSE = 380;

/** Fait glisser un dessin de `n` pixels vers la droite, en enroulant les lignes. */
const decaler = (art: readonly string[], n: number): readonly string[] =>
  n === 0 ? art : art.map((l) => l.slice(l.length - n) + l.slice(0, l.length - n));

interface Arrival {
  room?: string;
  x?: number;
  y?: number;
}

/**
 * La scène de jeu. Une pièce = un écran, reconstruit intégralement à chaque
 * changement de lieu (c'est la façon la plus simple de garantir qu'aucun objet
 * ne survit à un changement de dimension).
 */
export class WorldScene extends Phaser.Scene {
  private arrival: Arrival = {};
  private room!: Room;
  /** Palette de la pièce : elle décide de la couleur de tous les dessins. */
  private pal!: PaletteId;
  /** Vue de dessus, ou de profil comme au bord de l'Erdre. */
  private mode: ViewMode = 'top';
  /** Taille de la pièce en pixels — elle peut dépasser l'écran. */
  private roomW: number = GB.W;
  private roomH: number = GB.H;
  private player!: Player;
  private live: Live[] = [];
  private solids: Phaser.GameObjects.Rectangle[] = [];
  private bulle!: Phaser.GameObjects.Image;
  private target?: Live;
  /** Hermione, quand elle suit Nino : elle marche sur ses traces. */
  private suiveuse?: Live;
  /** Le ballon, s'il y en a un dans la pièce : le seul objet qui bouge tout seul. */
  private ballon?: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  /** Les poissons de la pièce, avec où ils en sont de leur saut. */
  private sauteurs: Sauteur[] = [];
  private trace: { x: number; y: number }[] = [];
  /** Distance parcourue depuis le dernier bruit de pas, en pixels. */
  private depuisLePas = 0;
  private errants: Errant[] = [];
  private transitioning = false;
  private keys!: Record<keyof typeof KEYS, Phaser.Input.Keyboard.Key[]>;

  constructor() {
    super('World');
  }

  init(data: Arrival): void {
    this.arrival = data ?? {};
    this.live = [];
    this.solids = [];
    this.target = undefined;
    this.suiveuse = undefined;
    this.ballon = undefined;
    this.sauteurs = [];
    this.trace = [];
    this.errants = [];
    this.transitioning = false;
  }

  create(): void {
    this.bindKeys();
    if (!this.scene.isActive('Ui')) this.scene.launch('Ui');

    // Une sauvegarde peut pointer vers une pièce qui n'existe plus : on rentre.
    const wanted = this.arrival.room ?? state.room;
    const id = ROOMS[wanted] ? wanted : 'chambre';
    this.room = ROOMS[id];
    state.room = id;
    // Toute l'aventure se passe la nuit. Le jour ne revient qu'au retour par la fenêtre.
    this.pal = state.flag('parapente-rentre')
      ? this.room.palette
      : paletteNocturne(this.room.palette);
    state.palette = this.pal;
    this.mode = this.room.view ?? 'top';
    this.roomW = this.room.tiles[0].length * GB.TILE;
    this.roomH = this.room.tiles.length * GB.TILE;
    this.physics.world.gravity.y = this.mode === 'side' ? GRAVITY : 0;
    const known = state.vu(id);
    state.visit(id);
    state.ecrans += 1;
    this.chosesQuiArrivent();
    // On note la première visite de l'Erdre après coup : le bateau ne peut pas être
    // déjà là au moment où on découvre l'endroit.
    if (id === 'erdre' && state.erdreDepuis === 0) state.erdreDepuis = state.ecrans;

    this.drawFloor();
    this.buildWalls();
    for (const def of this.room.objects) this.trySpawn(def);

    this.player = new Player(
      this,
      this.arrival.x ?? this.room.spawn.x,
      this.arrival.y ?? this.room.spawn.y,
      this.pal,
    );
    this.physics.world.setBounds(0, 0, this.roomW, this.roomH);
    this.physics.add.collider(this.player.sprite, this.solids);
    // On se rentre dedans pour de vrai. Le ballon ne se laisse pas pousser (`pushable`),
    // donc c'est Nino qu'il arrête ; et un ballon lancé qui arrive sur lui **s'arrête
    // net contre lui** — sinon, n'étant pas poussable, il lui passerait au travers.
    if (this.ballon) {
      this.physics.add.collider(this.player.sprite, this.ballon, () => {
        (this.ballon!.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      });
    }

    // Une pièce plus large que l'écran : la caméra suit Nino.
    this.cameras.main.setBounds(0, 0, this.roomW, this.roomH);
    if (this.roomW > GB.W || this.roomH > GB.H) {
      this.cameras.main.startFollow(this.player.sprite, true, 0.15, 0.15);
    }
    if (this.mode === 'side') this.player.sprite.setDepth(10);

    // Après le joueur : quand Hermione le suit, elle a besoin de sa position.
    this.spawnHermione();

    this.bulle = this.add
      .image(0, 0, texKey('bulle', this.pal))
      .setOrigin(0.5, 1)
      .setDepth(1200)
      .setVisible(false);

    state.locked = true;
    gbFade(this, this.pal, 'in', () => {
      // Le tout début du jeu : Nino se réveille dans son lit.
      if (id === 'chambre' && !state.flag('reveil')) {
        this.reveil();
        return;
      }
      // Et la toute fin : la cuisine, le gâteau, les sept bougies.
      if (id === 'cuisine' && state.flag('anniversaire') && !state.flag('fin')) {
        this.anniversaire();
        return;
      }
      state.locked = false;
    });
    bus.emit(EV.hud);
    bus.emit(EV.room, { name: nomDuLieu(id), isNew: !known });
    state.save();

    // Sonde de développement : position, pièce, verrou. Absente du build.
    if (import.meta.env.DEV) {
      (window as unknown as { nino?: unknown }).nino = {
        where: () => ({
          room: this.room.id,
          x: Math.round(this.player.sprite.x),
          y: Math.round(this.player.sprite.y),
          facing: this.player.facing,
          locked: state.locked,
          transitioning: this.transitioning,
          target: this.target?.def.id,
        }),
        go: (room: string) => this.scene.restart({ room }),
        solidsNear: (x: number, y: number, r = 20) =>
          this.solids
            .map((s) => ({
              x: Math.round(s.x - s.width / 2),
              y: Math.round(s.y - s.height / 2),
              w: s.width,
              h: s.height,
            }))
            .filter((b) => Math.abs(b.x + b.w / 2 - x) < r + b.w && Math.abs(b.y + b.h / 2 - y) < r + b.h),
        doors: () => this.room.doors,
        /** Fixe le nombre de haïkus déjà entendus, pour tester la danse de l'araignée. */
        haikus: (n: number) => {
          state.haiku = n;
          return state.haiku;
        },
        /** Fixe le nombre de trouvailles d'Hermione, pour tester la fin de la chasse. */
        soeur: (n: number) => {
          state.hermione = n;
          this.scene.restart({ room: this.room.id });
          return state.hermione;
        },
        /** Pose un flag et reconstruit la pièce : teste un état narratif d'un coup. */
        flag: (name: string) => {
          state.setFlag(name);
          this.scene.restart({ room: this.room.id });
          return [...state.flags];
        },
        /** Applique un moyen de se rafraîchir, pour tester la jauge sans jouer. */
        cool: (id: string) => {
          this.applyFraicheur(id);
          bus.emit(EV.hud);
          return { temperature: state.temperature, palette: state.palette };
        },
        /** La liste des raccourcis chiffrés, pour la retrouver sans lire le code. */
        etapes: () => ETAPES.map((e) => `${e.touche} · ${e.nom}`),
      };

      // Les chiffres sautent directement à un moment du jeu.
      this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => {
        const etape = ETAPES.find((e) => e.touche === ev.key);
        if (etape) this.allerEtape(etape);
      });
    }
  }

  /**
   * Ce qui se met en place tout seul avec le temps. « Plus tard » se mesure en écrans
   * traversés, pas en secondes : un enfant ne compte pas les minutes, il compte les
   * portes.
   */
  private chosesQuiArrivent(): void {
    const ECRANS = 3;
    if (
      state.flag('eau-coule') &&
      !state.flag('poisson-arrive') &&
      state.ecrans - state.eauDepuis >= ECRANS
    ) {
      state.setFlag('poisson-arrive');
    }
    // La sueur sèche.
    if (
      state.flag('sueur') &&
      !state.flag('sueur-sechee') &&
      state.ecrans - state.sueurDepuis >= ECRANS
    ) {
      state.setFlag('sueur-sechee');
    }
    // Le bateau de papa finit par remonter l'Erdre. Comme le poisson : pas à la
    // première visite, quelques portes plus tard.
    if (
      state.erdreDepuis &&
      !state.flag('bateau-arrive') &&
      state.ecrans - state.erdreDepuis >= ECRANS
    ) {
      state.setFlag('bateau-arrive');
    }
  }

  update(_time: number, delta: number): void {
    // Cette scène est le seul lecteur du clavier : elle rediffuse les boutons à
    // l'interface et au journal. Deux scènes qui lisent la même touche se la
    // volent, et un dialogue peut alors rester bloqué à l'écran.
    const btn: Buttons = {
      action: this.just('action'),
      journal: this.just('journal'),
      cancel: this.just('cancel'),
      up: this.just('up'),
      down: this.just('down'),
      left: this.just('left'),
      right: this.just('right'),
    };
    // On retient le verrou AVANT de diffuser : les écouteurs sont appelés de
    // façon synchrone, donc la boîte de dialogue peut se fermer (et déverrouiller)
    // pendant l'emit. Sans ce garde-fou, le même appui fermerait le dialogue puis
    // rouvrirait aussitôt le même dialogue.
    const wasLocked = this.transitioning || state.locked;
    bus.emit(EV.input, btn);

    if (wasLocked || this.transitioning || state.locked) {
      this.player.freeze();
      this.bulle.setVisible(false);
      return;
    }

    this.player.move({
      up: this.down('up'),
      down: this.down('down'),
      left: this.down('left'),
      right: this.down('right'),
    });
    this.bruitDesPas(delta);

    const door = this.doorUnderPlayer();
    if (door) {
      const fermee =
        (door.blockedIfFlag && state.flag(door.blockedIfFlag)) ||
        (door.needsFlag && !state.flag(door.needsFlag));
      if (fermee) this.porteBloquee(door);
      else this.goThroughDoor(door);
      return;
    }

    this.jouerAuBallon();
    this.sauter(delta);
    this.errer(delta);
    this.suivreNino();
    this.target = this.findTarget();
    this.showBulle();

    if (btn.action && this.target) this.interact(this.target);
    if (btn.journal) {
      state.locked = true;
      this.scene.launch('Journal');
    }
  }

  // ────────────────────────────────────────────────────────── construction

  /** Le sol et les murs sont peints en une seule texture plein écran. */
  private drawFloor(): void {
    const theme = THEMES[this.room.theme];
    // On cuit le décor une fois par phase d'eau : les tuiles d'eau sont les mêmes,
    // décalées de deux pixels vers la droite à chaque phase. Alterner les quatre
    // textures fait couler la rivière sans un seul dessin de plus.
    let animee = false;
    for (let ph = 0; ph < EAU_PHASES; ph++) {
      const tex = blankCanvas(this, `room-bg-${ph}`, this.roomW, this.roomH);
      const ctx = tex.getContext();
      this.room.tiles.forEach((row, r) => {
        for (let c = 0; c < row.length; c++) {
          const eau = EAU.has(row[c]);
          const art = theme[row[c]] ?? theme['.'];
          if (eau) animee = true;
          paintArt(ctx, eau ? decaler(art, ph * EAU_DECALAGE) : art, this.pal, c * GB.TILE, r * GB.TILE);
        }
      });
      tex.refresh();
    }

    const fond = this.add.image(0, 0, 'room-bg-0').setOrigin(0, 0).setDepth(-100);
    if (!animee) return;
    let ph = 0;
    this.time.addEvent({
      delay: EAU_VITESSE,
      loop: true,
      callback: () => {
        ph = (ph + 1) % EAU_PHASES;
        fond.setTexture(`room-bg-${ph}`);
      },
    });
  }

  /** Les tuiles bloquantes sont fusionnées par bandes horizontales. */
  private buildWalls(): void {
    this.room.tiles.forEach((row, r) => {
      let start = -1;
      for (let c = 0; c <= row.length; c++) {
        const solid = c < row.length && SOLID.has(row[c]);
        if (solid && start < 0) start = c;
        if (!solid && start >= 0) {
          this.addSolid(start * GB.TILE, r * GB.TILE, (c - start) * GB.TILE, GB.TILE);
          start = -1;
        }
      }
    });
  }

  private addSolid(x: number, y: number, w: number, h: number): void {
    const rect = this.add.rectangle(x + w / 2, y + h / 2, w, h).setVisible(false);
    this.physics.add.existing(rect, true);
    this.solids.push(rect);
  }

  private trySpawn(def: RoomObject): void {
    if (def.showIfFlag && !state.flag(def.showIfFlag)) return;
    if (def.hideIfFlag && state.flag(def.hideIfFlag)) return;
    if (this.live.some((l) => l.def.id === def.id)) return;

    const pal = this.pal;
    const key = texKey(def.sprite ?? 'panneau', pal);
    let frame = def.frame;
    // La dernière règle qui correspond gagne.
    for (const [flag, f] of def.frameIfFlag ?? []) if (state.flag(flag)) frame = f;
    let anim = def.animIfFlag && state.flag(def.animIfFlag[0]) ? def.animIfFlag[1] : def.anim;
    if (def.animSaufFlag && state.flag(def.animSaufFlag)) anim = undefined;

    let go: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
    if (anim) {
      const s = this.add.sprite(def.x, def.y, key, frame);
      s.play(animKey(anim, pal));
      go = s;
    } else {
      go = this.add.image(def.x, def.y, key, frame);
    }
    go.setOrigin(0, 0);
    if (def.scale) go.setScale(def.scale);
    // Profondeur = base du sprite : ce qui est plus bas passe devant.
    go.setDepth(def.depth ?? def.y + go.displayHeight);

    if (def.solid) {
      const [dx, dy, w, h] =
        def.solid === true ? [0, 0, go.displayWidth, go.displayHeight] : def.solid;
      this.addSolid(def.x + dx, def.y + dy, w, h);
    }

    if (def.ballon) {
      this.physics.add.existing(go);
      const b = go.body as Phaser.Physics.Arcade.Body;
      b.setBounce(1, 1);
      b.setDrag(BALLON_FROTTEMENT);
      b.setCollideWorldBounds(true);
      // Il ne se laisse pas pousser : **il ne bouge que d'un coup de pied**. Marcher
      // dedans ne le déplace pas d'un pixel, c'est Nino qui est arrêté.
      b.pushable = false;
      // Il rebondit : chaque contact sonne, mais seulement s'il va assez vite pour
      // qu'on y croie — sinon un ballon qui roule contre un mur crépite.
      this.physics.add.collider(go, this.solids, () => {
        if (b.velocity.length() > 40) jouer(this, 'rebond', { volume: 0.5 });
      });
      this.ballon = go;
    }

    const live = { def, go };
    this.live.push(live);

    if (def.saute) {
      this.sauteurs.push({
        live,
        saute: def.saute,
        t: 0,
        attente: Math.random() * SAUT_PAUSE,
        versDroite: true,
      });
      go.setVisible(false);
    }

    // Les personnages ne restent pas plantés. Pas en vue de profil : le quai est
    // une corniche étroite, on n'y flâne pas.
    if (def.errance && this.mode !== 'side') {
      this.errants.push({
        live,
        ancreX: def.x,
        ancreY: def.y,
        cibleX: def.x,
        cibleY: def.y,
        attente: Math.random() * 1200,
        rayon: def.errance.rayon,
        vitesse: def.errance.vitesse ?? ERRANCE_VITESSE,
      });
    }
  }

  /**
   * Un coup de pied. Le regard donne l'**axe** — vertical ou horizontal — et l'endroit
   * où on frappe donne l'**angle** : pile en face il part droit, décalé sur le côté il
   * part de biais, du côté où on l'a touché. Comme il rebondit sans rien perdre, un tir
   * de biais fait le tour de la cour.
   *
   * Le **sens**, lui, vient de la position du ballon et pas du regard : sinon, un ballon
   * derrière Nino partait droit dans ses jambes.
   */
  private taperDansLeBallon(l: Live): void {
    const b = l.go.body as Phaser.Physics.Arcade.Body;
    const s = this.player.sprite;
    const cx = l.go.x + l.go.displayWidth / 2;
    const cy = l.go.y + l.go.displayHeight / 2;
    const px = s.x;
    const py = s.y - 3;
    const biais = (ecart: number) =>
      Phaser.Math.Clamp(ecart / BALLON_ECART, -1, 1) * BALLON_ANGLE;

    const vertical = this.player.facing === 'up' || this.player.facing === 'down';
    const a = vertical
      ? cy < py
        ? -Math.PI / 2 + biais(cx - px)
        : Math.PI / 2 - biais(cx - px)
      : cx < px
        ? Math.PI - biais(cy - py)
        : biais(cy - py);
    b.setVelocity(Math.cos(a) * BALLON_TIR, Math.sin(a) * BALLON_TIR);
    jouer(this, 'ballon', { volume: 0.7 });
  }

  /**
   * Le ballon en vol : sa profondeur suit sa position, et s'il finit dans la fenêtre de
   * la cour, la fenêtre casse. Papa, resté à l'intérieur en train de courir après un
   * chat, n'a aucun doute sur le coupable.
   */
  private jouerAuBallon(): void {
    const go = this.ballon;
    if (!go) return;
    const b = go.body as Phaser.Physics.Arcade.Body;
    const cx = go.x + go.displayWidth / 2;
    const cy = go.y + go.displayHeight / 2;
    go.setDepth(go.y + go.displayHeight);

    if (state.flag('fenetre-cassee') || b.velocity.length() < BALLON_CASSE) return;
    const vitre = this.live.find((l) => l.def.id === 'fenetre-cour');
    if (!vitre) return;
    const cadre = new Phaser.Geom.Rectangle(
      vitre.def.x,
      vitre.def.y,
      vitre.go.displayWidth,
      vitre.go.displayHeight,
    );
    if (!cadre.contains(cx, cy)) return;

    state.setFlag('fenetre-cassee');
    (vitre.go as Phaser.GameObjects.Image).setFrame('cassee');
    sparkle(this, this.pal, cx, cadre.bottom);
    jouer(this, 'vitre-cassee', { volume: 0.8 });
    // Il retombe dans la cour au lieu de rester planté dans le cadre.
    b.setVelocity(0, 90);
    this.runDialogue('fenetre-cassee', vitre);
  }

  /**
   * Les poissons sautent d'un bord à l'autre et **ne sont visibles qu'en l'air** : sous
   * la ligne d'eau, ils n'existent pas. Pendant un dialogue tout s'arrête, sinon le
   * poisson à qui on parle replongerait au milieu de sa phrase.
   */
  private sauter(dt: number): void {
    if (state.locked) return;
    for (const s of this.sauteurs) {
      const go = s.live.go;
      if (s.attente > 0) {
        s.attente -= dt;
        go.setVisible(false);
        continue;
      }
      const avant = s.t;
      s.t += dt / SAUT_DUREE;
      if (s.t >= 1) {
        // Il retombe : un plouf à l'endroit exact où il perce la surface.
        this.plouf(s, s.versDroite ? s.saute.droite : s.saute.gauche);
        s.t = 0;
        s.versDroite = !s.versDroite;
        s.attente = SAUT_PAUSE * (0.6 + Math.random());
        go.setVisible(false);
        continue;
      }
      if (avant === 0) this.plouf(s, s.versDroite ? s.saute.gauche : s.saute.droite);
      const de = s.versDroite ? s.saute.gauche : s.saute.droite;
      const vers = s.versDroite ? s.saute.droite : s.saute.gauche;
      const y = s.saute.eau - Math.sin(Math.PI * s.t) * s.saute.hauteur;
      go.setPosition(Math.round(Phaser.Math.Linear(de, vers, s.t)), Math.round(y));
      go.setFlipX(!s.versDroite);
      // Visible dès que la moitié du corps est sortie de l'eau.
      go.setVisible(y + go.displayHeight / 2 < s.saute.eau);
    }
  }

  /** Un plouf sur la ligne d'eau, au bord où le poisson vient de la traverser. */
  private plouf(s: Sauteur, x: number): void {
    jouer(this, 'plouf', { volume: 0.5 });
    splash(this, this.pal, Math.round(x + s.live.go.displayWidth / 2), Math.round(s.saute.eau));
  }

  /** Le pose en haut de son arc, bien visible : on va lui parler. */
  private sortirDeLEau(l: Live): void {
    const s = this.sauteurs.find((x) => x.live === l);
    if (!s) return;
    s.t = 0.5;
    s.attente = 0;
    l.go.setPosition(
      Math.round((s.saute.gauche + s.saute.droite) / 2),
      Math.round(s.saute.eau - s.saute.hauteur),
    );
    l.go.setVisible(true);
  }

  /**
   * Le bruit des pas, au kilométrage : un son tous les quatorze pixels parcourus, et pas
   * au rythme de l'animation. Un enfant qui longe un mur en frottant avance très peu, et
   * il ne doit pas faire le bruit d'une course.
   */
  private bruitDesPas(dt: number): void {
    const v = (this.player.sprite.body as Phaser.Physics.Arcade.Body).velocity;
    const avance = (Math.abs(v.x) + Math.abs(v.y)) * (dt / 1000);
    if (avance < 0.1) {
      this.depuisLePas = 10;
      return;
    }
    this.depuisLePas += avance;
    if (this.depuisLePas < 14) return;
    this.depuisLePas = 0;
    jouer(this, 'pas', { volume: 0.35 });
  }

  /** Fait vivre les personnages : un pas, une pause, un autre pas. */
  private errer(dt: number): void {
    for (const e of this.errants) {
      const go = e.live.go;
      if (e.attente > 0) {
        e.attente -= dt;
        continue;
      }

      const dx = e.cibleX - go.x;
      const dy = e.cibleY - go.y;
      const reste = Math.hypot(dx, dy);

      if (reste < 1) {
        // Arrivé : on souffle, puis on choisit un nouveau point atteignable.
        e.attente = 500 + Math.random() * 2200;
        const angle = Math.random() * Math.PI * 2;
        const r = 6 + Math.random() * e.rayon;
        const nx = Math.round(e.ancreX + Math.cos(angle) * r);
        const ny = Math.round(e.ancreY + Math.sin(angle) * r);
        if (this.solLibre(nx, ny, go.displayWidth, go.displayHeight)) {
          e.cibleX = nx;
          e.cibleY = ny;
        }
        continue;
      }

      const pas = Math.min(1, (e.vitesse * dt) / 1000 / reste);
      const x = Math.round(go.x + dx * pas);
      const y = Math.round(go.y + dy * pas);
      if (dx !== 0) go.setFlipX(dx < 0);
      go.setPosition(x, y);
      if (e.live.def.depth === undefined) go.setDepth(y + go.displayHeight);
      e.live.def.x = x;
      e.live.def.y = y;
    }
  }

  /** Vrai si un sprite de cette taille peut se tenir là, en vue de dessus. */
  private solLibre(x: number, y: number, w: number, h: number): boolean {
    const x0 = x + 1;
    const x1 = x + w - 2;
    const y0 = y + h - 5;
    const y1 = y + h - 1;
    if (x0 < 0 || y0 < 0 || x1 >= this.roomW || y1 >= this.roomH) return false;
    for (let ty = Math.floor(y0 / GB.TILE); ty <= Math.floor(y1 / GB.TILE); ty++) {
      for (let tx = Math.floor(x0 / GB.TILE); tx <= Math.floor(x1 / GB.TILE); tx++) {
        if (SOLID.has(this.room.tiles[ty][tx])) return false;
      }
    }
    return true;
  }

  /**
   * Hermione est cachée dans une pièce à la fois, et change de cachette dès qu'on
   * l'a trouvée. Elle n'est donc jamais déclarée dans les pièces : on la pose ici.
   * Une fois toutes les cachettes trouvées, elle ne se cache plus : elle suit.
   */
  private spawnHermione(): void {
    if (hermioneSuit(state.hermione)) {
      const p = this.player.sprite;
      this.trySpawn({
        id: 'hermione-suit',
        x: Math.round(p.x - 4),
        y: Math.round(p.y - 8),
        sprite: 'hermione4',
        frame: 'rampe-0',
        anim: 'hermione-rampe',
        dialogue: 'hermione-suit',
      });
      this.suiveuse = this.live.find((l) => l.def.id === 'hermione-suit');
      this.trace = Array.from({ length: TRACE }, () => ({ x: p.x, y: p.y }));
      return;
    }
    const cachette = cachetteActuelle(state.hermione);
    if (!cachette || cachette.room !== this.room.id) return;
    // Elle respire sur place : animée, mais elle ne quitte jamais sa cachette.
    this.trySpawn({
      id: 'hermione',
      x: cachette.x,
      y: cachette.y,
      sprite: 'hermione',
      frame: 'idle-0',
      anim: 'hermione-idle',
      depth: cachette.depth,
      dialogue: 'hermione',
    });
  }

  /**
   * Hermione avance sur les traces de Nino, avec un vrai retard : elle ne lui colle
   * pas aux talons, elle arrive après. Elle ne rampe que quand elle se déplace.
   */
  private suivreNino(): void {
    if (!this.suiveuse) return;
    const p = this.player.sprite;
    this.trace.push({ x: p.x, y: p.y });
    while (this.trace.length > TRACE) this.trace.shift();

    const cible = this.trace[0];
    const go = this.suiveuse.go as Phaser.GameObjects.Sprite;
    // Assez près : elle attend là où elle est.
    const proche = Phaser.Math.Distance.Between(cible.x, cible.y, p.x, p.y) < ECART;
    const nx = proche ? go.x : Math.round(cible.x - 4);
    const ny = proche ? go.y : Math.round(cible.y - 8);
    const bouge = nx !== go.x || ny !== go.y;

    if (nx !== go.x) go.setFlipX(nx < go.x);
    go.setPosition(nx, ny);
    // Juste derrière Nino dans l'ordre d'affichage.
    go.setDepth(ny + 8);
    this.suiveuse.def.x = nx;
    this.suiveuse.def.y = ny;

    const key = animKey('hermione-rampe', this.pal);
    if (bouge) {
      if (go.anims.currentAnim?.key !== key) go.play(key);
    } else if (go.anims.isPlaying) {
      go.anims.stop();
      go.setFrame('rampe-0');
    }
  }

  /**
   * On vient de la retrouver. Petite scène jouée : Maman entre par une des portes de
   * la pièce, crie, traverse jusqu'à Hermione, la prend et repart par où elle est
   * venue. La dernière fois, elle renonce et repart seule.
   */
  private trouveHermione(l: Live): void {
    const derniere = state.hermione + 1 >= CACHETTES.length;
    say({ lines: RENCONTRE, focusY: l.def.y, onDone: () => this.mamanArrive(l, derniere) });
  }

  /**
   * L'ouverture du jeu : Nino se réveille et on lui demande s'il sort du lit. S'il
   * refuse, il a de plus en plus chaud — et au bout de trois refus la chaleur le met
   * dehors, en le laissant dégouliner. Les gouttes restent par terre pour toujours,
   * et Maman finira par le remarquer.
   */
  private reveil(): void {
    this.player.sprite.setPosition(46, 46);
    const retirer = this.montrer({
      sprite: 'nino-couche',
      x: 22,
      y: 18,
      depth: 60,
      cacheNino: true,
    });

    const finir = (force: boolean) => {
      state.setFlag('reveil');
      if (force) {
        state.setFlag('sueur');
        state.sueurDepuis = state.ecrans;
      }
      state.save();
      retirer();
      if (!force) {
        state.locked = false;
        return;
      }
      this.refreshObjects();
      this.runDialogue('reveil-force');
    };

    const demander = (fois: number) => {
      const debut = pickBeat('reveil')?.lines ?? [];
      say({
        lines: fois === 0 ? [...debut, SORTIR_DU_LIT] : [SORTIR_DU_LIT],
        choices: ['Oui', 'Non'],
        focusY: 20,
        onDone: (reponse) => {
          if (reponse === 0) {
            finir(false);
            return;
          }
          const dernier = fois + 1 >= CHALEUR.length;
          say({
            lines: [CHALEUR[fois]],
            focusY: 20,
            onDone: () => (dernier ? finir(true) : demander(fois + 1)),
          });
        },
      });
    };

    demander(0);
  }

  /**
   * L'araignée en dit un nouveau à chaque visite. Quand elle les a tous dits, elle
   * chante, elle danse, et elle s'en va.
   */
  private ditUnHaiku(l: Live): void {
    if (state.haiku >= HAIKUS.length) {
      say({ speaker: 'L’araignée', lines: CHANSON, focusY: l.def.y, onDone: () => this.danse(l) });
      return;
    }
    const premier = state.haiku === 0;
    say({
      speaker: 'L’araignée',
      lines: premier
        ? [PRESENTATION_ARAIGNEE, ...HAIKUS[0]]
        : HAIKUS[state.haiku % HAIKUS.length],
      focusY: l.def.y,
      onDone: () => {
        state.haiku += 1;
        state.save();
      },
    });
  }

  /**
   * La chorégraphie : pirouette, pas de côté, pirouette, pas de côté, et elle part en
   * pirouette. Elle chante un bout entre chaque mouvement — le texte s'affiche
   * au-dessus d'elle, sans boîte de dialogue, pour ne pas casser le rythme.
   *
   * Les pirouettes tournent sur son axe central : on bascule son point de pivot au
   * centre du sprite, sinon elle tournerait autour de son coin haut-gauche.
   */
  private danse(l: Live): void {
    state.locked = true;
    // Elle ne peut pas errer et danser en même temps.
    this.errants = this.errants.filter((e) => e.live !== l);

    const go = l.go;
    const w = go.displayWidth;
    const h = go.displayHeight;
    go.setOrigin(0.5, 0.5).setPosition(go.x + w / 2, go.y + h / 2);

    const chant = new PixelText(this, 'wl-chant', 0, 0, 70, 13);
    chant.image.setDepth(1300);

    /** Un bout de chanson au-dessus d'elle. */
    const chanter = (i: number, suite: () => void) => {
      const t = COUPLETS[i];
      chant.setLines([t], shadeHex(this.pal, 0));
      chant.image
        .setPosition(Math.round(go.x - measure(t) / 2), Math.round(go.y - h / 2 - 14))
        .setVisible(true);
      this.time.delayedCall(520, suite);
    };

    const pirouette = (suite: () => void) =>
      this.tweens.add({
        targets: go,
        angle: go.angle + 360,
        duration: 560,
        ease: 'Cubic.InOut',
        onComplete: suite,
      });

    const pasDeCote = (dx: number, suite: () => void) =>
      this.tweens.add({
        targets: go,
        x: go.x + dx,
        duration: 300,
        ease: 'Sine.InOut',
        onComplete: suite,
      });

    /** Elle part en tournant, vers le haut de l'écran. Pas de fondu : elle sort. */
    const sortie = () => {
      const x0 = go.x;
      const y0 = go.y;
      const a0 = go.angle;
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 2200,
        ease: 'Sine.In',
        onUpdate: (t) => {
          const v = t.getValue() ?? 0;
          go.setPosition(
            Math.round(Phaser.Math.Linear(x0, 116, v) + Math.cos(v * Math.PI * 4) * 10),
            Math.round(Phaser.Math.Linear(y0, -30, v)),
          );
          go.setAngle(a0 + v * 1080);
          chant.image.setPosition(
            Math.round(go.x - measure(COUPLETS[4]) / 2),
            Math.round(go.y - h / 2 - 14),
          );
        },
        onComplete: () => {
          chant.destroy();
          this.retirer(l);
          state.setFlag('araignee-partie');
          state.save();
          say({
            lines: ARAIGNEE_PARTIE,
            focusY: 30,
            onDone: () => {
              state.locked = false;
            },
          });
        },
      });
    };

    // chant, pirouette, chant, pas de côté, chant, pirouette, chant, pas de côté, chant, sortie
    chanter(0, () =>
      pirouette(() =>
        chanter(1, () =>
          pasDeCote(16, () =>
            chanter(2, () =>
              pirouette(() => chanter(3, () => pasDeCote(-16, () => chanter(4, sortie)))),
            ),
          ),
        ),
      ),
    );
  }

  /**
   * La diversion de Moon, en une petite scène jouée : il traverse le salon, monte sur
   * la table ronde, pousse un bol du bout de la patte, et sort en courant avec les
   * parents derrière lui. C'est ce qui libère la fenêtre.
   */
  private diversion(moon: Live): void {
    const bol = this.live.find((o) => o.def.id === 'bol-2');
    const parents = this.live.filter((o) => o.def.id === 'maman-salon' || o.def.id === 'papa-salon');
    if (!bol) return;

    state.locked = true;
    this.errants = this.errants.filter((e) => e.live !== moon && !parents.includes(e.live));
    const chat = moon.go;

    /** Tout le monde sort par la porte, le chat devant, les parents derrière. */
    const fuite = () => {
      this.tweens.add({
        targets: chat,
        x: -14,
        y: 44,
        duration: 1100,
        ease: 'Sine.In',
        onUpdate: () => chat.setDepth(chat.y + 120),
      });
      parents.forEach((p, i) => {
        this.tweens.add({
          targets: p.go,
          x: -16 - i * 12,
          y: 40 + i * 8,
          duration: 1250,
          delay: 160 + i * 120,
          ease: 'Sine.In',
          onUpdate: () => p.go.setDepth(p.go.y + 30),
          onComplete: () => this.retirer(p),
        });
      });
      this.time.delayedCall(1500, () => {
        this.retirer(moon);
        state.setFlag('parents-sortis');
        state.save();
        this.refreshObjects();
        state.locked = false;
      });
    };

    /** Le bol part du bout de la patte, décrit un arc, et atterrit par terre. */
    const pousser = () => {
      const bx = bol.go.x;
      const by = bol.go.y;
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 620,
        onUpdate: (t) => {
          const v = t.getValue() ?? 0;
          bol.go.setPosition(
            Math.round(bx + v * 8),
            Math.round(by + v * 28 - Math.sin(v * Math.PI) * 7),
          );
          bol.go.setDepth(60);
        },
        onComplete: () => {
          this.cameras.main.shake(180, 0.006);
          say({
            speaker: 'Papa',
            lines: DIVERSION.papa,
            focusY: 20,
            onDone: () =>
              say({
                speaker: 'Moon',
                lines: DIVERSION.minuterie,
                focusY: 20,
                onDone: () => {
                  state.locked = true;
                  fuite();
                },
              }),
          });
        },
      });
    };

    /** Il grimpe : un petit saut sur le plateau. */
    const grimper = () =>
      this.tweens.add({
        targets: chat,
        y: 18,
        duration: 320,
        ease: 'Back.Out',
        onUpdate: () => chat.setDepth(46),
        onComplete: pousser,
      });

    /** Il traverse le salon jusqu'à la table. */
    const traverser = () =>
      this.tweens.add({
        targets: chat,
        x: 120,
        y: 30,
        duration: 1400,
        ease: 'Sine.InOut',
        onUpdate: () => chat.setDepth(chat.y + 120),
        onComplete: grimper,
      });

    say({
      speaker: 'Moon',
      lines: DIVERSION.annonce,
      focusY: moon.def.y,
      onDone: () => {
        state.locked = true;
        traverser();
      },
    });
  }

  /** Retire un objet de la scène proprement : affichage, cibles et errance. */
  private retirer(l: Live): void {
    l.go.destroy();
    this.live = this.live.filter((o) => o !== l);
    this.errants = this.errants.filter((e) => e.live !== l);
    if (this.target === l) this.target = undefined;
  }

  /** Les endroits par lesquels on peut entrer dans la pièce. */
  /**
   * Le poisson raconte sa vie. Ça prend cinq boîtes de dialogue, et c'est fait exprès :
   * il ne demande rien, il raconte. Puis **le chat entre et s'assoit au bord de la
   * baignoire, sans un mot**, et le poisson en vient enfin au fait.
   *
   * Rien n'explique que le chat est un problème. C'est un chat au bord d'une baignoire
   * avec un poisson dedans, il n'y a rien à expliquer.
   */
  private histoireDuPoisson(l: Live): void {
    state.locked = true;
    this.sortirDeLEau(l);
    const focusY = l.def.y;
    const dire = (lines: string[], onDone: () => void) =>
      say({ speaker: POISSON, lines, focusY, onDone });

    const porte = this.entrees()[0];
    const seuil = { x: Math.round(porte.x - 6), y: Math.round(porte.y - 12) };
    const moon = this.add
      .image(seuil.x, seuil.y, texKey('moon', this.pal), 'idle-0')
      .setOrigin(0, 0)
      .setVisible(false);
    const profondeur = () => moon.setDepth(moon.y + moon.displayHeight);
    profondeur();

    const repartir = () => {
      state.locked = true;
      this.tweens.add({
        targets: moon,
        x: seuil.x,
        y: seuil.y,
        duration: this.duree(moon.x, moon.y, seuil.x, seuil.y),
        onUpdate: profondeur,
        onComplete: () => {
          moon.destroy();
          state.locked = false;
        },
      });
    };

    const boire = () => {
      // Le poisson part avec l'eau. La baignoire se vide tout de suite, pas au prochain
      // passage : c'est le seul moment où on le voit descendre.
      state.setFlag('bouchon-retire');
      const cuve = this.live.find((o) => o.def.id === 'baignoire');
      (cuve?.go as Phaser.GameObjects.Image | undefined)?.setFrame('vide');
      say({
        lines: RETIRE,
        focusY,
        onDone: () => {
          l.go.destroy();
          this.live = this.live.filter((o) => o !== l);
          this.sauteurs = this.sauteurs.filter((s) => s.live !== l);
          this.target = undefined;
          state.save();
          if (state.flag('chat-parle')) {
            say({ speaker: 'Moon', lines: LE_CHAT, focusY, onDone: repartir });
          } else {
            // Il n'a pas eu sa pizza : il ne parle pas encore. Il regarde, c'est tout.
            state.locked = true;
            this.time.delayedCall(900, repartir);
          }
        },
      });
    };

    const demander = () =>
      say({
        speaker: POISSON,
        lines: SAUVE_MOI,
        choices: ['Oui', 'Non'],
        focusY,
        onDone: (reponse) => (reponse === 0 ? boire() : dire(REFUS, repartir)),
      });

    const entrerLeChat = () => {
      state.locked = true;
      moon.setVisible(true);
      this.tweens.add({
        targets: moon,
        x: 42,
        y: 48,
        duration: this.duree(moon.x, moon.y, 42, 48),
        ease: 'Sine.easeInOut',
        onUpdate: profondeur,
        onComplete: demander,
      });
    };

    const raconter = (i: number) => {
      if (i >= VIE.length) {
        state.setFlag('poisson-vie-racontee');
        entrerLeChat();
        return;
      }
      dire(VIE[i], () => raconter(i + 1));
    };

    if (state.flag('poisson-vie-racontee')) entrerLeChat();
    else raconter(0);
  }

  /** Le saut du toit : si Nino dit oui, il part tout de suite. */
  private sauterDuToit(l: Live): void {
    const beat = pickBeat('parapente-envol');
    if (!beat?.choice) return;
    state.locked = true;
    say({
      lines: beat.lines,
      choices: ['Oui', 'Non'],
      focusY: l.def.y,
      onDone: (reponse) => {
        const branche = reponse === 0 ? beat.choice!.oui : beat.choice!.non;
        say({
          lines: branche.lines,
          focusY: l.def.y,
          onDone: () => {
            this.applyEffects(branche.effects, l);
            if (reponse !== 0) return;
            this.transitioning = true;
            portalWarp(this, this.pal, () => {
              this.scene.stop('Ui');
              this.scene.start('Parapente');
            });
          },
        });
      },
    });
  }

  /**
   * La fin. Nino cache le parapente sous le lit, se couche, fait semblant — et les
   * parents entrent le chercher. Ils ne parlent pas de la fenêtre ouverte. Ils ne parlent
   * pas du parapente. Ils l'emmènent dans la cuisine.
   */
  private faireSemblant(l: Live): void {
    state.locked = true;
    state.take('parapente');
    state.setFlag('parapente-cache');
    const couche = { sprite: 'nino-couche', x: l.def.x + 4, y: l.def.y + 10, cacheNino: true };

    // Les parents entrent par la porte de la chambre et vont jusqu'au lit.
    const porte = this.entrees()[0];
    const seuil = { x: Math.round(porte.x - 6), y: Math.round(porte.y - 15) };
    const acteurs = ['maman', 'papa'].map((qui, i) =>
      this.add
        .image(seuil.x + i * 10, seuil.y, texKey(qui, this.pal))
        .setOrigin(0, 0)
        .setVisible(false),
    );
    const profondeur = () => acteurs.forEach((a) => a.setDepth(a.y + a.displayHeight));
    profondeur();

    const versLaCuisine = () => {
      state.setFlag('anniversaire');
      state.save();
      this.transitioning = true;
      gbFade(this, this.pal, 'out', () => {
        this.scene.restart({ room: 'cuisine', x: 104, y: 120 });
      });
    };

    const parler = (i: number) => {
      if (i >= PARENTS.length) {
        versLaCuisine();
        return;
      }
      say({
        speaker: PARENTS[i].qui,
        lines: PARENTS[i].lignes,
        focusY: l.def.y,
        onDone: () => parler(i + 1),
      });
    };

    const entrer = () => {
      state.locked = true;
      acteurs.forEach((a) => a.setVisible(true));
      this.tweens.add({
        targets: acteurs,
        x: l.def.x + 24,
        y: l.def.y + 20,
        duration: this.duree(seuil.x, seuil.y, l.def.x + 24, l.def.y + 20),
        ease: 'Sine.easeInOut',
        onUpdate: profondeur,
        onComplete: () => parler(0),
      });
    };

    // Deux boîtes pour se coucher, et Nino apparaît dans son lit le temps du texte.
    // Nino apparaît dans son lit dès la première boîte, et il y reste : c'est ce que les
    // parents vont voir en entrant.
    const retirer = this.montrer(couche);
    const raconter = (i: number) => {
      if (i >= SEMBLANT.length) {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, retirer);
        entrer();
        return;
      }
      say({ lines: SEMBLANT[i], focusY: l.def.y, onDone: () => raconter(i + 1) });
    };
    raconter(0);
  }

  /** Dans la cuisine, tout le monde attend depuis ce matin. */
  private anniversaire(): void {
    state.locked = true;
    const dire = (i: number) => {
      if (i >= FETE.length) {
        state.setFlag('fin');
        state.save();
        this.scene.stop('Ui');
        this.scene.start('Fin');
        return;
      }
      // La boîte passe en haut : toute la scène du gâteau reste visible en dessous.
      // La réplique dit elle-même si un son l'accompagne.
      if (FETE[i].son) jouer(this, FETE[i].son, { volume: 0.9 });
      say({ speaker: FETE[i].qui, lines: FETE[i].lignes, focusY: 110, onDone: () => dire(i + 1) });
    };
    dire(0);
  }

  private entrees(): { x: number; y: number }[] {
    const list = this.room.doors.map((d) => ({ x: d.x + d.w / 2, y: d.y + d.h / 2 }));
    for (const o of this.room.objects) {
      if (o.portal) list.push({ x: o.x + 8, y: o.y + 12 });
    }
    if (list.length === 0) list.push({ ...this.room.spawn });
    return list;
  }

  /** Durée d'un trajet, à l'allure d'un adulte pressé. */
  private duree(x0: number, y0: number, x1: number, y1: number): number {
    return Math.max(140, (Phaser.Math.Distance.Between(x0, y0, x1, y1) / 62) * 1000);
  }

  private mamanArrive(l: Live, derniere: boolean): void {
    state.locked = true;
    jouer(this, 'cri-maman', { volume: 0.9 });

    // Elle entre par la porte la plus proche de la petite.
    const porte = this.entrees().reduce((a, b) =>
      Phaser.Math.Distance.Between(a.x, a.y, l.def.x, l.def.y) <
      Phaser.Math.Distance.Between(b.x, b.y, l.def.x, l.def.y)
        ? a
        : b,
    );
    const depart = { x: Math.round(porte.x - 4), y: Math.round(porte.y - 15) };
    const maman = this.add
      .image(depart.x, depart.y, texKey('maman', this.pal))
      .setOrigin(0, 0);
    const profondeur = () => maman.y + maman.displayHeight;
    maman.setDepth(profondeur());

    // Pendant qu'elle entre et qu'elle traverse, Hermione reste dans sa cachette.
    const marche = () => maman.setDepth(profondeur());

    // Au retour seulement : la petite est sous le bras.
    const emporte = () => {
      maman.setDepth(profondeur());
      if (!derniere) {
        l.go.setPosition(maman.x + 5, maman.y - 3);
        l.go.setDepth(profondeur() + 1);
      }
    };

    const fin = () => {
      maman.destroy();
      state.hermione += 1;
      toast(ANNONCES.hermioneTrouvee(state.hermione, CACHETTES.length));
      state.save();
      if (!derniere) {
        l.go.destroy();
        this.live = this.live.filter((o) => o !== l);
      }
      this.target = undefined;
      bus.emit(EV.hud);
      state.locked = false;
      // Dernière cachette : on reconstruit la pièce, elle y sera en suiveuse.
      if (derniere) this.scene.restart({ room: this.room.id });
    };

    const repartir = () => {
      this.tweens.add({
        targets: maman,
        x: depart.x,
        y: depart.y,
        duration: this.duree(maman.x, maman.y, depart.x, depart.y),
        onUpdate: emporte,
        onComplete: fin,
      });
    };

    const traverser = () => {
      state.locked = true;
      const cote = l.def.x > 16 ? -11 : 11;
      const cx = l.def.x + cote;
      const cy = l.def.y - 5;
      this.tweens.add({
        targets: maman,
        x: cx,
        y: cy,
        duration: this.duree(maman.x, maman.y, cx, cy),
        onUpdate: marche,
        onComplete: repartir,
      });
    };

    // Un pas dans la pièce, puis le cri, puis la traversée.
    const vers = Phaser.Math.Angle.Between(depart.x, depart.y, l.def.x, l.def.y);
    this.tweens.add({
      targets: maman,
      x: depart.x + Math.round(Math.cos(vers) * 11),
      y: depart.y + Math.round(Math.sin(vers) * 11),
      duration: 260,
      onUpdate: marche,
      onComplete: () =>
        say({
          speaker: 'Maman',
          lines: rappel(state.hermione),
          // Maman est peut-être entrée par le bas : dans ce cas le texte monte.
          focusY: maman.y,
          onDone: traverser,
        }),
    });
  }

  /**
   * Après un dialogue : un coffre s'ouvre, un chat se réveille, un bateau coule.
   *
   * Le retrait compte autant que l'ajout : sans lui, le bateau qu'on venait de couler
   * restait à flotter jusqu'au prochain changement de pièce, et papa n'apparaissait sur
   * le quai qu'une porte plus tard.
   */
  private refreshObjects(): void {
    for (const l of [...this.live]) {
      const { def } = l;
      const visible =
        (!def.showIfFlag || state.flag(def.showIfFlag)) &&
        !(def.hideIfFlag && state.flag(def.hideIfFlag));
      if (!visible) {
        l.go.destroy();
        this.live = this.live.filter((o) => o !== l);
        this.sauteurs = this.sauteurs.filter((x) => x.live !== l);
        this.errants = this.errants.filter((x) => x.live !== l);
        if (this.ballon === l.go) this.ballon = undefined;
        if (this.target === l) this.target = undefined;
        if (this.suiveuse === l) this.suiveuse = undefined;
        continue;
      }
      for (const [flag, f] of def.frameIfFlag ?? []) if (state.flag(flag)) l.go.setFrame(f);
      if (!(l.go instanceof Phaser.GameObjects.Sprite)) continue;
      // L'eau de la baignoire s'arrête avec le bouchon : sinon l'animation reprenait la
      // main sur la frame « vide » à chaque battement.
      if (def.animSaufFlag && state.flag(def.animSaufFlag)) {
        l.go.anims.stop();
        for (const [flag, f] of def.frameIfFlag ?? []) if (state.flag(flag)) l.go.setFrame(f);
      } else if (def.animIfFlag && state.flag(def.animIfFlag[0])) {
        const key = animKey(def.animIfFlag[1], this.pal);
        if (l.go.anims.currentAnim?.key !== key) l.go.play(key);
      }
    }
    // trySpawn refuse les doublons : seuls les nouveaux venus apparaissent.
    for (const def of this.room.objects) this.trySpawn(def);
  }

  // ─────────────────────────────────────────────────────────── interaction

  /**
   * Un personnage ou un passage passe devant un meuble, même s'il est plus loin.
   *
   * Hermione, quand elle suit Nino, passe en dernier : elle est en permanence collée
   * à lui, donc sans ça elle volerait absolument toutes les interactions du jeu.
   */
  private rank(def: RoomObject): number {
    if (def.priorite !== undefined) return def.priorite;
    if (def.id === 'hermione-suit') return 0;
    if (def.portal) return 2;
    return def.sprite && CHARACTER_SPRITES.has(def.sprite) ? 2 : 1;
  }

  private findTarget(): Live | undefined {
    // De profil, viser avec une direction n'a pas de sens (le bateau est derrière et
    // plus haut) : on prend simplement ce qui est le plus près de Nino.
    const marge = this.mode === 'side' ? 30 : 6;
    const p =
      this.mode === 'side'
        ? { x: this.player.sprite.x, y: this.player.sprite.y - 6 }
        : this.player.probe();
    let best: Live | undefined;
    let bestDist = Infinity;
    let bestRank = 0;
    // Un ballon ne se vise pas : il suffit d'en être près, quel que soit le sens du
    // regard. On compare alors avec Nino lui-même, pas avec le point qu'il regarde.
    const moi = { x: this.player.sprite.x, y: this.player.sprite.y - 4 };

    for (const l of this.live) {
      if (!l.def.dialogue && !l.def.portal && !l.def.ballon) continue;
      const rank = this.rank(l.def);
      if (rank < bestRank) continue;
      const ou = this.ou(l);
      const m = l.def.ballon ? BALLON_PORTEE : (l.def.portee ?? marge);
      const vise = l.def.ballon ? moi : p;
      // Marge volontairement large : à 7 ans, on ne se place pas au pixel près.
      const r = new Phaser.Geom.Rectangle(
        ou.x - m,
        ou.y - m,
        l.go.displayWidth + m * 2,
        l.go.displayHeight + m * 2,
      );
      if (!r.contains(vise.x, vise.y)) continue;
      const d = Phaser.Math.Distance.Between(
        vise.x,
        vise.y,
        ou.x + l.go.displayWidth / 2,
        ou.y + l.go.displayHeight / 2,
      );
      if (rank > bestRank || d < bestDist) {
        bestRank = rank;
        bestDist = d;
        best = l;
      }
    }
    return best;
  }

  /**
   * Où l'objet est vraiment. La plupart ne bougent pas et leur position déclarée fait
   * l'affaire — mais le ballon roule et les personnages errent, et viser leur point de
   * départ pendant qu'ils sont ailleurs ne marche pas.
   */
  private ou(l: Live): { x: number; y: number } {
    return l.def.ballon || l.def.errance
      ? { x: Math.round(l.go.x), y: Math.round(l.go.y) }
      : { x: l.def.x, y: l.def.y };
  }

  private showBulle(): void {
    if (!this.target) {
      this.bulle.setVisible(false);
      return;
    }
    const ou = this.ou(this.target);
    this.bulle
      .setPosition(Math.round(ou.x + this.target.go.displayWidth / 2), ou.y - 1)
      .setVisible(true);
  }

  private interact(l: Live): void {
    if (l.def.portal) {
      this.usePortal(l);
      return;
    }
    if (l.def.id === 'hermione') {
      jouer(this, 'hermione', { volume: 0.7 });
      this.trouveHermione(l);
      return;
    }
    if (l.def.id === 'araignee') {
      this.ditUnHaiku(l);
      return;
    }
    if (l.def.id === 'poisson') {
      this.histoireDuPoisson(l);
      return;
    }
    if (l.def.id === 'moon' && state.flag('chat-parle') && !state.flag('parents-sortis')) {
      this.diversion(l);
      return;
    }
    if (l.def.ballon) {
      this.taperDansLeBallon(l);
      return;
    }
    if (l.def.id === 'parapente' && !state.flag('parapente-pris')) {
      this.sauterDuToit(l);
      return;
    }
    // Rentré par la fenêtre, parapente sous le bras : c'est la fin du chapitre.
    if (l.def.id === 'lit' && state.flag('parapente-rentre') && !state.flag('anniversaire')) {
      this.faireSemblant(l);
      return;
    }
    if (l.def.saute) this.sortirDeLEau(l);
    if (l.def.sprite === 'moon' && !state.flag('chat-parle')) jouer(this, 'chat', { volume: 0.7 });
    if (l.def.sprite === 'elephant') jouer(this, 'elephant', { volume: 0.7 });
    if (l.def.dialogue) this.runDialogue(l.def.dialogue, l);
  }

  /**
   * Affiche un sprite le temps d'une réplique (Nino couché dans son lit, par exemple)
   * et renvoie de quoi le retirer.
   */
  private montrer(m?: Montre): () => void {
    if (!m) return () => {};
    const img = this.add
      .image(m.x, m.y, texKey(m.sprite, this.pal), m.frame)
      .setOrigin(0, 0)
      .setDepth(m.depth ?? m.y + 20);
    if (m.cacheNino) this.player.sprite.setVisible(false);
    return () => {
      img.destroy();
      if (m.cacheNino) this.player.sprite.setVisible(true);
    };
  }

  private runDialogue(id: string, l?: Live): void {
    const beat = pickBeat(id);
    if (!beat) return;

    // Une énigme : on propose les réponses, et seule la bonne applique ses effets.
    if (beat.enigme) {
      const e = beat.enigme;
      say({
        speaker: beat.speaker,
        lines: beat.lines,
        choices: e.reponses,
        focusY: l?.def.y,
        onDone: (reponse) => {
          const juste = reponse === e.bonne;
          jouer(this, juste ? 'enigme-juste' : 'enigme-faux', { volume: 0.6 });
          const branche = juste ? e.juste : e.faux;
          const retirerBranche = this.montrer(branche.montre);
          say({
            speaker: beat.speaker,
            lines: branche.lines,
            focusY: l?.def.y,
            onDone: () => {
              retirerBranche();
              this.applyEffects(branche.effects, l);
            },
          });
        },
      });
      return;
    }

    const retirer = this.montrer(beat.montre);
    say({
      speaker: beat.speaker,
      lines: beat.lines,
      choices: beat.choice ? ['Oui', 'Non'] : undefined,
      focusY: l?.def.y,
      onDone: (answer) => {
        retirer();
        this.applyEffects(beat.effects, l);
        if (!beat.choice) return;
        // La réponse enchaîne sur sa propre réplique, avec sa mise en scène.
        const branch = answer === 0 ? beat.choice.oui : beat.choice.non;
        const retirerBranche = this.montrer(branch.montre);
        say({
          speaker: beat.speaker,
          lines: branch.lines,
          focusY: l?.def.y,
          onDone: () => {
            retirerBranche();
            this.applyEffects(branch.effects, l);
          },
        });
      },
    });
  }

  private applyEffects(e: Effects | undefined, l?: Live): void {
    if (!e) return;
    if (e.flag) state.setFlag(e.flag);
    // On note l'écran où le robinet a été ouvert : le poisson arrivera quelques
    // écrans plus tard.
    if (e.flag === 'eau-coule') state.eauDepuis = state.ecrans;
    if (e.flag === 'bateau-coule') jouer(this, 'bateau-coule', { volume: 0.7 });
    if (e.cool) this.applyFraicheur(e.cool, l);
    if (e.take) state.take(e.take);
    if (e.give) {
      state.give(e.give);
      const item = ITEMS[e.give];
      toast(ANNONCES.objetRecu(item.name), e.give);
      jouer(this, 'objet-trouve', { volume: 0.6 });
      if (l) {
        sparkle(
          this,
          this.pal,
          Math.round(l.def.x + l.go.displayWidth / 2),
          Math.round(l.def.y + l.go.displayHeight / 2),
        );
      }
    }
    state.save();
    this.refreshObjects();
    bus.emit(EV.hud);
  }

  /**
   * Un moyen de se rafraîchir vient d'être trouvé. Si la température change assez
   * pour faire basculer la lumière de la maison, on reconstruit la pièce : c'est la
   * récompense visible de la quête.
   */
  private applyFraicheur(id: string, l?: Live): void {
    const degres = state.trouveFraicheur(id);
    if (degres === 0) return;
    const f = fraicheur(id)!;
    toast(`${degres > 0 ? '+' : ''}${degres}\u00b0  ${labelFraicheur(f.id)}`);
    if (l && degres < 0) {
      sparkle(
        this,
        this.pal,
        Math.round(l.def.x + l.go.displayWidth / 2),
        Math.round(l.def.y + l.go.displayHeight / 2),
      );
    }
  }

  private usePortal(l: Live): void {
    const p = l.def.portal!;
    const closed =
      (p.needs && !state.has(p.needs)) || (p.needsFlag && !state.flag(p.needsFlag));
    if (closed) {
      jouer(this, 'refus', { volume: 0.5 });
      if (p.lockedDialogue) this.runDialogue(p.lockedDialogue, l);
      return;
    }
    // Premier passage : on raconte l'ouverture, on ne traverse pas encore.
    if (p.firstDialogue && p.opensFlag && !state.flag(p.opensFlag)) {
      this.runDialogue(p.firstDialogue, l);
      return;
    }
    this.transitioning = true;
    this.player.freeze(this.mode);
    state.locked = true;
    // Un escalier n'est pas un portail : on monte des marches, ça ne scintille pas.
    jouer(this, l.def.id.startsWith('escalier') ? 'escalier' : 'portail', { volume: 0.6 });
    portalWarp(this, this.pal, () => {
      if (p.minijeu) {
        // L'interface appartient au monde : le mini-jeu a la sienne.
        this.scene.stop('Ui');
        this.scene.start(p.minijeu);
        return;
      }
      this.scene.restart({ room: p.room, x: p.x, y: p.y });
    });
  }

  /**
   * Va directement à une étape du jeu (développement seulement). On coupe l'interface
   * avant de reconstruire : sinon une boîte de dialogue restée ouverte survit au saut
   * et garde le clavier pour elle.
   */
  private allerEtape(e: Etape): void {
    if (this.transitioning) return;
    // On repart de zéro à chaque saut : une étape doit donner exactement la même
    // chose à chaque fois, sans traîner ce que le saut précédent avait posé.
    state.reset();
    for (const f of e.flags ?? []) state.setFlag(f);
    for (const i of e.items ?? []) state.give(i);
    if (e.haiku !== undefined) state.haiku = e.haiku;
    if (e.hermione !== undefined) state.hermione = e.hermione;
    if (e.eauVieille) {
      state.setFlag('eau-coule');
      state.eauDepuis = 0;
      state.ecrans = 99;
    }
    state.locked = false;
    state.save();

    this.scene.stop('Ui');
    if (e.minijeu) {
      this.scene.start(e.minijeu);
      return;
    }
    // Le bandeau de la pièce annonce l'arrivée : on sait où on a atterri.
    this.scene.restart({ room: e.room, x: e.x, y: e.y });
  }

  // ──────────────────────────────────────────────────────────────── portes

  private doorUnderPlayer(): Door | undefined {
    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    const me = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);
    return this.room.doors.find((d) =>
      Phaser.Geom.Intersects.RectangleToRectangle(
        me,
        new Phaser.Geom.Rectangle(d.x, d.y, d.w, d.h),
      ),
    );
  }

  /**
   * Une porte qui refuse sans être fermée : quelqu'un, de l'autre côté, s'en occupe.
   * On repousse Nino hors de la zone AVANT de parler, sinon la porte se redéclenche
   * dès que la boîte de dialogue se referme, et on n'entend plus que ça.
   */
  private porteBloquee(door: Door): void {
    // On le renvoie vers l'intérieur de la pièce, pas vers l'endroit d'où il vient :
    // arrivé dans l'embrasure, il est déjà de l'autre côté du milieu de la porte, et
    // le calculer à partir de sa position le poussait dans le mur.
    jouer(this, 'refus', { volume: 0.5 });
    const s = this.player.sprite;
    const largeur = this.room.tiles[0].length * 8;
    if (door.x <= 0) s.x = door.x + door.w + 6;
    else if (door.x + door.w >= largeur) s.x = door.x - 6;
    else if (door.y <= 0) s.y = door.y + door.h + 12;
    else s.y = door.y - 2;
    this.player.freeze(this.mode);

    // Les répliques s'enchaînent : Moon rassure, puis on entend ce que ça lui coûte.
    const suite = (i: number) => {
      const beat = pickBeat(door.blockedDialogue![i]);
      if (!beat) return;
      say({
        speaker: beat.speaker,
        lines: beat.lines,
        focusY: door.y,
        onDone: () => {
          if (i + 1 < door.blockedDialogue!.length) suite(i + 1);
        },
      });
    };
    if (door.blockedDialogue?.length) suite(0);
  }

  private goThroughDoor(door: Door): void {
    jouer(this, 'porte', { volume: 0.5 });
    this.transitioning = true;
    this.player.freeze(this.mode);
    state.locked = true;
    gbFade(this, this.pal, 'out', () => {
      this.scene.restart({ room: door.to.room, x: door.to.x, y: door.to.y });
    });
  }

  // ─────────────────────────────────────────────────────────────── clavier

  private bindKeys(): void {
    const kb = this.input.keyboard!;
    const map = {} as Record<keyof typeof KEYS, Phaser.Input.Keyboard.Key[]>;
    for (const [name, codes] of Object.entries(KEYS)) {
      map[name as keyof typeof KEYS] = codes.map((c) => kb.addKey(c));
    }
    this.keys = map;
  }

  private down(name: keyof typeof KEYS): boolean {
    return this.keys[name].some((k) => k.isDown);
  }

  private just(name: keyof typeof KEYS): boolean {
    // On consomme toutes les touches de l'alias, pas seulement la première.
    return this.keys[name].map((k) => Phaser.Input.Keyboard.JustDown(k)).some(Boolean);
  }
}
