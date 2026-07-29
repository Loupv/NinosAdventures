/**
 * La liste de courses des sons. `npx tsx tools/sons.ts`
 *
 * Affiche ce qu'il reste à trouver, par priorité, avec le nom exact du fichier à poser
 * dans `public/sons/`. Ce qui est déjà là est marqué trouvé — donc la liste raccourcit
 * toute seule au fil des trouvailles.
 */
import { existsSync, readdirSync } from 'node:fs';
import { SONS, fichiersAttendus, type Priorite } from '../src/data/sons';

const RANGS: Priorite[] = ['indispensable', 'important', 'plus tard'];
const DOSSIER = 'public/sons';

const presents = new Set(
  existsSync(DOSSIER) ? readdirSync(DOSSIER).filter((f) => /\.(wav|ogg|mp3)$/i.test(f)) : [],
);
const trouve = (nom: string) => {
  const base = nom.replace(/^sons\//, '').replace(/\.\w+$/, '');
  return [...presents].some((f) => f.replace(/\.\w+$/, '') === base);
};

let attendus = 0;
let acquis = 0;

for (const rang of RANGS) {
  const lot = SONS.filter((s) => s.priorite === rang);
  if (lot.length === 0) continue;
  console.log(`\n━━━ ${rang.toUpperCase()} ━━━`);
  for (const s of lot) {
    const noms = Array.from({ length: s.variantes }, (_, i) =>
      `${s.id}-${i + 1}.${s.boucle ? 'ogg' : 'wav'}`,
    );
    const ok = noms.filter(trouve).length;
    attendus += noms.length;
    acquis += ok;
    const etat = ok === noms.length ? '✓' : ok === 0 ? ' ' : `${ok}/${noms.length}`;
    const marques = [s.maison ? 'à enregistrer à la maison' : '', s.boucle ? 'boucle' : '']
      .filter(Boolean)
      .join(', ');
    console.log(
      `\n[${etat}] ${s.id}  —  ${s.variantes} variante${s.variantes > 1 ? 's' : ''}${marques ? `  (${marques})` : ''}`,
    );
    console.log(`     quand : ${s.quand}`);
    console.log(`     cherche : ${s.cherche}`);
    if (ok < noms.length) {
      console.log(`     fichiers : ${noms.filter((n) => !trouve(n)).join('  ')}`);
    }
  }
}

// Le drapeau `present` décide de ce que le jeu charge : il ne doit jamais mentir.
const drapeaux: string[] = [];
for (const s of SONS) {
  const noms = Array.from({ length: s.variantes }, (_, i) =>
    `${s.id}-${i + 1}.${s.boucle ? 'ogg' : 'wav'}`,
  );
  const tous = noms.every(trouve);
  if (tous && !s.present) drapeaux.push(`  ${s.id} : fichiers là, ajoute \`present: true\``);
  if (!tous && s.present) drapeaux.push(`  ${s.id} : \`present: true\` mais des fichiers manquent`);
}
if (drapeaux.length) {
  console.log('\n━━━ à corriger dans src/data/sons.ts ━━━');
  console.log(drapeaux.join('\n'));
}

console.log(
  `\n━━━ ${acquis}/${attendus} fichiers trouvés dans ${DOSSIER}/ ` +
    `(${fichiersAttendus().length} attendus au total) ━━━`,
);
if (acquis === 0) {
  console.log(
    'Rien encore. Le dossier public/sons/ attend, et rien dans le jeu ne dépend de lui :\n' +
      'on peut en poser un seul et le brancher, les autres suivront.',
  );
}
