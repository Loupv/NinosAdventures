/**
 * Vérificateur de cohérence du monde. `npx tsx tools/verifier.ts`
 *
 * Il ne teste pas le code, il teste le *plan* : une pièce dont un mur bouge peut
 * enfermer Nino ou faire apparaître Hermione dans un évier sans qu'aucun type ne
 * proteste. C'est arrivé plusieurs fois.
 *
 * Deux conventions, à ne pas confondre — elles ont déjà provoqué de fausses alertes :
 *  - **Nino** a son origine en bas au centre : `y` est le niveau de ses pieds, et sa
 *    boîte de collision fait 6×5 px, de `x-3..x+3` et `y-5..y`.
 *  - **Tout le reste** (meubles, personnages, Hermione) est placé par son coin haut
 *    gauche : `y` est le haut du dessin.
 */
import { ROOMS } from '../src/data/rooms';
import { IMAGES, SHEETS } from '../src/art/sprites';
import { CACHETTES, CACHETTES_MAISON } from '../src/data/hermione';
import { DIALOGUES } from '../src/data/dialogues';

const SOLID = new Set(['#', '~', 'X', 'T', 'V', 'Q', 'M']);

/** Taille de chaque dessin, en pixels. */
const dim: Record<string, [number, number]> = {};
for (const [k, art] of Object.entries(IMAGES)) {
  dim[k] = [Math.max(...art.map((r) => r.length)), art.length];
}
for (const [k, frames] of Object.entries(SHEETS)) {
  const tailles = Object.values(frames).map(
    (art) => [Math.max(...art.map((r) => r.length)), art.length] as const,
  );
  dim[k] = [Math.max(...tailles.map((t) => t[0])), Math.max(...tailles.map((t) => t[1]))];
}

type Boite = readonly [number, number, number, number];
const dessin = (o: any): Boite => {
  const sc = o.scale ?? 1;
  return [o.x, o.y, dim[o.sprite][0] * sc, dim[o.sprite][1] * sc];
};
/** La boîte qui bloque : celle donnée à la main si elle existe, sinon le dessin. */
const dur = (o: any): Boite =>
  Array.isArray(o.solid) ? [o.x + o.solid[0], o.y + o.solid[1], o.solid[2], o.solid[3]] : dessin(o);
const croise = (a: Boite, b: Boite) =>
  a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];

let ko = 0;
const dit = (...m: unknown[]) => {
  console.log(...m);
  ko++;
};

