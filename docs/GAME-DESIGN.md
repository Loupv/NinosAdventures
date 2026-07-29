# Les Aventures de Nino — document de game design

*Version 0.1 — première passe jouable.*

## Pitch

Nino a 7 ans. Un jour de canicule, il s'ennuie dans sa chambre. En interagissant avec
son quotidien — un frigo, un chat, une fenêtre — il ouvre des passages vers des
histoires parallèles où la logique des adultes ne s'applique plus tout à fait.

Rick & Morty pour un enfant de 7 ans : l'absurde est traité très sérieusement, jamais
avec cynisme, et personne n'est méchant.

## Ton

- **Phrases courtes.** Le texte est écrit pour être lu à voix haute par un adulte.
- **L'absurde est constaté, jamais expliqué.** Papa est sur un bateau sur l'Erdre
  alors qu'il travaille dans la mezzanine. Personne ne relève. C'est ça, la blague.
- **Le décor répond.** Un reflet fait signe, un ballon revient tout seul, le fond de
  l'armoire est plus loin qu'il ne devrait. Aucune de ces choses n'est un piège.
- **Pas de mort, pas de score, pas d'échec.** La récompense est le journal qui
  se remplit.

## Le casting

| Personnage | Où | Rôle |
|---|---|---|
| **Nino** | partout | Le héros. Prend l'absurde au sérieux. |
| **Hermione** | une cachette à la fois | La petite sœur, un an. Elle est cachée quelque part et **change de cachette dès qu'on l'a trouvée**. |
| **Moon** | salon | Le chat blanc. Dort, jusqu'à ce qu'on le paie en pizza. Devient le guide du jeu. |
| **Maman** | cuisine, puis salon | Elle cherche Hermione dans la cuisine, plantée devant le frigo, et ne monte au salon qu'une fois qu'elle a renoncé. Tient le réel. C'est elle qui envoie Nino au frigo sans savoir ce qu'elle déclenche. |
| **Papa** | mezzanine | « Cinq minutes, Nino. » Depuis quarante minutes. |
| **Papa (capitaine)** | l'Erdre | Le même papa, sur un bateau, avec un chapeau de capitaine. Il n'arrive que plus tard (flag `bateau-arrive`). |
| **L'araignée** | mezzanine, puis le 27e étage de la tour | Géante, et elle dit des haïkus — un nouveau à chaque visite, dix en réserve. Quand elle les a tous dits, elle chante, elle danse, et elle s'en va. |
| **Gérard, le poisson** | baignoire, puis l'Erdre | Saute d'un bord à l'autre, visible seulement quand il est en l'air. Raconte sa vie en cinq boîtes de dialogue, et ne demande de l'aide qu'au moment où le chat s'assoit au bord de la baignoire. Rend ses dettes, plus tard, dans l'Erdre. |
| **L'écureuil** | un coin de la cour, puis les roseaux de l'Erdre | À moitié caché, toujours. Pousse Nino à viser la fenêtre avec le ballon, puis à couler le bateau de papa — et nie tout, à chaque fois. Il ne gagne rien à ça. |
| **L'Éléphant des Machines** | 31e étage de la tour | Douze mètres de bois et d'acier, sur un palier. Personne ne demande comment il est monté. Il pose la seule énigme dont il ne connaît pas la réponse. |
| **La maîtresse** | école *(à construire)* | Donnera des « devoirs » qui sont des quêtes déguisées. |
| **Copains ×3** | école *(à construire)* | Un qui croit tout, un qui ne croit rien, un qui a déjà vu une dimension et n'en parle jamais. |

Les copains attendent leurs noms — ils sont déjà déclarés dans
[characters.ts](../src/data/characters.ts) avec leur rôle narratif.

## La carte

```
   chambre des parents          chambre de Nino
    (sort par le bas)            (sort par le bas)
            │                            │
            └──────────┬─────────────────┘
                       │
                ┌──────┴──────┐
     escalier ──┤             │
    (mezzanine) │   COULOIR   │
                │  (vertical) │
salle de bain ──┤             │
                └──────┬──────┘
                       │
                ┌──────┴───────────────┐
                │      CUISINE         ├── salon (flanc droit)
                │  plan de travail en L│
                │  frigo centré en haut│
                └──────┬───────────────┘
                       │ (porte du bas = sortie de la maison)
                    la cour ──── (trou dans la haie) ──── NANTES
                    porte à droite, trou plus à gauche

        ┌───────────────────────────┐
        │          SALON            │
        │ bibliothèque ┐   ┌ table  │
        │ (coin H-G)   │   │ ronde  │
        │                          │
        │ canapé vertical + Moon    │
        │ vidéoprojecteur (dessous) │
        │        → mur de droite    │
        │        ┌ FENÊTRE ┐        │
        └────────┴────┬────┴────────┘
                      │ (une fois que le chat a parlé)
                   NANTES
                      │
              LA RUE DES BARS   deux terrasses, trois personnes très occupées
                      │
              LE BORD DE L'ERDRE   (papa, capitaine — puis papa, repêché)
                      │ (une fois le bateau coulé)
              UNE TERRASSE, LA NUIT   papa et le parrain, un verre à la main
                      │
              LA TOUR DE BRETAGNE
```

**Deux écrans de ville qui ne servent à rien**, et c'est leur fonction : entre deux
morceaux d'histoire, un écran où l'on ne fait que traverser en écoutant des gens dire
n'importe quoi donne au trajet une longueur. La rue des bars est en plein jour ; sur la
terrasse, **la nuit est tombée** — personne ne l'a vue tomber.

La maison et la ville tiennent sur **un seul écran** chacune (20 × 18 tuiles de 8 px),
sans scrolling : c'est la grammaire de Zelda 1 et de Pokémon, et c'est très lisible pour
un enfant. Les tuiles `X` (hors-plan) permettent à une pièce de ne pas remplir l'écran —
c'est ce qui donne au couloir sa forme de boyau.

### La forme des pièces

Les tuiles de hors-plan (`X`) servent à donner une **silhouette** à chaque pièce, au
lieu d'un rectangle plein écran :

- **le couloir** est un boyau vertical étroit ;
- **la mezzanine** est petite et verticale : lit de camp à gauche, livres à droite,
  et l'escalier pour redescendre en haut à droite ;
- **la salle de bain** est étroite mais horizontale : baignoire-douche en haut à
  gauche, toilettes en bas à gauche, évier en bas, sortie à droite.

### Deux vues

Une pièce déclare sa vue : `view: 'top'` (par défaut) ou `view: 'side'`.

**Le bord de l'Erdre est de profil**, à la Mario : deux écrans de long, gravité, et
**uniquement du déplacement horizontal**. Haut et bas ne font rien : le quai est une
corniche au bord de l'eau, il n'y a rien à franchir, et un enfant qui saute au bord de
l'Erdre n'est pas ce qu'on veut montrer. La caméra suit Nino dès qu'une pièce dépasse
l'écran.

Le décor y est étagé en plans, du plus loin au plus près : ciel, ligne d'arbres, eau
claire, eau plus sombre, mur de quai, ligne de marche, maçonnerie au premier plan. **Le
poisson saute dans la bande d'eau du bas**, celle qui touche la berge : plus haut, il avait
l'air d'être au milieu de la rivière.

