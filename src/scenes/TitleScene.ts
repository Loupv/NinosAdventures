import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shade, shadeHex } from '../art/palette';
import { animKey, texKey } from '../art/pixels';
import { state } from '../systems/state';
import { jouerAmbiance, jouerMusique } from '../systems/audio';
import { TITRE } from '../data/textes';
import { PixelText, measure } from '../ui/PixelText';

/** L'écran-titre : la photo de famille, qui se remplit à mesure qu'on joue. */
export class TitleScene extends Phaser.Scene {
  private prompt!: PixelText;
  private aussi?: PixelText;
  private trois?: PixelText;
  private blink = true;
  /** Vrai quand la question « tout effacer ? » est posée et attend une réponse. */
  private demande = false;

  constructor() {
    super('Title');
  }

  create(): void {
    const pal = 'titre' as const;
    state.palette = pal;
    // Les six notes de l'écran-titre — et le silence tant que le fichier n'est pas posé.
    jouerMusique(this, 'titre');
    jouerAmbiance(this, undefined);
    const ink = shadeHex(pal, 3);

    // Le fond descend d'un cran **sous** la palette : les personnages sont dessinés avec la
    // teinte 0 en contour, et sur un fond teinte 0 ils fondaient dedans. Un bleu plus noir
    // que tout ce qui se dessine, et l'affiche retrouve ses silhouettes.
    this.add
      .rectangle(0, 0, GB.W, GB.H, 0x0c1722)
      .setOrigin(0, 0)
      .setDepth(-10);
    this.add
      .graphics()
      .lineStyle(1, shade(pal, 1), 1)
      .strokeRect(3.5, 3.5, GB.W - 7, GB.H - 7);

    this.bigLine(TITRE.ligne1, 20, ink, 'ttl-1');
    this.bigLine(TITRE.ligne2, 38, ink, 'ttl-2');

    this.add
      .sprite(66, 108, texKey('nino', pal), 'down-0')
      .setOrigin(0.5, 1)
      .play(animKey('nino-walk-down', pal));
    this.add
      .sprite(94, 108, texKey('moon', pal), 'idle-0')
      .setOrigin(0.5, 1)
      .play(animKey('moon-idle', pal));
    // Le sol sous leurs pieds.
    this.add.rectangle(8, 108, GB.W - 16, 1, shade(pal, 1)).setOrigin(0, 0);

    /**
     * **L'affiche se remplit à mesure qu'on joue.** Chaque personnage principal rejoint
     * Nino et Moon sur l'écran-titre une fois rencontré : au début ils sont deux, à la fin
     * c'est une photo de famille — l'araignée, l'écureuil, Hermione, papa en capitaine,
     * Gérard en l'air (il ne se pose jamais), et l'éléphant à moitié dans le cadre, parce
     * qu'il est inutilement grand. On lit la sauvegarde sans la charger « pour de vrai » :
     * `begin()` rechargera ou remettra à zéro selon ce qu'on choisit.
     */
    if (state.hasSave()) state.load();
    const invite = (
      x: number,
      y: number,
      sprite: string,
      frame: string,
      anim: string | undefined,
      la: boolean,
    ) => {
      if (!la) return;
      const s = this.add.sprite(x, y, texKey(sprite, pal), frame).setOrigin(0.5, 1);
      if (anim) s.play(animKey(anim, pal));
    };
    invite(34, 108, 'ecureuil', 'queue-0', 'ecureuil-queue', state.flag('ecureuil-vu'));
    invite(50, 108, 'hermione', 'idle-0', 'hermione-idle', state.hermione > 0);
    invite(112, 108, 'papa-capitaine', 'marche-0', undefined, state.flag('papa-capitaine-vu'));
    // Gérard pose dans son seau, et il en saute de temps en temps : c'est comme ça qu'il
    // voyage, c'est comme ça qu'il pose.
    invite(132, 108, 'seau', 'eau-0', 'seau-saute', state.flag('poisson-arrive'));
    // L'araignée n'est pas dans le rang : elle pend à son fil, sous le « LES » du titre,
    // à sa taille normale — et elle monte et descend, lentement, avec une pause à chaque
    // bout. Le fil s'arrête à elle : il grandit et raccourcit avec la descente.
    if (state.haiku > 0) {
      const fil = this.add.rectangle(30, 6, 1, 54, shade(pal, 2)).setOrigin(0.5, 0).setDepth(-7);
      const bete = this.add
        .sprite(30, 60, texKey('araignee', pal), 'pattes-0')
        .setOrigin(0.5, 0)
        .setDepth(-5)
        .play(animKey('araignee-pattes', pal));
      this.tweens.addCounter({
        from: 60,
        to: 52,
        duration: 2400,
        yoyo: true,
        repeat: -1,
        hold: 1400,
        repeatDelay: 1400,
        ease: 'Sine.easeInOut',
        onUpdate: (t) => {
          const y = Math.round(t.getValue() ?? 60);
          bete.setY(y);
          fil.setSize(1, y - 6);
        },
      });
    }
    // **L'éléphant n'est pas un invité, c'est le décor.** Du sol jusqu'au-delà du haut de
    // l'écran, derrière tout le monde : la tête dépasse du cadre, personne ne trouve ça
    // bizarre, et toute la famille pose devant lui.
    if (state.flag('elephant-vu')) {
      this.add
        .sprite(224, 108, texKey('elephant', pal), 'boit')
        .setOrigin(1, 1)
        .setScale(6)
        .setDepth(-6)
        .play(animKey('elephant-oreille', pal));
    }

    this.prompt = this.line('', 110, ink, 'ttl-3');
    this.aussi = this.line('', 123, ink, 'ttl-4');
    this.trois = this.line('', 134, ink, 'ttl-5');
    this.proposer();

    this.time.addEvent({
      delay: 480,
      loop: true,
      callback: () => {
        this.blink = !this.blink;
        // La question, elle, ne clignote pas : on ne fait pas clignoter ce qui efface une partie.
        this.prompt.image.setVisible(this.demande || this.blink);
      },
    });

    const kb = this.input.keyboard!;
    KEYS.action.forEach((c) =>
      kb.addKey(c).on('down', () => (this.demande ? this.begin(true) : this.begin(false))),
    );
    // ÉCHAP : renoncer à effacer. C'est tout ce qu'il fait ici.
    KEYS.cancel.forEach((c) => kb.addKey(c).on('down', () => this.demande && this.proposer()));
    // START (P au clavier) : les réglages, comme depuis n'importe où dans le jeu.
    KEYS.reglages.forEach((c) =>
      kb.addKey(c).on('down', () => !this.demande && this.scene.start('Reglages')),
    );
    kb.addKey('R').on('down', () => this.demander());
  }