for (const r of Object.values(ROOMS)) {
  if (r.tiles.length !== 18 || r.tiles.some((t) => t.length !== r.tiles[0].length)) {
    dit('GRILLE', r.id, '— 18 lignes de largeur égale attendues');
  }
  const largeur = r.tiles[0].length * 8;

  for (const o of r.objects) {
    if (!o.sprite) continue;
    if (!dim[o.sprite]) {
      dit('SPRITE INCONNU', r.id, o.id, o.sprite);
      continue;
    }
    const [x, y, w, h] = dessin(o);
    // `deborde` = on sort du cadre exprès. Un seul cas aujourd'hui : la Tour de Bretagne,
    // dont on ne doit jamais voir le sommet. Sans ce champ, la seule façon de faire taire
    // le contrôle serait de rentrer la tour dans l'écran, ce qui la rendrait petite.
    if (!o.deborde && (x < 0 || y < 0 || x + w > largeur || y + h > 144)) {
      dit('DEBORDE', r.id, o.id);
    }
  }

  // Deux dessins au même endroit : l'un cache l'autre.
  const visibles = r.objects.filter((o) => o.sprite && dim[o.sprite]);
  for (let i = 0; i < visibles.length; i++) {
    for (let j = i + 1; j < visibles.length; j++) {
      const [a, b] = [visibles[i], visibles[j]];
      const exclusifs =
        (a.showIfFlag && a.showIfFlag === b.hideIfFlag) ||
        (b.showIfFlag && b.showIfFlag === a.hideIfFlag);
      if (!exclusifs && a.solid && b.solid && croise(dessin(a), dessin(b))) {
        dit('MEUBLES QUI SE CHEVAUCHENT', r.id, a.id, b.id);
      }
    }
  }

  // Tout endroit où Nino peut atterrir doit être du sol libre.
  const arrivees = [
    { x: r.spawn.x, y: r.spawn.y, quoi: 'spawn', dans: r },
    ...r.doors.map((d) => ({ x: d.to.x, y: d.to.y, quoi: `porte->${d.to.room}`, dans: ROOMS[d.to.room] })),
    ...r.objects
      .filter((o) => o.portal && !o.portal.minijeu)
      .map((o) => ({
        x: o.portal!.x,
        y: o.portal!.y,
        quoi: `portail->${o.portal!.room}`,
        dans: ROOMS[o.portal!.room],
      })),
  ];
  for (const a of arrivees) {
    if (!a.dans) {
      dit('CIBLE INCONNUE', r.id, a.quoi);
      continue;
    }
    const pieds: Boite = [a.x - 3, a.y - 5, 6, 5];
    if (a.dans.view !== 'side') {
      for (let ty = Math.floor(pieds[1] / 8); ty <= Math.floor((pieds[1] + pieds[3] - 1) / 8); ty++) {
        for (let tx = Math.floor(pieds[0] / 8); tx <= Math.floor((pieds[0] + pieds[2] - 1) / 8); tx++) {
          if (SOLID.has(a.dans.tiles[ty]?.[tx] ?? '#')) dit('DANS UN MUR', r.id, a.quoi);
        }
      }
    }
    for (const o of a.dans.objects) {
      if (!o.sprite || !dim[o.sprite] || !o.solid) continue;
      if (croise(pieds, dur(o))) dit('DANS UN MEUBLE', r.id, a.quoi, o.id);
    }
  }

  for (const d of r.doors) {
    let libre = false;
    for (let ty = Math.floor(d.y / 8); ty < Math.ceil((d.y + d.h) / 8); ty++) {
      for (let tx = Math.floor(d.x / 8); tx < Math.ceil((d.x + d.w) / 8); tx++) {
        if (!SOLID.has(r.tiles[ty]?.[tx] ?? '#')) libre = true;
      }
    }
    if (!libre) dit('PORTE MUREE', r.id, '->', d.to.room);
  }
}

/**
 * Hermione doit être **à moitié cachée** : ni plantée au milieu d'une pièce, ni recouverte
 * au point d'être invisible.
 *
 * On compte, pixel par pixel, la part de ses 8×10 recouverte par un meuble **dessiné
 * devant elle** — la profondeur compte autant que la position. Le premier contrôle que
 * j'avais écrit se contentait de vérifier qu'un meuble la touchait : la toute première
 * cachette du jeu était recouverte à 100 % et personne ne pouvait la trouver.
 */
/**
 * Elle respire : les deux frames se décalent d'un pixel, donc **tout bouge sauf les
 * jambes** (les deux dernières lignes sont identiques). Il ne suffit donc pas qu'un bout
 * d'elle dépasse : il faut que ce soit un bout **animé**, sinon on passe devant sans rien
 * remarquer. C'est ce petit mouvement qui donne envie d'aller voir.
 */
const LIGNES_ANIMEES = 8;
const COUVERTURE = { min: 15, max: 55 };
for (const [i, c] of CACHETTES.entries()) {
  const r = ROOMS[c.room];
  if (!r) {
    dit('CACHETTE', i, 'pièce inconnue', c.room);
    continue;
  }
  const sienne = c.depth ?? c.y + 10;
  const cache = new Set<string>();
  for (const o of r.objects) {
    if (!o.sprite || !dim[o.sprite]) continue;
    const [ox, oy, ow, oh] = dessin(o);
    if ((o.depth ?? oy + oh) <= sienne) continue; // dessiné derrière elle : ne cache rien
    for (let x = c.x; x < c.x + 8; x++) {
      for (let y = c.y; y < c.y + 10; y++) {
        if (x >= ox && x < ox + ow && y >= oy && y < oy + oh) cache.add(`${x},${y}`);
      }
    }
  }
  const part = Math.round((cache.size / 80) * 100);
  let anime = 0;
  for (let x = c.x; x < c.x + 8; x++) {
    for (let y = c.y; y < c.y + LIGNES_ANIMEES; y++) if (!cache.has(`${x},${y}`)) anime++;
  }
  if (part < COUVERTURE.min) dit(`CACHETTE ${i} (${c.room}) : à découvert, recouverte à ${part} %`);
  else if (part > COUVERTURE.max) dit(`CACHETTE ${i} (${c.room}) : introuvable, recouverte à ${part} %`);
  else if (anime < 12) dit(`CACHETTE ${i} (${c.room}) : seules ses jambes dépassent (${anime} px animés visibles), on ne verra pas qu’elle bouge`);
}