Attention : **plus rien n'est solide sur le quai**. Comme on ne saute plus, le moindre
meuble en travers fermerait définitivement l'accès au poisson et au bateau — le panneau et
le réverbère sont du décor auquel on peut parler, rien de plus. Les
valeurs sont choisies pour que Nino (sombre) se détache toujours du plan derrière lui.
Pour l'instant on **marche, c'est tout** : le quai est vide, il n'y a rien à franchir.
**Le bateau de papa arrive sous les yeux de Nino**, quatre secondes après son arrivée sur
le quai : *« Un bateau remonte l'Erdre. Il y a quelqu'un dessus. »* La règle des trois
écrans existe toujours en secours, mais elle ne suffisait pas — **rien ne disait au joueur
de repartir et de revenir**, et il attendait sur le quai devant une rivière vide. Le voir
arriver vaut mieux que le trouver là. Le flag `bateau-arrive` fait apparaître au second plan
papa debout dessus : dessiné derrière Nino et plus haut à l'écran, donc plus loin, selon
la convention 2D habituelle.

De profil, l'interaction ne vise plus dans une direction : on prend simplement ce qui
est le plus près. Sinon parler à quelqu'un qui est sur un bateau derrière soi serait
impossible.

Ça crée un embouteillage sur un quai étroit — la corde, papa sur le bateau, le poisson dans
l'eau se disputent les mêmes pixels — donc un objet peut déclarer deux choses : sa
**`priorite`** (2 = comme un personnage ; sans ça papa volait l'interaction de la corde, qui
devenait injouable) et sa **`portee`** en pixels (celle de la corde est resserrée à 12). Le
quai se lit alors comme des zones successives : la bouée, le panneau, **la corde**, **papa**,
**le poisson**, puis **l'écureuil**.

## La chaîne d'ouverture : rien ne s'ouvre tout seul

Sortir de la maison demande **quatre choses, dans cet ordre**, et chacune débloque la
suivante. Aucune n'est expliquée : on les découvre en butant dessus.

1. **Maman cherche Hermione dans la cuisine**, et elle est plantée devant le frigo.
   *« Pas maintenant, Nino. Je cherche ta sœur. »* — *« Cherche-la, tu veux ? Je n'avance
   pas. »*
2. **On trouve Hermione dans les cinq cachettes de la maison**, et à chaque fois Maman la
   récupère… puis la reperd : *« Elle est repartie. Trois secondes. J'ai tourné la tête
   trois secondes. »* C'est la blague, et c'est aussi la quête.
3. **La cinquième cachette est derrière la baignoire**, et on ne la voit pas : il y a de
   l'eau et un poisson dedans. Il faut donc **faire couler l'eau, attendre le poisson,
   l'écouter, et retirer le bouchon** — toute la chaîne de la salle de bain devient
   obligatoire, sans qu'une ligne ne le dise.
4. Une fois la chasse finie, **Maman renonce et monte au salon**. Le frigo est libre, la
   pizza est prise.
5. Et là seulement Moon accepte la pizza — **parce qu'il a vu le poisson**. Avant ça il
   dort d'un sommeil imperturbable : *« Nino agite la pizza. Moon dort toujours. Il
   faudrait quelque chose de plus intéressant qu'une pizza. »*

Ce qui rend cette chaîne solide, c'est qu'elle est **entièrement indirecte** : nulle part
le jeu ne dit « va voir le poisson pour que le chat ait faim ». Il dit « le chat dort », et
« il faudrait quelque chose de plus intéressant ». Le joueur fait le lien tout seul, et
c'est là que l'affaire devient un jeu plutôt qu'une liste de courses.

> Le vérificateur surveille précisément ce point : **exactement une** cachette révélée par
> un flag, c'est **la dernière de la maison**, et ce flag est bien `bouchon-retire`. Sans
> ça on pourrait finir le jeu sans jamais entrer dans la salle de bain, et personne ne s'en
> apercevrait. Il vérifie aussi qu'**aucune cachette du dehors ne compte pour la maison** —
> l'erreur inverse serait pire : il faudrait sortir pour pouvoir sortir.

## Branche 1 : la pizza, le chat, la fenêtre

C'est la branche implémentée. Elle sert de gabarit à toutes les suivantes.

1. **Chambre.** Nino s'ennuie. Le ventilateur est cassé, la fenêtre ne sert à rien,
   le coffre à jouets est connu par cœur. Le lit propose un vrai **choix Oui / Non**
   (se recoucher), qui ne mène nulle part — et c'est le but : montrer tout de suite
   que le jeu écoute. → *le joueur cherche ailleurs.*
2. **Couloir, puis cuisine.** Maman : « va voir dans le frigo ». → **flag** `indice-frigo`
3. **Frigo.** → **objet** `pizza`, **flag** `pizza-prise` (le frigo change de sprite,
   il reste ouvert).
4. **Salon.** **Papa et Maman tiennent le salon.** C'est là qu'est le vrai obstacle, et
   il n'est pas magique : on n'enjambe pas une fenêtre devant ses parents. Tout le monde
   sait ça.
5. Moon dort sur le canapé. Avec la pizza en poche, l'interaction change complètement :
   Moon mange, s'assoit, **et se met à parler**. → **flag** `chat-parle`, la pizza est
   consommée, Moon passe de la frame « dort » à son animation assise. Il promet de
   « s'occuper des adultes ».
6. **On retourne voir Moon** — et il tient sa promesse. C'est une **scène jouée** :

   *« Regarde bien. »* → il traverse le salon → il grimpe sur la table ronde → **il pousse
   un des deux bols du bout de la patte**, qui décrit un arc et tombe par terre (secousse
   de caméra) → *« NON MAIS CE CHAT. »* (Papa) → *« Tu as environ deux minutes. »* (Moon)
   → **il sort en courant, les deux parents derrière lui.**

   → **flag** `parents-sortis`. Le bol reste par terre, pour toujours : il ne s'est même
   pas cassé. **Et Moon n'est plus là** : il est sorti avec eux, on ne le revoit pas dans
   le salon.

   Ce flag ouvre deux choses d'un coup : la fenêtre du salon, et **la porte de la
   cuisine** qui donne sur la cour.

   Et on ne repart pas en arrière : **si Nino essaie de retourner dans la cuisine, il se
   fait refouler**. Moon n'est pas visible — il est de l'autre côté, dans la pièce d'à
   côté — on l'entend seulement :

   > **Moon** — *« Vas-y, je les retiens. »*
   > **Papa** — *« VIENS LÀ, TOI !! »*

   Deux répliques, aucun commentaire, et on sait exactement ce qui se passe hors champ.
   À partir de là, la seule sortie du salon est la fenêtre.

   C'est le cœur de la branche : le chat n'est pas un donneur d'indices, c'est un
   **complice**. Et la fenêtre, entre-temps, refuse pour une raison qui change — d'abord
   les parents, ensuite « Moon a promis et n'a encore rien fait », ce qui renvoie le
   joueur vers le chat sans jamais lui dire quoi faire. Une fois le coup fait, Moon ne
   commente plus rien : il a arrêté de parler exactement au moment où il devenait utile.
