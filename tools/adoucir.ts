/**
 * Adoucir un son. `npx tsx tools/adoucir.ts <entrée.wav> <sortie.wav> [options]`
 *
 * Le bip du texte se joue trente fois par phrase : le moindre excès d'aigu devient
 * agressif au bout d'une minute. Cet outil fait trois choses, dans cet ordre :
 *
 *  1. **Un passe-bas** — une moyenne glissante appliquée plusieurs fois, ce qui suffit
 *     largement ici et ne demande aucune bibliothèque. Chaque passe coupe un peu plus
 *     d'aigu ; trois ou quatre passes transforment un bip carré en note ronde.
 *  2. **Des fondus** aux deux bouts, 3 ms à l'attaque et le reste à l'extinction. Sans
 *     eux, la coupure franche d'un échantillon fait un clic — et c'est souvent *ça* qu'on
 *     entend comme agressif, pas la note elle-même.
 *  3. **Un gain**, pour descendre le niveau une fois pour de bon plutôt que de le
 *     rattraper à chaque lecture.
 *
 * Il affiche aussi un indice de brillance (la part d'énergie dans les variations rapides)
 * avant et après : c'est ce qui permet de comparer deux candidats sans les écouter.
 *
 * Exemple :
 *   npx tsx tools/adoucir.ts source.wav public/sons/texte-1.wav --passes=4 --gain=0.4
 */
import { brillance, crete, ecrire, fondus, gain, lire, passeBas } from './wav';

// ── ligne de commande ────────────────────────────────────────────────────────
const [entree, sortie, ...reste] = process.argv.slice(2);
if (!entree || !sortie) {
  console.log('usage : npx tsx tools/adoucir.ts <entrée.wav> <sortie.wav> [--passes=4] [--gain=0.4] [--attaque=3] [--chute=25] [--duree=40]');
  process.exit(1);
}
const opt = (nom: string, defaut: number) => {
  const t = reste.find((r) => r.startsWith(`--${nom}=`));
  return t ? Number(t.split('=')[1]) : defaut;
};

const src = lire(entree);
const avant = {
  ms: (src.echantillons.length / src.frequence) * 1000,
  brillance: brillance(src.echantillons),
  crete: crete(src.echantillons),
};

let y = src.echantillons;
const dureeMs = opt('duree', 0);
if (dureeMs > 0) y = y.subarray(0, Math.round((dureeMs / 1000) * src.frequence));
y = passeBas(y, opt('passes', 4));
y = fondus(y, src.frequence, opt('attaque', 3), opt('chute', 25));
y = gain(y, opt('gain', 0.4));

ecrire(sortie, { frequence: src.frequence, echantillons: y });
const apres = { ms: (y.length / src.frequence) * 1000, brillance: brillance(y), crete: crete(y) };
console.log(`${entree}\n  avant : ${avant.ms.toFixed(0)} ms   brillance ${avant.brillance.toFixed(4)}   crête ${avant.crete.toFixed(2)}`);
console.log(`${sortie}\n  après : ${apres.ms.toFixed(0)} ms   brillance ${apres.brillance.toFixed(4)}   crête ${apres.crete.toFixed(2)}`);
