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
  glissando,
  passeBas,
  silence,
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

console.log('\n── la voix des personnages ──');
// Un carré, pas un triangle : les harmoniques impaires font le « grain » d'une bouche, là
// où le triangle du texte n'est qu'un souffle. Filtré quatre fois quand même — il se joue
// autant que le texte, il n'a pas le droit de fatiguer — et un peu plus long, pour que la
// transposition vers le grave (l'Éléphant descend de onze demi-tons) garde de la matière.
poser('voix-1', gain(fondus(passeBas(carre(40, 320), 4), FREQUENCE, 3, 28), 0.42));

console.log('\n── les cris des animaux : des glissades ──');
// Tous les cris sont des glissandos — un miaulement monte puis descend, une bulle descend,
// un barrissement monte. Le triangle pour les doux, le carré pour les gros.
const miaou = (monte: number, descend: number, h1: number, h2: number) =>
  gain(
    fondus(passeBas(coller(glissando(monte, h1, h2), glissando(descend, h2, h1 * 0.85)), 3), FREQUENCE, 8, 60),
    0.4,
  );
poser('chat-1', miaou(130, 200, 470, 760));
poser('chat-2', miaou(100, 150, 540, 830));
poser('chat-3', miaou(160, 250, 430, 690));

// La bulle du poisson : une note qui coule vers le bas, très filtrée — on l'entend sous l'eau.
poser('poisson-1', gain(fondus(passeBas(glissando(110, 460, 160), 5), FREQUENCE, 4, 40), 0.42));
poser(
  'poisson-2',
  gain(fondus(passeBas(coller(glissando(70, 420, 220), silence(40), glissando(90, 380, 150)), 5), FREQUENCE, 4, 40), 0.42),
);

// L'araignée : deux tout petits pas secs, presque rien — c'est une bête silencieuse qui
// veut bien faire un effort.
const patte = (graine: number) =>
  decroissance(passeBas(bruitBlanc(16, graine), 5), FREQUENCE, 5);
poser('araignee-1', gain(fondus(coller(patte(3), silence(55), patte(9)), FREQUENCE, 1, 10), 0.5));
poser('araignee-2', gain(fondus(coller(patte(17), silence(40), patte(29), silence(40), patte(31)), FREQUENCE, 1, 10), 0.5));

// L'écureuil : deux pépiements pressés, tout en haut — il parle comme il vole des verres.
const pepiement = (h1: number, h2: number) => passeBas(glissando(42, h1, h2, 'carre'), 3);
poser('ecureuil-1', gain(fondus(coller(pepiement(950, 1400), silence(35), pepiement(1100, 1500)), FREQUENCE, 2, 18), 0.3));
poser('ecureuil-2', gain(fondus(coller(pepiement(1050, 1350), silence(50), pepiement(900, 1450)), FREQUENCE, 2, 18), 0.3));

// L'Éléphant : un barrissement en carré, qui monte puis retombe un peu. Douze mètres.
const barrissement = (a: number, b: number, c: number) =>
  gain(fondus(passeBas(coller(glissando(210, a, b, 'carre'), glissando(150, b, c, 'carre')), 2), FREQUENCE, 6, 70), 0.42);
poser('elephant-1', barrissement(170, 340, 290));
poser('elephant-2', barrissement(150, 300, 260));

console.log('\n── les prouts de la fusée : huit, tous différents ──');
// La fonctionnalité la plus importante du projet, en attendant les vrais. Une impulsion
// asymétrique dont la hauteur renégocie tous les dix millisecondes : c'est exactement ça.
const prout = (ms: number, hzBase: number, graine: number) => {
  const n = Math.round((ms / 1000) * FREQUENCE);
  const x = new Float64Array(n);
  let e = graine * 2654435761;
  const alea = () => {
    e = (e * 1103515245 + 12345) & 0x7fffffff;
    return e / 0x7fffffff;
  };
  let phase = 0;
  let hz = hzBase;
  for (let i = 0; i < n; i++) {
    if (i % 441 === 0) hz = hzBase * (0.65 + alea() * 0.8);
    phase += hz / FREQUENCE;
    x[i] = phase % 1 < 0.22 ? 1 : -0.32;
  }
  return gain(fondus(decroissance(passeBas(x, 2), FREQUENCE, ms * 0.6), FREQUENCE, 2, 26), 0.48);
};
poser('prout-1', prout(260, 85, 5)); // le standard
poser('prout-2', prout(150, 105, 11)); // le court
poser('prout-3', prout(480, 72, 19)); // le long
poser('prout-4', prout(220, 130, 23)); // l'aigu
poser('prout-5', prout(340, 62, 31)); // le grave
poser('prout-6', gain(coller(prout(90, 95, 37), silence(70), prout(200, 88, 41)), 0.48)); // l'hésitant
poser('prout-7', gain(coller(prout(240, 78, 43), silence(45), prout(110, 92, 47)), 0.48)); // celui qui repart
poser('prout-8', prout(400, 98, 53)); // le généreux

console.log('\n── le pistolet à eau ──');
// Un pschitt : une bouffée de bruit claire qui s'éteint vite — la pression part, l'eau suit.
const pschitt = (ms: number, graine: number) =>
  gain(fondus(decroissance(passeBas(bruitBlanc(ms, graine), 3), FREQUENCE, ms * 0.5), FREQUENCE, 2, 30), 0.4);
