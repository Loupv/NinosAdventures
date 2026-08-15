import Phaser from 'phaser';
import { GB, GRAVITY, KEYS } from '../config';
import { THEMES, SOLID } from '../art/tiles';
import { paletteAube, paletteNocturne, shade, shadeHex, type PaletteId } from '../art/palette';
import { animKey, blankCanvas, paintArt, texKey } from '../art/pixels';
import { ROOMS, nomDuLieu, type Door, type Room, type RoomObject } from '../data/rooms';
import { ARROSABLES, CHARACTER_SPRITES } from '../data/characters';
import { ITEMS, type ItemId } from '../data/items';
import { pickBeat, type DialogueBeat, type Effects, type Montre } from '../data/dialogues';
import {
  ANNONCES,
  ARAIGNEE_PARTIE,
  NAUFRAGE,
  AU_BORD_DE_LEAU,
  LA_JOIE_DU_BATEAU,
  MAMAN_PARTIE,
  PAPA_BRICOLE,
  PAPA_GRAIN,
  POISSON_PART,
  PAPA_NAGE,
  ARROSES,
  ARROSE_DEFAUT,
  BAREME,
  RENOTE,
  ECUREUIL_FUITE,
  ECUREUIL_MOUILLE,
  ECUREUIL_RIT,
  ECUREUIL_TREMPE,
  VERRES_PAPA,
  VERRES_PARRAIN,
  ECUREUIL_VANNES,
  JARDINIER_MERCI,
  JARDINIER_PART,
  CREDITS,
  GENERIQUE,
  QUITTER,
  PLANTE,
  PLANTES,
  PLANTES_TOUTES,
  PLANTE_ARROSEE,
  arrosee,
  plantesSauvees,
  PIGEON,
  PIGEON_PERCHOIR,
  PISTOLET_RENDU,
  CHALEUR,
  CHANSON,
  COUPLETS,
  DIVERSION,
  FETE,
  GROGNEMENT,
  HAIKUS,
  LE_CHAT,
  PARENTS,
  PANIQUE,
  POISSON,
  PRESENTATION_ARAIGNEE,
  REFUS,
  RENCONTRE,
  RETIRE,
  SEMBLANT,
  SORTIR_DU_LIT,
  VIE,
  OBJETS,
  QUEL_OBJET,
  beatObjet,
  portables,
} from '../data/textes';
import {
  CACHETTES,
  CACHETTES_MAISON,
  cachetteActuelle,
  hermioneSuit,
  mamanRenonce,
  rappel,
} from '../data/hermione';
import { piece } from '../data/pieces';
import { state } from '../systems/state';
import { EV, bus, say, toast, type Buttons } from '../systems/bus';
import { gbFade, portalWarp, sparkle, splash } from '../systems/fx';
import { jouer, jouerAmbiance, jouerMusique } from '../systems/audio';
import { musiquePour } from '../data/sons';
import { Player, type ViewMode } from '../entities/Player';
import { ETAPES, type Etape } from '../dev/etapes';
import { PixelText, measure } from '../ui/PixelText';
import { LINE_H, wrap } from '../art/font';

/**
 * **Hermione ne copie pas le chemin de son frère : elle a le sien.**
 *
 * Deux régimes, et une seule règle — la distance. Au-delà de `SUIT_LOIN`, elle revient vers lui, en
 * ligne droite et d'un bon pas. En deçà, **elle vaque** : elle se choisit un point au hasard autour
 * de Nino, elle y va sans se presser, elle s'arrête un moment, elle recommence. Elle reste donc
 * toujours dans ses pattes sans jamais lui coller au train, et elle bouge encore quand il ne bouge
 * plus — ce qui est exactement ce que fait un enfant d'un an dans une pièce où il y a son frère.
 *
 * Deux versions ont précédé celle-ci. La première la faisait viser la position de Nino trente-quatre
 * images plus tôt : dès qu'il s'arrêtait, elle se figeait sur place, souvent à la porte par laquelle
 * on venait d'entrer. La deuxième lui faisait remonter sa trace point par point — correct, mais
 * c'était un wagon, pas une petite sœur.
 */
const SUIT_PROCHE = 22;
const SUIT_LOIN = 34;
const SUIT_VITESSE = 46;
const SUIT_FLANE = 18;

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
  /**
   * **La position réelle, avec ses décimales.** Elle est indispensable : à quatorze pixels par
   * seconde, un pas fait moins d'un quart de pixel par image. En écrivant l'arrondi dans le
   * sprite et en le relisant à l'image suivante, la fraction était perdue à chaque fois et
   * personne ne bougeait jamais d'un pixel — Maman, les copains, l'écureuil de la tour et le
   * pigeon étaient tous immobiles sans que ça saute aux yeux.
   */
  x: number;
  y: number;
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

/** Ce qui dépasse de l'eau quand le poisson parle, en pixels. Le reste est sous la surface. */
const EMERGE = 5;

/**
 * Le temps qu'une pièce reste à l'écran pendant le générique, en ms — et le temps plus court des
 * **mentions de fin**, qui sont des vannes d'une ligne et non des cartons de personnage. À quatre
 * secondes pour tout le monde, le générique durait plus d'une minute et on l'attendait.
 */
const GENERIQUE_ETAPE = 3600;
const GENERIQUE_COURT = 2600;

/** Le temps que met la bosse à passer d'une étape à la suivante, dans la trompe. En ms. */
const MONTEE = 800;

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

/** Vivant, donc arrosable : il a quelque chose à dire **et** ce n'est pas un meuble. */
const vivant = (l: { def: RoomObject }) =>
  !!l.def.dialogue && ARROSABLES.has(l.def.sprite ?? '');

