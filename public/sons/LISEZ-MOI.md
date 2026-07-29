# Les sons du jeu

Poser les fichiers ici, nommés **`<id>-<numéro>.wav`** — même pour un son unique :
`porte-1.wav`, `prout-1.wav`, `prout-2.wav`, … Les boucles (musiques) sont en `.ogg`.

La liste de ce qu'il faut, et ce qui manque encore :

```bash
npx tsx tools/sons.ts
```

Les identifiants et le nombre de variantes attendues sont dans
[`src/data/sons.ts`](../../src/data/sons.ts). Ajouter un son au jeu = une entrée là-bas,
puis les fichiers ici.

**Pourquoi plusieurs variantes ?** Un son entendu trois fois par minute lasse en deux
minutes. Le jeu en pioche une au hasard à chaque fois, et jamais celle qui vient d'être
jouée — c'est ce détail qui fait qu'on ne l'entend plus comme une répétition.

**Ce qu'on cherche :** court, sec, un peu pauvre. Le jeu a quatre couleurs et une police
d'un pixel ; une Game Boy n'a pas de reverb.

---

## Où trouver, sans rien devoir à personne

Tout ce qui suit est en **CC0** : domaine public, aucune attribution obligatoire, usage
commercial compris. C'est la licence à préférer — pas de fichier de crédits à maintenir,
pas de question à se poser si le jeu sort un jour.

### 1. Le gros de la besogne : 512 bruitages 8-bit — **déjà utilisé**

**[512 Sound Effects (8-bit style)](https://opengameart.org/content/512-sound-effects-8-bit-style)**
— Juhani Junkala, **CC0**, 20 Mo, un seul zip. Tout en 44,1 kHz, 16 bits, mono, à −6 dB.

Le pack est organisé en six dossiers : *General Sounds* (bips, menus, pièces, impacts,
fanfares, sons positifs et négatifs), *Movement* (pas, sauts, échelles, escaliers),
*Explosions*, *Weapons*, *Death Screams*. **`texte-1.wav` en vient** : c'est
`General Sounds/Simple Bleeps/sfx_sounds_Blip4.wav`, 43 ms, ~854 Hz — le plus court et le
plus neutre des onze bips, donc celui qui supporte le mieux d'être transposé.

Cinq cents bruitages dans l'esprit NES / C64, de quoi couvrir d'un coup `objet-trouve`,
`piece`, `enigme-juste`, `enigme-faux`, `refus`, `portail` et `vitre-cassee`. Le même
auteur a des collections de 1000 et 6000 sons sur itch.io si celle-ci ne suffit pas.

Le zip lui-même n'est pas versionné (20 Mo) : le retélécharger au besoin depuis le lien
ci-dessus, seuls les fichiers utilisés vivent dans ce dossier.

### 2. Les bruits d'interface, très propres : Kenney

**[Kenney — tous les packs audio](https://kenney.nl/assets/category:Audio)**, **CC0**.
Les deux utiles ici :

- **[Digital Audio](https://kenney.nl/assets/digital-audio)** — 60 sons, bips et
  électronique. Bon pour `texte` et les validations.
- **[Interface Sounds](https://kenney.nl/assets/interface-sounds)** — 100 sons de menu,
  clics, glissements.

Il y a aussi *Impact Sounds*, *UI Audio*, *Music Jingles* et *RPG Audio* dans la même
catégorie. C'est plus lisse et plus « moderne » que les 512 : à mélanger avec parcimonie.

### 3. Les musiques

**[4 Chiptunes (Adventure)](https://opengameart.org/content/4-chiptunes-adventure)** —
Juhani Junkala, **CC0**, boucles sans couture, fournies en **OGG et WAV**. Quatre pistes :
Stage 1 (léger, aventureux), Stage 2 (un peu plus tendu), Boss Fight, Stage Select.

**[5 Chiptunes (Action)](https://opengameart.org/content/5-chiptunes-action)** — même
auteur, **CC0**, plus nerveux. Une piste d'action ferait très bien `musique-fusee` en
attendant mieux.

Pour la maison la nuit, en revanche, aucune de ces pistes ne conviendra : elles sont toutes
trop gaies. Ce sera à composer — ou à ralentir de moitié, ce qui marche étonnamment bien.

### 4. Les fabriquer soi-même, en dix secondes

**[jsfxr](https://sfxr.me/)** et **[jfxr](https://jfxr.frozenfractal.com/)** — deux
générateurs dans le navigateur, dans la lignée du sfxr de DrPetter. On clique « pickup »,
« hit », « blip », on tire deux curseurs, on exporte le `.wav`.

**Le son produit est entièrement à toi**, sans attribution ni condition. Pour un jeu
Game Boy c'est souvent plus rapide et plus juste que de fouiller une banque : on obtient
exactement la durée et la hauteur qu'on veut, et les huit variantes d'un même bip se font
en une minute.

---

## Les voix, et « le texte qui s'écrit »

**Aucune banque ne donnera de voix qui aille avec ce jeu**, et ce n'est pas grave : les
jeux dont il s'inspire n'en ont pas du tout. Deux techniques valent mieux.

**Un bip par caractère, à hauteur variable.** Un seul fichier (`texte-1.wav`) suffit : le
jeu peut le rejouer plus aigu pour Moon, plus grave pour Papa, très grave pour l'Éléphant,
en changeant simplement la vitesse de lecture. C'est comme ça que sonnent les dialogues
d'Animal Crossing — et ça donne une voix à chaque personnage pour le prix d'un son.

**Et pour le reste, la maison.** Onze entrées de la liste sont marquées `maison`, et
aucune banque ne les remplacera :

- les dix **« HERMIONE ! »** de Maman, dans l'ordre — l'exaspération monte, puis elle
  renonce ;
- **Hermione** qui babille : elle a un an, c'est maintenant ou jamais ;
- **Moon** qui miaule ;
- le **ballon** dans la cour, la **porte**, l'**escalier**, le **robinet** ;
- les **huit prouts** ;
- et le tout dernier son du jeu : une grande inspiration devant les bougies, puis une
  respiration d'enfant qui dort.

Un bruitage acheté sera toujours plus propre, et toujours moins juste. C'est un jeu sur
cette maison-là.