poser('pistolet-1', pschitt(160, 71));
poser('pistolet-2', pschitt(230, 83));

console.log('\n── l’eau : le plouf, le robinet, la rafale ──');
// Un plouf : la note qui plonge, puis l'éclaboussure de bruit.
const plouf = (hz: number, graine: number) =>
  gain(
    fondus(
      coller(
        passeBas(glissando(60, hz, hz * 0.4), 3),
        decroissance(passeBas(bruitBlanc(120, graine), 4), FREQUENCE, 30),
      ),
      FREQUENCE,
      2,
      50,
    ),
    0.42,
  );
poser('plouf-1', plouf(420, 101));
poser('plouf-2', plouf(360, 103));
poser('plouf-3', plouf(480, 107));
poser('plouf-4', plouf(320, 109));

// Le robinet : de l'eau qui coule un moment — du bruit clair, moins sombre que la pluie.
const robinet = (ms: number, graine: number) =>
  gain(fondus(passeBas(bruitBlanc(ms, graine), 3), FREQUENCE, 40, 120), 0.36);
poser('robinet-1', robinet(700, 113));
poser('robinet-2', robinet(900, 127));

// La rafale du parapente : une houle de bruit, attaque lente, retombée lente.
const rafale = (ms: number, graine: number) =>
  gain(fondus(passeBas(bruitBlanc(ms, graine), 5), FREQUENCE, ms * 0.35, ms * 0.45), 0.5);
poser('rafale-1', rafale(800, 131));
poser('rafale-2', rafale(1100, 137));
poser('rafale-3', rafale(650, 139));

console.log('\n── le héron, le grognement, les bougies ──');
// Le héron : un cri rêche qui descend, deux fois rien de filtrage — c'est un oiseau rêche.
const heron = (h1: number, h2: number, ms: number) =>
  gain(fondus(passeBas(glissando(ms, h1, h2, 'carre'), 1), FREQUENCE, 4, 60), 0.26);
poser('heron-1', heron(880, 520, 240));
poser('heron-2', heron(760, 480, 300));

// Le grognement de Moon : plus long et plus bas que la colère, avec une remontée de fin —
// un chat contrarié pose une question.
poser(
  'grognement-1',
  gain(fondus(passeBas(coller(glissando(340, 130, 95, 'carre'), glissando(120, 95, 150, 'carre')), 3), FREQUENCE, 20, 60), 0.36),
);
poser(
  'grognement-2',
  gain(fondus(passeBas(coller(glissando(280, 145, 100, 'carre'), glissando(90, 100, 160, 'carre')), 3), FREQUENCE, 20, 60), 0.36),
);

// Les bougies, en attendant le vrai souffle : une grande inspiration de bruit, un silence,
// puis deux respirations d'enfant qui dort. Le vrai enregistrement reste indispensable.
poser(
  'bougies-1',
  gain(
    coller(
      fondus(passeBas(bruitBlanc(700, 149), 5), FREQUENCE, 500, 180),
      silence(500),
      fondus(passeBas(bruitBlanc(900, 151), 6), FREQUENCE, 400, 480),
      silence(400),
      fondus(passeBas(bruitBlanc(1000, 157), 6), FREQUENCE, 450, 520),
    ),
    0.3,
  ),
);

console.log('\n── ce qui tombe, et qui gronde ──');
// Un clonk : le choc (un claquement de bruit) puis la note de l'objet (un carré qui
// s'éteint). Le verre sonne plus haut que le bol.
const clonk = (hz: number, graine: number) =>
  gain(
    fondus(
      coller(
        decroissance(passeBas(bruitBlanc(18, graine), 2), FREQUENCE, 5),
        decroissance(passeBas(carre(130, hz), 3), FREQUENCE, 26),
      ),
      FREQUENCE,
      1,
      40,
    ),
    0.4,
  );
poser('objet-tombe-1', clonk(240, 91)); // le verre
poser('objet-tombe-2', clonk(170, 97)); // le bol

// La colère : un grondement qui descend — toute réplique en MAJUSCULES le déclenche.
const grondement = (h1: number, h2: number, ms: number) =>
  gain(fondus(decroissance(passeBas(glissando(ms, h1, h2, 'carre'), 2), FREQUENCE, ms * 0.7), FREQUENCE, 3, 40), 0.4);
poser('colere-1', grondement(150, 85, 280));
poser('colere-2', grondement(170, 95, 230));

console.log('\n── la pluie, la danse, le départ ──');
// La pluie de l'éléphant : du bruit très sombre, long, avec des fondus larges — deux
// lectures qui se chevauchent font une averse continue.
poser('pluie-1', gain(fondus(passeBas(bruitBlanc(1400, 61), 6), FREQUENCE, 350, 450), 0.55));

// La danse de l'araignée : quatre notes qui montent, une petite valse d'adieu.
poser(
  'araignee-danse-1',
  gain(
    fondus(
      passeBas(coller(carre(110, 392), carre(110, 494), carre(110, 587), carre(170, 784)), 3),
      FREQUENCE,
      4,
      50,
    ),
    0.34,
  ),
);

// Et son départ : une longue glissade vers le haut, de plus en plus loin.
poser('araignee-part-1', gain(fondus(passeBas(glissando(1100, 480, 1500), 3), FREQUENCE, 30, 320), 0.3));

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