7. **Fenêtre du salon** (en bas, au milieu). Sans `parents-sortis`, elle refuse. Avec,
   le premier appui pose la question **« Enjamber la fenêtre ? »** : *Oui* franchit le pas
   (**flag** `fenetre-ouverte`, la fenêtre change de sprite, dehors aussi), *Non* le fait
   redescendre du canapé et laisse la fenêtre ouverte pour plus tard. Une fois ouverte,
   l'appui suivant fait passer sans rien dire.

   Elle donne sur **la cour** — c'est la même fenêtre qu'on voit de dehors, à droite de la
   porte. Nino ne se téléporte pas en ville : il enjambe une fenêtre et il est derrière
   chez lui, ce qui est très exactement ce que ça fait quand on a sept ans.
8. **Nantes**, par le trou dans la haie. La palette du monde entier passe du vert Game Boy
   au sépia. Un panneau pointe vers l'eau, et **trois vélos affaissés** sont posés contre
   le mur : *« Trois vélos. Six pneus à plat. »* Le vélo de Nino, lui, reste dans la cour —
   c'est le sien, il n'y en a qu'un.
9. **L'Erdre.** Palette cyan. Papa est sur un bateau, avec un chapeau de capitaine.
   → **flag** `papa-capitaine-vu`, ce qui **modifie la réplique de papa dans la
   mezzanine** : la boucle narrative se referme.

### La chaîne du poisson

La plus belle mécanique du chapitre, parce qu'elle traverse deux mondes **et qu'elle
prend son temps** :

1. **Salle de bain.** La baignoire est **vide**, et le jeu demande : *« Faire couler
   l'eau ? »* → choix Oui / Non.
2. S'il dit oui, il ouvre le robinet et **s'en va faire autre chose**. La baignoire se
   remplit (elle change de sprite).
3. **Quelques écrans plus tard**, en revenant : il y a un poisson dedans. Il **saute d'un
   bord à l'autre** de la baignoire et il n'est visible qu'en l'air — sous la ligne d'eau
   il n'est plus là — avec un petit **plouf** à chaque fois qu'il traverse la surface.

   « Plus tard » se mesure en **écrans traversés**, pas en secondes : un enfant ne compte
   pas les minutes, il compte les portes. Trois portes suffisent.
4. **Il ne demande rien.** Il raconte sa vie : *« Je m'appelle Gérard. »* — *« Je suis né
   dans un sac en plastique. Après, il y a eu un bocal. Puis un autre bocal. »* — *« Puis
   plus rien pendant très longtemps. »* — *« Et un matin : cette baignoire. Je n'ai jamais
   compris comment. »* — *« Voilà. C'était ma vie. »*

   Cinq boîtes de dialogue. C'est long exprès.
5. **Alors le chat entre — et il s'arrête à la porte.** Il regarde. Puis il avance de
   quelques pas **à chaque phrase du poisson**, doucement, et le poisson change de ton
   d'une boîte à l'autre :

   *« Ah. »* — *« Il y a un chat, à la porte. »* — *« Il avance. »* — *« Il avance
   encore. »* — *« Bon. Tu peux retirer le bouchon ? Tout de suite, plutôt. »*

   Une boîte = un pas de plus, et la dernière porte la question. **Il s'arrête à mi-chemin** :
   un chat qui s'arrête en route est une plus grande menace qu'un chat arrivé. Rien n'explique
   que c'est un problème : c'est un chat, une baignoire, un poisson dedans.

   **Et le poisson ne lâche pas l'affaire.** Dire non ne termine rien : *« Non ?! Regarde-le.
   Regarde-moi. »* — *« Je ne demande pas pour le plaisir. »* — *« Le bouchon. S'il te
   plaît. »* — *« Nino. »* La question revient à chaque fois, et il n'y a pas d'autre issue.
   C'est cohérent : il y a un chat dans la pièce, ce n'est plus une faveur qu'il demande.

   **Et à chaque refus, le chat gagne un tout petit pas.** Trois pas d'une dizaine de pixels,
   puis il s'arrête — et le poisson en est au dernier mot, qui se répète. Quand ni l'un ni
   l'autre ne bouge plus, on sait qu'on a vu tout ce que la scène avait à montrer, et qu'il
   ne reste qu'à retirer le bouchon.

7. Une fois le bouchon retiré, il descend — et **Moon grogne**, parce que son dîner vient de
   passer par un trou de deux centimètres sous son nez. La baignoire se vide **complètement** :
   l'animation de l'eau est coupée avant de poser la frame vide, sinon le battement suivant
   la remettait pleine.
8. Il descend, très digne, la tête la première. *« On se reverra. »* Et **Moon regarde le
   trou** : s'il a déjà eu sa pizza —
   donc s'il sait parler — il a un avis : *« C'était mon poisson. »* Sinon il ne dit rien,
   parce que ce jour-là il ne parle pas encore. Puis il repart par où il est venu.

   Si Nino refuse, le poisson encaisse : *« D'accord. Je repose la question dans deux
   minutes. »* Le chat s'en va aussi. Il reviendra.
8. **Au bord de l'Erdre**, il est là, à sauter dans l'eau du premier plan. Et il remercie :
   *« Merci pour le bouchon. Je n'oublie pas ces choses-là. »*

**Ce n'est pas lui qui coule le bateau : c'est Nino.** Le bateau est amarré au quai par une
**corde**, et l'écureuil la désigne. Tirer dessus fait sauter un bouchon au fond de la coque,
et le bateau descend *tout doucement, sans un bruit. Personne ne regardait.* → **flag**
`bateau-coule`. C'est mieux que de le faire faire au poisson : la bêtise est un geste de
Nino, pas une faveur qu'on demande.

**Et alors le poisson sert à réparer.** C'est là que la chaîne de la salle de bain est
payée, et elle change vraiment quelque chose :

| | Si Nino a sauvé le poisson (`bouchon-retire`) | S'il ne l'a pas fait |
|---|---|---|
| Le naufrage | *« Le poisson remonte, papa accroché à lui. »* | *« Papa remonte tout seul, en nageant. »* |
| Papa, sur le quai | *« C'est un poisson qui m'a ramené. »* — *« Un poisson. »* | *« Ne dis rien à ta mère. »* |

La chaîne de la baignoire ne donne donc pas un objet : elle donne **un sauveteur**. Et dans
les deux cas personne ne se noie — l'absurde est constaté, jamais expliqué.

> Le jour où il y aura un passage vers l'est, penser à replacer papa-repêché : là où il est,
> il ne bloque rien, mais il est sur le chemin.

C'est la meilleure façon d'utiliser la règle du jeu : un geste minuscule dans une pièce
banale a une conséquence dans un autre lieu, une heure plus tard, et personne ne fait le
lien à part le joueur.

### Le grand lit des parents → le rêve de la fusée

**Fermer les yeux lance le rêve tout de suite.** Le lit n'est plus un passage à deux temps :
on répond oui, on voit Nino s'allonger, l'écran s'éteint et la fusée commence. Un enfant qui
vient de s'endormir ne réappuie pas sur un bouton pour rêver.

S'y allonger ouvre une branche : *« Il ferme les yeux une seconde. Une seconde, pas... »*
— et Nino se réveille **sur une fusée**, dans un ciel gris cathodique.

C'est un **mini-jeu** à la Flappy Bird, dans sa propre scène. Réglé pour un enfant de
sept ans :

- chute lente, poussée généreuse, trous larges ;
- **aucune punition** — quand on touche, on recommence d'un appui, on ne perd jamais
  rien ;
- boîte de collision plus petite que le dessin : on pardonne ;
- cinq obstacles passés et c'est gagné ;
- Échap réveille Nino à tout moment.