interface Arrival {
  room?: string;
  x?: number;
  y?: number;
  /**
   * **Étape du générique.** Quand ce champ est là, la pièce est rejouée en mode cinéma : pas de
   * Nino, pas de clavier, pas de bandeau de lieu, rien de sauvegardé — juste le décor, ses
   * personnages qui bougent, et une ligne de remerciement en bas de l'écran.
   */
  cinema?: number;
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
  /** Hermione, quand elle suit Nino : elle vaque autour de lui. */
  private suiveuse?: Live;
  /** Le ballon, s'il y en a un dans la pièce : le seul objet qui bouge tout seul. */
  private ballon?: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  /** Les poissons de la pièce, avec où ils en sont de leur saut. */
  private sauteurs: Sauteur[] = [];
  /**
   * Où en est Hermione : sa position **en flottant** (arrondie à chaque image, elle avancerait d'un
   * pixel entier par frame quelle que soit sa vitesse), le point qu'elle s'est choisi, et le temps
   * qu'elle passe à ne rien faire avant d'en choisir un autre.
   */
  private suit?: { x: number; y: number; cible?: { x: number; y: number }; attente: number };
  /** Distance parcourue depuis le dernier bruit de pas, en pixels. */
  private depuisLePas = 0;
  /** Vrai quand le ballon a été frappé fort et n'est pas encore retombé au calme. */
  private ballonEnVol = false;
  /** Combien de fois l'écureuil s'est moqué : il change de vanne à chaque tir raté. */
  private vannes = 0;
  /** Combien de phrases papa a marmonnées sur son bateau : il ne se répète pas d'affilée. */
  private bricolages = 0;
  /** Combien de fois on a dérangé un pigeon : il ne s'en va pas deux fois pareil. */
  private pigeonneries = 0;
  /** Gouttes de pluie en vol : la pluie de l'éléphant est plafonnée. */
  private gouttes = 0;
  /** Et les giclées du bout de la trompe. */
  private jets = 0;
  /** Combien de fois on a arrosé l'écureuil de la tour : il ne râle pas deux fois pareil. */
  private mouillé = 0;
  /** La vanne affichée au-dessus de lui, s'il y en a une. */
  private vanne?: PixelText;
  private errants: Errant[] = [];
  private transitioning = false;
  /** Vrai pendant le générique : la pièce se regarde, elle ne se joue pas. */
  private cinema = false;
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
    this.suit = undefined;
    this.ballon = undefined;
    this.ballonEnVol = false;
    this.vanne = undefined;
    this.sauteurs = [];
    this.errants = [];
    this.transitioning = false;
  }

  create(): void {
    this.bindKeys();
    // **Le générique n'a pas d'interface** : ni jauge, ni boîte de dialogue, ni bandeau de lieu.
    this.cinema = this.arrival.cinema !== undefined;
    if (this.cinema) this.scene.stop('Ui');
    else if (!this.scene.isActive('Ui')) this.scene.launch('Ui');

    // Une sauvegarde peut pointer vers une pièce qui n'existe plus : on rentre.
    const wanted = this.arrival.room ?? state.room;
    const id = ROOMS[wanted] ? wanted : 'chambre';
    this.room = ROOMS[id];
    state.room = id;
    // La musique de l'endroit. Redemander celle qui joue déjà ne la fait pas repartir :
    // toute la maison partage la même boucle. Le générique, lui, garde la musique avec
    // laquelle il est arrivé — il traverse toutes les pièces, ce serait un zapping.
    if (!this.cinema) jouerMusique(this, musiquePour(id));
    // Et les grillons, par-dessus, dès que la nuit est tombée — jusqu'au retour en parapente.
    if (!this.cinema)
      jouerAmbiance(this, state.flag('nuit') && !state.flag('parapente-rentre') ? 'nuit' : undefined);
    // L'heure du jour, en deux drapeaux. On se lève vers midi ; la nuit tombe en entrant
    // dans la tour ; sur le toit le ciel pâlit déjà — et une fois rentré par la fenêtre
    // c'est le matin, donc les couleurs du jour à nouveau.
    if (this.room.heure && !this.cinema) state.setFlag(this.room.heure);
    this.pal =
      state.flag('aube') && !state.flag('parapente-rentre')
        ? paletteAube(paletteNocturne(this.room.palette))
        : state.flag('nuit') && !state.flag('parapente-rentre')
          ? paletteNocturne(this.room.palette)
          : this.room.palette;
    state.palette = this.pal;
    this.mode = this.room.view ?? 'top';
    this.roomW = this.room.tiles[0].length * GB.TILE;
    this.roomH = this.room.tiles.length * GB.TILE;
    this.physics.world.gravity.y = this.mode === 'side' ? GRAVITY : 0;
    const known = state.vu(id);
    // Le générique ne visite rien et ne fait rien arriver : il regarde.
    if (!this.cinema) {
      state.visit(id);
      state.ecrans += 1;
      this.chosesQuiArrivent();
    }
    // On note la première visite de l'Erdre après coup : le bateau ne peut pas être
    // déjà là au moment où on découvre l'endroit.

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

    // Une pièce plus large que l'écran : la caméra suit Nino. Pendant le générique elle
    // traverse la pièce toute seule, et Nino n'est pas là.
    this.cameras.main.setBounds(0, 0, this.roomW, this.roomH);
    if (!this.cinema && (this.roomW > GB.W || this.roomH > GB.H)) {
      this.cameras.main.startFollow(this.player.sprite, true, 0.15, 0.15);
    }
    if (this.cinema) this.player.sprite.setVisible(false);
    if (this.mode === 'side') this.player.sprite.setDepth(10);

    // Après le joueur : quand Hermione le suit, elle a besoin de sa position.
    this.spawnHermione();

    this.bulle = this.add
      .image(0, 0, texKey('bulle', this.pal))
      .setOrigin(0.5, 1)
      .setDepth(1200)
      .setVisible(false);

    state.locked = true;
    if (this.cinema) {
      gbFade(this, this.pal, 'in', () => this.etapeDuGenerique(this.arrival.cinema ?? 0));
      return;
    }
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
      // **Le naufrage rattrapé.** Si on est parti pendant que le bateau descendait, il a
      // fini sans nous : on revient, il n'y a plus de bateau et papa est sur le quai. « Personne
      // ne regardait » — c'était déjà écrit dans le texte de la corde.
      if (id === 'erdre' && state.flag('bateau-coule') && !state.flag('papa-sauve')) {
        state.setFlag('papa-dans-leau');
        state.setFlag('papa-sauve');
        state.save();
        this.refreshObjects();
      }
      // Au sortir du rêve de la fusée : il raconte son rêve à personne. Hermione, elle,
      // est déjà apparue au bord du lit — c'est le flag du rêve qui l'a mise là, et on ne
      // la commente pas.
      if (id === 'chambre-parents' && state.flag('reve-fait') && !state.flag('reve-raconte')) {
        this.time.delayedCall(500, () => {
          if (this.room.id === 'chambre-parents' && !state.locked && !this.transitioning) {
            this.runDialogue('sortie-du-reve');
          }
        });
      }
      // **Papa bricole tout haut.** Il ne voit pas Nino, il a un bouchon qui fuit, et il
      // commente son propre travail : c'est ce qui le rend occupé.
      if (id === 'erdre') this.papaBricole();
      /**
       * **La nuit tombe au pied de la tour**, et le jeu le dit une fois. C'est la seule narration
       * d'ambiance qui se déclenche toute seule : elle ne demande rien, elle ne bloque rien, elle
       * donne l'heure — et elle rappelle qu'on est attendu à la maison.
       */
      if (id === 'tour-pied' && !state.flag('nuit-dite')) {
        state.setFlag('nuit-dite');
        state.save();
        this.time.delayedCall(700, () => {
          if (this.room.id === 'tour-pied' && !state.locked && !this.transitioning) {
            this.runDialogue('nuit-tombe');
          }
        });
      }
    });
    if (this.cinema) return;
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
        /** Met un objet dans le sac : le pistolet à eau sans ouvrir le coffre. */
        sac: (id: ItemId) => {
          state.give(id);
          bus.emit(EV.hud);
          return [...state.items];
        },
        /** La liste des étapes, pour la retrouver sans lire le code. */
        etapes: () => ETAPES.map((e) => `${e.touche} · ${e.nom}`),
        /** Sauter à une étape depuis la console : celles qui n'ont plus de touche. */
        etape: (touche: string) => {
          const e = ETAPES.find((x) => x.touche === touche);
          if (e) this.allerEtape(e);
          return e?.nom ?? '?';
        },
      };

      /**
       * **Seuls les chiffres 1 à 5 sautent dans le jeu.** Les lettres étaient aussi branchées, et
       * un enfant qui cherche la touche du pistolet à eau se retrouvait téléporté au pied de la
       * Tour de Bretagne sans comprendre pourquoi. Les autres étapes restent accessibles depuis la
       * console : `nino.etape('f')`.
       */
      this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => {
        if (!/^[1-5]$/.test(ev.key)) return;
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
    /**
     * **La sueur sèche dès qu'on sort de la chambre.** Elle dégouline sur le sol si Nino a traîné
     * au lit, et trois flaques au pied du lit pour toute la partie, c'est une tache, pas une
     * blague. Le temps de traverser une pièce et c'est sec.
     */
    if (state.flag('sueur') && this.room.id !== 'chambre') state.setFlag('sueur-sechee');

    const ECRANS = 3;
    if (
      state.flag('eau-coule') &&
      !state.flag('poisson-arrive') &&
      state.ecrans - state.eauDepuis >= ECRANS
    ) {
      state.setFlag('poisson-arrive');
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

    // **Avec la vue** : sans elle, le quai de l'Erdre se pilotait comme une pièce vue de
    // dessus — on y marchait verticalement, et tout le code de la vue de profil (gravité,
    // pas de saut, retournement du sprite) ne servait à rien.
    this.player.move(
      {
        up: this.down('up'),
        down: this.down('down'),
        left: this.down('left'),
        right: this.down('right'),
      },
      this.mode,
    );
    this.bruitDesPas(delta);
    this.mamanSurveille();
    if (this.just('arroser')) this.tirerAuPistolet();

    const door = this.doorUnderPlayer();
    if (door) {
      const fermee =
        (door.blockedIfFlag &&
          state.flag(door.blockedIfFlag) &&
          !(door.blockedSaufFlag && state.flag(door.blockedSaufFlag))) ||
        (door.needsFlag && !state.flag(door.needsFlag));
      if (fermee) this.porteBloquee(door);
      else this.goThroughDoor(door);
      return;
    }

    this.jouerAuBallon();
    this.sauter(delta);
    this.errer(delta);
    this.suivreNino(delta);
    this.target = this.findTarget();
    this.showBulle();

    if (btn.action && this.target) this.interact(this.target);
    if (btn.journal) {
      state.locked = true;
      this.scene.launch('Journal');
    }
    // ÉCHAP : on quitte la partie et on revient au titre — d'où l'on peut repartir à zéro.
    if (btn.cancel) this.quitter();
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
    // Une planche d'images s'il est animé — ou s'il **marche en patrouillant** : ses animations
    // sont dans `patrouille`, parce que ce sont celles d'un aller-retour, pas d'un état.
    // Et s'il **pourrait** s'animer un jour (`animIfFlag`) : le rafraîchissement ne sait
    // animer que les sprites — le seau du poisson naissait image, et ne sautait jamais.
    if (anim || def.patrouille?.marche || def.animIfFlag) {
      const s = this.add.sprite(def.x, def.y, key, frame);
      if (anim) s.play(animKey(anim, pal));
      go = s;
    } else {
      go = this.add.image(def.x, def.y, key, frame);
    }
    go.setOrigin(0, 0);
    // Une zone d'interaction n'a pas de dessin : elle a une taille, une portée, et c'est tout.
    if (def.zone) go.setVisible(false);
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
    // Ce qui flotte est découpé à la surface dès son apparition : la coque est à moitié
    // immergée sans qu'on ait eu à la dessiner deux fois.
    this.couperALaFlottaison(live);

    /**
     * **Les cent pas.** C'est pour papa sur son pont : de l'endroit où Nino s'arrête, la poupe est
     * hors du cadre, et un père qu'on ne voit jamais ne sert à rien.
     */
    if (def.patrouille) {
      go.setPosition(def.patrouille.gauche, def.y);
      this.patrouiller(live, def.patrouille, true);
    }

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
    if (def.errance && this.mode !== 'side' && (!def.errance.apres || state.flag(def.errance.apres))) {
      this.errants.push({
        live,
        ancreX: def.x,
        ancreY: def.y,
        cibleX: def.x,
        cibleY: def.y,
        x: def.x,
        y: def.y,
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

    // Un tir part, puis retombe au calme : s'il n'a rien cassé, quelqu'un va le dire.
    const vitesse = b.velocity.length();
    if (vitesse > BALLON_CASSE) this.ballonEnVol = true;
    else if (this.ballonEnVol && vitesse < 4) {
      this.ballonEnVol = false;
      if (!state.flag('fenetre-cassee')) this.vanner();
    }

    if (state.flag('fenetre-cassee') || vitesse < BALLON_CASSE) return;
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
    /**
     * **Une vitre qui casse dans une maison vide ne fait pas de bruit.** Mais la maison ne se
     * vide pas à la diversion : les parents courent après le chat **dedans**, et tant que Nino
     * ne les a pas vus au bord de l'Erdre, quelqu'un est derrière ce mur. C'est donc la première
     * visite de l'Erdre qui fait le silence — `parents-sortis` tombe trop tôt, à la seconde même
     * où casser la vitre devient possible, et papa ne grondait jamais. Maman regronde une fois
     * rentrée sous la pluie ; entre les deux, il ne reste que l'écureuil, qui rit.
     */
    const personne = state.vu('erdre') && !state.flag('maman-quai-partie');
    if (!personne) {
      this.runDialogue('fenetre-cassee', vitre);
      return;
    }
    const lui = this.live.find((l) => l.def.id === 'ecureuil');
    if (lui) this.flotter(ECUREUIL_RIT, lui);
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

  /**
   * **Un aller, une pause, un retour, une pause.** Il marche jusqu'au bout du pont, **se penche sur
   * sa coque** le temps qu'il faut, et repart dans l'autre sens. Deux animations, deux états, et
   * chaque étape rappelle la suivante — un va-et-vient qui ne s'arrête que quand le bateau coule.
   *
   * Le glissement seul ne suffisait pas : un dessin qui se déplace sans bouger les jambes n'est pas
   * quelqu'un qui marche, c'est un objet qu'on pousse.
   */
  private patrouiller(l: Live, p: NonNullable<RoomObject['patrouille']>, versLaDroite: boolean): void {
    const go = l.go;
    if (p.marche && go instanceof Phaser.GameObjects.Sprite) {
      go.play(animKey(p.marche, this.pal), true);
    }
    this.tweens.add({
      targets: go,
      x: versLaDroite ? p.droite : p.gauche,
      duration: p.duree,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Arrivé au bout, il se baisse sur sa coque. On le retrouve par son identifiant :
        // entre deux trajets, un rafraîchissement de la pièce peut avoir remplacé le sien.
        if (!this.live.includes(l) || state.flag('bateau-coule')) return;
        if (p.arret && go instanceof Phaser.GameObjects.Sprite) {
          go.play(animKey(p.arret, this.pal), true);
        }
        this.time.delayedCall(p.pause ?? 0, () => {
          if (!this.live.includes(l) || state.flag('bateau-coule')) return;
          this.patrouiller(l, p, !versLaDroite);
        });
      },
    });
  }

  /**
   * **Deux adultes parlent bateau, Nino écoute.** Le parrain s'enthousiasme, papa approuve au
   * conditionnel, et le « ahem » dit tout le reste. La dernière réplique change selon que sa coque
   * est au fond de l'Erdre ou juste percée : c'est la même gêne, à un naufrage près.
   */
  private discussionDuBateau(): void {
    state.locked = true;
    state.setFlag('joie-bateau');
    state.save();
    // Deux conversations, pas deux fins de conversation : un père dont le bateau est au fond de
    // l'Erdre ne parle pas de son bouchon comme s'il avait encore une coque à réparer.
    const suite = LA_JOIE_DU_BATEAU[state.flag('bateau-coule') ? 'coule' : 'flotte'];
    const dire = (i: number) => {
      if (i >= suite.length) return;
      const beat = suite[i];
      say({ speaker: beat.qui, lines: beat.lignes, focusY: 48, onDone: () => dire(i + 1) });
    };
    dire(0);
  }

  /**
   * **Papa se parle à lui-même en réparant.** Une phrase au-dessus de lui toutes les six
   * secondes, sans boîte et sans verrou : on n'est pas son interlocuteur, on est le gamin qui
   * regarde son père bricoler. Il se tait pendant les dialogues — et pour de bon quand son
   * bateau est au fond, où il a d'autres phrases.
   */
  private papaBricole(): void {
    this.time.addEvent({
      delay: 6000,
      startAt: 3800,
      loop: true,
      callback: () => {
        const lui = this.live.find((l) => l.def.id === 'papa-capitaine');
        if (!lui || state.locked || this.transitioning || state.flag('bateau-coule')) return;
        // **Seulement s'il est à l'écran.** Le texte flottant se recale dans le cadre quand son
        // personnage en sort : sans ce test, une phrase de papa apparaissait au bord de l'écran
        // alors qu'il était cinquante pixels plus loin, sans personne dessous.
        const cam = this.cameras.main;
        if (lui.go.x < cam.scrollX || lui.go.x > cam.scrollX + cam.width) return;
        this.flotter(PAPA_BRICOLE[this.bricolages % PAPA_BRICOLE.length], lui);
        this.bricolages += 1;
      },
    });
  }

  /**
   * **Le naufrage.** Le bouchon a sauté : le bateau descend de trente pixels en huit
   * secondes, et papa descend avec, debout, sans jamais rien lâcher. Ce qui rend la scène,
   * c'est la lenteur — et le fait que **personne n'appuie sur rien** : les répliques flottent
   * au-dessus de lui, l'une après l'autre, pendant qu'il s'enfonce.
   *
   * La ligne de flottaison découpe le bateau et papa à mesure : ils entrent dans l'eau, ils
   * n'y glissent pas dessus. Quand l'eau passe le chapeau, c'est « Blublublub. »
   */
  private coulerLeBateau(): void {
    const bateau = this.live.find((l) => l.def.id === 'bateau');
    const papa = this.live.find((l) => l.def.id === 'papa-capitaine');
    if (!bateau || !papa) return;
    jouer(this, 'bateau-coule', { volume: 0.7 });
    // Il s'arrête de faire les cent pas et se redresse : à partir d'ici, il a autre chose à
    // gérer, et un capitaine coule debout.
    this.tweens.killTweensOf(papa.go);
    if (papa.go instanceof Phaser.GameObjects.Sprite) {
      papa.go.anims.stop();
      papa.go.setFrame('marche-0');
    }

    const DUREE = 8000;
    const FOND = 32;
    /**
     * **Il penche d'abord, il descend ensuite.** Une seconde et demie où le bateau se couche sur
     * la gauche sans encore s'enfoncer — l'eau entre par là, c'est de ce côté que ça penche — et
     * c'est là que tombe la première réplique de papa. Un bateau qui descend tout droit ne dit
     * pas qu'il a un trou.
     *
     * La bascule se fait à l'angle, autour du coin haut-gauche du dessin : six degrés suffisent,
     * et papa se penche avec, debout dans sa coque, sans jamais rien lâcher.
     */
    const PENCHE = 1500;
    // Papa se tient à trente-six pixels de l'axe de bascule : le pont **se relève** sous ses pieds
    // de quatre pixels, et il monte avec. Sans ça, il s'enfonçait dans sa propre coque.
    const leve = (l: Live) => (l === papa ? -4 : 0);
    for (const l of [bateau, papa]) {
      this.tweens.add({
        targets: l.go,
        angle: -6,
        y: l.go.y + leve(l),
        duration: PENCHE,
        ease: 'Sine.easeOut',
      });
      this.tweens.add({
        targets: l.go,
        y: l.go.y + leve(l) + FOND,
        duration: DUREE,
        delay: PENCHE,
        ease: 'Sine.easeIn',
        onUpdate: () => this.couperALaFlottaison(l),
        onComplete: () => this.couperALaFlottaison(l),
      });
    }

    // Une réplique tous les 1,3 s, la première pendant qu'il penche. La dernière tombe quand
    // l'eau lui passe au-dessus du chapeau — d'où le décalage : elle n'est pas dans la même
    // série que les autres.
    NAUFRAGE.forEach((phrase, i) => {
      this.time.delayedCall(500 + i * 1300, () => {
        // On le retrouve par son identifiant à chaque fois : entre deux répliques, un
        // rafraîchissement des objets peut avoir remplacé le sien.
        const lui = this.live.find((l) => l.def.id === 'papa-capitaine');
        if (!lui || this.room.id !== 'erdre') return;
        if (i === NAUFRAGE.length - 1) state.setFlag('papa-dans-leau');
        this.flotter(phrase, lui);
      });
    });

    this.time.delayedCall(PENCHE + DUREE + 900, () => {
      if (this.room.id !== 'erdre') return;
      state.setFlag('papa-dans-leau');
      state.save();
      this.papaNage(papa);
    });
  }

  /**
   * **Papa remonte et s'en va à la nage.** Vers la droite, sans se presser, jusqu'à sortir du
   * cadre — et il dit sa phrase en passant. Le poisson n'y est plus pour rien : on le voyait
   * flotter à côté de lui sans comprendre ce qu'il faisait là, et un poisson qui remorque un
   * adulte ne se lit pas.
   */
  private papaNage(papa: Live): void {
    const go = papa.go;
    go.setPosition(go.x, 58);
    this.couperALaFlottaison(papa);
    // Il nage : la tête sort de l'eau, monte et descend, et il avance.
    this.tweens.add({
      targets: go,
      y: 56,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.couperALaFlottaison(papa),
    });
    this.tweens.add({
      targets: go,
      x: this.roomW + 20,
      duration: 6000,
      ease: 'Linear',
      onUpdate: () => this.couperALaFlottaison(papa),
      onComplete: () => {
        state.setFlag('papa-sauve');
        state.save();
        this.refreshObjects();
      },
    });
    this.time.delayedCall(1200, () => {
      const lui = this.live.find((x) => x.def.id === 'papa-capitaine');
      if (lui) this.flotter(PAPA_NAGE, lui);
    });
  }

  /**
   * **La discussion au bord de l'eau.** Nino tombe sur une conversation entre le poisson et
   * l'éléphant : le poisson se demande ce qu'il y a plus loin, l'éléphant répond « la mer », et
   * ça finit par un poisson dans une trompe. Personne ne s'adresse à Nino, et c'est ce qui rend
   * la scène drôle — il n'a rien demandé, il regarde.
   *
   * À la fin, l'éléphant lance le poisson vers la mer, et **c'est ce geste qui fait la pluie**.
   */
  private discussionAuBordDeLEau(elephant: Live): void {
    const poisson = this.live.find((x) => x.def.id === 'poisson-erdre');
    /**
     * **Il parle depuis l'eau, la tête dehors.** On le sort de la liste des sauteurs — sinon il
     * replongerait au milieu d'une phrase — et on le pose sur la **ligne de flottaison de sa
     * bande** : le ventre est découpé à la surface, et seule la partie émergée se dessine.
     *
     * Plus haut, il avait l'air figé au milieu d'un saut, c'est-à-dire hors de l'eau.
     */
    if (poisson) {
      const s = this.sauteurs.find((x) => x.live === poisson);
      if (s) this.sauteurs = this.sauteurs.filter((x) => x !== s);
      const eau = poisson.def.saute?.eau ?? 64;
      if (poisson.go instanceof Phaser.GameObjects.Sprite) {
        poisson.go.anims.stop();
        poisson.go.setFrame('saut-0');
      }
      poisson.go.setPosition(elephant.go.x - 18, eau - EMERGE);
      poisson.go.setCrop(0, 0, poisson.go.displayWidth, EMERGE);
      poisson.go.setVisible(true);
    }
    state.locked = true;
    const suite = (i: number) => {
      if (i >= AU_BORD_DE_LEAU.length) {
        this.lancerLePoisson(elephant, poisson);
        return;
      }
      const beat = AU_BORD_DE_LEAU[i];
      say({
        speaker: beat.qui,
        lines: beat.lignes,
        focusY: 30,
        onDone: () => suite(i + 1),
      });
    };
    suite(0);
  }

  /**
   * **Le poisson monte dans la trompe, et ça prend le temps que ça prend.** Quatre secondes où
   * personne n'appuie sur rien : il nage jusqu'au bout de la trompe et disparaît dessous, une
   * **bosse** apparaît au pied du tuyau — c'est lui —, la trompe se lève à mi-hauteur, puis
   * tout en haut, et la bosse remonte à chaque étape.
   *
   * On ne dit rien de tout ça. Une bosse qui monte dans une trompe se comprend sans légende, et
   * c'est le seul moment du jeu où il faut laisser le temps de regarder.
   */
  private lancerLePoisson(elephant: Live, poisson?: Live): void {
    state.locked = true;
    state.setFlag('poisson-parti');
    const img = elephant.go as Phaser.GameObjects.Sprite;
    // Il arrête de boire : sans ça, son animation de trompe écraserait toutes les images de la
    // scène une demi-seconde après qu'on les a posées.
    img.anims.stop();

    // Il nage jusqu'au bout de la trompe, sous la surface, et on ne le revoit qu'en l'air. Le bout
    // est tout à gauche du dessin, là où la trompe plonge : deux pixels après le bord.
    if (poisson) {
      this.tweens.add({
        targets: poisson.go,
        x: elephant.go.x + 2,
        y: 60,
        duration: 800,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          poisson.go.setVisible(false);
          jouer(this, 'plouf', { volume: 0.5 });
        },
      });
    }

    const etapes = ['avale', 'mi-trompe', 'boule', 'boule-haut'];
    etapes.forEach((f, i) => this.time.delayedCall(900 + i * MONTEE, () => img.setFrame(f)));
    this.time.delayedCall(900 + etapes.length * MONTEE, () => this.averse(elephant, poisson));
  }

  /**
   * Découpe un dessin à la ligne de flottaison de la pièce : ce qui est sous l'eau ne se
   * dessine pas. Une image sous la ligne disparaît entièrement, ce qui est exactement ce
   * qu'on veut d'un bateau qui coule.
   */
  private couperALaFlottaison(l: Live): void {
    if (l.def.flotte === undefined) return;
    // La découpe se compte en pixels du dessin, pas en pixels d'écran : l'éléphant est affiché
    // au double, et sans cette division il ne serait jamais coupé du tout.
    const echelle = l.go.scaleY || 1;
    const haut = Phaser.Math.Clamp((l.def.flotte - l.go.y) / echelle, 0, l.go.height);
    l.go.setCrop(0, 0, l.go.width, haut);
  }

  /**
   * L'écureuil se moque d'un tir raté. Le texte s'affiche **au-dessus de lui, sans boîte
   * de dialogue et sans bloquer** : on est en train de jouer au ballon, ce n'est pas le
   * moment de lire. Il ne dit rien avant de s'être présenté une première fois.
   */
  private vanner(): void {
    const lui = this.live.find((l) => l.def.id === 'ecureuil');
    if (!lui || !state.flag('ecureuil-vu')) return;
    this.flotter(ECUREUIL_VANNES[this.vannes % ECUREUIL_VANNES.length], lui);
    this.vannes += 1;
  }

  /**
   * Une phrase posée au-dessus de quelqu'un, sans boîte et sans verrou.
   *
   * Deux précautions, apprises sur l'Erdre qui fait deux écrans de large :
   *  - **le texte vit dans la pièce, pas sur l'écran.** `PixelText` est fait pour
   *    l'interface et ignore la caméra ; posé au-dessus de quelqu'un, il tombait hors du
   *    cadre dès que la pièce défilait.
   *  - **son canevas fait la largeur de la phrase**, une phrase trop longue passe à la
   *    ligne, et le tout est ramené dans le champ de la caméra. Sans ça, « Un capitaine ne
   *    quitte pas son navire » — deux cent dix-sept pixels — sortait de l'écran par la
   *    droite, et il ne restait que « Un capitaine ne quit ».
   */
  private flotter(t: string, sur: Live): void {
    this.vanne?.destroy();
    const MAX = 140;
    const lignes = measure(t) <= MAX ? [t] : wrap(t, MAX);
    const large = Math.max(...lignes.map(measure)) + 2;
    const texte = new PixelText(this, 'wl-vanne', 0, 0, large, LINE_H * lignes.length + 1);
    texte.image.setDepth(1300);
    texte.image.setScrollFactor(1);
    texte.setLines(lignes, shadeHex(this.pal, 3));
    const cam = this.cameras.main;
    texte.image.setPosition(
      Phaser.Math.Clamp(
        Math.round(sur.go.x + sur.go.displayWidth / 2 - large / 2),
        Math.round(cam.scrollX) + 2,
        Math.round(cam.scrollX + cam.width) - large - 2,
      ),
      Math.round(sur.go.y - 12 - LINE_H * (lignes.length - 1)),
    );
    /**
     * **Le texte flottant emporte son fond.** En encre sombre à même le décor, il devenait illisible
     * dès que le sol était foncé — les pavés de la ville, l'eau de l'Erdre, la nuit de la tour. Un
     * rectangle plein derrière, et il se lit partout, sans devenir une boîte de dialogue pour
     * autant : on continue de jouer pendant qu'il s'affiche.
     */
    const fond = this.add
      .rectangle(
        texte.image.x - 2,
        texte.image.y - 1,
        large + 4,
        LINE_H * lignes.length + 3,
        shade(this.pal, 0),
      )
      .setOrigin(0, 0)
      .setScrollFactor(1)
      .setDepth(1299);
    this.vanne = texte;
    this.time.delayedCall(1700, () => {
      if (this.vanne === texte) this.vanne = undefined;
      fond.destroy();
      texte.destroy();
    });
  }

  /**
   * **Qui est dans le jet.** Le plus proche à quarante pixels, du côté où Nino regarde, parmi ce
   * qui a un dialogue — et on ignore ce qui est trop loin en travers. C'est volontairement généreux :
   * viser au pixel près à sept ans n'a aucun intérêt, et le jet part de toute façon.
   */
  private quiEstDansLeJet(): Live | undefined {
    const f = this.player.facing;
    const moi = { x: this.player.sprite.x, y: this.player.sprite.y - 4 };
    const PORTEE = 40;
    let best: Live | undefined;
    let bestDist = Infinity;
    for (const l of this.live) {
      if (!vivant(l)) continue;
      const c = { x: l.go.x + l.go.displayWidth / 2, y: l.go.y + l.go.displayHeight / 2 };
      const dx = c.x - moi.x;
      const dy = c.y - moi.y;
      // Devant lui, pas derrière : on n'arrose pas dans son dos.
      if (f === 'left' && dx > 4) continue;
      if (f === 'right' && dx < -4) continue;
      if (f === 'up' && dy > 4) continue;
      if (f === 'down' && dy < -4) continue;
      const d = Math.hypot(dx, dy);
      if (d > PORTEE || d >= bestDist) continue;
      bestDist = d;
      best = l;
    }
    return best;
  }

  /**
   * **Le pistolet à eau, sur sa propre touche.** Il ne pouvait pas passer par ESPACE :
   * l'écureuil a une énigme à poser dans la tour, et une interaction ne peut pas être
   * les deux à la fois. X arrose ce qu'on a en face — et si ce n'est personne, ça arrose
   * le vide, ce qui est déjà un jeu en soi quand on a sept ans.
   *
   * Deux écureuils, deux réactions : celui de la cour s'en va pour de bon, celui de la
   * tour change de coin en râlant et garde son énigme entière.
   */
  private tirerAuPistolet(): void {
    if (!state.has('pistolet-eau') || state.locked || this.transitioning) return;
    const main = { x: Math.round(this.player.sprite.x), y: Math.round(this.player.sprite.y - 8) };
    /**
     * **On arrose ce qui est vivant** : les gens et les bêtes, pas le mobilier. Dans ce jeu un vélo
     * a un dialogue comme tout le monde, mais un vélo arrosé n'a rien à répondre. Et on arrose
     * **plus loin qu'on ne parle** — un pistolet qui exige d'être collé à sa cible n'est pas un
     * pistolet, c'est une poignée de main : à défaut de quelqu'un dans la portée des dialogues, on
     * prend le plus proche à quarante pixels, du côté où Nino regarde.
     */
    const vise = this.target && vivant(this.target) ? this.target : this.quiEstDansLeJet();
    // Sans personne en face, le jet part droit devant : arroser le vide fait partie du jeu.
    const f = this.player.facing;
    const loin = {
      x: main.x + (f === 'left' ? -30 : f === 'right' ? 30 : 0),
      y: main.y + (f === 'up' ? -26 : f === 'down' ? 26 : 0),
    };
    const cible = vise
      ? {
          x: Math.round(vise.go.x + vise.go.displayWidth / 2),
          y: Math.round(vise.go.y + vise.go.displayHeight / 2),
        }
      : loin;

    jouer(this, 'pistolet', { volume: 0.6 });
    for (let i = 0; i < 3; i++) {
      const g = this.add
        .image(main.x, main.y, texKey('goutte', this.pal))
        .setOrigin(0.5, 0.5)
        .setDepth(1350);
      this.tweens.add({
        targets: g,
        x: cible.x,
        y: cible.y,
        duration: 240,
        delay: i * 80,
        ease: 'Quad.easeOut',
        onComplete: () => {
          g.destroy();
          if (i < 2) return;
          splash(this, this.pal, cible.x, cible.y);
          if (!vise) return;
          if (vise.def.id === 'ecureuil') {
            state.locked = true;
            say({
              speaker: 'L’écureuil',
              lines: ECUREUIL_TREMPE,
              focusY: 130,
              onDone: () => this.ecureuilDetale(vise),
            });
          } else if (vise.def.sprite === 'ecureuil') {
            this.ecureuilChangeDeCoin(vise);
          } else if (vise.def.id === 'pigeon-terrasse') {
            this.pigeonRenverseLesVerres(vise);
          } else if (PLANTES.some((pl) => pl.id === vise.def.id)) {
            this.arroserUnePlante(vise);
          } else {
            // Tous les autres : une phrase blasée au-dessus de la tête, et on continue. Sauf la
            // maîtresse, qui retient — et qui le fera payer d'un point à la notation.
            if (vise.def.id === 'maitresse') {
              state.setFlag('maitresse-arrosee');
              state.save();
            }
            const quoi = ARROSES[vise.def.id] ?? ARROSES[vise.def.sprite ?? ''] ?? ARROSE_DEFAUT;
            this.flotter(quoi[this.mouillé % quoi.length], vise);
            this.mouillé += 1;
          }
        },
      });
    }
  }

  /**
   * **La troisième bêtise de l'écureuil.** Le pigeon arrosé décolle par-dessus la table de
   * papa, emporte les deux verres au passage, et quitte l'écran par le haut — pour toujours.
   * Papa a tout vu, son fils, le pistolet, le jet ; il accuse le pigeon quand même. Dehors,
   * c'est toujours le pigeon, comme à la maison c'est toujours le chat.
   *
   * Les verres tombés restent au sol le temps de la visite ; au retour, la table est
   * simplement vide (`frameIfFlag`) — le serveur est passé.
   */
  private pigeonRenverseLesVerres(l: Live): void {
    state.locked = true;
    // Plus d'errance : à partir d'ici, c'est un vol, pas une promenade.
    this.errants = this.errants.filter((e) => e.live !== l);
    const table = this.live.find((x) => x.def.id === 'table-papa');
    const tx = table?.def.x ?? 64;
    const ty = table?.def.y ?? 52;
    l.go.setDepth(1500);
    // 1. Il décolle vers la table — c'est sur son chemin, pas un détour.
    this.tweens.add({
      targets: l.go,
      x: tx + 5,
      y: ty - 8,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => {
        jouer(this, 'vitre-cassee', { volume: 0.5 });
        if (table) (table.go as Phaser.GameObjects.Image).setFrame('vide');
        // 2. Les deux verres partent chacun de leur côté et finissent couchés au sol.
        for (const cote of [-1, 1]) {
          const v = this.add
            .image(tx + 7 + cote * 5, ty + 1, texKey('verre', this.pal))
            .setOrigin(0.5, 0.5)
            .setDepth(ty + 24);
          this.tweens.add({
            targets: v,
            x: v.x + cote * 9,
            y: ty + 15,
            angle: cote * 90,
            duration: 260,
            ease: 'Quad.easeIn',
            onComplete: () => {
              jouer(this, 'objet-tombe', { volume: 0.6 });
              splash(this, this.pal, Math.round(v.x), Math.round(v.y));
            },
          });
        }
        // 3. Et il quitte le quartier par le haut, sans un mot, comme d'habitude.
        this.tweens.add({
          targets: l.go,
          x: this.roomW + 20,
          y: -20,
          duration: 650,
          ease: 'Quad.easeIn',
          onComplete: () => {
            l.go.setVisible(false);
            state.setFlag('verres-tombes');
            state.save();
            say({
              speaker: 'Papa',
              lines: VERRES_PAPA,
              focusY: ty,
              onDone: () =>
                say({
                  speaker: 'Le parrain',
                  lines: VERRES_PARRAIN,
                  focusY: ty,
                  onDone: () => {
                    state.locked = false;
                  },
                }),
            });
          },
        });
      },
    });
  }

  /**
   * **La seule chose du jeu que l'eau améliore.** La plante se redresse, elle fleurit, et elle reste
   * comme ça pour toujours : c'est un dessin de plus, pas un effet. Tout le reste de ce que fait le
   * pistolet est une phrase blasée.
   *
   * **Et la septième compte double** : quand plus aucune n'a soif, le jeu le dit une fois — sans
   * félicitations, sans fanfare — et l'écran de fin s'en souviendra. Le jardinier de la place, lui,
   * s'en apercevra tout seul.
   */
  private arroserUnePlante(l: Live): void {
    state.setFlag(arrosee(l.def.id));
    (l.go as Phaser.GameObjects.Image).setFrame('radieuse');
    jouer(this, 'objet-trouve', { volume: 0.4 });
    const toutes = plantesSauvees() >= PLANTES.length;
    if (toutes) state.setFlag('plantes-toutes');
    state.save();
    if (!toutes) {
      this.flotter(PLANTE_ARROSEE, l);
      return;
    }
    state.locked = true;
    say({ lines: PLANTES_TOUTES, focusY: l.def.y, onDone: () => this.jardinierArrive(l) });
  }

  /**
   * **Le jardinier arrive dans la pièce où la septième plante a bu.** N'importe laquelle : une
   * chambre, une cuisine, le hall d'une tour de trente-deux étages. Il pousse la porte la plus
   * proche, il traverse, il remercie — puis **il se rend compte d'où il est** et il repart par où
   * il est venu.
   *
   * C'est le seul personnage du jeu qui relève l'absurde. Tous les autres l'avalent sans broncher :
   * Maman arrive en sous-marin sur un quai et personne ne dit rien. Lui, il aura fallu sept plantes
   * pour qu'il se demande ce qu'il fait là — et c'est ce décalage qui fait la blague.
   *
   * Rien ne dépend de cette scène : elle se joue une fois, elle ne donne rien, et le merci est déjà
   * acquis quand elle commence.
   */
  private jardinierArrive(l: Live): void {
    state.locked = true;
    state.setFlag('jardinier-merci');
    state.save();
    // Par la porte la plus proche de la plante, comme Maman quand elle vient chercher Hermione.
    const porte = this.entrees().reduce((a, b) =>
      Phaser.Math.Distance.Between(a.x, a.y, l.def.x, l.def.y) <
      Phaser.Math.Distance.Between(b.x, b.y, l.def.x, l.def.y)
        ? a
        : b,
    );
    const depart = { x: Math.round(porte.x - 4), y: Math.round(porte.y - 15) };
    const lui = this.add
      .image(depart.x, depart.y, texKey('jardinier', this.pal))
      .setOrigin(0, 0)
      .setDepth(depart.y + 16);
    const profondeur = () => lui.setDepth(lui.y + lui.displayHeight);

    // À côté de la plante, du côté où il reste de la place.
    const cote = l.def.x > this.roomW / 2 ? -12 : 12;
    const vers = { x: Math.round(l.def.x + cote), y: Math.round(l.def.y + 4) };

    const repartir = () => {
      this.tweens.add({
        targets: lui,
        x: depart.x,
        y: depart.y,
        duration: this.duree(lui.x, lui.y, depart.x, depart.y),
        onUpdate: profondeur,
        onComplete: () => {
          lui.destroy();
          state.locked = false;
        },
      });
    };

    const parler = () => {
      say({
        speaker: JARDINIER_MERCI.qui,
        lines: JARDINIER_MERCI.lignes,
        focusY: vers.y,
        onDone: () =>
          say({
            speaker: JARDINIER_PART.qui,
            lines: JARDINIER_PART.lignes,
            focusY: vers.y,
            onDone: repartir,
          }),
      });
    };

    this.tweens.add({
      targets: lui,
      x: vers.x,
      y: vers.y,
      duration: this.duree(depart.x, depart.y, vers.x, vers.y),
      onUpdate: profondeur,
      onComplete: parler,
    });
  }

  /**
   * **Ce que dit une plante**, choisi ici parce qu'un dialogue ne sait pas de quel objet il parle :
   * les sept partagent le même texte, et seule la scène sait laquelle a déjà bu.
   */
  private parlerALaPlante(l: Live): void {
    const lignes = state.flag(arrosee(l.def.id))
      ? PLANTE.arrosee
      : state.has('pistolet-eau')
        ? PLANTE.sechePistolet
        : PLANTE.seche;
    state.locked = true;
    say({ lines: lignes, focusY: l.def.y });
  }

  /**
   * L'écureuil de la tour, arrosé : il traverse le palier en couinant et se réinstalle
   * ailleurs. Son énigme n'a pas bougé d'un mot — c'était juste pour le plaisir.
   */
  private ecureuilChangeDeCoin(l: Live): void {
    const coins = [
      { x: 84, y: 60 },
      { x: 48, y: 44 },
      { x: 108, y: 64 },
      { x: 52, y: 96 },
    ];
    const i = coins.findIndex((c) => c.x === l.def.x && c.y === l.def.y);
    const ou = coins[(i + 1) % coins.length];
    this.flotter(ECUREUIL_MOUILLE[this.mouillé % ECUREUIL_MOUILLE.length], l);
    this.mouillé += 1;
    l.def.x = ou.x;
    l.def.y = ou.y;
    this.target = undefined;
    jouer(this, 'pas', { volume: 0.4, rate: 2.4 });
    this.tweens.add({
      targets: l.go,
      x: ou.x,
      y: ou.y,
      duration: 380,
      ease: 'Quad.easeInOut',
      onUpdate: () => l.go.setDepth(l.go.y + l.go.displayHeight),
    });
  }

  /**
   * On l'a arrosé : il détale. Il file en diagonale hors de l'écran et
   * ne revient pas — jusqu'à la prochaine visite, parce qu'un écureuil ne retient rien.
   */
  private ecureuilDetale(l: Live): void {
    state.locked = true;
    this.vanne?.destroy();
    this.vanne = undefined;
    this.target = undefined;
    this.live = this.live.filter((o) => o !== l);
    this.errants = this.errants.filter((e) => e.live !== l);
    jouer(this, 'pas', { volume: 0.5, rate: 2.4 });
    this.tweens.add({
      targets: l.go,
      x: l.go.x + 90,
      y: l.go.y + 26,
      duration: 480,
      ease: 'Quad.easeIn',
      onComplete: () => {
        l.go.destroy();
        say({ lines: [ECUREUIL_FUITE], focusY: 130 });
      },
    });
  }

  /**
   * **L'averse, dans l'ordre.** Le jet **d'abord, tout seul** : la trompe est en l'air, l'eau
   * part droit vers le haut et sort du cadre, et pendant deux secondes il ne se passe que ça —
   * assez pour comprendre d'où va venir la pluie. Le poisson part avec, en criant.
   *
   * **Puis les gouttes retombent**, partout au hasard de la largeur. Et seulement une fois qu'il
   * pleut pour de bon, la caméra va voir Maman : elle doit lever la tête sous une vraie averse,
   * pas sous un jet qui monte.
   */
  private averse(l: Live, poisson?: Live): void {
    (l.go as Phaser.GameObjects.Image).setFrame('trompe');
    jouer(this, 'plouf', { volume: 0.7 });

    // **Le jet ne s'arrête pas.** Il sort du bout de la trompe et monte hors du cadre, en
    // continu : c'est lui qui explique la pluie. Tant qu'on est là, il envoie de l'eau.
    this.time.addEvent({ delay: 110, loop: true, callback: () => this.unJet(l) });

    // Le poisson part avec le jet : il sort du bout de la trompe, pas de l'eau. On tue d'abord sa
    // nage — sans ça, les deux mouvements se disputent le sprite et il repart de l'eau.
    if (poisson) {
      this.tweens.killTweensOf(poisson.go);
      poisson.go.setCrop();
      if (poisson.go instanceof Phaser.GameObjects.Sprite) {
        poisson.go.play(animKey('poisson-saut', this.pal));
      }
      poisson.go.setPosition(l.go.x + 14, l.go.y).setVisible(true);
      // **Droit en l'air, avec le jet.** En diagonale il avait l'air lancé à la main ; à la
      // verticale, il part comme ce qui l'envoie — et la mer, il la trouvera tout seul.
      this.tweens.add({
        targets: poisson.go,
        x: l.go.x + 14 + Math.round(Math.random() * 8 - 4),
        y: -40,
        duration: 1600,
        ease: 'Quad.easeOut',
        onComplete: () => {
          poisson.go.destroy();
          this.live = this.live.filter((x) => x !== poisson);
        },
      });
    }

    /**
     * Le travelling attend **deux choses** : que la pluie ait commencé, et que le cri du poisson
     * ait été lu. Sans ce compte à deux, un joueur rapide envoyait Maman lever la tête sous un
     * ciel sec, et un joueur lent voyait deux boîtes de dialogue se marcher dessus.
     */
    let pret = 0;
    const puis = () => {
      pret += 1;
      if (pret < 2 || this.room.id !== 'erdre') return;
      this.mamanVoitLaPluie();
    };

    this.time.delayedCall(500, () =>
      say({ speaker: POISSON_PART.qui, lines: POISSON_PART.lignes, focusY: 30, onDone: puis }),
    );

    // Deux secondes de jet seul, puis la pluie, **sans fin** : une goutte toutes les quarante
    // millisecondes, et il ne s'arrête pas. La trompe reste levée, il continue d'envoyer de
    // l'eau, et ça ne cesse que quand on quitte l'écran — le minuteur meurt avec la scène.
    // Revenir plus tard, c'est revenir au sec.
    this.time.delayedCall(2000, () => {
      this.time.addEvent({ delay: 40, loop: true, callback: () => this.uneGoutte() });
      // L'averse s'entend : le fichier fait 1,4 s avec des fondus larges, relancé toutes les
      // 1,1 s les lectures se chevauchent — une pluie continue. Le minuteur meurt avec la scène.
      jouer(this, 'pluie', { volume: 0.5 });
      this.time.addEvent({ delay: 1100, loop: true, callback: () => jouer(this, 'pluie', { volume: 0.5 }) });
      puis();
    });
  }

  /**
   * Une giclée qui part du bout de la trompe et monte **droit en l'air**, hors du cadre. Elle
   * dévie de trois pixels à peine : un jet en diagonale ressemblait à un arrosage, pas à un
   * éléphant qui souffle vers le ciel.
   */
  private unJet(l: Live): void {
    if (this.jets >= 8) return;
    this.jets += 1;
    const bout = { x: Math.round(l.go.x + 14), y: Math.round(l.go.y + 2) };
    const j = this.add
      .image(bout.x, bout.y, texKey('goutte', this.pal))
      .setOrigin(0.5, 0.5)
      .setDepth(1200);
    this.tweens.add({
      targets: j,
      x: bout.x + Math.round(Math.random() * 6 - 3),
      y: bout.y - 44 - Math.random() * 24,
      duration: 620,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.jets -= 1;
        j.destroy();
      },
    });
  }

  /**
   * Une goutte de pluie, quelque part dans le champ, qui tombe jusqu'au quai.
   *
   * **Quarante gouttes au maximum en même temps.** La pluie ne s'arrête jamais : sans ce
   * plafond, une image perdue ou un onglet en arrière-plan laisserait les gouttes s'empiler
   * indéfiniment. Quarante, c'est déjà une averse.
   */
  private uneGoutte(): void {
    if (this.gouttes >= 40) return;
    this.gouttes += 1;
    const cam = this.cameras.main;
    const x = Math.round(cam.scrollX + Math.random() * cam.width);
    const g = this.add
      .image(x, -4, texKey('goutte', this.pal))
      .setOrigin(0.5, 0.5)
      .setDepth(1150);
    const sol = 92 + Math.random() * 14;
    this.tweens.add({
      targets: g,
      y: sol,
      duration: 520 + Math.random() * 160,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.gouttes -= 1;
        if (Math.random() < 0.35) splash(this, this.pal, Math.round(g.x), Math.round(sol));
        g.destroy();
      },
    });
  }

  /**
   * **On va la voir.** La caméra quitte Nino et se déplace jusqu'au banc, parce que toute la
   * scène est là-bas : Maman lève la tête sous l'averse. La réplique se lit **pendant qu'elle
   * est à l'écran**, et ce n'est qu'après qu'elle se met à courir — avant, elle partait avant
   * qu'on ait eu le temps de la voir.
   */
  private mamanVoitLaPluie(): void {
    const maman = this.live.find((x) => x.def.id === 'maman-quai');
    if (!maman) return;
    const beat = pickBeat('maman-pluie');
    const cam = this.cameras.main;
    cam.stopFollow();
    cam.pan(maman.go.x, cam.midPoint.y, 700, 'Sine.easeInOut');
    state.locked = true;
    this.time.delayedCall(800, () => {
      if (!beat) {
        this.mamanSEnfuit(maman);
        return;
      }
      say({
        speaker: beat.speaker,
        lines: beat.lines,
        focusY: 30,
        onDone: () => this.mamanSEnfuit(maman),
      });
    });
  }

  /**
   * Elle part en courant vers la maison, Hermione sous le bras, et la caméra la laisse filer
   * avant de revenir à Nino. Le bout du quai est libre à partir de là — c'est ce que valait la
   * pluie.
   */
  private mamanSEnfuit(maman: Live): void {
    const petite = this.live.find((x) => x.def.id === 'hermione-bras');
    state.locked = true;
    jouer(this, 'cri-maman', { volume: 0.5 });
    for (const qui of [maman, petite]) {
      if (!qui) continue;
      this.tweens.add({
        targets: qui.go,
        x: qui.go.x - 300,
        duration: 2400,
        ease: 'Quad.easeIn',
      });
    }
    this.time.delayedCall(2600, () => {
      state.setFlag('maman-quai-partie');
      state.save();
      this.refreshObjects();
      /**
       * **Et papa, qui n'a pas levé la tête.** Sa femme vient de partir en courant avec sa fille
       * sous le bras, il pleut sur tout l'écran, et il en est à la météo. La caméra est encore sur
       * le bateau : c'est le bon moment, et c'est la seule fois où on l'entend sans lui parler.
       */
      const lui = this.live.find((x) => x.def.id === 'papa-capitaine');
      if (lui) this.flotter(PAPA_GRAIN, lui);
      // **Puis la caméra revient sur Nino**, en travelling elle aussi : elle est allée voir la
      // scène, elle revient au personnage. Reprendre le suivi d'un coup ferait un saut.
      const cam = this.cameras.main;
      this.time.delayedCall(1600, () =>
        cam.pan(this.player.sprite.x, cam.midPoint.y, 700, 'Sine.easeInOut'),
      );
      this.time.delayedCall(2400, () => {
        cam.startFollow(this.player.sprite, true, 0.15, 0.15);
        // Le seul commentaire de la scène, et il arrive quand le quai est vide : ce n'est pas une
        // description de ce qu'on vient de voir, c'est ce que Nino en conclut.
        say({ lines: MAMAN_PARTIE, focusY: 130 });
      });
    });
  }

  /**
   * **Le pigeon.** Une boîte de texte — le texte flottant se lisait mal sur les pavés — puis,
   * **quand la boîte se ferme**, il s'écarte. On lit ce qu'il fait, ensuite il le fait, et on
   * le voit le faire : dans l'autre ordre, il bougeait derrière la boîte.
   */
  private pigeonSeDecale(l: Live): void {
    /**
     * **Au septième dérangement, il change de quartier.** Six boîtes à se décaler d'un pas et à
     * regarder ailleurs, et puis il monte : sur le toit du tram, sur le mur de l'école, sur la table
     * où boivent deux adultes. Il n'explique rien, il ne redescend pas.
     */
    const monte = this.pigeonneries >= PIGEON.length && l.def.perchoir;
    const boite = monte ? PIGEON_PERCHOIR : PIGEON[this.pigeonneries % PIGEON.length];
    this.pigeonneries += 1;
    state.locked = true;
    say({
      lines: boite,
      focusY: l.def.y,
      onDone: () => (monte ? this.pigeonMonte(l) : this.pigeonSEcarte(l)),
    });
  }

  /** Il se pose là-haut, et il y reste : plus d'errance, plus de commentaire. */
  private pigeonMonte(l: Live): void {
    const p = l.def.perchoir;
    if (!p) return;
    this.errants = this.errants.filter((e) => e.live !== l);
    l.go.setPosition(p.x, p.y).setDepth(p.y + l.go.displayHeight);
    jouer(this, 'pas', { volume: 0.3, rate: 3.2 });
  }

  /**
   * Il s'écarte. On ne le pousse pas d'un tween : on déplace **le point qu'il visait** et son
   * ancre, et son errance l'y emmène de son propre pas. Il n'a donc pas l'air de fuir — il a
   * l'air d'avoir décidé d'aller ailleurs, ce qui est très différent.
   */
  private pigeonSEcarte(l: Live): void {
    const e = this.errants.find((x) => x.live === l);
    if (!e) return;
    const dir = Math.sign(l.go.x - this.player.sprite.x) || 1;
    e.attente = 0;
    const nx = Phaser.Math.Clamp(
      Math.round(l.go.x + dir * (14 + Math.random() * 10)),
      8,
      this.roomW - 8 - l.go.displayWidth,
    );
    const ny = Math.round(l.go.y + (Math.random() < 0.5 ? -5 : 5));
    if (this.solLibre(nx, ny, l.go.displayWidth, l.go.displayHeight)) {
      e.cibleX = nx;
      e.cibleY = ny;
      e.ancreX = nx;
      e.ancreY = ny;
    }
    // Un peu plus vif le temps de s'écarter : un pigeon dérangé n'a pas le même pas.
    e.vitesse = 26;
    jouer(this, 'pas', { volume: 0.3, rate: 2.8 });
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
   * **Nino s'arrête avant qu'on le voie.** Pas de porte, pas de mère qui gronde : une ligne
   * invisible à cinquante pixels du banc, où **il les repère et comprend tout seul** qu'il ne
   * faut pas aller plus loin. Se faire attraper ne donne rien à résoudre ; voir de loin, oui.
   *
   * Tant qu'ils sont là, il n'y a rien à tenter de ce côté — le quai, la corde, l'écureuil du
   * bout : tout ça attend qu'ils s'en aillent d'eux-mêmes.
   */
  private mamanSurveille(): void {
    if (this.room.id !== 'erdre' || state.flag('maman-quai-partie')) return;
    const maman = this.live.find((l) => l.def.id === 'maman-quai');
    if (!maman) return;
    const limite = maman.def.x - 50;
    if (this.player.sprite.x < limite) return;
    this.player.sprite.x = limite - 12;
    this.player.freeze(this.mode);
    state.locked = true;
    jouer(this, 'refus', { volume: 0.4 });
    this.runDialogue('maman-voit');
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
    this.goutteQuiTombe();
  }

  /**
   * **Il dégouline, et il le fait partout.** S'il a traîné au lit, Nino sort du lit trempé — et il
   * laisse une goutte tous les quatorze pixels, dans toutes les pièces qu'il traverse, jusqu'à ce
   * que **Maman le voie** : c'est ce qui donne son sens à sa seule réplique là-dessus, « Nino, tu
   * mets de l'eau partout !! »
   *
   * Les flaques du pied du lit, elles, sèchent en quittant la chambre : trois taches définitives
   * dans sa propre chambre, ce n'était plus une blague. La traînée, elle, se nettoie toute seule —
   * chaque goutte s'efface au bout de quelques secondes, et il n'en reste rien quand Maman a parlé.
   */
  private goutteQuiTombe(): void {
    if (!state.flag('sueur') || state.flag('maman-sueur')) return;
    const g = this.add
      .image(Math.round(this.player.sprite.x), Math.round(this.player.sprite.y + 4), texKey('goutte', this.pal))
      .setOrigin(0.5, 0.5)
      .setDepth(2);
    this.tweens.add({
      targets: g,
      alpha: 0,
      delay: 2600,
      duration: 900,
      onComplete: () => g.destroy(),
    });
  }

  /** Fait vivre les personnages : un pas, une pause, un autre pas. */
  private errer(dt: number): void {
    for (const e of this.errants) {
      const go = e.live.go;
      if (e.attente > 0) {
        e.attente -= dt;
        continue;
      }

      const dx = e.cibleX - e.x;
      const dy = e.cibleY - e.y;
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
      e.x += dx * pas;
      e.y += dy * pas;
      const x = Math.round(e.x);
      const y = Math.round(e.y);
      if (dx !== 0) go.setFlipX(dx < 0);
      go.setPosition(x, y);
      if (e.live.def.depth === undefined) go.setDepth(y + go.displayHeight);
      e.live.def.x = x;
      e.live.def.y = y;
    }
  }

  /** Vrai si un sprite de cette taille peut se tenir là, en vue de dessus. */
  /**
   * **Libre pour quelqu'un qui marche** : les tuiles, mais aussi les meubles. `solLibre` ne connaît
   * que le décor peint ; Hermione, qui trace sa route toute seule, traverserait sinon le canapé.
   */
  private placeLibre(x: number, y: number, w: number, h: number): boolean {
    if (!this.solLibre(x, y, w, h)) return false;
    const pieds = new Phaser.Geom.Rectangle(x + 1, y + h - 5, w - 2, 4);
    return !this.solids.some((s) =>
      Phaser.Geom.Intersects.RectangleToRectangle(pieds, s.getBounds()),
    );
  }

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
    // **Pas de suiveuse pendant l'anniversaire** : la cuisine a déjà son Hermione, attablée devant
    // le gâteau. Elles s'y retrouvaient toutes les deux, ce qui faisait une sœur de trop.
    if (state.flag('anniversaire')) return;
    if (hermioneSuit(state.hermione, this.room.id)) {
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
      this.suit = this.suiveuse
        ? { x: this.suiveuse.go.x, y: this.suiveuse.go.y, attente: 0 }
        : undefined;
      return;
    }
    const cachette = cachetteActuelle(state.hermione);
    if (!cachette || cachette.room !== this.room.id) return;
    // Une cachette peut attendre son heure : derrière la baignoire, il faut que l'eau soit
    // partie pour qu'on voie quelque chose. C'est ce qui rend le poisson obligatoire.
    if (cachette.revele && !state.flag(cachette.revele)) return;
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
   * **Elle reste dans les pattes de son frère, à sa façon.** Trop loin : elle revient droit sur lui.
   * Assez près : elle se choisit un point au hasard autour de lui, elle y va, elle s'arrête, elle
   * en choisit un autre. Elle ne rampe que quand elle se déplace, et elle bute sur les murs comme
   * tout le monde — un pas de côté quand la diagonale ne passe pas.
   */
  private suivreNino(dt: number): void {
    if (!this.suiveuse) return;
    const p = this.player.sprite;
    const go = this.suiveuse.go as Phaser.GameObjects.Sprite;
    const s = (this.suit ??= { x: go.x, y: go.y, attente: 0 });
    // Le point d'où elle regarde le monde : son milieu, pas son coin haut-gauche.
    const elle = { x: s.x + 4, y: s.y + 8 };
    const loin = Phaser.Math.Distance.Between(elle.x, elle.y, p.x, p.y);

    let cible: { x: number; y: number } | undefined;
    let vitesse = SUIT_FLANE;
    if (loin > SUIT_LOIN) {
      // Trop loin : elle laisse tomber ce qu'elle faisait et elle revient.
      cible = { x: p.x, y: p.y };
      vitesse = SUIT_VITESSE;
      s.cible = undefined;
      s.attente = 0;
    } else {
      // À portée : elle vaque. Un point autour de Nino, puis une pause, puis un autre.
      s.attente -= dt;
      if (!s.cible && s.attente <= 0) s.cible = this.pointAutourDe(p, go);
      cible = s.cible;
      if (cible && Phaser.Math.Distance.Between(elle.x, elle.y, cible.x, cible.y) < 3) {
        s.cible = undefined;
        s.attente = 500 + Math.random() * 1400;
        cible = undefined;
      }
    }

    let bouge = false;
    if (cible) {
      const pas = (vitesse * dt) / 1000;
      const a = Phaser.Math.Angle.Between(elle.x, elle.y, cible.x, cible.y);
      const dx = Math.cos(a) * pas;
      const dy = Math.sin(a) * pas;
      // La diagonale d'abord, puis un pas de côté : elle longe les meubles au lieu de s'y coller.
      for (const [ex, ey] of [
        [dx, dy],
        [dx, 0],
        [0, dy],
      ]) {
        if (this.placeLibre(Math.round(s.x + ex), Math.round(s.y + ey), go.displayWidth, go.displayHeight)) {
          s.x += ex;
          s.y += ey;
          bouge = true;
          break;
        }
      }
      // Coincée : elle abandonne ce point et en choisira un autre.
      if (!bouge) s.cible = undefined;
    }

    const nx = Math.round(s.x);
    const ny = Math.round(s.y);
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
   * Un point au hasard autour de Nino, dans le rayon où elle se tient — et **sur un sol libre**,
   * sinon elle viserait l'intérieur d'un meuble et resterait plantée devant.
   */
  private pointAutourDe(
    p: { x: number; y: number },
    go: Phaser.GameObjects.Sprite,
  ): { x: number; y: number } | undefined {
    for (let essai = 0; essai < 6; essai++) {
      const a = Math.random() * Math.PI * 2;
      const r = 10 + Math.random() * (SUIT_PROCHE - 10);
      const x = p.x + Math.cos(a) * r;
      const y = p.y + Math.sin(a) * r;
      if (this.placeLibre(Math.round(x - 4), Math.round(y - 8), go.displayWidth, go.displayHeight)) {
        return { x, y };
      }
    }
    return undefined;
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
    jouer(this, 'araignee-danse', { volume: 0.6 });
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
      jouer(this, 'araignee-part', { volume: 0.5 });
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
          jouer(this, 'objet-tombe', { volume: 0.7 });
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
    // Voir un poisson dans une baignoire donne faim à un chat. C'est ce flag qui, plus
    // tard, lui fera accepter la pizza.
    state.setFlag('poisson-vu');
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
      // La baignoire se vide pour de bon : on coupe l'animation de l'eau **avant** de
      // poser la frame, sinon le battement suivant la remettrait pleine.
      const cuve = this.live.find((o) => o.def.id === 'baignoire');
      if (cuve?.go instanceof Phaser.GameObjects.Sprite) cuve.go.anims.stop();
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
          // Le poisson vient de passer par le trou, sous son nez.
          jouer(this, 'grognement', { volume: 0.8 });
          say({
            speaker: 'Moon',
            lines: GROGNEMENT,
            focusY,
            onDone: () => {
              // Il n'ajoute un mot que s'il a déjà eu sa pizza : c'est elle qui l'a fait
              // parler. Sinon il grogne, et c'est tout.
              if (state.flag('chat-parle')) {
                say({ speaker: 'Moon', lines: LE_CHAT, focusY, onDone: repartir });
                return;
              }
              state.locked = true;
              this.time.delayedCall(900, repartir);
            },
          });
        },
      });
    };

    /**
     * Le chat se poste à la porte, puis **avance de quelques pas à chaque phrase**. Le
     * poisson panique d'une boîte à l'autre ; c'est le chat qui donne le tempo, et personne
     * n'explique pourquoi c'est un problème.
     *
     * Il **s'arrête à mi-chemin** : il n'a pas besoin d'arriver au bord pour que ce soit
     * une menace, et un chat qui s'arrête en chemin en est une plus grande qu'un chat
     * arrivé. Le poisson, lui, **ne lâche pas l'affaire** — dire non ne fait que ramener la
     * question, et il n'y a pas d'autre issue que le bouchon.
     */
    const MI_CHEMIN = { x: 92, y: 54 };
    /**
     * Là où le chat s'arrête pour de bon. Chaque refus le rapproche d'un tout petit pas —
     * et quand il ne bouge plus, on sait qu'on a vu tout ce que la scène avait à montrer.
     * Il n'atteint jamais le bord : il n'en a pas besoin.
     */
    const LIMITE = { x: 58, y: 50 };
    const pas = PANIQUE.length - 1;
    const insiste = (i: number) => {
      const dernierMot = i >= REFUS.length - 1;
      say({
        speaker: POISSON,
        lines: REFUS[Math.min(i, REFUS.length - 1)],
        choices: ['Oui', 'Non'],
        focusY,
        onDone: (reponse) => {
          if (reponse === 0) {
            boire();
            return;
          }
          if (dernierMot) {
            // Le chat est arrivé au bout de ce qu'il fera, le poisson au bout de ce qu'il
            // dira. On repose la même question, indéfiniment : c'est la seule sortie.
            insiste(i);
            return;
          }
          state.locked = true;
          const avance = (i + 1) / (REFUS.length - 1);
          this.tweens.add({
            targets: moon,
            x: Math.round(MI_CHEMIN.x + (LIMITE.x - MI_CHEMIN.x) * avance),
            y: Math.round(MI_CHEMIN.y + (LIMITE.y - MI_CHEMIN.y) * avance),
            duration: 420,
            ease: 'Sine.easeInOut',
            onUpdate: profondeur,
            onComplete: () => insiste(i + 1),
          });
        },
      });
    };

    const paniquer = (i: number) => {
      const derniere = i >= PANIQUE.length - 1;
      say({
        speaker: POISSON,
        lines: PANIQUE[i],
        choices: derniere ? ['Oui', 'Non'] : undefined,
        focusY,
        onDone: (reponse) => {
          if (derniere) {
            if (reponse === 0) boire();
            else insiste(0);
            return;
          }
          state.locked = true;
          // Un pas de plus, lentement, jusqu'à la moitié de la pièce et pas plus loin.
          const avance = (i + 1) / pas;
          this.tweens.add({
            targets: moon,
            x: Math.round(seuil.x + (MI_CHEMIN.x - seuil.x) * avance),
            y: Math.round(seuil.y + (MI_CHEMIN.y - seuil.y) * avance),
            duration: 620,
            ease: 'Sine.easeInOut',
            onUpdate: profondeur,
            onComplete: () => paniquer(i + 1),
          });
        },
      });
    };

    /** Il apparaît à la porte, et il regarde. C'est tout, pour l'instant. */
    const entrerLeChat = () => {
      state.locked = true;
      moon.setVisible(true);
      this.time.delayedCall(700, () => paniquer(0));
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

  /**
   * Le grand lit des parents. **Fermer les yeux lance le rêve tout de suite** : c'est le
   * même enchaînement que le saut du toit, avec la mise en scène de Nino couché pendant la
   * dernière réplique.
   */
  private sEndormir(l: Live): void {
    const beat = pickBeat('grand-lit');
    if (!beat?.choice) return;
    state.locked = true;
    say({
      lines: beat.lines,
      choices: ['Oui', 'Non'],
      focusY: l.def.y,
      onDone: (reponse) => {
        const branche = reponse === 0 ? beat.choice!.oui : beat.choice!.non;
        const retirer = this.montrer(branche.montre);
        say({
          lines: branche.lines,
          focusY: l.def.y,
          onDone: () => {
            this.applyEffects(branche.effects, l);
            if (reponse !== 0) {
              retirer();
              return;
            }
            // On garde Nino couché à l'écran pendant le fondu : c'est lui qui s'endort.
            this.transitioning = true;
            gbFade(this, this.pal, 'out', () => {
              retirer();
              this.scene.stop('Ui');
              this.scene.start('Flappy');
            });
          },
        });
      },
    });
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
      /**
       * **Chacun sa place au pied du lit.** Ils arrivaient tous les deux sur le même pixel : deux
       * parents parfaitement superposés, dont on ne voyait qu'un. Quatorze pixels d'écart, c'est-à-dire
       * une largeur de personnage et demie — on les voit tous les deux, et ils ont l'air de se tenir
       * côte à côte plutôt que de se marcher dessus.
       */
      this.tweens.add({
        targets: acteurs,
        x: (_cible: unknown, _clef: string, _valeur: number, i: number) => l.def.x + 18 + i * 14,
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
    /**
     * **La scène des bougies prend son temps.** Certaines répliques portent une `pause` : après
     * elles, le jeu attend avant d'ouvrir la boîte suivante, écran vide. C'est tout ce qu'il faut
     * pour qu'un silence soit un silence — sans ça, la dernière scène du jeu défilait aussi vite
     * qu'un dialogue de couloir, et la fin tombait comme un couperet.
     */
    const dire = (i: number) => {
      if (i >= FETE.length) {
        this.endormiSurLaTable();
        return;
      }
      // La boîte passe en haut : toute la scène du gâteau reste visible en dessous.
      // La réplique dit elle-même si un son l'accompagne, et le temps qu'on lui laisse après.
      if (FETE[i].son) jouer(this, FETE[i].son, { volume: 0.9 });
      const suite = () => {
        const pause = FETE[i].pause;
        if (!pause) {
          dire(i + 1);
          return;
        }
        this.time.delayedCall(pause, () => dire(i + 1));
      };
      say({ speaker: FETE[i].qui, lines: FETE[i].lignes, focusY: 110, onDone: suite });
    };
    dire(0);
  }

  /**
   * **Une étape du générique.** La pièce est déjà là, avec ses personnages et leurs animations : il
   * ne reste qu'à la regarder. On pose la ligne de remerciement en bas, on traverse lentement la
   * pièce si elle est plus large que l'écran, et au bout de quatre secondes on enchaîne sur la
   * suivante — jusqu'à la dernière, qui rend la main à l'écran de fin.
   *
   * **ESPACE saute tout.** Un enfant de sept ans qui vient de finir un jeu a le droit d'être pressé,
   * et un générique dont on ne peut pas sortir est une punition.
   */
  private etapeDuGenerique(i: number): void {
    state.locked = true;
    const etape = CREDITS[i];
    const dernier = i + 1 >= CREDITS.length;
    this.carton(dernier ? [...etape.lignes, '', ...GENERIQUE.fin] : etape.lignes);

    // Celui qu'on remercie, reposé là où on l'a rencontré : à la fin du jeu, presque aucun n'est
    // encore dans sa pièce, et remercier une pièce vide n'a pas le même effet.
    // Et pas deux fois : si la pièce l'a encore chez elle, on ne le double pas.
    const q = etape.qui && !this.live.some((l) => l.def.sprite === etape.qui?.sprite) ? etape.qui : undefined;
    if (q) {
      const go = q.anim
        ? this.add.sprite(q.x, q.y, texKey(q.sprite, this.pal), q.frame)
        : this.add.image(q.x, q.y, texKey(q.sprite, this.pal), q.frame);
      go.setOrigin(0, 0).setScale(q.scale ?? 1);
      go.setDepth(q.y + go.displayHeight);
      if (q.anim && go instanceof Phaser.GameObjects.Sprite) go.play(animKey(q.anim, this.pal));
    }

    // Un travelling lent d'un bord à l'autre, quand il y a de quoi traverser.
    const duree = etape.court ? GENERIQUE_COURT : GENERIQUE_ETAPE;
    const cam = this.cameras.main;
    cam.stopFollow();
    if (this.roomW > GB.W) {
      cam.setScroll(0, 0);
      cam.pan(this.roomW - GB.W / 2, cam.midPoint.y, duree, 'Sine.easeInOut');
    }

    const suite = () => {
      if (this.transitioning) return;
      this.transitioning = true;
      gbFade(this, this.pal, 'out', () => {
        if (dernier) {
          this.scene.start('Fin');
          return;
        }
        this.scene.restart({ room: CREDITS[i + 1].room, cinema: i + 1 });
      });
    };

    /**
     * **On ne saute pas le générique.** Il y avait ESPACE pour passer, et le premier joueur l'a
     * sauté sans le vouloir — la même touche venait de fermer la boîte précédente. Un générique de
     * quarante secondes à la fin d'un jeu qu'on vient de finir n'est pas une punition ; le rater
     * par accident, si.
     */
    this.time.delayedCall(duree + 600, suite);
  }

  /**
   * **Le carton du générique** : deux lignes en bas de l'écran, sur un fond plein, plus le rappel
   * qu'on peut passer. Ce n'est pas une boîte de dialogue — elle attendrait un appui, et ici c'est
   * le temps qui décide.
   */
  private carton(brutes: string[]): void {
    // **Les lignes se replient toutes seules.** Un remerciement un peu long sortait de l'écran par
    // la droite, exactement comme les lignes trop longues de l'écran de fin : on ne compte plus les
    // caractères à la main, on laisse le retour à la ligne faire son travail.
    const lignes = brutes.flatMap((l) => (l ? wrap(l, GB.W - 10) : ['']));
    const haut = GB.H - 8 - lignes.length * LINE_H;
    this.add
      .rectangle(0, haut - 4, GB.W, GB.H - haut + 4, shade(this.pal, 0))
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1900);
    const texte = new PixelText(this, 'gen-carton', 0, haut, GB.W, lignes.length * LINE_H + 2);
    texte.image.setScrollFactor(0).setDepth(1910);
    texte.setLines(lignes, shadeHex(this.pal, 3));
  }

  /**
   * **Il s'endort sur la table, la tête dans les bras.** C'est la dernière image du jeu jouable :
   * les bougies soufflées, le gâteau devant lui, et il tombe de sommeil au milieu de sa propre
   * fête. Personne ne sait ce qu'il a fait cette nuit, et c'est ce qui rend la scène drôle plutôt
   * que triste.
   *
   * Puis le fondu, et **le générique traverse les écrans du jeu**.
   */
  private endormiSurLaTable(): void {
    state.setFlag('fin');
    state.save();
    const table = this.room.objects.find((o) => o.id === 'table');
    this.montrer({
      sprite: 'nino-couche',
      x: (table?.x ?? 88) - 4,
      y: (table?.y ?? 72) - 6,
      depth: 200,
      cacheNino: true,
    });
    say({
      lines: GENERIQUE.endormi,
      focusY: 20,
      onDone: () => {
        this.transitioning = true;
        gbFade(this, this.pal, 'out', () => {
          this.scene.stop('Ui');
          this.scene.restart({ room: CREDITS[0].room, cinema: 0 });
        });
      },
    });
  }

  /**
   * **Revenir à l'écran-titre**, avec ÉCHAP, depuis n'importe quelle pièce. La partie est sauvegardée
   * en continu : on ne perd rien, et c'est de là qu'on peut repartir à zéro. On demande quand même,
   * parce qu'un enfant qui cherche la touche du pistolet à eau ne veut pas se retrouver au menu.
   */
  private quitter(): void {
    state.locked = true;
    state.save();
    say({
      lines: [QUITTER.question],
      choices: QUITTER.choix,
      focusY: 20,
      onDone: (reponse) => {
        if (reponse !== 0) return;
        this.scene.stop('Ui');
        this.scene.start('Title');
      },
    });
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

    /**
     * **Dans la maison elle entre par une porte ; dehors elle arrive en véhicule**, par le
     * côté de l'écran, et personne ne relève jamais. Le véhicule est déclaré sur la
     * cachette : vélo, hélicoptère, jetpack, sous-marin.
     */
    const cachette = cachetteActuelle(state.hermione);
    const vehicule = cachette?.vehicule;
    const sprite = vehicule ?? 'maman';
    const depart = vehicule
      ? // Hors champ, du côté le plus proche : elle traverse tout l'écran.
        {
          x: l.def.x < this.roomW / 2 ? -30 : this.roomW + 6,
          y: Math.max(2, Math.min(this.roomH - 24, l.def.y - 6)),
        }
      : (() => {
          const porte = this.entrees().reduce((a, b) =>
            Phaser.Math.Distance.Between(a.x, a.y, l.def.x, l.def.y) <
            Phaser.Math.Distance.Between(b.x, b.y, l.def.x, l.def.y)
              ? a
              : b,
          );
          return { x: Math.round(porte.x - 4), y: Math.round(porte.y - 15) };
        })();
    const maman = this.add
      .image(depart.x, depart.y, texKey(sprite, this.pal))
      .setOrigin(0, 0)
      .setFlipX(depart.x < 0);
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
      // Les cinq de la maison faites : elle renonce, monte au salon, et le frigo est
      // libre. Les deux du dehors se trouveront plus tard.
      const renonce = mamanRenonce(state.hermione) && !state.flag('maman-au-salon');
      if (mamanRenonce(state.hermione)) state.setFlag('maman-au-salon');
      toast(ANNONCES.hermioneTrouvee(state.hermione, CACHETTES.length));
      state.save();
      if (!derniere) {
        l.go.destroy();
        this.live = this.live.filter((o) => o !== l);
      }
      this.target = undefined;
      bus.emit(EV.hud);
      /**
       * **En renonçant, elle rend le pistolet à eau.** C'est la seule récompense de la maison, et
       * elle arrive d'une capitulation : cinq cachettes, elle a compris, et elle a maintenant autre
       * chose à faire que de surveiller un jouet confisqué. Il retourne au fond du coffre sans un
       * mot de plus — il faut aller le chercher.
       */
      if (renonce) {
        state.setFlag('pistolet-rendu');
        state.save();
        say({
          speaker: PISTOLET_RENDU.qui,
          lines: PISTOLET_RENDU.lignes,
          focusY: l.def.y,
          onDone: () => {
            if (derniere) this.scene.restart({ room: this.room.id });
          },
        });
        return;
      }
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

    /**
     * **La quatrième fois, c'est Hermione qui vient.** Maman n'a plus la force de traverser la
     * pièce : elle crie depuis l'entrée, et la petite trotte jusqu'à elle toute seule. Le rituel
     * s'est retourné, et personne ne le commente.
     */
    const laPetiteVient = () => {
      state.locked = true;
      this.tweens.add({
        targets: l.go,
        x: maman.x + 5,
        y: maman.y + 8,
        duration: this.duree(l.go.x, l.go.y, maman.x, maman.y),
        onUpdate: () => l.go.setDepth(profondeur() + 1),
        onComplete: repartir,
      });
    };

    /**
     * **Une scène qui se raccourcit à chaque fois.** Répéter la même entrée cinq fois, c'est une
     * blague qui ralentit ; le comique de répétition veut qu'on accélère. Les trois premières
     * fois, Maman traverse la pièce et repart avec sa fille. La quatrième, elle reste sur le pas
     * de la porte et c'est Hermione qui vient. La cinquième, elle crie, elle capitule, elle
     * repart — sans avoir fait un pas de plus.
     */
    const suite =
      state.hermione >= CACHETTES_MAISON - 1
        ? repartir
        : state.hermione >= CACHETTES_MAISON - 2
          ? laPetiteVient
          : traverser;

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
          onDone: suite,
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
    return l.def.ballon || l.def.errance || l.def.patrouille
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
    /**
     * **Ce qui est joué par la scène se reconnaît à son dialogue, pas à son identifiant.** Un même
     * personnage revient à plusieurs endroits avec le même nom d'objet — l'araignée de la mezzanine
     * et celle du trentième étage, Moon sur son canapé et Moon sur son palier — et seul le nom du
     * dialogue dit ce qu'il fait là. Sur l'identifiant, l'araignée de la tour récitait un haïku au
     * lieu de poser son énigme.
     */
    if (l.def.dialogue === 'hermione') {
      jouer(this, 'hermione', { volume: 0.7 });
      this.trouveHermione(l);
      return;
    }
    if (l.def.dialogue === 'araignee') {
      this.ditUnHaiku(l);
      return;
    }
    if (l.def.dialogue === 'poisson') {
      this.histoireDuPoisson(l);
      return;
    }
    if (l.def.dialogue === 'moon' && state.flag('chat-parle') && !state.flag('parents-sortis')) {
      this.diversion(l);
      return;
    }
    if (l.def.ballon) {
      this.taperDansLeBallon(l);
      return;
    }
    // **Tant qu'il n'est pas rentré, le parapente marche encore.** Le garde-fou était
    // `parapente-pris`, posé au moment du saut et sauvegardé aussitôt : un rechargement de
    // page pendant le vol laissait Nino sur le toit avec un parapente sous les yeux et
    // « Il n'y a plus de parapente sur le toit. » — un cul-de-sac, sans autre issue que de
    // recommencer la partie. On relance le vol autant de fois qu'il faut.
    if (l.def.id === 'parapente' && !state.flag('parapente-rentre')) {
      this.sauterDuToit(l);
      return;
    }
    if (l.def.id === 'grand-lit') {
      this.sEndormir(l);
      return;
    }
    // Rentré par la fenêtre, parapente sous le bras : c'est la fin du chapitre.
    if (l.def.id === 'lit' && state.flag('parapente-rentre') && !state.flag('anniversaire')) {
      this.faireSemblant(l);
      return;
    }
    /**
     * **L'éléphant fait pleuvoir.** Une fois qu'on l'a vu boire, il propose de montrer quelque
     * chose : il envoie une trompe d'Erdre par-dessus le quai, Maman croit à un orage et rentre
     * en courant avec Hermione. C'est le seul endroit du jeu où l'absurde **sert à quelque
     * chose** — sans cette pluie, le bout du quai reste gardé.
     */
    /**
     * **La discussion au bord de l'eau**, déclenchée par l'éléphant ou par le poisson : les deux
     * sont dedans. Elle n'existe qu'une fois que Nino **s'est arrêté devant ses parents** —
     * avant, il n'y a pas de problème, et une solution qui arrive avant l'énigme est un couloir.
     *
     * Le seul verrou est `maman-quai-vue` : puisqu'il s'arrête assez loin pour ne pas être vu, il
     * ne peut plus parler ni à Maman ni à papa, et c'est ce moment-là qui vaut les deux.
     */
    if (
      l.def.id === 'elephant-erdre' &&
      state.flag('elephant-vu') &&
      state.flag('maman-quai-vue') &&
      !state.flag('poisson-parti')
    ) {
      const elephant = this.live.find((x) => x.def.id === 'elephant-erdre');
      if (elephant) {
        this.discussionAuBordDeLEau(elephant);
        return;
      }
    }
    /**
     * **La joie d'avoir un bateau.** On s'adresse au parrain, et ce sont eux deux qui parlent :
     * Nino écoute. Une fois seulement, et après la blague de papa — c'est elle qui installe la
     * table, et un père doit avoir fait semblant de ne pas reconnaître son fils avant de discuter
     * navigation devant lui.
     */
    if (l.def.id === 'parrain' && state.flag('papa-terrasse-vu') && !state.flag('joie-bateau')) {
      this.discussionDuBateau();
      return;
    }
    /**
     * **Le projet d'art se choisit.** Si Nino porte plusieurs objets pas encore montrés, la
     * maîtresse demande lequel — sans ça, l'ordre d'une liste décidait à sa place. Un seul
     * objet, et on retombe sur le dialogue normal.
     */
    if (l.def.dialogue === 'maitresse' && state.flag('devoir-donne') && portables().length >= 2) {
      this.choisirLObjet(l, portables(), 0);
      return;
    }
    // **Le pigeon ignore Nino.** Pas de boîte de dialogue : une boîte supposerait qu'il
    // s'intéresse à nous. Il se décale, il emmène son point d'ancrage avec lui, et il continue.
    // Les sept plantes partagent un texte : c'est la scène qui sait laquelle a bu.
    if (l.def.dialogue === 'plante') {
      this.parlerALaPlante(l);
      return;
    }
    if (l.def.dialogue === 'pigeon') {
      this.pigeonSeDecale(l);
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
    this.jouerBeat(beat, l);
  }

  /**
   * **Choisir ce qu'on pose sur la table.** Quand Nino porte plusieurs objets pas encore
   * montrés, la maîtresse demande — et c'est lui qui décide, pas l'ordre d'une liste. La
   * fenêtre de choix ne rend que quatre lignes : trois objets à la fois, et « Autre chose... »
   * fait tourner la liste quand il en porte davantage.
   */
  private choisirLObjet(l: Live, liste: ItemId[], depart: number): void {
    const tranche = [...liste.slice(depart), ...liste.slice(0, depart)].slice(0, 3);
    const tourne = liste.length > 3;
    say({
      speaker: 'La maîtresse',
      lines: QUEL_OBJET.question,
      choices: [...tranche.map((id) => OBJETS[id].nom), ...(tourne ? [QUEL_OBJET.autre] : [])],
      focusY: l.def.y,
      onDone: (i) => {
        if (i !== undefined && i < tranche.length) {
          this.jouerBeat(beatObjet(tranche[i]), l);
          return;
        }
        this.choisirLObjet(l, liste, (depart + 3) % liste.length);
      },
    });
  }

  private jouerBeat(beat: DialogueBeat, l?: Live): void {

    /**
     * **Un devoir noté : une petite discussion.** Deux ou trois questions à la suite, aucune
     * mauvaise réponse, et chaque choix ajoute des points. La première question est portée par
     * la réplique d'accueil — les choix s'ouvrent dessus, sans boîte supplémentaire. À la fin,
     * le barème donne la note et ce que la maîtresse en dit.
     *
     * La note est un souvenir, pas un verrou : elle s'affiche dans le journal et sur l'écran de
     * fin, et rien ne se ferme derrière elle.
     */
    if (beat.devoir) {
      const etapes = beat.devoir.etapes;
      /**
       * **Arroser la maîtresse coûte un point.** Elle l'a dit sur le moment — « Et j'ai tout vu. » —
       * et elle s'en souvient à la notation. Ce n'est pas une punition : c'est la seule conséquence
       * du jeu qui vienne d'une bêtise gratuite, et un enfant de sept ans doit pouvoir la découvrir
       * sans qu'on l'ait prévenu.
       */
      let points = state.flag('maitresse-arrosee') ? -1 : 0;
      const suite = (i: number) => {
        if (i >= etapes.length) {
          const bareme = BAREME.find((b) => points >= b.min) ?? BAREME[BAREME.length - 1];
          /**
           * **Elle garde la meilleure, et elle le dit.** Sans cette ligne, revenir avec un autre
           * objet donnait une note qui semblait remplacer l'autre : un enfant n'ose plus essayer
           * moins bien. Trois cas, une phrase chacun, et rien n'est jamais perdu.
           */
          const avant = state.note;
          const rappel = !avant
            ? []
            : bareme.note > avant
              ? RENOTE.mieux
              : bareme.note === avant
                ? RENOTE.pareil
                : RENOTE.moins;
          state.note = Math.max(state.note, bareme.note);
          jouer(this, bareme.note >= 16 ? 'enigme-juste' : 'valider', { volume: 0.6 });
          say({
            speaker: beat.speaker,
            lines: [...bareme.lines, ...rappel],
            focusY: l?.def.y,
            onDone: () => {
              // Les effets du beat comptent aussi ici : c'est eux qui retiennent quel objet a été
              // rendu, et donc ce qu'elle dira au troisième, au cinquième et au huitième.
              this.applyEffects(beat.effects, l);
              state.save();
              bus.emit(EV.hud);
            },
          });
          return;
        }
        const e = etapes[i];
        say({
          speaker: beat.speaker,
          // La première étape n'a pas de question : c'est l'accueil qui la pose.
          lines: e.lines ?? (i === 0 ? beat.lines : []),
          choices: e.reponses,
          focusY: l?.def.y,
          onDone: (reponse) => {
            const retour = e.retours[reponse ?? 0] ?? e.retours[0];
            points += retour.points;
            say({
              speaker: beat.speaker,
              lines: retour.lines,
              focusY: l?.def.y,
              onDone: () => {
                this.applyEffects(retour.effects, l);
                suite(i + 1);
              },
            });
          },
        });
      };
      suite(0);
      return;
    }

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
    if (e.flag === 'eau-coule') {
      state.eauDepuis = state.ecrans;
      jouer(this, 'robinet', { volume: 0.6 });
    }
    // Le bouchon a sauté : le bateau commence à descendre, tout de suite et tout seul.
    if (e.flag === 'bateau-coule') this.coulerLeBateau();
    if (e.piece) {
      const neuve = !state.pieces.has(e.piece);
      state.pieces.add(e.piece);
      if (neuve) {
        jouer(this, 'piece', { volume: 0.8 });
        toast(ANNONCES.pieceTrouvee(piece(e.piece)?.name ?? e.piece));
      }
    }
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
    else if (door.y + door.h >= this.room.tiles.length * 8) s.y = door.y - 2;
    // Un escalier gardé n'est pas contre un mur, il est au milieu du palier : on le
    // redescend au pied des marches, seul côté par lequel il puisse arriver.
    else s.y = door.y + door.h + 6;
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
    jouer(this, door.son ?? 'porte', { volume: 0.5 });
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
