/**
 * Fabrique les sons du jeu. `npx tsx tools/synthese.ts`
 *
 * Certains sons valent mieux d'être **fabriqués que cherchés**, parce qu'on veut un
 * contrôle exact sur ce qui pique l'oreille. La console d'origine avait trois voies : deux
 * canaux carrés pour les notes, et un canal de bruit pour les percussions. On s'en tient
 * là, et on filtre tout pour enlever l'agressivité.
 *
 * Chaque son est déterministe : relancer l'outil réécrit exactement les mêmes fichiers.
 *
 *  - `texte`   triangle très court et très filtré. Il se joue trente fois par phrase, donc
 *              c'est le plus doux de tous : un carré, même bas, devient une agression au
 *              bout d'une minute.
 *  - `pas`     bruit blanc filtré, sans aucune note — le canal « noise » de la console.
 *              Quatre variantes : longueurs et filtrages différents, pour que la marche ne
 *              fasse pas machine à coudre.
 *  - `menu`    carré doux et bref : le curseur qui change de ligne dans un choix.
 *  - `valider` deux carrés, une quarte au-dessus : le choix est pris.
 */
import {
  FREQUENCE,
  brillance,
  bruitBlanc,
  carre,
  coller,
  crete,
  decroissance,
  ecrire,
  fondus,
  gain,
  passeBas,
  triangle,
} from './wav';

const DOSSIER = 'public/sons';

const poser = (nom: string, x: Float64Array) => {
  ecrire(`${DOSSIER}/${nom}.wav`, { frequence: FREQUENCE, echantillons: x });
  const ms = (x.length / FREQUENCE) * 1000;
  console.log(
    `  ${nom.padEnd(14)} ${ms.toFixed(0).padStart(3)} ms   ` +
      `brillance ${brillance(x).toFixed(3).padStart(6)}   crête ${crete(x).toFixed(2)}`,
  );
};

console.log('\n── le texte qui s’écrit ──');
// Triangle bas, filtré quatre fois, presque pas d'attaque et une extinction longue :
// à ce niveau on entend un souffle de note, pas un bip.
poser('texte-1', gain(fondus(passeBas(triangle(34, 380), 4), FREQUENCE, 4, 26), 0.5));

console.log('\n── les pas : du bruit, aucune note ──');
const pas = (ms: number, passes: number, demiVie: number, graine: number) =>
  gain(
    fondus(decroissance(passeBas(bruitBlanc(ms, graine), passes), FREQUENCE, demiVie), FREQUENCE, 1, 12),
    0.42,
  );
poser('pas-1', pas(44, 7, 10, 1));
poser('pas-2', pas(38, 8, 8, 7));
poser('pas-3', pas(50, 6, 13, 13));
poser('pas-4', pas(41, 9, 9, 23));

console.log('\n── le curseur d’un choix, et sa validation ──');
// Carré filtré deux fois : il garde le grain de la console sans en avoir l'arête.
poser('menu-1', gain(fondus(passeBas(carre(38, 300), 3), FREQUENCE, 2, 22), 0.34));
poser('menu-2', gain(fondus(passeBas(carre(38, 340), 3), FREQUENCE, 2, 22), 0.34));
// Deux notes, une quarte : ça se lit comme « pris en compte » sans faire fanfare.
poser(
  'valider-1',
  gain(
    fondus(
      passeBas(coller(carre(46, 330), carre(70, 440)), 3),
      FREQUENCE,
      2,
      30,
    ),
    0.4,
  ),
);

console.log('\nÉcrits dans ' + DOSSIER + '/. Les fichiers du pack qu’ils remplacent sont écrasés.\n');