Gagner donne **une pièce à collectionner**. On ne sait pas encore ce qu'elles veulent
dire, et c'est volontaire : Nino les ramasse d'abord, on comprendra après. Elles ont leur
page dans le journal, et leur registre dans
**[pieces.ts](../src/data/pieces.ts)**.

### Le coffre à jouets

Il ne contient plus seulement un dinosaure vexé : tout au fond, il y a le **pistolet à
eau** de Nino. Il fonctionne encore.

Le pistolet s'utilise avec **X**, sa propre touche — ESPACE devait rester la parole, parce
que l'écureuil de la tour a une énigme à poser et qu'une interaction ne peut pas être les
deux à la fois. Il arrose ce qu'on a en face, et si ce n'est personne, il arrose le vide.
Chacun a sa phrase quand il le reçoit, flottante et sans boîte : personne ne se fâche
vraiment, tout le monde a déjà eu une journée. Le seul effet réel du jeu est sur
l'écureuil : celui de la cour détale pour de bon, celui de la tour change de coin en
râlant et garde son énigme entière.

> **À décider.** Le pistolet est trouvé trop facilement pour ce qu'il permet : il devrait
> **récompenser une quête de la maison** plutôt que d'être au fond d'un coffre qu'on ouvre
> en passant. Laquelle, et à quel moment, reste à discuter.

### Branches secondaires déjà ouvertes

- **La cour**, par la porte du fond de la cuisine. Mais **cette porte est fermée à clé
  tant que les parents sont là** : on ne sort pas de la maison sous leur nez. Il faut donc
  que Moon ait fait son numéro, exactement comme pour la fenêtre.

  Une fois dehors : **le vélo de Nino** (un pneu à plat depuis le mois de mars), un
  réverbère, et **le ballon**. Et
  le mur du haut de la cour a **trois entrées, chacune vers un endroit différent** : un
  trou dans la haie vers **Nantes** (la deuxième route vers la ville), la **porte de la
  maison** au centre vers la cuisine, et juste à sa droite **la fenêtre du salon**, par
  laquelle on rentre aussi.

  **Le ballon.** **Espace** tape dedans, et il suffit d'**être à côté** : on ne vise pas
  un ballon, on y est ou on n'y est pas — même dos tourné. Le regard donne l'**axe**,
  vertical ou horizontal, et **l'endroit où on frappe donne l'angle** : pile en face il
  part droit, décalé sur le côté il part de biais, jusqu'à une cinquantaine de degrés. Le
  **sens** vient de la position du ballon, pas du regard : sinon un ballon derrière Nino
  partait droit dans ses jambes. Il rebondit **sans rien perdre**
  sur les murs, le vélo, le réverbère — un tir de biais fait donc le tour de la cour — et
  il s'arrête tout seul sur le béton.

  **Il ne bouge que d'un coup de pied.** Marcher dedans ne le déplace pas d'un pixel :
  c'est Nino qui est arrêté, comme devant un meuble. Et un ballon lancé qui arrive sur lui
  **s'arrête net contre lui**. C'est le seul objet du jeu qui bouge de lui-même, et il n'a
  aucune utilité : c'est un ballon.

  Sauf qu'il y a une fenêtre au fond de la cour. **Si on la prend, elle casse** — le verre
  ne tient plus que dans les coins du cadre — et Papa, resté à l'intérieur en train de
  courir après un chat, sait exactement qui accuser : *« NON MAIS CE CHAT. »*

  **Et il y a un écureuil dans le coin**, derrière le carton, à moitié caché. Il n'a qu'une
  idée : *« Psst. »* — *« T'es bon au foot ? »* — *« Prouve-le. Vise la fenêtre. »* Si on
  revient le voir avant d'avoir tiré, il insiste sans insister : *« La fenêtre. Elle est
  toujours là. »* Et une fois la vitre en morceaux : *« Je n'ai jamais dit ça. Je ne t'ai
  jamais parlé. »*

  Il ne gagne rien à ça et il n'explique rien. C'est le premier personnage du jeu qui pousse
  Nino à faire une bêtise — et qui se rétracte.

  **Et il revient.** On le retrouve **dans les roseaux au bord de l'Erdre**, une fois le
  bateau arrivé, avec une idée plus grosse — et cette fois il désigne quelque chose de
  précis : *« Psst. »* — *« T'es fort ? »* — *« Prouve-le. Tire sur cette corde. »* Puis, si
  on traîne : *« La corde. Personne ne la tient. »* Et après le naufrage, toujours la même
  chanson : *« Moi ? Je regardais l'eau. »*

  La formule marche parce qu'elle **flatte** : *t'es bon au foot ?*, *t'es fort ?* — et
  qu'elle donne un geste à faire, pas une idée à avoir.

  **Et il commente.** Chaque tir de ballon qui retombe sans avoir cassé la fenêtre lui
  vaut une pique, affichée au-dessus de lui **sans boîte de dialogue** : on est en train de
  jouer au ballon, ce n'est pas le moment de lire. *« Raté. »* — *« Oh là là. »* — *« Tu
  VISES ? »* — *« Moi je dis rien. »* — *« C'est large, hein. »*

  Et si on va lui demander des comptes, **il détale** en diagonale hors de l'écran :
  *« L'écureuil détale. »* Il revient à la visite suivante, parce qu'un écureuil ne retient
  rien.

  C'est un patron réutilisable : **proposer, insister, nier**. Trois beats, aucun
  commentaire, et le même écureuil peut resservir dans n'importe quel chapitre.
- **La Tour de Bretagne**, à l'est du quai de l'Erdre, une fois le bateau coulé. C'est le
  chapitre 2, et la fin du jeu — voir plus bas.
- **Trois amorces plantées** pour les chapitres suivants :
  - l'**armoire** des parents dont le fond est trop loin,
  - la **bonde de la baignoire** qui fait un bruit d'océan,
  - le **reflet dans la télé** qui fait signe avant Nino.

## Hermione : la chasse au trésor

Nino a une petite sœur d'un an. Elle est cachée **quelque part**, une seule à la fois,
et elle change de cachette dès qu'on l'a trouvée. Dix-neuf cachettes, deux par pièce.

### Le rythme, pas le commentaire

C'est le principe d'écriture de toute la séquence : **la scène ne s'explique pas**.

1. On la trouve. Nino dit : **« ... »**
2. **Maman entre** par une des portes de la pièce, fait un pas dedans, et crie :
   **« HERMIONE ! Viens ici ! »**
3. Elle **traverse la pièce** jusqu'à la petite, la prend sous le bras, et **repart par
   où elle est venue**, jusqu'à sortir de l'écran.

Rien d'autre. Pas de narrateur qui souligne que c'est drôle. Le comique vient de la
répétition, de l'endroit où on la trouve, et de dix variations du cri de Maman qui
montent en exaspération — de « Viens ici ! » à « Comment tu es montée là ?! », puis
« HERMIONE. », puis « ... HERMIONE. »

À la dix-neuvième, Maman renonce : *« Bon. » « Elle reste avec toi. »* Hermione ne
repart pas, et **elle suit Nino à quatre pattes** à partir de là.

### Cinq dans la maison, quatre dehors