/**
 * La chaîne d'ouverture : **libérer le poisson doit rester obligatoire pour sortir de la
 * maison.** Le mécanisme est indirect — la dernière cachette d'Hermione n'existe qu'une
 * fois la baignoire vidée, et c'est en finissant la chasse que Maman quitte la cuisine et
 * libère le frigo. Si cette cachette cessait d'être la dernière, on pourrait tout finir
 * sans jamais entrer dans la salle de bain, et personne ne s'en apercevrait.
 */
const reveles = CACHETTES.map((c, i) => ({ i, revele: c.revele })).filter((c) => c.revele);
const derniere = reveles.find((r) => r.i === CACHETTES_MAISON - 1);
if (!derniere) {
  dit(`CHAÎNE : la dernière cachette de la maison (nº${CACHETTES_MAISON - 1}) n'est révélée par aucun flag`);
} else if (derniere.revele !== 'bouchon-retire') {
  dit(`CHAÎNE : la dernière cachette de la maison attend « ${derniere.revele} », pas le bouchon`);
}
// Les autres cachettes révélées rendent chacune une scène obligatoire, et c'est voulu — mais
// chaque flag doit être posé par quelque chose, sinon la chasse s'arrête là pour toujours.
const POSEURS: Record<string, string> = {
  'bouchon-retire': 'la bonde de la baignoire',
  'reve-fait': 'le rêve de la fusée',
};
for (const r of reveles) {
  if (r.i >= CACHETTES_MAISON) {
    dit(`CHAÎNE : la cachette nº${r.i} est dehors et attend un flag — Maman n'y arriverait jamais`);
  } else if (!POSEURS[r.revele!]) {
    dit(`CHAÎNE : la cachette nº${r.i} attend « ${r.revele} », et rien de connu ne pose ce flag`);
  }
}
// Et les cachettes du dehors doivent bien être dehors : une cachette de la maison placée
// après le seuil ne serait jamais nécessaire, et une du dehors avant le seuil rendrait
// l'ouverture impossible — il faudrait sortir pour pouvoir sortir.
const DEDANS = ['chambre', 'couloir', 'chambre-parents', 'mezzanine', 'sdb', 'cuisine', 'salon'];
CACHETTES.forEach((c, i) => {
  const dedans = DEDANS.includes(c.room);
  if (i < CACHETTES_MAISON && !dedans) dit(`CHAÎNE : cachette nº${i} (${c.room}) est dehors mais compte pour la maison`);
  if (i >= CACHETTES_MAISON && dedans) dit(`CHAÎNE : cachette nº${i} (${c.room}) est dans la maison mais compte pour le dehors`);
});

// Aucun dialogue manquant. Trois objets sont pris en charge par la scène elle-même
// (WorldScene.interagir) : leur champ `dialogue` n'est qu'un marqueur « on peut parler ».
const JOUES_PAR_LA_SCENE = new Set(['araignee', 'hermione', 'hermione-suit', 'poisson']);
const appeles = new Set<string>();
for (const r of Object.values(ROOMS)) {
  for (const o of r.objects) {
    for (const d of [o.dialogue, o.portal?.lockedDialogue, o.portal?.firstDialogue]) {
      if (d) appeles.add(d);
    }
  }
  for (const p of r.doors) for (const d of p.blockedDialogue ?? []) appeles.add(d);
}
for (const d of appeles) if (!DIALOGUES[d] && !JOUES_PAR_LA_SCENE.has(d)) dit('DIALOGUE MANQUANT', d);

