import Phaser from 'phaser';
import { PALETTE_IDS, type PaletteId } from '../art/palette';
import { animKey, bakeImage, bakeSheet, texKey } from '../art/pixels';
import { IMAGES, SHEETS } from '../art/sprites';
import { bakeFont } from '../art/font';
import { chargerSons } from '../systems/audio';

/**
 * Rien à charger : tout le jeu est dessiné au démarrage, une fois par palette.
 * C'est ce qui nous permet de changer la couleur du monde entier d'un seul coup.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Les sons dont les fichiers sont là. Le reste du jeu marche sans eux.
    chargerSons(this);
  }

  create(): void {
    bakeFont();

    for (const pal of PALETTE_IDS) {
      for (const [name, frames] of Object.entries(SHEETS)) bakeSheet(this, name, frames, pal);
      for (const [name, art] of Object.entries(IMAGES)) bakeImage(this, name, art, pal);
      this.makeAnims(pal);
    }

    this.scene.start('Title');
  }

  private makeAnims(pal: PaletteId): void {
    const nino = texKey('nino', pal);
    const walk = (dir: 'down' | 'up' | 'side') =>
      this.anims.create({
        key: animKey(`nino-walk-${dir}`, pal),
        frames: [`${dir}-1`, `${dir}-0`, `${dir}-2`, `${dir}-0`].map((frame) => ({
          key: nino,
          frame,
        })),
        frameRate: 7,
        repeat: -1,
      });
    walk('down');
    walk('up');
    walk('side');

    this.anims.create({
      key: animKey('moon-idle', pal),
      frames: [
        { key: texKey('moon', pal), frame: 'idle-0' },
        { key: texKey('moon', pal), frame: 'idle-1' },
      ],
      frameRate: 1.6,
      repeat: -1,
    });

    // Les Zzz des dormeurs : deux images qui se croisent en montant, très lentement.
    this.anims.create({
      key: animKey('zzz-dort', pal),
      frames: [
        { key: texKey('zzz', pal), frame: 'dort-0' },
        { key: texKey('zzz', pal), frame: 'dort-1' },
      ],
      frameRate: 1.1,
      repeat: -1,
    });

    // L'eau du seau scintille en deux images, comme celle de la baignoire.
    this.anims.create({
      key: animKey('seau-eau', pal),
      frames: [
        { key: texKey('seau', pal), frame: 'eau-0' },
        { key: texKey('seau', pal), frame: 'eau-1' },
      ],
      frameRate: 1.4,
      repeat: -1,
    });
    // Le poisson qui saute dans son seau, une fois son énigme résolue. Il replonge
    // entre deux sauts : l'eau seule fait la dernière image.
    this.anims.create({
      key: animKey('seau-saute', pal),
      frames: [
        { key: texKey('seau', pal), frame: 'saute-0' },
        { key: texKey('seau', pal), frame: 'saute-1' },
        { key: texKey('seau', pal), frame: 'saute-0' },
        { key: texKey('seau', pal), frame: 'eau-0' },
        { key: texKey('seau', pal), frame: 'eau-1' },
      ],
      frameRate: 2.2,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('hermione-idle', pal),
      frames: [
        { key: texKey('hermione', pal), frame: 'idle-0' },
        { key: texKey('hermione', pal), frame: 'idle-1' },
      ],
      frameRate: 1.3,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('hermione-rampe', pal),
      frames: [
        { key: texKey('hermione4', pal), frame: 'rampe-0' },
        { key: texKey('hermione4', pal), frame: 'rampe-1' },
      ],
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('araignee-pattes', pal),
      frames: [
        { key: texKey('araignee', pal), frame: 'pattes-0' },
        { key: texKey('araignee', pal), frame: 'pattes-1' },
      ],
      frameRate: 3,
      repeat: -1,
    });

    // **Papa sur son pont.** Il marche, et il se penche sur sa coque quand il s'arrête.
    this.anims.create({
      key: animKey('papa-marche', pal),
      frames: ['marche-0', 'marche-1'].map((frame) => ({
        key: texKey('papa-capitaine', pal),
        frame,
      })),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('papa-bricole', pal),
      frames: ['penche-0', 'penche-1'].map((frame) => ({
        key: texKey('papa-capitaine', pal),
        frame,
      })),
      frameRate: 2.5,
      repeat: -1,
    });

    /**
     * **L'éléphant du palier ne boit pas** : il n'y a pas d'eau au trentième étage. Deux images,
     * la même trompe, et **l'oreille seule** qui bat toutes les huit dixièmes de seconde. Un
     * animal immobile qui remue une oreille est vivant ; le même qui trempe sa trompe dans un
     * plancher est un décor mal réglé.
     */
    this.anims.create({
      key: animKey('elephant-oreille', pal),
      frames: ['boit', 'boit-oreille'].map((frame) => ({
        key: texKey('elephant', pal),
        frame,
      })),
      frameRate: 1.2,
      repeat: -1,
    });

    /**
     * **L'éléphant boit, et il bat de l'oreille.** Quatre images d'une seconde, et **deux rythmes
     * dans le même cycle** : la trompe change toutes les deux images — l'eau, puis la bouche — et
     * l'oreille à chacune. À cette vitesse ce n'est pas une animation, c'est un animal qui prend
     * son temps ; et deux cadences valent mieux qu'une, parce qu'on ne voit plus la boucle.
     */
    this.anims.create({
      key: animKey('elephant-boit', pal),
      frames: ['boit', 'boit-oreille', 'bouche', 'bouche-oreille'].map((frame) => ({
        key: texKey('elephant', pal),
        frame,
      })),
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('poisson-saut', pal),
      frames: [
        { key: texKey('poisson', pal), frame: 'saut-0' },
        { key: texKey('poisson', pal), frame: 'saut-1' },
      ],
      frameRate: 3.5,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('fusee-vol', pal),
      frames: [
        { key: texKey('fusee', pal), frame: 'vol-0' },
        { key: texKey('fusee', pal), frame: 'vol-1' },
      ],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('portail-spin', pal),
      frames: ['spin-0', 'spin-1', 'spin-2'].map((frame) => ({
        key: texKey('portail', pal),
        frame,
      })),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('ecureuil-queue', pal),
      frames: [
        { key: texKey('ecureuil', pal), frame: 'queue-0' },
        { key: texKey('ecureuil', pal), frame: 'queue-1' },
      ],
      frameRate: 2.2,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('heron-vol', pal),
      frames: [
        { key: texKey('heron', pal), frame: 'vol-0' },
        { key: texKey('heron', pal), frame: 'vol-1' },
      ],
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('splash-plouf', pal),
      frames: ['plouf-0', 'plouf-1', 'plouf-2'].map((frame) => ({
        key: texKey('splash', pal),
        frame,
      })),
      frameRate: 16,
    });

    this.anims.create({
      key: animKey('baignoire-eau', pal),
      frames: [
        { key: texKey('baignoire', pal), frame: 'pleine' },
        { key: texKey('baignoire', pal), frame: 'pleine-2' },
      ],
      frameRate: 1.4,
      repeat: -1,
    });

    this.anims.create({
      key: animKey('etincelle-pop', pal),
      frames: ['pop-0', 'pop-1', 'pop-2'].map((frame) => ({
        key: texKey('etincelle', pal),
        frame,
      })),
      frameRate: 14,
    });
  }
}