**Neuf cachettes, et deux moitiés qui ne servent pas à la même chose.** Les cinq de la
maison sont la quête d'ouverture : elles sont obligatoires, elles gardent le frigo, et la
dernière exige le poisson. Les quatre du dehors se trouvent après être sorti — c'est ce qui
donne à Hermione une raison de continuer à apparaître dans le chapitre de la ville, au lieu
de disparaître à mi-parcours. Au bout des neuf, Maman renonce pour de bon et Hermione suit
Nino à quatre pattes.

**Et dehors, Maman n'entre plus par la porte.** Elle emploie ce qu'elle a sous la main, et
personne ne relève jamais :

| Où | Comment elle arrive |
|---|---|
| La cour | **à vélo**, avec un panier |
| Nantes, près du réverbère | **en hélicoptère** |
| Nantes, près des vélos à plat | **en jetpack** |
| Le bord de l'Erdre | **en sous-marin** |

Elle crie « HERMIONE ! » dans les quatre cas, traverse l'écran, la ramasse et repart du même
côté. Le sous-marin qui aborde un quai est le meilleur de la série, précisément parce que
rien ne le commente.

### Toujours un bout animé qui dépasse

La règle n'est pas « à moitié cachée » mais **« un bout animé qui dépasse »**. Hermione
respire : ses deux images se décalent d'un pixel, donc tout bouge chez elle **sauf ses
jambes**, identiques d'une frame à l'autre. Si seuls ses pieds dépassent d'un meuble, on
passe devant sans rien remarquer ; s'il dépasse un morceau de tête ou de torse, le petit
mouvement attire l'œil et donne envie d'aller voir.

Le vérificateur mesure donc deux choses, pixel par pixel, en tenant compte de **qui est
dessiné devant qui** : la part d'elle recouverte (entre 15 et 55 %) et le nombre de pixels
**animés** restés visibles (au moins douze). Les neuf cachettes sont entre 20 et 50 %.

Ce n'est pas un défi — on la trouve tout de suite quand on entre dans la bonne pièce. C'est
une invitation.

### Toujours à moitié cachée

Une règle dure : **Hermione n'est jamais plantée seule au milieu d'une pièce.** Chaque
cachette chevauche un meuble et lui passe dessous en profondeur, de sorte qu'il ne reste
qu'un tiers d'elle visible — deux pieds sous le coffre à jouets, une épaule derrière le
canapé. Un script vérifie les dix-neuf : chevauchement suffisant sur les deux axes,
profondeur inférieure à celle du meuble, et sol accessible dessous.

Cachée, elle **respire sur place** (deux frames) : animée, mais elle ne quitte jamais sa
couverture. Quand elle suit Nino, elle avance sur ses traces avec un vrai retard et
s'arrête à bonne distance — elle ne lui colle pas aux talons.

### Ce que ça donne pour la quête

C'est le second fil du jeu : on ne cherche Hermione pour aucune récompense, on la cherche
parce qu'elle est introuvable.

Tout est dans **[hermione.ts](../src/data/hermione.ts)** : une ligne par cachette, et la
liste des cris de Maman.

## L'araignée qui s'en va

Dix haïkus, un par visite. Quand elle les a tous dits, l'interaction change : elle
annonce *« Je n'ai plus de poèmes. Il me reste la danse. »*, elle chante — « Tou-tou-tou.
Tou-tou-tou-tou. TOU. » — puis **elle danse** :

1. deux ronds sur place, avec **deux pirouettes** dedans (elle tourne sur elle-même) ;
2. trois pas de côté ;
3. et elle **s'en va en dansant** : une spirale de trois pirouettes qui l'emmène hors de
   l'écran par le haut.

**Pas de fondu** — elle ne s'efface pas, elle sort. Puis le jeu dit, simplement :
*« Elle est partie... »*

Le flag `araignee-partie` la retire définitivement de la mezzanine. **On la retrouvera
ailleurs** : il suffira de la déclarer dans une autre pièce avec
`showIfFlag: 'araignee-partie'`, et elle y sera comme si elle n'avait jamais bougé.

C'est le premier personnage qui quitte le jeu de lui-même. Ça vaut la peine d'en faire
une règle : un personnage qu'on a épuisé s'en va, et réapparaît là où on ne l'attend pas.

## Les personnages bougent

Un personnage planté est un décor. Tous les personnages **errent** : ils visent un point
au hasard autour de leur position d'origine, y vont lentement, s'arrêtent un moment, puis
recommencent. Le champ `errance: { rayon, vitesse }` d'un objet suffit à l'activer, et le
moteur vérifie que le point visé est bien du sol libre.

Les vitesses disent le personnage : Maman 15 px/s, un passant nantais 26, Moon 11 (un
chat se déplace par à-coups), Hermione portée disparue 0 — elle respire sur place pour ne
pas sortir de sa cachette. Personne n'erre en vue de profil : le quai de l'Erdre est une
corniche étroite, on n'y flâne pas.

## Systèmes

Tout le jeu tient sur quatre briques, volontairement pauvres.

| Brique | Où | Ce que ça fait |
|---|---|---|
| **flags** | [state.ts](../src/systems/state.ts) | Un `Set<string>`. Toute la progression est là. |
| **objets** | [items.ts](../src/data/items.ts) | Un `Set<ItemId>`. Un seul objet existe aujourd'hui. |
| **dialogues conditionnels** | [dialogues.ts](../src/data/dialogues.ts) | Un tableau par interlocuteur, du plus spécifique au plus général. La première condition vraie gagne. |
| **choix Oui / Non** | idem, champ `choice` | La dernière ligne devient une question ; chaque branche a ses propres répliques et ses propres effets. |
| **cachettes** | [hermione.ts](../src/data/hermione.ts) | Une liste ordonnée. La sœur se pose dans la pièce courante si c'est son tour. |
| **portails** | [rooms.ts](../src/data/rooms.ts) | Une porte qui demande un objet ou un flag, avec un dialogue de refus et un dialogue de première ouverture. |

### Un jour, une nuit, un matin

**On se lève vers midi.** *« Le soleil est déjà haut, et il fait chaud. »* Tout le
chapitre de la maison, la cour, la ville et l'Erdre se passent en pleine journée : c'est
la chaleur qui ouvre le jeu, et c'est elle qui justifie les volets tirés, le ventilateur
et les vélos à plat.

**La nuit tombe en arrivant à la Tour de Bretagne.** Personne ne la voit tomber — Nino
entre dans le hall, et dehors il fait noir. Trente-deux étages plus haut, sur le toit, le
ciel est déjà gris : *« Les étoiles ne bougent pas. Mais le ciel, derrière, commence à
être gris. »* C'est de là que vient l'urgence du dernier chapitre — il faut rentrer avant
que les parents se réveillent, et c'est la seule chose qui presse dans tout le jeu.

**Et le matin, au retour par la fenêtre.** Nino pousse le parapente sous le lit, fait
semblant de dormir, et les parents viennent le chercher pour son anniversaire — *« À sept
heures du matin ? »* Il s'endort en soufflant ses bougies : il est debout depuis la veille
à midi, et personne ne s'en étonne.

Techniquement, deux drapeaux et deux tables. `nuit` est posé en entrant dans n'importe
quelle pièce `tour-*`, `aube` en arrivant sur le toit ; ensuite `paletteNocturne(base)`
remplace chaque palette par sa version de nuit (`real` → `real-soir`, `ville` →
`ville-nuit`, `eau` → `eau-nuit`) et `paletteAube` fait du toit son propre moment
(`ville-aube` : le noir délavé, le ton clair qui part vers le chaud). Une fois
`parapente-rentre` posé, plus rien ne s'applique : c'est le jour.