// Le dehors est fermé tant que les parents sont là, ouvert dès qu'ils sortent.
const joignables = (flags: Set<string>) => {
  const vus = new Set(['chambre']);
  const pile = ['chambre'];
  while (pile.length) {
    const r = ROOMS[pile.pop()!];
    const suivantes = [
      // Une porte peut attendre un flag, ou se faire barrer par un autre.
      ...r.doors
        .filter(
          (d) =>
            (!d.needsFlag || flags.has(d.needsFlag)) &&
            !(d.blockedIfFlag && flags.has(d.blockedIfFlag)),
        )
        .map((d) => d.to.room),
      ...r.objects
        .filter(
          (o) =>
            o.portal &&
            !o.portal.minijeu &&
            (!o.portal.needsFlag || flags.has(o.portal.needsFlag)) &&
            (!o.showIfFlag || flags.has(o.showIfFlag)),
        )
        .map((o) => o.portal!.room),
    ];
    for (const n of suivantes) if (!vus.has(n)) (vus.add(n), pile.push(n));
  }
  return vus;
};
const avant = joignables(new Set());
for (const r of ['chambre', 'couloir', 'chambre-parents', 'mezzanine', 'sdb', 'cuisine', 'salon']) {
  if (!avant.has(r)) dit(r, 'injoignable au début du jeu');
}
for (const r of ['cour', 'nantes', 'erdre']) {
  if (avant.has(r)) dit(r, 'accessible alors que les parents sont encore là');
}
// Fin de partie : tout doit avoir été atteignable au moins une fois.
const FIN = new Set([
  'parents-sortis',
  'fenetre-ouverte',
  'bouchon-retire',
  'bateau-arrive',
  'bateau-coule',
  'enigme-moon',
  'enigme-ecureuil',
  'enigme-araignee',
  'enigme-elephant',
  'parapente-pris',
]);
const apres = joignables(FIN);
for (const r of Object.keys(ROOMS)) if (!apres.has(r)) dit(r, 'injoignable même en fin de partie');
// La tour ne s'ouvre qu'avec le naufrage : c'est tout le sens de la chaîne du poisson.
const sansNaufrage = joignables(new Set(['parents-sortis', 'fenetre-ouverte', 'bouchon-retire']));
for (const r of Object.keys(ROOMS)) {
  if (r.startsWith('tour-') && sansNaufrage.has(r)) dit(r, 'accessible sans avoir coulé le bateau');
}

console.log(
  ko === 0
    ? `${Object.keys(ROOMS).length} pièces, ${CACHETTES.length} cachettes, ${appeles.size} dialogues appelés — tout est cohérent`
    : `${ko} problème(s)`,
);

// ── Les mots sont-ils tous dans textes.ts ? ──
// On cherche, ailleurs que dans textes.ts, une chaîne qui ressemble à une phrase :
// deux mots en minuscules séparés par une espace. Les cartes ASCII, les identifiants et
// les noms techniques n'en contiennent jamais.
const { readdirSync, readFileSync } = await import('node:fs');
/**
 * textes.ts contient les mots du jeu ; etapes.ts nomme des raccourcis de développement ;
 * sons.ts décrit les sons à trouver — rien de tout ça ne s'affiche à l'écran.
 */
const AUTORISE = ['src/data/textes.ts', 'src/dev/etapes.ts', 'src/data/sons.ts'];
/** Les messages d'erreur technique ne s'affichent jamais dans le jeu. */
const TECHNIQUE = /throw new Error|console\./;
const PHRASE = /'[^']*[a-zéèêàâîôûçùïœ]{3,}[ ,][a-zéèêàâîôûçùïœ]{3,}[^']*'/;
const fichiers: string[] = [];
const explorer = (dir: string) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const chemin = `${dir}/${e.name}`;
    if (e.isDirectory()) explorer(chemin);
    else if (e.name.endsWith('.ts')) fichiers.push(chemin);
  }
};
explorer('src');
let egares = 0;
for (const f of fichiers) {
  if (AUTORISE.includes(f)) continue;
  for (const [i, ligne] of readFileSync(f, 'utf8').split('\n').entries()) {
    const nu = ligne.trim();
    if (nu.startsWith('*') || nu.startsWith('//') || nu.startsWith('/*')) continue;
    if (nu.startsWith('import') || nu.startsWith('export {')) continue;
    if (TECHNIQUE.test(nu)) continue;
    if (!PHRASE.test(nu)) continue;
    console.log(`TEXTE ÉGARÉ  ${f}:${i + 1}  ${nu.slice(0, 70)}`);
    egares++;
  }
}
console.log(egares === 0 ? 'tous les textes sont dans textes.ts' : `${egares} texte(s) hors de textes.ts`);
