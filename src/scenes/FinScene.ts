import Phaser from 'phaser';
import { GB, KEYS } from '../config';
import { shadeHex } from '../art/palette';
import { texKey } from '../art/pixels';
import { state } from '../systems/state';
import { CACHETTES } from '../data/hermione';
import { PIECES } from '../data/pieces';
import { FIN } from '../data/textes';
import { PixelText, measure } from '../ui/PixelText';

/**
 * L'écran de fin. **Palette du jour** : c'est le seul écran, avec la cuisine de la fête,
 * où le soleil est levé — tout le reste du jeu se passe pendant la nuit blanche de la
 * veille.
 *
 * On y compte ce que Nino a trouvé, pas ce qu'il a réussi — il n'y a pas de score dans
 * ce jeu, seulement des choses vues.
 */
const PALETTE = 'real' as const;

export class FinScene extends Phaser.Scene {
  constructor() {
    super('Fin');
  }

  create(): void {
    state.palette = PALETTE;
    state.locked = true;
    this.cameras.main.setBackgroundColor(shadeHex(PALETTE, 0));

    const ink = shadeHex(PALETTE, 3);
    const centre = (t: PixelText, texte: string, y: number) => {
      t.image.setPosition(Math.round((GB.W - measure(texte)) / 2), y);
      t.setLines([texte], ink);
    };

    this.add
      .image(GB.W / 2 - 16, 26, texKey('gateau', PALETTE))
      .setOrigin(0, 0)
      .setScale(2);

    centre(new PixelText(this, 'fin-titre', 0, 76, GB.W, 12), FIN.titre, 76);
    centre(
      new PixelText(this, 'fin-bon', 0, 92, GB.W, 12),
      FIN.voeu,
      92,
    );
    centre(
      new PixelText(this, 'fin-compte', 0, 108, GB.W, 12),
      FIN.compte(
        `${state.hermione}/${CACHETTES.length}`,
        `${state.pieces.size}/${PIECES.length}`,
      ),
      108,
    );
    centre(new PixelText(this, 'fin-suite', 0, 126, GB.W, 12), FIN.suite, 126);

    const kb = this.input.keyboard!;
    for (const code of KEYS.action) {
      kb.addKey(code).once('down', () => {
        state.locked = false;
        this.scene.start('Title');
      });
    }
  }
}