**Et sur le toit de la tour, le ciel.** Cinq rangées d'étoiles au-dessus du parapet, la
seule fois du jeu où on voit le ciel en entier. Les étoiles sont posées à la main,
irrégulièrement : une tuile étoilée répétée dessinait une grille, et une grille ne
ressemble pas à un ciel. *« Toute la ville éteinte, d'un coup. Et au-dessus, le ciel
entier. Nino n'avait jamais vu autant d'étoiles. »*

### Les palettes comme effet narratif

Tout le pixel art n'utilise que **4 indices de couleur**, comme la Game Boy. Au
démarrage, chaque sprite est cuit une fois par palette. Changer de monde = re-piocher
les mêmes dessins dans une autre palette : le monde entier change de couleur d'un
seul coup, sans un seul asset supplémentaire.

- `real` — vert Game Boy : la maison, le quotidien. Deux écarts assumés avec la vraie
  DMG : le **ton 2 a été assombri**, parce qu'il y était presque indistinguable du ton 3
  (tapis, plans de travail et tissus y disparaissaient) ; et le **vert est désaturé de
  40 %** vers son propre gris — le vert acide d'origine fatigue sur un écran rétroéclairé.
  La désaturation conserve la luminance de chaque ton, donc les quatre valeurs restent
  aussi lisibles qu'avant.
- `ville` — sépia chaud : Nantes
- `eau` — cyan : l'Erdre, et tout ce qui sera aquatique
- `tv` — gris cathodique : réservé au Monde de la Télé

### Les effets

- **Fondus « en escalier » 4 tons** — la Game Boy ne sait pas faire d'alpha, elle
  décale sa palette. Nos fondus l'imitent.
- **Bandeau de lieu** à l'arrivée, avec une étoile quand le lieu est découvert.
- **La jauge est en haut à gauche**, pas à droite : le coin haut-droit doit rester libre
  pour le décor, sinon une porte ou une fenêtre posée là passe sous le badge.
- **L'eau bouge.** Le décor est cuit deux fois, la deuxième avec les tuiles d'eau décalées
  de deux pixels, et on alterne toutes les 380 ms. Ça vaut pour l'Erdre et pour toute pièce
  qui contient de l'eau, sans un dessin de plus. L'eau de la baignoire, qui est un sprite et
  pas une tuile, a sa propre deuxième frame et s'anime tant qu'il y a de l'eau dedans.
- **Plouf** — trois frames, à l'endroit exact où un poisson traverse la surface.
- **Warp de portail** — anneaux concentriques qui avalent l'écran + secousse caméra.
- **Étincelle** — au ramassage d'un objet.
- **Frappe caractère par caractère** dans les dialogues, avec triangle clignotant.
- **Mise en scène pendant une réplique** (`montre`) : un sprite s'affiche le temps du
  texte, et Nino peut être masqué le temps que son double le remplace. C'est comme ça
  qu'on **le voit couché dans son lit** — sinon, en tons sombres sur une couverture
  sombre, il disparaissait dedans.
- **Échelle entière** (`scale: 2`) : l'araignée de la mezzanine est géante sans qu'on ait
  eu à la redessiner en plus grand, et la grille de pixels reste intacte.
- **Le texte garde une marge** de huit pixels à droite du cadre. Sans elle, une ligne
  pleine venait frôler le trait et donnait l'impression de sortir de l'écran.
- **La boîte de dialogue ne cache jamais l'action.** Chaque réplique dit où regarder
  (`focusY`), et la boîte se place à l'opposé : si Maman entre par la porte du bas, le
  texte monte en haut de l'écran. L'étiquette du nom et la fenêtre de choix suivent, et
  la jauge de température s'efface le temps de la réplique.
- **Bulle d'interaction** au-dessus de ce qui est actionnable : indispensable pour un
  enfant, qui ne devine pas qu'un décor est actionnable. La zone d'interaction est
  volontairement large (6 px de marge), et un **personnage passe toujours devant un
  meuble** : sans ça, le canapé « volait » l'interaction destinée à Moon.

## L'ouverture

Le jeu commence **dans le lit**. Nino ouvre les yeux, il fait chaud, très chaud, et il se
demande : *« Quelle heure il est ? »*

Puis on lui demande : **« Sortir du lit ? »** — et il peut dire non. S'il refuse, la
chaleur monte d'un cran à chaque fois :

*Il fait trop chaud.* → *IL FAIT TROP CHAUD !* → *IL FAIT BEAUCOUP TROP CHAUD !!*

Au troisième refus, **la chaleur le met dehors tout seul** : *« Nino sort du lit. Il
dégouline de sueur. »* Et il laisse **trois flaques au pied du lit** — un œuf de Pâques
qui ne se déclenche que si on a traîné. Elles sèchent au bout de trois écrans, et si on
croise Maman entre-temps : *« Nino, tu mets de l'eau partout !! »*

Ça ne se joue qu'une fois.

## La quête : faire descendre la température — **en pause**

> **Suspendue le 28 juillet 2026.** Les interactions qui donnaient des degrés ont été
> retirées du jeu : plus aucun dialogue ne rapporte de fraîcheur, la lumière de la maison
> ne change plus, et la page « FRAIS » du journal a disparu. La chaleur reste : il fait
> trop chaud, Nino dégouline, les vélos de la ville ont fondu — c'est l'ambiance, ce n'est
> plus un score.
>
> Le mécanisme est intact et n'attend qu'un mot : `fraicheur.ts` garde le registre,
> `state.fraicheurs` garde le compte, `applyFraicheur()` fonctionne toujours (la sonde
> `nino.cool('volets')` le prouve). Pour rallumer la quête : remettre les `cool:` dans les
> dialogues, rebrancher `paletteFor()` dans `WorldScene.create()`, et rendre la page du
> journal. **Tout ce qui suit décrit la quête telle qu'elle était pensée**, et reste vrai
> le jour où on la reprend.

**Il fait 34°. On cherche tous les moyens de faire baisser ça.**

C'est la mission, en une phrase qu'un enfant de sept ans peut répéter. Objectif : **20°**,
et alors le jour peut enfin finir.

**Aucun chiffre n'est affiché à l'écran.** Pas de thermomètre en surimpression : le seul
retour, c'est **la lumière de la maison qui change** (voir plus bas). Le compte exact
reste consultable dans le journal, pour l'adulte qui lit par-dessus l'épaule.

La chaleur n'est jamais expliquée davantage que par la phrase de Moon : *« le monde est
trop petit aujourd'hui. »* On n'en dira pas plus, et c'est ce qui rend tout le reste
possible.

### Pourquoi ça marche

- **Le compteur est le sujet.** Pas de score abstrait à collectionner : chaque
  trouvaille est un geste qu'un enfant a déjà fait un jour de canicule.
- **On cherche beaucoup de petites choses.** Fermer les volets, s'allonger sur le
  carrelage, rester debout devant le frigo ouvert, se mettre dans l'ombre du
  réverbère : −1° chacun. Le jeu récompense le fait de tout toucher.
- **Certaines idées réchauffent.** Se recoucher : +1°. Prendre le chat sur ses genoux
  (un chat, ça fait trente-huit degrés) : +1°. Le vidéoprojecteur allumé : +1°. C'est
  la blague, et ça apprend au joueur que la jauge marche dans les deux sens.