  /**
   * L'état normal du titre : continuer si une partie existe, la commencer sinon — et, dans le
   * premier cas seulement, la façon de tout effacer.
   */
  private proposer(): void {
    this.demande = false;
    const garde = state.hasSave();
    this.ecrire(this.prompt, garde ? TITRE.continuer : TITRE.commencer, 110);
    // Une partie en cours propose d'effacer ; sinon la ligne sert aux réglages, qui
    // ont besoin d'être trouvables sans qu'on les cherche.
    this.ecrire(this.aussi!, garde ? TITRE.recommencer : TITRE.reglages, 123);
    this.ecrire(this.trois!, garde ? TITRE.reglages : '', 134);
  }

  /** La question. Tant qu'elle est posée, ESPACE efface et ÉCHAP renonce. */
  private demander(): void {
    if (this.demande) return;
    // Rien à effacer : on démarre une partie neuve sans poser de question.
    if (!state.hasSave()) {
      this.begin(true);
      return;
    }
    this.demande = true;
    this.ecrire(this.prompt, TITRE.effacer, 110);
    this.ecrire(this.aussi!, `${TITRE.effacerOui}   ${TITRE.effacerNon}`, 123);
    this.ecrire(this.trois!, '', 134);
  }

  private ecrire(t: PixelText, texte: string, y: number): void {
    t.image.setPosition(Math.round((GB.W - measure(texte)) / 2), y).setVisible(true);
    t.setLines([texte], shadeHex('titre', 3));
  }

  private begin(fresh: boolean): void {
    if (fresh) {
      state.clearSave();
      state.reset();
    } else if (state.hasSave()) {
      state.load();
    } else {
      state.reset();
    }
    this.scene.start('World', { room: state.room });
  }

  private line(text: string, y: number, color: string, key: string): PixelText {
    const t = new PixelText(this, key, Math.round((GB.W - measure(text)) / 2), y, GB.W, 12);
    t.setLines([text], color);
    return t;
  }

  /** Le titre, en pixels deux fois plus gros. */
  private bigLine(text: string, y: number, color: string, key: string): void {
    const t = new PixelText(this, key, 0, 0, GB.W, 13);
    t.setLines([text], color);
    t.image.setScale(2).setPosition(Math.round((GB.W - measure(text) * 2) / 2), y);
  }
}
