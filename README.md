# Les Aventures de Nino

Petit jeu narratif façon Game Boy — 160 × 144, quatre couleurs, un écran par lieu.
Un enfant de 7 ans traverse son quotidien et tombe sur des passages vers des histoires
parallèles.

Le document de design et l'histoire : **[docs/GAME-DESIGN.md](docs/GAME-DESIGN.md)**.

**Pour changer un texte du jeu : [src/data/textes.ts](src/data/textes.ts).** Tout y est —
répliques, énigmes, haïkus, noms des lieux, boutons, écran de fin — et rien d'autre n'a
besoin d'être touché.

## Lancer

```bash
npm install && npm run dev
```

Puis ouvrir <http://localhost:5173>.

## Jouer

| Touche | Action |
|---|---|
| Flèches / ZQSD / WASD | Se déplacer |
| **Espace** ou **E** | Parler, fouiller, ouvrir, franchir |
| **Entrée** ou **J** | Ouvrir le journal (← → pour changer de page) |
| **Échap** | Fermer |
| **M** ou le bouton sous l'écran | Couper / rallumer le son |

**Quatorze sons sur vingt-huit sont branchés** : le texte qui s'écrit, les pas, les portes,
les escaliers, le ballon, la vitre, les objets ramassés, les énigmes, les refus, le portail,
le naufrage. Ils viennent du pack CC0 de Juhani Junkala ; cinq sont marqués *provisoires* et
attendent leur version enregistrée à la maison. Les autres — le prout de la fusée, les cris
de Maman, Hermione, Moon, le souffle des bougies — **sont déjà branchés dans le code et
resteront muets jusqu'à ce que les fichiers arrivent**.

**Le son est coupé au démarrage**, le temps du développement. Le bouton vit dans la page,
sous l'écran, et pas dans le jeu : il ne mange aucun pixel, et il suffira de retirer le
`<button>` de `index.html` et le bloc marqué *TEMPORAIRE* de `src/main.ts` le jour où on
n'en voudra plus.

Une petite bulle apparaît au-dessus de tout ce qui peut être actionné. La boîte de
dialogue se place toujours du côté opposé à l'action, pour ne rien cacher. La partie est
sauvegardée automatiquement à chaque changement de pièce.

**Le parcours de la première branche :** chambre → couloir → cuisine (parler à maman,
ouvrir le frigo) → salon (donner la pizza à Moon) → la fenêtre en bas du salon → la cour
→ le trou dans la haie → Nantes → l'Erdre, où papa est sur un bateau avec un chapeau de
capitaine → **la Tour de Bretagne**, une fois le bateau coulé → le toit, le parapente, et
la fenêtre de sa chambre.

Certains dialogues posent une **question** : les flèches haut/bas choisissent, Espace
valide.

**Personne ne prononce de mot.** Chaque personnage a le même bip de 43 ms, rejoué à une
autre hauteur et une autre vitesse : Moon parle haut et vite, l'Éléphant très bas et
lentement. C'est le rythme du texte qui fait la parole, comme sur la console d'origine.

Dans la cour, **Espace tape dans le ballon** — il suffit d'être à côté, sans viser. Le
regard donne l'axe, et l'endroit où on le frappe donne l'angle : pile en face il part
droit, décalé sur le côté il part de biais, et comme il rebondit sans rien perdre, un tir
de biais fait le tour de la cour. Il **ne bouge que si on tape dedans** — marcher dedans ne
le déplace pas, c'est Nino qui est arrêté — et on le stoppe en se mettant devant. Il y a une
fenêtre au fond de la cour.

## Aller vite (développement)

Les **chiffres 1 à 9** sautent directement à un moment du jeu, avec l'état qu'il faut pour
que ce soit jouable tout de suite. Chaque saut **repart de zéro** — il écrase la partie en
cours, mais il donne toujours exactement la même chose.