- **Les mondes parallèles sont les gros moyens.** −3 à −5° chacun. Ils ne sont pas une
  récompense narrative séparée : ils sont *la meilleure façon* d'avoir froid.

### La lumière comme récompense

C'est là que le système de palettes paie. La maison a **quatre lumières**, choisies par
la température, et toutes les pièces changent d'un coup :

C'est donc la seule jauge du jeu, et elle est dans le décor.

| Température | Palette | Ce qu'on voit |
|---|---|---|
| 34 – 30° | `real-chaud` | midi blanchi, contrastes durs, ça pique les yeux |
| 29 – 25° | `real` | le vert Game Boy normal |
| 24 – 21° | `real-doux` | l'or de la fin d'après-midi |
| ≤ 20° | `real-soir` | le bleu du soir — le jour a fini |

Un enfant voit la lumière baisser et comprend qu'il gagne, sans qu'on lui explique
quoi que ce soit. Zéro asset supplémentaire : les mêmes dessins, quatre palettes.

### Où c'est écrit

Tout est dans **[fraicheur.ts](../src/data/fraicheur.ts)** : un tableau, un moyen par
ligne, avec son libellé et ses degrés. Ce fichier alimente à lui seul la jauge, la page
« FRAIS » du journal et la liste de ce qu'il reste à écrire. Ajouter un moyen = une
ligne ici, plus `cool: '<id>'` dans le dialogue concerné. La température n'est jamais
stockée : elle se recalcule depuis les moyens trouvés, donc elle ne peut pas dériver.

## Chapitre 2 : la Tour de Bretagne

**C'est la fin du jeu, et c'est ce qui donne un sens au naufrage** : une fois le bateau de
papa au fond de l'Erdre, plus personne ne regarde vers l'est, et le quai continue jusqu'à
la ville.

### Monter

La Tour de Bretagne fait trente-deux étages et **l'ascenseur est hors service** — le
papier est jauni, il date de 1976, personne ne s'en étonne. Il faut donc monter à pied :
hall → 13e → 27e → 31e → le toit. Les trois paliers sont **exactement identiques**, et
c'est ce qui donne l'impression de monter très longtemps.

À chaque étage, **un animal barre l'escalier avec une énigme**. Ce sont tous des animaux
déjà rencontrés — sauf un, et personne ne demande comment il est monté :

| Étage | Qui | L'énigme | La bonne réponse |
|---|---|---|---|
| Hall | **Moon** | *« Qui dort seize heures par jour, et personne ne lui dit rien ? »* | Un chat |
| 13e | **L'écureuil** | *« Qu'est-ce qui est mieux qu'une noisette ? »* | Deux noisettes |
| 27e | **L'araignée** | *« Une aile, et pas d'oiseau. Un enfant dessous. »* | Un parapente |
| 31e | **L'Éléphant des Machines** | *« Combien de pas, d'ici jusqu'à la mer ? »* | Je ne sais pas |

Quatre remarques sur ces énigmes :

- **L'araignée annonce le mécanisme.** Sa réponse est *un parapente*, et il y en a un sur
  le toit. Elle dit des poèmes depuis le début du jeu ; ici elle voit ce qui va se passer.
- **L'éléphant récompense l'honnêteté** — la bonne réponse est « Je ne sais pas », et il
  répond *« Moi non plus. »* C'est le dernier verrou du jeu : il ne doit jamais bloquer.
- **Aucune mauvaise réponse ne coûte quoi que ce soit.** On redemande autant qu'on veut, et
  chaque échec donne un indice, jamais la réponse : Moon dit *« Réfléchis à qui tu
  parles »*, l'araignée dit *« Il n'y a pas de ficelle »* (ce qui élimine le cerf-volant).
- **L'araignée était partie de la mezzanine** en dansant, très tôt dans le jeu. Voilà où
  elle était.

### Voler

Sur le toit : la vue, une antenne qui vibre, et **un parapente plié contre le parapet**.
À qui il est, on ne sait pas.

Le vol est un mini-jeu — flèches gauche/droite, et **la façade de la maison a deux
fenêtres** : la sienne, et celle des parents. Viser la mauvaise allume une lumière. Réglé
comme le rêve de la fusée, c'est-à-dire **sans aucune punition** : rater ne fait pas
perdre, une rafale remonte Nino et il recommence. Le vent pousse de côté toutes les
secondes et demie, ce qui suffit à en faire un jeu.

**Et les hérons.** Ils traversent l'écran pendant la descente, un toutes les deux
secondes, à des hauteurs qui ne se répètent pas — ce sont ceux de l'Erdre, et ils rentrent
à la même heure que lui. Les toucher ne fait pas perdre non plus : le héron proteste et
l'écarte d'un grand coup d'aile, ce qui suffit largement à faire manquer la fenêtre. C'est
le seul obstacle du jeu qu'on ne peut pas résoudre — on peut seulement l'éviter.

L'écran du vol est **dans la palette de l'aube**, comme le toit d'où il vient : le ciel
prend le ton moyen et non le plus clair, ce qui laisse le ton clair à la seule chose qui
doit sauter aux yeux — sa fenêtre, la seule allumée de la façade.

### La fin

De retour dans sa chambre, parapente sous le bras, il suffit d'aller au lit :

1. *« Nino plie le parapente. Mal. Il le pousse sous le lit. »*
2. *« Il se glisse sous la couette. Il ferme les yeux très fort. »* — et on **le voit dans
   son lit**, comme au tout début du jeu.
3. **Les parents entrent.** Ils ne parlent ni de la fenêtre ouverte, ni du parapente.
   *« Il dort. »* — *« À sept heures du matin ? »* — *« Nino. Nino, viens. »*
4. **La cuisine.** La lumière est allumée. Un gâteau, **sept bougies**, Hermione qui tape
   sur la table. *« JOYEUX ANNIVERSAIRE ! »* — *« Souffle ! »*
5. *« Nino prend une très grande respiration. »* — *« ... »* — **« Nino dort. »**

Et c'est tout. **Rien n'explique la révélation** : les parents n'étaient pas distraits
depuis ce matin, ils préparaient. Le joueur le comprend en voyant le gâteau, pas en le
lisant. Et Nino s'endort au moment de souffler, parce qu'il a fait tout ça aujourd'hui et
que personne ne le sait.

L'écran de fin est dans la palette du soir, et il compte ce qui a été **trouvé**, pas ce
qui a été réussi : les cachettes d'Hermione, les pièces. Il n'y a pas de score dans ce jeu.

## Branches proposées

Chacune part d'un objet que Nino peut **déjà** toucher dans le jeu. « Coût » = ce
qu'il faut ajouter au moteur, au-delà des pièces et des dialogues.

Chaque axe contribue à la même chose : **des degrés**. En voici les gros moyens.

### A. L'Océan de l'Évier — *la bonde de la baignoire* — −4°
Elle fait un bruit d'océan. On tire la bonde, et la salle de bain se vide vers le bas.
Au fond : tout ce qui a été perdu dans les canalisations, rangé par un poisson qui
prend son travail très au sérieux. Nino remonte **la petite cuillère** que maman
cherche depuis des années — ce qui change ce que maman dit, pour toujours.
*Palette `eau` (existe). Coût : aucun, tout est déjà là.*

### B. Le Fond de l'Armoire — *l'armoire des parents* — −4°
Le fond est plus loin qu'il ne devrait. C'est un couloir de manteaux qui ne finit pas,
jusqu'aux affaires d'enfance des parents. Au bout, un garçon de six ans qui ressemble
beaucoup à papa, et qui ne comprend pas pourquoi Nino le fixe.
*Coût : une pièce qui se rejoue sur elle-même jusqu'à ce qu'on fasse la bonne chose.*

### C. Dans la Lumière — *le vidéoprojecteur* — −4°
L'ombre de Nino fait signe avant lui. S'il entre dans le carré de lumière, il devient
plat : dans ce monde, **on ne marche que dans ce qui est éclairé**. Il en ressort avec
son ombre en compagnon — elle atteint ce que Nino n'atteint pas.
*Palette `tv` (existe). Coût : zones éclairées franchissables + un suiveur.*

### D. Le Terrain qui n'existe pas — *le ballon de la cour* — −4°
Le ballon revient tout seul parce que quelqu'un le renvoie. Derrière la haie, la même
cour, mais les copains y sont déjà, à un jeu dont les règles changent chaque fois qu'on
demande à quoi on joue. **C'est l'entrée du chapitre école** : les copains se nomment ici.
*Coût : un mini-jeu très simple, et un règlement qui se réécrit.*

### E. Nantes en vélo — *le pneu à plat* — −5°
Une pompe traîne dans les cartons de la mezzanine. Réparé, le vélo ouvre la ville :
la Loire, le passage Pommeraye, le jardin des plantes — et **l'Éléphant des Machines**,
qui marche, qu'on peut suivre, et sur lequel on peut monter.
*Palette `ville` (existe). Coût : un déplacement rapide, plusieurs écrans de ville.*

### F. Remonter l'Erdre — *papa capitaine* — −3° (déjà jouable : tremper les pieds)
« Monte pas, ça bouge. » Il faut donc un autre bateau. L'île de Versailles, son jardin
japonais, et un héron qui exige des papiers.
*Coût : un bateau qui avance (plateforme mobile), de l'eau franchissable.*

## Ce qui reste à faire

**Court terme**
- [ ] Nommer les copains (branche D les nomme naturellement).
- [x] Retrouver l'araignée quelque part — elle est au 27e étage de la tour.
- [ ] Une troisième bêtise pour l'écureuil : le patron **proposer / insister / nier** est
      posé, il ne demande qu'un objet fragile et un adulte à accuser.
- [x] Faire arriver le bateau de papa — trois écrans après la première visite de l'Erdre.
- [x] Le poisson repêche papa après le naufrage.

- [x] Un passage vers l'est de l'Erdre — il mène à la Tour de Bretagne, et il ne s'ouvre
      qu'une fois le bateau coulé.
- [ ] Une deuxième pièce à collectionner : il n'y en a qu'une (le rêve de la fusée), et
      l'écran de fin les compte.

**Son** — **dix-sept sons sont branchés**, et la liste complète est écrite :
[`src/data/sons.ts`](../src/data/sons.ts), 28 sons, 70 fichiers. `npx tsx tools/sons.ts`
dit à tout moment ce qui manque, par priorité, avec le nom exact du fichier à poser dans
`public/sons/`.

Quatre des plus importants sont **fabriqués** plutôt que trouvés (`npx tsx
tools/synthese.ts`), parce qu'on voulait un contrôle exact sur ce qui pique l'oreille :

- **le bip du texte** — un triangle de 34 ms filtré quatre fois. Il se joue trente fois par
  phrase : le bip carré du pack avait un indice de brillance de 0,141, celui-ci 0,003.
  Quarante fois moins d'aigu, et on peut l'écouter une heure.
- **les pas** — du bruit blanc filtré, **aucune note**, comme le canal « noise » de la
  console. Les pas du pack avaient une hauteur, et une hauteur qui revient tous les quatorze
  pixels devient une mélodie.
- **le curseur d'un choix** et **sa validation** — deux carrés doux, une quarte d'écart pour
  le second : « pris en compte » sans faire fanfare.

`tools/adoucir.ts` fait la même chose sur un fichier existant (passe-bas, fondus, gain), et
affiche l'indice de brillance avant/après — c'est ce qui permet de comparer deux candidats
sans les écouter.

Trois principes y sont posés :

- **Les sons répétitifs viennent par paquets.** Un son entendu trois fois par minute lasse
  en deux minutes : on cherche plusieurs enregistrements du même geste, et le jeu en pioche
  un au hasard — **jamais celui qui vient d'être joué**. Sans cette dernière règle, le
  hasard rejoue deux fois de suite la même variante une fois sur trois, et l'oreille
  n'entend plus que ça. Le pas de Nino en demande quatre, le prout de la fusée huit.
- **Court, sec, un peu pauvre.** Quatre couleurs, une police d'un pixel : une Game Boy n'a
  pas de reverb.
- **Enregistré à la maison plutôt qu'acheté.** Une porte, un robinet, le ballon dans la
  cour, **Maman qui crie les dix « HERMIONE ! »**, Hermione qui babille, Moon qui miaule.
  C'est un jeu sur cette maison-là ; onze entrées de la liste sont marquées comme telles.

Les deux indispensables : **le prout de la fusée** (huit variantes, c'est de loin la
fonctionnalité la plus importante du projet) et **le souffle des bougies** — une grande
inspiration, puis rien, puis une respiration d'enfant qui dort. C'est le dernier son du
jeu, il doit être le plus doux.
- [ ] Un écran de fin de chapitre à 20° : le ventilateur repart tout seul, la nuit tombe.
- [ ] Le ventilateur réparé pourrait être le tout dernier moyen (−2°).

**Confort**
- [ ] Contrôles tactiles (D-pad à l'écran) si on veut jouer sur tablette.
- [ ] Voix off enregistrées sur les dialogues (les hooks n'existent pas encore).

## Ajouter du contenu

**N'importe quel texte** → **[textes.ts](../src/data/textes.ts)**, et rien d'autre. C'est
le seul fichier à ouvrir pour réécrire ce qui se dit : les répliques (classées par
interlocuteur), les énigmes de la tour, les haïkus, les cris de Maman, les noms des lieux,
les fiches du journal, les boutons, l'écran de fin. La mécanique qui les entoure — quand
une réplique sort, ce qu'elle change — reste dans [dialogues.ts](../src/data/dialogues.ts)
et se laisse ignorer.

Le vérificateur monte la garde : il refuse toute phrase française laissée en dur ailleurs
dans le code.

**Une réplique de plus** → une entrée en haut du tableau de l'interlocuteur, avec sa
condition. La première dont la condition passe est celle qui se joue.

**Un lieu** → [rooms.ts](../src/data/rooms.ts). Une carte de 18 lignes de 20
caractères (`#` bloc, `.` sol, `,` variante, `~` eau), une liste d'objets, une liste de
portes. Ne pas oublier de l'ajouter à `LIEUX_ORDER` pour qu'il apparaisse au journal.

**Un objet de décor** → [sprites.ts](../src/art/sprites.ts). Du texte, dans le code :
`.` transparent, `0` à `3` les quatre tons. Toutes les lignes doivent avoir la même
longueur.

**Un personnage** → [characters.ts](../src/data/characters.ts) pour la fiche, un sprite
8×15 dans `sprites.ts`, un tableau de dialogues, et un objet dans la pièce voulue.