| Touche | Où |
|---|---|
| **1** | Le réveil, partie neuve |
| **2** | La cour |
| **3** | Nantes |
| **4** | L'Erdre |
| **5** | La mezzanine, l'araignée a ses dix haïkus |
| **6** | La mezzanine, elle n'en a plus : elle danse |
| **7** | La salle de bain, le poisson est arrivé |
| **8** | Le rêve : Nino sur la fusée |
| **9** | Hermione a été trouvée partout, elle suit Nino |
| **0** | La Tour de Bretagne, en bas |
| **P** | Le toit de la tour, énigmes résolues, parapente à prendre |
| **F** | La fin : dans la chambre, parapente sous le bras |

La liste vit dans [`src/dev/etapes.ts`](src/dev/etapes.ts) — une ligne par étape. Dans la
console : `nino.etapes()` la rappelle, `nino.where()` dit où on est, `nino.go('salon')`,
`nino.flag('parents-sortis')`, `nino.cool('volets')`, `nino.soeur(19)`, `nino.haikus(10)`.

Rien de tout ça n'existe dans le jeu construit.

## Comment c'est fait

Pas un seul fichier d'image. **Tout le pixel art est du texte dans le code** :

```ts
const BALLON: Art = [
  '..0000..',
  '.033330.',
  '03300330',
  ...
];
```

`.` = transparent, `0` à `3` = les quatre tons de la palette. Au démarrage, chaque
dessin est « cuit » en texture **une fois par palette**. Changer de monde revient donc à
rejouer les mêmes dessins dans d'autres couleurs — le monde entier change de teinte sans
un asset de plus. La police, elle, est fabriquée en seuillant la police monospace du
système : de vraies lettres 1-bit, accents français compris, sans fichier de font.

```
src/
  main.ts            zoom entier, ordre des scènes
  config.ts          résolution, vitesse, touches
  art/
    palette.ts       les 4 palettes (real, ville, eau, tv)
    sprites.ts       tout le pixel art des personnages et des décors
    tiles.ts         les jeux de tuiles 8×8 par thème
    pixels.ts        texte → texture Phaser
    font.ts          la police 1-bit
  data/
    textes.ts        TOUS LES TEXTES DU JEU — le seul fichier à ouvrir pour les changer
    sons.ts          la liste des sons à trouver, et le tirage au sort des variantes
    rooms.ts         les lieux : carte ASCII, objets, portes, portails
    hermione.ts      les cachettes de la petite sœur, et les cris de maman
    haikus.ts        les haïkus de l'araignée
    fraicheur.ts     la quête de température, en pause (voir le doc de design)
    pieces.ts        les pièces à collectionner
    dialogues.ts     la mécanique des dialogues (conditions, effets)
    items.ts         les objets ramassables
    characters.ts    la fiche de chaque personnage
  dev/etapes.ts      les raccourcis chiffrés vers chaque étape
  entities/Player.ts Nino : 4 directions, 2 frames de marche
  systems/
    state.ts         objets, flags, lieux visités, sauvegarde
    fx.ts            fondus 4 tons, warp de portail, étincelles
    bus.ts           le lien entre le monde et l'interface
  ui/                boîte de dialogue, texte pixel
  scenes/            Boot, Title, World, Flappy (le rêve), Ui, Journal
```

## Vérifier

```bash
npm run build
```

Type-check strict puis build de production.

```bash
npx tsx tools/verifier.ts
```

Vérifie le *plan* du jeu, pas le code : grilles de pièces, sprites qui débordent, meubles
qui se chevauchent, points d'arrivée dans un mur, portes murées, cachettes d'Hermione à
découvert, dialogues manquants, lieux injoignables — et qu'aucun texte français ne traîne
ailleurs que dans `textes.ts`.

```bash
npx tsx tools/sons.ts
```

La liste des sons qui manquent, par priorité, avec le nom du fichier à poser dans
`public/sons/`. Les sources libres de droits (CC0) sont listées dans
[public/sons/LISEZ-MOI.md](public/sons/LISEZ-MOI.md).
