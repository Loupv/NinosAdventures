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
- **L'absurde est constaté, jamais expliqué.** Papa est sur un bateau sur l'Erdre alors
  qu'il est assis dans le salon. Personne ne relève. C'est ça, la blague.
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
| **Maman** | cuisine, puis salon, puis le bout du quai de l'Erdre | Elle cherche Hermione dans la cuisine, plantée devant le frigo, et ne monte au salon qu'une fois qu'elle a renoncé. Tient le réel. C'est elle qui envoie Nino au frigo sans savoir ce qu'elle déclenche. |
| **Papa** | salon | Il regarde un tutoriel : *« Colmater une coque : dix astuces. »* — « C'est pour un ami. » La meilleure blague du jeu est plantée avant même de sortir de la maison. |
| **Papa (capitaine)** | l'Erdre | Le même papa, sur un bateau, avec un chapeau de capitaine. Il est là dès qu'on arrive au quai. |
| **L'araignée** | mezzanine, puis le 27e étage de la tour | Géante, et elle dit des haïkus — un nouveau à chaque visite, dix en réserve. Quand elle les a tous dits, elle chante, elle danse, et elle s'en va. |
| **Gérard, le poisson** | baignoire, puis l'Erdre | Saute d'un bord à l'autre, visible seulement quand il est en l'air. Raconte sa vie en cinq boîtes de dialogue, et ne demande de l'aide qu'au moment où le chat s'assoit au bord de la baignoire. Dans l'Erdre, **il ne parle plus** — il saute, il est occupé, tout se dit à l'éléphant — sauf dans la scène de son départ, la tête hors de l'eau. |
| **L'écureuil** | un coin de la cour, le quai de l'Erdre, derrière le banc de la terrasse | À moitié caché, toujours. Pousse Nino à viser la fenêtre avec le ballon, à couler le bateau de papa, puis à arroser le pigeon de la terrasse — et nie tout, à chaque fois. Il ne gagne rien à ça. |
| **L'Éléphant des Machines** | le bord de l'Erdre, puis le 31e étage de la tour | Douze mètres de bois et d'acier. On le voit d'abord boire dans la rivière, puis on le retrouve sur un palier. Personne ne demande comment il est monté ; lui se souvient de l'avoir croisé en bas. Il pose la seule énigme dont il ne connaît pas la réponse. |
| **Le jardinier** | la place, près du tram | Chapeau, tablier, et il se plaint de la chaleur — le sport local. Il n'arrive pas à suivre, il ne demande jamais rien, et il dit merci si les sept plantes ont été arrosées sans lui. |
| **L'employé des Machines** | l'entrée de la place | Le personnage le plus terne de la ville porte la plus grosse information du jeu, et la donne comme un problème d'effectifs : *« L'éléphant s'est échappé. »* Ses nouvelles suivent l'éléphant avec un temps de retard — il apprend par ouï-dire ce que Nino a vu de ses yeux, et personne ne fait jamais le rapprochement. |
| **La maîtresse** | derrière les grilles de l'école | Réclame le projet d'art de Nino. N'importe quel objet fait l'affaire ; ce qu'elle note, c'est ce qu'on en dit — et elle garde la meilleure note. |
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
                   NANTES ─── (vers le haut) ─── L'ÉCOLE   la cour derrière une grille
                 la place                            on parle à travers les barreaux
       un tram arrêté, un accordéon
                      │ (vers la droite)
              LE BORD DE L'ERDRE   papa capitaine, l'éléphant qui boit, maman sur son banc
                      │ (une fois le bateau coulé)
              LA RUE DES BARS   deux terrasses, trois personnes très occupées
                      │
              UNE TERRASSE, LA NUIT   papa et le parrain, un verre à la main
                      │
              AU PIED DE LA TOUR   de profil, et elle sort du cadre par le haut
                      │
              LA TOUR DE BRETAGNE
```

**Du mobilier partout.** Bancs brûlants, poubelles dans lesquelles Nino ne regarde pas, pigeons
qui ne s'envolent pas mais se décalent de trois pas, et le seul arbre du jeu dans la cour de
l'école. Rien de tout ça ne sert, tout répond quand on lui parle : c'est la règle du décor
depuis le début.

**Quatre écrans de ville qui ne servent à rien**, et c'est leur fonction : entre deux
morceaux d'histoire, un écran où l'on ne fait que traverser en écoutant des gens dire
n'importe quoi donne au trajet une longueur. **Les quatre sont en plein jour**, y compris la rue
des bars et la terrasse : deux écrans qui se touchent ne peuvent pas être l'un au soleil et
l'autre en pleine nuit. **La nuit tombe au pied de la tour**, et nulle part ailleurs — personne ne
la voit tomber, mais au moins elle ne tombe qu'une fois.

Sur la terrasse, **c'est Nino qui va voir son père** : la blague ne se déclenche pas en entrant
dans l'écran. Un père qui interpelle son fils dès qu'il apparaît, c'est le jeu qui vient nous
chercher ; un père qu'on va voir de son plein gré, c'est un enfant qui décide.

### Le projet d'art

**Un objet ne se rend qu'une fois.** On repassait le même bouchon jusqu'à tomber sur la bonne
réponse, et la note ne voulait plus rien dire.

**Et le bouchon ne peut pas valoir vingt** : c'est le premier objet qu'on peut avoir, dès la salle
de bain, et décrocher la meilleure note dessus vidait les sept autres de tout intérêt. Cinq points
au maximum, donc seize sur vingt — la maîtresse le dit à sa façon : *« C'est joliment dit. » « C'est
un bouchon, Nino. »* (La vieille chaussure est dans le même cas, pour la même raison.)

**Le seul devoir du jeu, et il n'a pas de bonne réponse.** La maîtresse réclame le projet
d'art de Nino : *« Rapporte-moi un objet, et explique-moi en quoi c'est de l'art. »*

**N'importe quel objet fait l'affaire**, et il y en a huit à ramasser un peu partout :

| L'objet | Où | Ce qu'elle en dit |
|---|---|---|
| Une **vieille chaussure** | le quai de l'Erdre | *« Ah ! Tu as apporté quelque chose. »* |
| Le **bouchon de la baignoire** | la salle de bain, après le poisson | *« Un bouchon. »* |
| Une **noisette** | un coin de la cour | elle la regarde ; la noisette ne bouge pas |
| Un **ticket de tram** | sous le tram, sur la place | *« Poinçonné, en plus. »* |
| Le **ballon dégonflé** | la cour de l'école elle-même | *« Celui-là ? Il est à l'école, Nino. »* |
| Une **plume de héron** | le quai de l'Erdre | *« Oh. »* |
| La **croûte de pizza** | ce que Moon laisse du bout de pizza | *« Elle est mâchée ? »* |

Chercher l'objet fait sortir de l'école et revenir : c'est la seule quête du jeu qui fait
faire l'aller-retour, et elle passe par des écrans qu'on traverse de toute façon.

**Le huitième objet est un déchet du chat.** Le bout de pizza sert à payer Moon, il est donc
consommé — mais **il en laisse la croûte**, et c'est elle qu'on garde : le seul objet du jeu qui
change de nom en changeant de main. Sans ça, la liste promettait huit objets dont un impossible.

**Elle compte ce qu'on lui apporte.** Au troisième objet elle s'étonne — *« Encore un ? »* —, au
cinquième elle constate — *« Tu as vidé la rue, Nino. »* — et au huitième elle capitule : *« Bon. »
« Je vais chercher une boîte. »* C'est le seul endroit du jeu qui récompense un enfant qui ramasse
tout ce qu'il trouve, et ça ne coûte qu'un drapeau par objet rendu.

**Et elle se souvient de la note.** Revenir avec un autre objet ne remplace jamais la précédente —
*« Mieux que la dernière fois. »*, *« Pareil que la dernière fois. »*, *« Tu avais fait mieux. Je
garde la meilleure. »* Un enfant qui ne sait pas qu'il ne risque rien n'essaie pas deux fois.

**Et on ne rentre pas dans l'école.** Au fond, **le bâtiment** : quatre-vingt-seize pixels de
façade, un fronton avec son horloge qui dépasse du haut de l'écran, deux rangées de fenêtres à
petits carreaux, une grande porte et ses marches. Devant, la cour. Et entre la cour et la rue,
**une grille** : Nino longe le trottoir en bas et parle **à travers les barreaux**. Un jour sans
classe, la grille est fermée, il y a quand même du monde dedans, et personne ne vient ouvrir. Le
ballon dégonflé, lui, est passé par-dessus il y a longtemps : il traîne dans la rue, du bon côté.

Puis vient **la discussion**, et c'est là que tout se joue : deux questions à la suite, propres
à chaque objet, trois réponses chacune. *« À qui elle est, cette chaussure ? »*, *« Pourquoi ce
bouchon-là ? »*, *« De quel oiseau ? »*, *« Elle est mâchée ? »* — puis, toujours, *« Et en quoi
c'est de l'art ? »*

**Aucune réponse n'est mauvaise.** Chacune vaut de zéro à trois points, et le total donne la
note. Le principe d'écriture : ce qui rapporte le plus, c'est **de regarder l'objet pour ce
qu'il est** — *« un bouchon qui ne bouche plus »*, *« un ticket qui ne va nulle part »*, *« un
ballon qui ne rebondit plus »* — et *« je l'ai décidé »* gagne toujours, parce que c'est la
réponse de Duchamp et que la maîtresse le sait.

| Points | Note | Ce qu'elle dit |
|---|---|---|
| 6 | **20** | *« ... » « Vingt sur vingt. » « Ne le dis pas aux autres. »* |
| 4–5 | **16** | *« C'est très joli, ce que tu dis. »* |
| 2–3 | **12** | *« C'est un début. »* |
| 0–1 | **8** | *« Tu as apporté quelque chose, c'est déjà ça. »* |

On peut revenir avec autre chose autant qu'on veut : **la meilleure note est gardée**, jamais
remplacée par une moins bonne. Un enfant qui a une meilleure idée ne doit pas pouvoir y perdre.

Techniquement, `devoir` est une suite d'étapes — question, réponses, points — et un barème
partagé. C'est le troisième type de réplique du jeu, à côté du choix Oui/Non et de l'énigme.

La meilleure est celle que Duchamp aurait donnée, et c'est la maîtresse qui s'incline. La note
s'affiche dans le journal et sur l'écran de fin, à côté des cachettes d'Hermione et des
pièces : **c'est un souvenir, pas un verrou.** Rien ne se ferme derrière un devoir, et on peut
finir le jeu sans jamais le rendre.

Techniquement c'est un troisième type de réplique, à côté du choix Oui/Non et de l'énigme :
`devoir`, une liste de réponses et une liste de retours notés. Ajouter un devoir ailleurs = une
entrée dans **[textes.ts](../src/data/textes.ts)**, rien d'autre.

**L'école** est là parce qu'elle devait y être : on passe devant, la grille est ouverte un
jour sans classe, et il y a du monde dans la cour. Les trois copains n'ont pas de nom — ils
sont dans le casting comme ça, et ce sont ceux de la vraie vie. Le premier croit Nino sur
parole (*« Tu sais que les chats parlent, en fait ? »*), le deuxième ne croit rien (*« Et il
n'y a pas de poisson dans les baignoires. »*), le troisième ne dit rien et **fait oui de la
tête, une fois**. La maîtresse a des devoirs pour lui, mais pas aujourd'hui : il fait trop
chaud.

**Au pied de la tour**, un écran entier pour une seule information : c'est très haut. De
profil comme l'Erdre, déplacement horizontal seulement. La tour est faite de **tuiles**
(`T`, solide) qui montent jusqu'en haut de l'écran et le dépassent : on n'en voit jamais le
sommet. Une brèche d'une tuile à son pied, c'est l'entrée, et comme tout le reste du mur
bloque, c'est le seul passage. On marche longtemps le long du socle avant d'y arriver — c'est
ce temps de marche qui dit la taille du bâtiment, pas un dessin.

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
quai se lit alors comme des zones successives : la bouée, le panneau, **le poisson**, puis —
seulement une fois le quai libre — **la corde**, **papa** et **l'écureuil du bout**.

**Tout ce qui est à droite de la ligne de Maman attend qu'elle s'en aille.** La corde, papa dans
sa coque, l'écureuil posté à la toute fin de l'écran : le naufrage est un chapitre d'après la
pluie. On ne scie pas l'amarre du bateau de son père sous les yeux de sa mère.

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
5. Moon dort sur le canapé — **et il ne bouge pas** : tous les personnages du jeu errent, sauf
   celui qui dort. Il ne se met à faire les cent pas qu'une fois réveillé, c'est-à-dire payé. Avec la pizza en poche, l'interaction change complètement :
   Moon mange, s'assoit, **et se met à parler**. → **flag** `chat-parle`, la pizza est
   consommée, Moon passe de la frame « dort » à son animation assise. Il promet de
   « s'occuper des adultes ».
6. **On retourne voir Moon** — et il tient sa promesse. C'est une **scène jouée** :

   *« Regarde bien. »* → il traverse le salon → il grimpe sur la table ronde → **il pousse
   un des deux bols du bout de la patte**, qui décrit un arc et tombe par terre (secousse
   de caméra) → *« NON MAIS CE CHAT. »* (Papa) → *« Tu as environ deux minutes. »* (Moon)
   → **il sort en courant, les deux parents derrière lui.**

   La porte du salon vers la cuisine est alors barrée — *Moon les retient*, et on entend très bien
   comment ça se passe pour lui — mais **seulement le temps de sortir**. Dès que Nino a enjambé la
   fenêtre, le blocage se lève : la maison est vide, et un chat qui retiendrait des parents partis
   depuis une heure devient un mensonge. Un obstacle raconté par une réplique ne peut pas durer plus
   longtemps que la réplique (`blockedSaufFlag`).

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
9. **L'Erdre.** Palette cyan. Papa bricole dans la coque de son bateau, et **Maman l'attend au
   bout du quai**, assise sur un banc avec Hermione sur les genoux. On les voit de loin, tous les
   deux, et **on ne leur parle pas** : Nino s'arrête bien avant leur portée. Papa redevient un
   interlocuteur une fois le quai libre — *« Deux minutes, Nino ! J'ai un bouchon qui fuit. »*

   Au second plan, **un éléphant de douze mètres boit dans la rivière** — en bois, et il bouge
   les oreilles. Il est **dans** l'eau : la surface passe à la cheville, les pattes plongent et le
   bout de la trompe trempe. Posé dessus, il avait l'air de marcher sur l'Erdre ; coupé sous le
   ventre, ce n'était plus qu'une caisse — il faut que **tout ce qui fait l'éléphant reste dehors**.

   Sa **trompe part loin vers l'avant**, en diagonale : quatre colonnes de dessin ajoutées à sa
   gauche rien que pour elle. Sans cette longueur, la partie émergée était trop courte pour qu'on
   y voie passer un poisson — et c'est tout l'enjeu de la scène suivante.

   **Et il boit vraiment** : quatre images d'une seconde, avec **deux rythmes dans le même
   cycle** — la trompe change toutes les deux images (l'eau, puis la bouche) et **l'oreille bat à
   chacune**, un pixel vers l'avant. À cette vitesse ce n'est pas une animation, c'est un animal
   qui prend son temps ; et deux cadences valent mieux qu'une, parce qu'on ne voit plus la boucle.
   Il s'arrête de boire dès que le poisson monte dans sa trompe, sinon son animation écraserait
   les images de la scène une demi-seconde après qu'on les a posées.

   Ses huit variantes ne sont **pas huit dessins** : chacune est l'image de base avec deux à six
   lignes remplacées, et seules ces lignes-là apparaissent dans le fichier. Bouger deux pixels ne
   doit pas coûter dix-neuf lignes d'éléphant. Personne sur le quai ne s'arrête. C'est cette première rencontre qui rend drôle
   la deuxième, trente-et-un étages plus haut : on ne demandera jamais comment il est monté,
   mais on saura qu'il était en bas. Et lui s'en souvient : *« On s'est déjà vus. » « En bas. »
   « Je bois beaucoup. »*

### La pluie de l'éléphant

**Et le quai se souvient de l'averse.** Un monsieur regarde l'eau depuis le bord, et il a une
raison de ne pas y entrer qui ne tient pas debout : *« J'irais bien me baigner. » « Mais ces poissons
me font un peu peur. »* Après la pluie, il ne se demande pas d'où elle venait — il en commente
l'odeur : *« Cette pluie a une étrange odeur de cacahuète. »* L'eau sortait d'une trompe d'éléphant,
et c'est très exactement la bonne réaction dans ce jeu.

**L'Éléphant, lui, ne dit rien du départ.** Quand on lui reparle après coup : *« L'Éléphant regarde
l'eau. » « Il y a un poisson en moins. » « Ça ne se voit pas. »*

**Le seul endroit du jeu où l'absurde sert à quelque chose.** Le bout du quai est gardé — pas
par une porte fermée, par sa mère. Et ce n'est pas un mur : **une ligne invisible à cinquante
pixels de son banc**, où **ce n'est pas elle qui le repère, c'est lui qui s'arrête** :

> *« C'est Maman. » « Et papa est sur son bateau. » « Ils ne doivent pas nous voir. »*

Il fait un pas en arrière, et c'est fini. Se faire attraper par sa mère ne laisse rien à
résoudre — elle décide, on subit ; **la voir de loin, si** : le problème est posé, et il est à
lui. Les fois suivantes, une seule ligne — *« Ils sont toujours là. »* — parce que trois phrases
répétées à chaque pas finissent par ressembler à un mur qui parle.

C'est aussi pour ça que **ni Maman ni papa n'ont de dialogue sur ce quai** : ils sont à cinquante
pixels, on ne leur parle pas de si loin. Ce sont deux silhouettes qui attendent, et **cet arrêt
vaut les deux rencontres** — c'est lui, et lui seul, qui ouvre la scène de la pluie.

Sauf tomber sur **une conversation entre le poisson et l'éléphant**. Personne ne s'adresse à
Nino : il regarde.

> *« Je me demande ce qu'il y a plus loin. »* — *« La mer. »* — *« C'est comment ? »* —
> *« Salé. »* — *« J'aimerais voir ça un jour. »* — *« Je peux t'aider. Monte dans ma trompe. »*
> — *« ... » « D'accord. »*

Et l'éléphant envoie le poisson vers la mer. **C'est ce geste-là qui fait la pluie** : ce n'est
pas une solution qu'on demande, c'est deux animaux qui avaient une idée. Le poisson ne revient
pas — l'Erdre est sans poisson après ça, et c'est très bien : il voulait voir la mer.

La scène n'existe **qu'une fois qu'on a vu le problème** : il faut s'être arrêté devant eux.
Avant ça l'éléphant boit, le poisson saute, et c'est tout ce qu'ils font.

### Le poisson monte dans la trompe

**Quatre secondes où personne n'appuie sur rien**, et c'est le morceau qu'il ne faut surtout pas
presser. Dans l'ordre, sans un mot de commentaire :

1. Le poisson **nage jusqu'au bout de la trompe** et disparaît sous la surface.
2. Une **bosse** apparaît au milieu de la trompe, en plein ciel entre la tête et l'eau. C'est lui.
   Au pied du tuyau, elle se confondait avec le menton ; sur une trompe courte, elle ne se voyait
   pas du tout.
3. La trompe **se lève à mi-hauteur**, puis tout en haut — quatre images de l'éléphant, une toutes
   les huit dixièmes de seconde. Rien n'est tweené : ce sont des dessins qui se succèdent.
4. La bosse **remonte** à chaque image, jusqu'en haut du tuyau.
5. Le jet part, **droit vers le ciel**, et le poisson part avec.

Une bosse qui monte dans une trompe se comprend sans légende. On ne recopie pas dix-neuf lignes
d'éléphant pour la déplacer : les quatre variantes sont la même image avec **deux lignes changées**,
et ces deux lignes se lisent telles quelles dans le fichier.

**Et on ne raconte pas ce qui se voit** : le jet qui monte, l'averse, Maman qui détale, ça se
regarde. Le seul texte de toute la séquence est le cri du poisson qui s'en va — *« Aaaaaaaaaaaaaah. »*

**Le jet est vertical.** Il sort du bout de la trompe, dévie de trois pixels à peine et sort du
cadre par le haut. En diagonale, ça ressemblait à un arrosage ; à la verticale, c'est un éléphant
qui souffle vers le ciel — et l'eau retombe forcément quelque part.

**Deux secondes de jet tout seul**, ensuite les gouttes. Cet écart est ce qui rend la pluie
lisible : d'abord on voit l'eau monter, et seulement après on la voit tomber. Sans lui, tout
arrivait en même temps et personne ne savait d'où venait l'averse.

**La caméra va la voir.** Elle quitte Nino, se déplace jusqu'au banc — toute la scène est
là-bas — et **Maman lève la tête sous l'averse** : *« Il pleut ! »* La réplique se lit pendant
qu'elle est à l'écran, et ce n'est qu'après qu'elle se met à courir vers la maison, Hermione sous
le bras. Avant, elle partait avant qu'on ait eu le temps de la voir.

Le travelling attend **deux choses** : que la pluie ait commencé, et que le cri du poisson ait été
lu. Un joueur rapide envoyait Maman lever la tête sous un ciel sec ; un joueur lent voyait deux
boîtes de dialogue se marcher dessus. Un compte à deux règle les deux cas.

Et quand la caméra est revenue sur lui, le quai vide, il conclut — *« Elle ne nous a pas vus… »*
C'est le seul commentaire de toute la séquence, et il ne décrit rien de ce qu'on vient de voir :
il dit ce que Nino en retient, c'est-à-dire qu'il l'a échappé belle.

**Et la maison se referme.** Maman est rentrée s'abriter avec Hermione : à partir de là, les deux
entrées de la cour — la porte de la cuisine et la fenêtre du salon — sont fermées. *« Maman est
rentrée. » « Elle est là, derrière la porte. » « Ce n'est pas le moment. »* On ne raconte pas la
punition : il suffit que Nino n'ait aucune envie d'ouvrir cette porte, et tout le reste du jeu tient
sur le fait qu'il n'est pas rentré. Il reviendra par la fenêtre de sa chambre, au petit matin, en
parapente.

**La pluie ne s'arrête pas.** La trompe reste levée, **le jet continue de partir de son bout** et
ça tombe jusqu'à ce qu'on quitte l'écran — le minuteur meurt avec la scène. Quarante gouttes en vol au
maximum, ce qui est déjà une averse. Revenir plus tard, c'est revenir au sec : le banc est vide,
le quai est libre, et personne ne reviendra vérifier le temps.

### Papa bricole tout haut

**Il fait les cent pas sur son pont**, d'un bout à l'autre, cinq secondes par trajet. Ce n'est pas
de la décoration : Nino s'arrête à cinquante pixels de sa mère, et de là le bateau est tout au bord
du cadre — planté à la poupe, son père restait invisible pendant tout le chapitre. Qu'il aille et
vienne suffit à le mettre à l'écran.

Et il **marche** vraiment : quatre images, deux états. Les jambes s'écartent et se rejoignent quand
il avance, et **à chaque bout du bateau il s'arrête et se penche sur sa coque**, deux secondes et
demie, le bras qui monte et descend. Un dessin qui glisse sans bouger les jambes n'est pas quelqu'un
qui marche, c'est un objet qu'on pousse ; et accroupi, tout le personnage descend de deux lignes —
à huit pixels de large, c'est la hauteur qui dit qu'on s'est baissé, pas le détail des bras.

Le naufrage arrête tout ça : il se redresse et ne bouge plus. On ne fait pas les cent pas sur un
bateau qui coule, et un capitaine coule debout.

**Il ne voit pas Nino.** Toutes les six secondes, une phrase sort au-dessus de lui, sans boîte et
sans verrou, pendant qu'il visse dans sa coque :

> *« Si je mets ça là… »* — *« Hmm. Ça vient d'où, ça ? »* — *« Un coup de scie ici, quelques clous
> là. »*

C'est ce qui le rend **occupé** plutôt qu'immobile, et ça vaut mieux qu'un dialogue : un père
occupé est un père qu'on peut regarder sans lui parler. Il se tait pendant les dialogues, et pour
de bon quand son bateau est au fond — là, il a d'autres phrases.

Et pendant l'averse, alors que sa femme part en courant avec sa fille sous le bras, il ne lève pas
la tête : *« On dirait qu'un gros grain se prépare. »* La caméra est encore sur le bateau à ce
moment-là — c'est la seule fois où on l'entend sans lui avoir parlé, et c'est le seul commentaire
que mérite une pluie faite par un éléphant.

### Le naufrage

**Il penche d'abord, il descend ensuite.** Une seconde et demie où le bateau se couche sur la
gauche sans encore s'enfoncer — l'eau entre par là, c'est de ce côté que ça penche — et c'est
pendant cette bascule que tombe la première réplique : *« Hm… pas bon. »* Un bateau qui descend
tout droit ne dit pas qu'il a un trou. Six degrés suffisent, et papa se penche avec, debout dans
sa coque, sans jamais rien lâcher.

C'est aussi ce qui remet le naufrage à sa place : **couler le bateau n'ouvre plus rien**. C'est
une bêtise qu'on fait parce que l'écureuil l'a proposée, et le poisson la répare parce qu'il a
une dette. Une bêtise obligatoire n'est pas une bêtise.

### La joie d'avoir un bateau

À la terrasse, quand on s'adresse au parrain, **ce sont eux deux qui parlent** et Nino écoute :

> — *« Ce qui est bien, avec un bateau… » « C'est qu'on part quand on veut. »*
> — *« Personne ne te demande rien. » « Moi, j'en rêve. »*
> — **Papa :** *« Oh oui. » « Ça doit être bien… » « Ahem. »*

Papa approuve **au conditionnel** la joie de posséder ce qu'il possédait encore ce matin. Le
« ahem » fait tout le travail, personne ne dit ce qui s'est passé, et **Nino est le seul à la table
à savoir pourquoi**.

**Et si le bateau flotte encore, ce n'est pas la même conversation** — pas seulement la même avec
une autre chute :

> — *« Alors, ce bouchon ? »*
> — **Papa :** *« Réglé. » « Enfin. » « Presque. »*
> — *« Tu m'emmènes, un jour ? » « En mer. »*
> — **Papa :** *« Bien sûr. » « Quand le bouchon tiendra. » « Ahem. »*

Il promet une sortie en mer qu'il sait très bien ne pas pouvoir tenir. La même gêne, à un naufrage
près.

Ça n'arrive qu'une fois, et après la blague de papa : c'est elle qui installe la table, et un père
doit avoir fait semblant de ne pas reconnaître son fils avant de discuter navigation devant lui.

**Et une fois, une seule, un adulte commence à se poser la question.** À la terrasse, si le poisson
est parti à la mer : *« Il paraît qu'il a plu, cet après-midi. » « Sur le quai. » « Juste sur le
quai. » « Mais comment… » « Peu importe. »* L'amorce avortée rend toutes les autres non-réactions
plus drôles — à condition qu'elle n'arrive qu'une fois, et c'est le rôle du drapeau `papa-doute`.

Et ça se voit plus tard : **si le bateau n'a pas coulé, papa n'est pas trempé au bar.** Le
parrain ne dit plus *« Ton père est tout mouillé »* mais *« Il t'a raconté son bouchon ? À moi,
deux fois. »* Deux fins de soirée pour la même terrasse, selon ce qu'on a fait de l'après-midi.

### La troisième bêtise : le pigeon et les verres

L'écureuil est aussi à la terrasse, derrière le banc, la queue qui dépasse. Toujours le même
patron en trois temps — il propose (*« Psst. » « T'es précis ? » « Prouve-le. Arrose le
pigeon. »*), il insiste (*« Le pigeon. » « Il est toujours sec. »*), il nie (*« Je ne connais
pas ce pigeon. » « Je connais personne. »*) — et trois victimes de plus en plus loin de chez
Nino : la fenêtre de sa maison, le bateau de son père, les verres d'un inconnu.

**Le pigeon arrosé décolle par-dessus la table de papa et emporte les deux verres.** Ils
tombent chacun de leur côté et restent couchés au sol le temps de la visite ; au retour, la
table est simplement vide — le serveur est passé. Le pigeon, lui, a quitté le quartier pour
toujours, comme le font les pigeons.

**Papa a tout vu** — son fils, le pistolet, le jet — et il accuse le pigeon quand même : *« NON
MAIS CE PIGEON. »* Dehors, c'est toujours le pigeon, comme à la maison c'est toujours le chat.
Le parrain tire la seule conclusion utile : *« Garçon. La même chose. Dans un verre plus
lourd. »* — et à la visite suivante, une fois : *« On attend les verres. » « Des lourds. »*
**Une fois seulement** : la réplique rend ensuite la parole aux blagues du bateau — *« Ton
père est tout mouillé »* et le bouchon raconté deux fois ne doivent pas finir derrière une
commande qui radote.

Petit bonus d'horlogerie : si le joueur a dérangé le pigeon six fois avant, celui-ci est déjà
perché **sur** la table au moment de la proposition — l'écureuil fait viser un pigeon posé
entre les deux verres, et personne ne trouve ça suspect. Papa est sur un bateau, avec un chapeau de capitaine, et il
   demande à Nino de dire à sa mère **qu'il est resté au salon** — ce qui est vrai, il y est
   aussi. Personne ne relève.

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
**corde**, et l'écureuil la désigne. Tirer dessus fait sauter un bouchon au fond de la coque
→ **flag** `bateau-coule`. C'est mieux que de le faire faire au poisson : la bêtise est un
geste de Nino, pas une faveur qu'on demande.

**Le bateau est déjà là, tout à droite du quai, et il est grand** — cinquante-six pixels de
long, un tiers de l'écran. Il n'arrive plus quelques écrans après la première visite : on le
voit en arrivant, et c'est ce qui donne envie de marcher jusqu'au bout. La moitié basse de sa
coque est sous l'eau, découpée à la ligne de flottaison de la pièce (`flotte`).

**Et il coule pendant huit secondes.** Pas une phrase qui raconte le naufrage : le naufrage.
Le bateau descend de trente-deux pixels, papa descend avec — debout, à son bastingage — et la
ligne de flottaison les découpe à mesure, si bien qu'ils *entrent* dans l'eau au lieu d'y
glisser dessus. Une réplique flottante toutes les 1,3 seconde, sans boîte et sans rien à
presser : c'est le seul moment du jeu qui se déroule tout seul.

> *« Ce n'est rien. »* — *« C'est de l'eau. »* — *« Un capitaine ne quitte pas son navire. »*
> — *« Ça va se stabiliser. »* — *« Bon. »* — et quand l'eau lui passe le chapeau :
> **« Blublublub. »**

Si on lui parle pendant qu'il descend, il trouve encore que tout va bien : *« Ne reste pas
là. Enfin, si. Reste. Mais ne dis rien. »* Et une fois l'eau au chapeau, il n'y a plus de
conversation possible — seulement « Blublublub. »

Si on quitte l'écran en pleine descente, le naufrage se termine sans nous : on revient, il
n'y a plus de bateau et **plus de papa non plus**. *Personne ne regardait*, c'était écrit.

**Et il ne remonte pas sur le quai.** Il part à la nage vers la droite, sort du cadre, et le quai
reste vide — on le retrouve un verre à la main deux écrans plus loin. Le repêcher ici enlevait
tout le sel de la terrasse : un père trempé qu'on a déjà vu sortir de l'eau ne surprend plus
personne.

**Et alors le poisson sert à réparer.** C'est là que la chaîne de la salle de bain est
payée, et elle change vraiment quelque chose :

| | Si Nino a sauvé le poisson (`bouchon-retire`) | S'il ne l'a pas fait |
|---|---|---|
| Le naufrage | Papa remonte, remet son chapeau et **s'en va à la nage** vers la droite | *« Ne dis rien à ta mère. »*, lâché en passant |

La chaîne de la baignoire ne donne donc pas un objet : elle donne **un sauveteur**. Et dans
les deux cas personne ne se noie — l'absurde est constaté, jamais expliqué.

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
- **huit obstacles passés** et c'est gagné ;
- Échap réveille Nino à tout moment.

**Ça se resserre en avançant.** Les cinq tuyaux d'avant étaient cinq fois le même : même vitesse,
même trou, même écart, du premier au dernier. Il n'y avait donc aucune raison de continuer autre
que de compter jusqu'à cinq. Maintenant tout se lit sur une seule courbe, du premier tuyau
(`score 0`) au huitième (`score 8`) : le défilement passe de 42 à 68 px/s, le passage de 52 à
36 px de haut, l'écart entre deux tuyaux de 100 à 78 px. Et **à partir du cinquième, le passage
se balance** doucement de haut en bas. Le premier tuyau reste large et lent — un enfant de sept
ans le passe du premier coup — et le huitième demande vraiment de viser.

Deux détails, invisibles mais décisifs : la hauteur du passage est **figée au moment où le tuyau
est placé** (elle se relisait sur le score à chaque image, si bien que le tuyau qu'on traversait
rétrécissait sur nous à l'instant où il comptait son point), et le point ne tombe qu'une fois le
tuyau **entièrement derrière** la boîte de collision.

**Et c'est dessiné.** Le rêve se jouait contre deux rectangles gris posés par le moteur — les
seuls objets du jeu à n'être le dessin de personne — sur un ciel meublé de quatre autres
rectangles gris. Ce sont maintenant des tuyaux de bande dessinée, corps répété et embout marqué
à l'entrée du passage, **sombres sur ce ciel très clair** ; et de vrais nuages, retournés une
fois sur deux pour qu'on ne voie pas que c'est quatre fois le même. Les deux lignes de texte du
bas ont un fond clair sous elles : elles tombaient sinon sur une colonne noire.

Gagner donne **une pièce à collectionner**. On ne sait pas encore ce qu'elles veulent
dire, et c'est volontaire : Nino les ramasse d'abord, on comprendra après. Elles ont leur
page dans le journal, et leur registre dans
**[pieces.ts](../src/data/pieces.ts)**.

**Et au réveil, Hermione est là.** Elle a rampé jusqu'au grand lit pendant qu'il dormait,
et elle dépasse du bord du lit. C'est la deuxième cachette de la chasse, et **elle n'existe
qu'une fois le rêve fait** — comme la cachette de la salle de bain n'existe qu'une fois la
baignoire vidée. Le rêve devient donc obligatoire, et c'est très bien : c'est la scène la
plus drôle du jeu, personne ne devrait pouvoir passer à côté.

Ça ne demande aucune adresse : **le flag est posé au réveil, gagné ou pas.** Se réveiller
avec ÉCHAP après trois échecs compte autant que passer les huit tuyaux — et le grand lit
est la seule chose à faire dans cette chambre, donc personne ne cherche longtemps. La
réplique du réveil ne parle que du rêve — *« Quel drôle de rêve. Il y avait une fusée, et
ça sentait bizarre. »* — et jamais de sa sœur : elle est là, à l'écran, ça suffit.

### S'allonger sur le carrelage

Nino se couche de tout son long sur le carrelage de la cuisine, la joue contre le sol : *« C'est le
meilleur endroit de la maison. Tout le monde le sait. »* C'était la plus jolie interaction du jeu et
la plus inutile — alors **de tout en bas, il voit sous le frigo** :

> *« Quelque chose brille, tout au fond. » « Le bras ne passe pas. » « Il faudrait essayer par le
> côté. »*

**Mais se coucher par terre ne donne que le renseignement**, et **on ne voit toujours rien** : la
pièce est sous le frigo, elle y reste. Ce qui apparaît est une **zone d'interaction sans dessin** sur
le côté de l'appareil — seule la bulle dit qu'il y a quelque chose à tenter là. Faire surgir une
pièce sur le carrelage aurait tout gâché : on l'aurait vue arriver, au lieu d'aller la chercher.
Il ne reste qu'à passer le bras :

> *« Nino passe le bras sur le côté du frigo. » « De la poussière, un bouchon de stylo, et quelque
> chose de dur. » « Une pièce. »*

Deux gestes au lieu d'un, et le second n'existe que parce qu'on a fait le premier : c'est **la
deuxième pièce du jeu**, et elle récompense une idée, pas une case cochée.

### Le coffre à jouets

Il ne contient plus seulement un dinosaure vexé : tout au fond, il y a le **pistolet à
eau** de Nino. Il fonctionne encore.

Le pistolet s'utilise avec **X**, sa propre touche — ESPACE devait rester la parole, parce
que l'écureuil de la tour a une énigme à poser et qu'une interaction ne peut pas être les
deux à la fois. Il arrose ce qu'on a en face, et si ce n'est personne, il arrose le vide.
Chacun a sa phrase quand il le reçoit, flottante et sans boîte : personne ne se fâche
vraiment, tout le monde a déjà eu une journée. Il a **deux effets réels** : l'écureuil — celui de
la cour détale pour de bon, celui de la tour change de coin en râlant et garde son énigme entière —
et **la plante du couloir**.

### Les sept plantes qui ont soif

**Les plantes sont la seule chose que l'eau améliore**, et il y en a **sept**, en pleine vue, dans
des pièces qu'on traverse de toute façon : la chambre, le couloir, le salon, la cuisine, la rue des
bars, devant l'école, le hall de la tour. Chacune a trois états — *« La terre est sèche, sèche,
sèche. »*, la même chose plus *« Nino a ce qu'il faut. »* quand il a le pistolet (sans jamais nommer
la touche : un pistolet à eau se devine), et arrosée.

Le dessin change **pour de bon** : deux pousses neuves, quatre fleurs, une ligne de feuillage en
plus, le pot et la tige au pixel près — et une ligne, *« La plante semble soudainement
revivre. »* C'est le seul
changement d'apparence définitif du jeu qui ne soit pas une bêtise ; tout le reste de ce que fait le
pistolet est une phrase blasée. Le couloir, au passage, cesse d'être le dernier écran où rien ne
répondait.

**La huitième plante est en plastique.** Elle est au treizième étage de la tour, elle est là depuis
1976, et elle ne compte pas : *« L'eau glisse sur le plastique. » « La plante ne bougera plus
jamais. »* C'est la seule fausse piste du jeu, et elle se dit elle-même.

**Personne ne donne cette quête.** Le jardinier de la place se plaint de la chaleur — *« Il fait
trop chaud. » « Tout crève. » « J'arrose, j'arrose... » « Et le lendemain, à refaire. »* — et c'est
tout ce qu'il fait. Il ne demande rien, il ne dit pas où sont les plantes, il ne compte pas devant
nous. Mais il remarque :

| Ce qu'il voit | Ce qu'il dit |
|---|---|
| aucune arrosée | *« Il fait trop chaud. » « Tout crève. »* |
| quelques-unes | *« Il y en a qui vont mieux. » « Ce n'est pas moi. »* |
| **les sept** | *« C'est toi qui les as arrosées ? » « Toutes ? » « Elles vont mieux que moi. » « Merci, petit. »* |

C'est **le seul merci du jeu qu'on ait à mériter**, et il vient d'un adulte qui n'avait rien demandé.

**Et il vient le dire en personne.** Quand la septième plante boit, le jardinier **arrive dans la
pièce** — n'importe laquelle : une chambre, une cuisine, le hall d'une tour de trente-deux étages.
Il pousse la porte la plus proche, il traverse, il remercie. Puis il se rend compte d'où il est :

> *« ... » « Qu'est-ce que je fais là, moi ? » « Bon. » « Je m'en vais. »*

Et il repart par où il est venu. **C'est le seul personnage du jeu qui relève l'absurde** — tous les
autres l'avalent sans broncher, Maman arrive en sous-marin sur un quai et personne ne dit rien. Il
aura fallu arroser sept plantes pour qu'un adulte se demande enfin ce qu'il fait là.

Sur sa place, ensuite, il ne recommence pas : *« Ah, c'est toi. » « Elles vont toutes bien. » « Je
n'y suis pour rien. »* Un merci qui se répète n'est plus un merci.

Le journal les compte sur sa propre page (`PLANTES`) : le total, puis celles qui vont mieux, les
autres en pointillés — on sait combien il en reste, jamais où elles sont. Et quand la septième boit,
le jeu le constate une fois, sans fanfare : *« Plus une seule plante n'a soif. »* L'écran de fin s'en
souvient.

**Le vérificateur tient la quête** : toute plante posée dans une pièce doit être déclarée dans
`PLANTES` et savoir fleurir (`arrosee-<id>` → `radieuse`), et toute plante déclarée doit exister
quelque part. Sans ça, on en pose une de plus, elle s'arrose, elle fleurit — et la quête devient
infinissable sans que rien ne le dise.

**Il arrose plus loin qu'on ne parle** : quarante pixels devant soi, pas seulement la personne
qu'on pourrait toucher du doigt. Un pistolet à eau qui exige d'être collé à sa cible n'est pas un
pistolet, c'est une poignée de main.

**Et il n'arrose que ce qui est vivant** — les personnages et les pigeons. Dans ce jeu un vélo, un
banc et un tram ont un dialogue comme tout le monde, mais un vélo arrosé n'a rien à répondre : on
mouille des gens, pas du mobilier (`ARROSABLES`).

**Il n'est plus dans le coffre au début : il est confisqué.** On l'y trouvait dans les trente
premières secondes, alors que c'est le seul objet du jeu qui change vraiment quelque chose. Le
coffre dit simplement *« Son pistolet à eau n'y est plus. »*

C'est **Maman qui le rend**, au moment où elle renonce à la chasse à Hermione — le seul jalon de la
maison qui se mérite, et une capitulation : elle a maintenant autre chose à faire que de surveiller
un jouet :

> *« Merci de m'avoir aidée, Nino. » « Exceptionnellement, je te rends ton pistolet à eau. » « Il est
> au fond du coffre. » « Et tu ne t'en sers pas sur ta maîtresse. »*

Elle dit **pourquoi** elle le rend, **où** il est, et **la seule chose qu'il ne faut pas en faire** —
c'est-à-dire la première chose qu'un enfant de sept ans va essayer. Ça coûte un point au projet
d'art, et personne ne l'aura prévenu deux fois.

### Les copains savent, ou pas

**Nino arrive à l'école après avoir coulé un bateau et traversé Nantes en parapente**, et jusqu'ici
ses copains lui parlaient de la récré. Maintenant ils réagissent à ce qu'il a vraiment fait :

| | |
|---|---|
| **Le premier croit tout, et surenchérit** | *« Tu as coulé le bateau de ton père ?! » « Moi mon père il a même pas de bateau. »* — *« Tu as volé ? » « En vrai ? » « Moi aussi, une fois. » « Presque. »* |
| **Le deuxième nie tout, au nom de la physique** | *« Les bateaux, ça coule pas. » « C'est de la physique. »* — *« On peut pas voler. » « Sinon tout le monde le ferait. »* |
| **Le troisième ne dit rien** | *« Il regarde Nino un long moment. » « Il sait. » « Il fait oui de la tête, une fois. »* |

Le troisième est la blague : il hoche la tête **sur la seule chose qui est vraie**, et comme tout
est vrai, il hoche à chaque fois.

### On peut arroser à peu près tout le monde

Le pistolet à eau avait huit réactions et il manquait exactement les gens qu'un enfant de sept ans
vise en premier. Il y en a maintenant une par personne : la dame aux douze baguettes (*« Mes
baguettes ! » « Elles étaient déjà molles. »*), le conducteur du tram (*« Ah. » « Merci. »*), le
serveur (*« Ça sera sur l'addition. »*), le compteur de fenêtres (*« Quarante-hui... » « Zut. » « Je
recommence. »*), les trois copains, le monsieur immobile qui ne bouge pas davantage.

**Et la maîtresse.** *« Nino. » « Repose ça. » « Et j'ai tout vu. »* — et elle **retient** : à la
notation suivante, le projet d'art perd un point, ce qui fait tomber un vingt sur vingt à seize. On
ne descend jamais sous huit, la règle du barème tient. C'est la seule conséquence du jeu qui vienne
d'une bêtise entièrement gratuite, et personne ne prévient.

### Le miroir prend de l'avance

Quatre visites au lavabo, et le reflet dérive : il est *« un tout petit peu en retard »*, puis *« il
attend que le vrai Nino commence »*, puis **il se lave la figure avant lui**, puis *« Le miroir est
vide. » « Il reviendra. »* — et il revient, *« comme si de rien n'était »*. Rien ne se passe si on n'y
retourne pas : c'est une blague pour ceux qui se relavent la figure quatre fois, et ceux-là la
méritent.

### Le pigeon finit par monter

Six boîtes à se décaler d'un pas et à regarder exprès ailleurs, et **au septième dérangement il
change de quartier** : *« Le pigeon a changé d'avis. » « Il est monté. »* Il se pose sur la chose la
plus haute et la plus mal choisie de l'écran — le toit du tram, le mur de l'école, la table où
boivent papa et le parrain — et il n'en redescend pas. Il n'explique rien, évidemment.

### Qui gronde quand la vitre casse

Le ballon dans la fenêtre de la cour ne réveille pas toujours la même personne, et c'est une
question de **qui est derrière ce mur** :

| Quand | Qui réagit |
|---|---|
| Nino n'a pas encore vu l'Erdre | **Papa** : *« NON MAIS CE CHAT. »* |
| Nino a vu ses parents au bord de l'eau (lui sur son bateau, elle au bout du quai) | **personne** — la maison est vide, et il ne reste que **l'écureuil, qui rit** : *« Hé hé hé. »* |
| Maman est rentrée sous la pluie de l'éléphant | **Maman**, même phrase : c'est toujours le chat qui prend |

Une vitre qui casse dans une maison vide ne fait pas de bruit. C'est la version décor de la règle
du jeu : **rien ne réagit tout seul**, quelqu'un doit être là.

**Ce n'est pas la diversion qui vide la maison** : les parents courent après le chat *dedans*,
et le drapeau `parents-sortis` tombe à la seconde même où casser la vitre devient possible —
gater le cri dessus rendait papa muet à jamais. C'est **la première visite de l'Erdre** qui
fait foi : tant que Nino ne les a pas vus dehors, quelqu'un est derrière ce mur.

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
et elle change de cachette dès qu'on l'a trouvée. Cinq cachettes, une par pièce de la maison.

### Une scène qui raccourcit à chaque fois

**Répéter la même entrée cinq fois, c'est une blague qui ralentit** — le comique de répétition veut
qu'on accélère. La scène de Maman se raccourcit donc d'elle-même :

| | |
|---|---|
| Les trois premières | elle entre, elle crie, **elle traverse la pièce**, elle repart avec sa fille |
| La quatrième | elle reste sur le pas de la porte — **c'est Hermione qui trotte jusqu'à elle** |
| La cinquième | elle crie, elle capitule, elle repart : *« Bon. » « Elle reste avec toi. »* — sans avoir fait un pas de plus |

Le retournement de la quatrième est la vraie blague : le rituel s'est inversé, la petite a compris
avant les adultes, et personne ne le commente.

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

### Cinq cachettes, toutes dans la maison

**Cinq cachettes, toutes dans la maison.** Elles sont la quête d'ouverture : obligatoires, elles
gardent le frigo, et la dernière exige le poisson.

**Aucune n'est dans la cuisine**, et c'est une contrainte de l'histoire, pas du dessin :
Maman y cherche Hermione pendant toute la chasse, et une petite sœur cachée dans la pièce
où sa mère la cherche ne tient pas debout. Les cinq sont donc le couloir (derrière la
plante), la chambre des parents (derrière l'armoire), la chambre de Nino (sous son lit), la
mezzanine (derrière le carton) et la salle de bain (celle qui exige le poisson). **Puis elle suit son frère, dans toute la maison.** Dès que Maman a renoncé — les cinq
trouvées — Hermione se met à quatre pattes derrière lui et ne le quitte plus, tant qu'il reste
dedans. C'est toute la seconde moitié du chapitre de la maison qu'elle passe accrochée à ses
talons.

**Et dehors, on ne la cherche plus.** Il y avait deux cachettes de plus, dans la cour et au bord de
l'Erdre, avec Maman qui arrivait à vélo puis en sous-marin. C'était drôle une fois, et ça cassait le
chapitre : **dehors est le moment où Nino est seul**, et sa sœur n'a rien à y faire. La chasse se
termine là où elle a commencé, à la porte de la maison.

**Et dehors, Maman n'entre plus par la porte.** Elle emploie ce qu'elle a sous la main, et
personne ne relève jamais :

| Où | Comment elle arrive |
|---|---|
| La cour | **à vélo**, avec un panier |
| Le bord de l'Erdre | **en sous-marin** |

Les deux autres véhicules — l'hélicoptère et le jetpack — sont dessinés et attendent : ils
serviront le jour où il y aura des cachettes ailleurs que dans Nantes.

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
**animés** restés visibles (au moins douze). Les cinq cachettes sont entre 20 et 50 %.

Ce n'est pas un défi — on la trouve tout de suite quand on entre dans la bonne pièce. C'est
une invitation.

### Toujours à moitié cachée

Une règle dure : **Hermione n'est jamais plantée seule au milieu d'une pièce.** Chaque
cachette chevauche un meuble et lui passe dessous en profondeur, de sorte qu'il ne reste
qu'un tiers d'elle visible — deux pieds sous le coffre à jouets, une épaule derrière le
canapé. Le vérificateur les contrôle toutes : chevauchement suffisant sur les deux axes,
profondeur inférieure à celle du meuble, et sol accessible dessous.

Cachée, elle **respire sur place** (deux frames) : animée, mais elle ne quitte jamais sa
couverture.

**Quand elle suit, elle ne copie pas son chemin : elle a le sien.** Une seule règle, la distance.
Au-delà de trente-quatre pixels elle revient vers lui, en ligne droite et d'un bon pas. En deçà,
**elle vaque** : un point au hasard autour de Nino, elle y va sans se presser, elle s'arrête une
seconde ou deux, elle recommence. Elle reste donc toujours dans ses pattes sans jamais lui coller au
train — **et elle bouge encore quand il ne bouge plus**, ce qui est exactement ce que fait un enfant
d'un an dans une pièce où il y a son frère.

Elle bute sur les murs **et sur les meubles** comme tout le monde : la diagonale d'abord, un pas de
côté si ça ne passe pas. Quand elle suivait la trace de Nino, la question ne se posait pas — il
contournait pour deux.

> Deux versions ont précédé celle-ci, et la première était un vrai bug : Hermione visait *la
> position de Nino trente-quatre images plus tôt*. Dès qu'il s'immobilisait, cette position devenait
> la sienne, la condition « assez près » passait à vrai — et **la petite se figeait là où elle en
> était**, le plus souvent à la porte par laquelle on venait d'entrer. Elle ne suivait donc que tant
> qu'on marchait sans jamais s'arrêter, c'est-à-dire jamais.

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

Et **elle réapparaît au vingt-septième étage**, où elle ne récite plus : elle pose l'énigme du
parapente. Ce qui a coûté un bug : les scènes jouées (les haïkus, la petite sœur, le poisson de la
baignoire, le pigeon, la diversion du chat) étaient reconnues **à l'identifiant de l'objet**, et
comme les deux araignées s'appellent `araignee`, celle de la tour récitait un haïku au lieu de son
énigme. C'est maintenant **le nom du dialogue** qui décide — un même personnage revient partout avec
le même nom d'objet, seul son dialogue dit ce qu'il fait là. Moon, qui tient un canapé et un palier,
tombait dans le même piège.

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
- **Ce qui s'affiche par-dessus le jeu se pose en haut à gauche**, pas à droite : le coin
  haut-droit doit rester libre pour le décor, sinon une porte ou une fenêtre posée là passe
  sous le badge.
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
  texte monte en haut de l'écran. L'étiquette du nom et la fenêtre de choix suivent.
- **Vingt et un caractères par réponse.** La fenêtre de choix fait cent trente pixels de large et
**ne replie pas les lignes : elle tronque, sans le dire.** Trois réponses du jeu passaient par-dessus
le bord, dont celle de l'énigme de l'araignée. Le vérificateur refuse maintenant toute réponse plus
longue.
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
qui ne se déclenche que si on a traîné. **Elles sèchent dès qu'il quitte la chambre** : trois
flaques définitives dans sa propre chambre, ce n'est plus une blague, c'est une tache.

**Mais lui reste trempé, et il en met partout.** Une goutte tous les quatorze pixels, dans toutes
les pièces qu'il traverse, jusqu'à ce que **Maman le voie** — *« Nino, tu mets de l'eau partout !! »*
C'est elle qui clôt la blague ; avant elle, la traînée le suit dans toute la maison et s'efface
derrière lui au bout de trois secondes. Sécher au bout d'une pièce vidait la réplique de son sens :
il ne mettait plus d'eau que dans sa chambre.

Ça ne se joue qu'une fois.

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
| Hall | **Le poisson, dans un seau** | *« Qu'est-ce qui monte et descend sans bouger ? »* | La mer |
| 13e | **L'écureuil** | *« Qu'est-ce qui est mieux qu'une noisette ? »* | Deux noisettes |
| 27e | **L'araignée** | *« Le fer blanc du mardi ne dort jamais deux fois sous la même chaussette. Qu'est-ce que ça veut dire ? »* | C'est un beau poème |
| 31e | **L'Éléphant des Machines** | *« Combien de pas, d'ici jusqu'à la mer ? »* | Je ne sais pas |
| Le toit | **Moon, sous sa lune** | *« Quelle heure est-il ? »* — la plus difficile de toutes les questions | L'heure de rentrer |

**Le hall annonce la quête, le toit la referme.** Dans le hall, un seau d'eau — l'eau
scintille, rien ne dit ce qu'il y a dedans. On lui parle : c'est le poisson, qui revient
tout juste de la mer (l'eau salée gratte, personne ne le dit) et qui considère que la règle
des tours s'applique à lui aussi : une énigme par étage, et tout en haut. Dans un seau.
Personne ne relève. Une fois son énigme résolue, il saute dedans — avant, rien ne bouge.

Sur le toit, **Moon attend sur un trône, sous une lune énorme**, et trente-deux étages
servent à apprendre pourquoi le chat s'appelle Moon : gardien de la lune, évidemment. Sa
question est la plus difficile de toutes, sa bonne réponse est la seule chose que le jeu
ait jamais voulu dire, et réussir fait apparaître le parapente — c'est lui, la récompense.
Le parapente ne traîne plus sur le toit : il se mérite.

**Et on y arrive en travelling.** La première fois, la caméra part de très bas — la façade
de la tour défile sur un ciel étoilé, fenêtres éteintes, une allumée de temps en temps —
et remonte en trois secondes jusqu'au tableau : le trône et Moon au centre exact de
l'écran, Nino aligné dessous, la lune un peu à gauche comme les vraies lunes. C'est le
sommet du jeu, il a droit à son plan. La façade n'existe pas dans la pièce : elle est
dessinée sous le bord bas du toit, dans une zone où la caméra n'a normalement pas le
droit d'aller, et tout est détruit à l'arrivée.

Quatre remarques sur ces énigmes :

- **L'araignée ne pose pas d'énigme, et c'est ça son énigme.** Elle récite un poème auquel
  personne ne peut rien comprendre, et elle demande ce que ça veut dire. La bonne réponse est de
  **ne rien chercher** : *« C'est un beau poème. »* — et elle confirme, *« Ça ne veut rien dire. »
  « C'est un poème. »* Elle dit des haïkus depuis la mezzanine ; on ne pouvait pas lui donner une
  charade. Chercher un sens, c'est se tromper : *« Tu cherches trop. »*
- **L'éléphant récompense l'honnêteté** — la bonne réponse est « Je ne sais pas », et il
  répond *« Moi non plus. »* C'est le dernier verrou du jeu : il ne doit jamais bloquer.
- **Aucune mauvaise réponse ne coûte quoi que ce soit.** On redemande autant qu'on veut, et
  chaque échec donne un indice, jamais la réponse : le poisson dit *« Indice : j'en
  reviens »*, l'araignée dit *« Tu cherches trop »* (ce qui écarte les deux réponses qui cherchent
  un sens), Moon dit *« Regarde le ciel. Pense à la maison. »*
- **L'araignée était partie de la mezzanine** en dansant, très tôt dans le jeu. Voilà où
  elle était.

### L'éléphant du trentième étage

Il est **inutilement gros, mais pas absurde** : trois fois le dessin, quatre-vingt-dix pixels de
long dans un palier qui n'en fait que quatre-vingts entre ses murs. Il est donc **coincé entre les
deux**, il dépasse de cinq pixels de chaque côté, et il tient **toute la moitié haute** de la pièce
— sa tête mange même le mur du fond et la bande noire au-dessus. Déborder par le haut ne se voit
pas comme un défaut : il n'y a rien là-haut, et ça dégage tout le bas. À cinq fois le dessin il remplissait l'écran entier : ça ne ressemblait
plus à un éléphant trop grand, ça ressemblait à un bug.

C'est ce qui pose sans l'écrire la question qu'on ne pose jamais — sauf une fois, la première, et
c'est Nino qui la pense : *« Comment il est arrivé ici ?… »* Personne ne répond, et l'éléphant
enchaîne sur ses retrouvailles et son énigme.

**Il ne boit pas** : il n'y a pas d'eau à cet étage. Seule l'oreille bat, très lentement. Un animal
immobile qui remue une oreille est vivant ; le même qui trempe sa trompe dans un plancher est un
décor mal réglé.

Et **le second escalier s'ouvre en bas à droite, contre le mur** : du même côté que celui d'arrivée,
mais à l'autre bout du palier. On débouche des marches, on lève la tête sur un éléphant qui occupe
tout le fond, et il n'y a qu'à longer le bas de la pièce — pas à faire le tour d'un animal de douze
mètres.

### Trois fenêtres, trois hauteurs

Les paliers sont identiques **au pixel près** — c'est la blague de l'ascension — mais rien ne disait
qu'on montait. Une fenêtre par étage, et c'est le paysage qui compte les étages à la place du
joueur :

> **13e** — *« La fenêtre est ouverte. » « D'ici, les voitures font le bruit de la mer. »*
> **27e** — *« D'ici, on ne voit plus que les toits. » « Et l'Erdre, tout au fond. »*
> **31e** — *« D'ici, on ne voit plus rien. » « C'est peut-être un nuage. »*

### Voler

Sur le toit : la vue, une antenne qui vibre — et, une fois la question de Moon résolue,
**le parapente apparaît contre le parapet, dans le dos du gardien**. Pour sauter, il faut
contourner le trône et monter sur le rebord : on se retrouve au bord du vide, derrière
Moon, et c'est exactement là qu'on doit être. À qui est le parapente, on ne sait pas.

Le vol est un mini-jeu **vu vers l'avant**, comme une borne d'arcade : la ville vient vers
nous, Nino se déplace sur tout l'écran aux quatre flèches, et le décor grandit à mesure. La
traversée dure une bonne demi-minute — c'était dix secondes vues de côté, et c'était trop
court pour le dernier morceau du jeu.

**La perspective tient en deux lignes.** Chaque chose a une position dans le monde (`x`
latéral, `y` vertical, `z` la distance) et l'écran s'en déduit :

```
sx = 80 + x * FOCALE / z        sy = HORIZON + y * FOCALE / z
```

Plus `z` est grand, plus c'est petit et proche du point de fuite. La taille des immeubles,
l'échelle des hérons, la fenêtre qui grossit à la fin : tout n'est que cette division. Il n'y
a pas de moteur 3D, il y a un rapport. Quatorze immeubles recyclés en boucle (deux suites
d'entiers qui ne retombent pas en phase, donc pas de hasard : deux vols se ressemblent), une
fenêtre allumée sur chacun quand il est assez proche, et **huit lignes de sol qui foncent vers
nous** — sans elles, on ne sait pas si on vole ou si on flotte.

**La maison arrive au bout**, avec porte, cheminée, et ses deux fenêtres : **la sienne
clignote** — trois fois par seconde, c'est ce qui la distingue de celle des parents, et c'est
ce que le message annonce (*« La fenêtre qui clignote ! »*). Viser la mauvaise allume une
lumière. La décision se prend à `z = 70` et pas au dernier moment : en approchant, les deux
fenêtres s'écartent vers les bords, et trop près la sienne sortait de l'écran — la cible
devenait injoignable pile au moment de viser. Et **dans la dernière ligne droite, la ville
s'écarte** : un immeuble qui renaissait devant la façade, avec sa fenêtre allumée, faisait
concurrence à la cible au pire moment — les nouveaux venus se rangent sur les bords.

Réglé comme le rêve de la fusée, c'est-à-dire **sans aucune punition** : rater ne fait pas
perdre, une rafale remonte Nino, la maison repart au loin (moins loin que la première fois) et
il recommence — **autant de fois qu'il veut**, un retry classique. ÉCHAP reste la seule porte
de sortie : le vent le repose sur le toit, et il repart quand il veut. (Il y avait un compteur
de trois essais qui forçait ce retour : un enfant à deux doigts de réussir se faisait ramener
au toit par une règle — c'est lui qui décide, maintenant.)

**Le vol accélère en approchant** : la vitesse d'avance gagne un tiers entre le saut et la
maison, et les hérons suivent — ils viennent aussi plus souvent. Le début est une promenade —
la lune encore dans le ciel de l'aube, une lueur au ras de l'horizon — la fin demande de
piloter, et Nino se penche du côté où il va. Les hérons sont annoncés **quand on en voit un**
(*« Des hérons ! »*), pas quand le premier naît en point invisible au loin — c'était une
annonce sans oiseau.

Trois choses encore, qui font le voyage :

- **les étoiles s'éteignent une à une** à mesure que le jour approche avec la maison ;
- **on repasse au-dessus de l'Erdre** à mi-vol — une bande d'eau claire en travers du sol,
  et le seul repère que Nino connaît : *« L'Erdre ! »* ;
- **le vent se voit** : trois traînées filent dans son sens pendant qu'une rafale souffle.

Et les annonces (*« Viser sa fenêtre. »*, le score du retour) se posent sur **un bandeau
clair** : l'encre sombre se perdait sur le sol sombre dès que le texte descendait sous
l'horizon.

> **Un cul-de-sac à ne pas refaire ailleurs.** Le parapente du toit était garé derrière le
> flag `parapente-pris`, posé au moment du saut et sauvegardé aussitôt. Si le vol
> s'interrompait — page rechargée, onglet fermé — on retrouvait le toit avec un parapente bien
> visible et la phrase « Il n'y a plus de parapente sur le toit », sans plus aucune façon de
> partir. La règle : **ne jamais fermer une interaction sur un flag posé avant que la chose
> qu'il ouvre soit finie.** Ici, le parapente repart tant que `parapente-rentre` n'est pas
> posé, c'est-à-dire tant que Nino n'est pas chez lui.

**Les immeubles cognent.** Ils ne faisaient rien du tout, et la ville n'était donc qu'un
papier peint qu'on traversait. Maintenant on rebondit dessus : un coup de caméra, le bruit du
rebond, Nino est poussé du côté où il y a de la place et il perd un peu d'altitude — *« Boum. »*
la première fois, *« Pardon ! »* les suivantes. Ça ne fait pas perdre, mais ça suffit largement
à manquer la fenêtre.

Deux réglages qui décident si ça se sent juste ou pas :

- **Nino est dessiné devant tout le reste.** Dans cette perspective, rien ne peut passer devant
  le point de vue ; un immeuble qui lui passait par-dessus se lisait comme un choc, alors qu'il
  ne se passait rien.
- **Le rebond part à la première image où le mur le touche à l'écran**, tant que la façade est
  plus près que `COGNE`. C'était réglé si serré qu'on avait le temps de croire s'être écrasé
  avant que le jeu ne réagisse.

**Et la rafale souffle vraiment.** C'était une impulsion d'un coup sur la vitesse latérale :
amortie en deux dixièmes de seconde, complètement noyée dès qu'on tenait une flèche, elle ne
faisait rien. C'est maintenant **un vent d'une seconde** qui pousse de côté *et* qui soulève —
une quarantaine de pixels de dérive, à corriger pendant qu'il dure. Le pilotage reste plus fort
que le vent : on peut lutter, mais il faut s'en occuper.

**Et les hérons**, qui arrivent maintenant en face et grossissent : ce sont ceux de l'Erdre,
et ils rentrent à la même heure que lui. Les toucher ne fait pas perdre non plus — le héron
proteste et l'écarte d'un coup d'aile, ce qui suffit largement à faire manquer la fenêtre.
C'est le seul obstacle du jeu qu'on ne peut pas résoudre : on peut seulement l'éviter.

L'écran du vol est **dans la palette de l'aube**, comme le toit d'où il vient : le ciel prend
le ton moyen et non le plus clair, ce qui laisse le ton clair aux deux seules choses qui
doivent sauter aux yeux — les fenêtres allumées de la ville, et la sienne au bout.

### La fin

**Nino atterrit dans une maison endormie.** Il fait encore nuit dedans : la palette du soir
tient jusqu'à ce qu'il dorme vraiment, les grillons s'entendent par la vitre cassée, et la
maison se traverse sur la pointe des pieds. Dans la chambre des parents, **Papa et Maman
dorment dans le grand lit** — deux têtes sur l'oreiller, *« Pour une fois, personne ne
cherche personne. »* — et **Hermione dort dans son lit de bébé**, la tête qui dépasse de la
couverture. Tout ça n'existe que cette nuit-là : au matin, la chambre redevient la chambre.

Puis il suffit d'aller au lit :

1. *« Nino plie le parapente. Mal. Il le pousse sous le lit. »*
2. *« Il se glisse sous la couette. Il ferme les yeux très fort. »* — et on **le voit dans
   son lit**, comme au tout début du jeu. L'écran s'éteint : cette fois il dort pour de
   vrai, et le drapeau `matin` rallume le jour.
3. **Les parents entrent.** Ils ne parlent ni de la fenêtre ouverte, ni du parapente.
   *« Il dort. »* — *« À sept heures du matin ? »* — *« Nino. Nino, viens. »* Ils s'arrêtent au
   pied du lit **côte à côte**, à quatorze pixels l'un de l'autre : ils visaient le même pixel, et
   on ne voyait qu'un seul parent.
4. **La cuisine.** La lumière est allumée. Un gâteau, **sept bougies**, Hermione qui tape
   sur la table. *« JOYEUX ANNIVERSAIRE ! »*
5. *« Tu as bien dormi ? »* — *« ... »* — *« Oui. »* C'est le seul mensonge de Nino dans tout le
   jeu, et il tient en un mot.
6. *« Souffle ! »* — *« Nino prend une très grande respiration. »* — *« ... »*
7. **Six bougies éteintes. La septième repart toute seule.** *« Celle-là, c'est une farce. »* —
   *« Ce n'est pas moi. »* — *« Ce n'est pas moi non plus. »* — **« Moon regarde ailleurs. »**
8. *« Nino souffle une deuxième fois. »* — *« Voilà. »* — et **il s'endort sur la table**, la tête
   dans les bras, au milieu de sa propre fête : *« Nino s'endort sur la table. »*

Et c'est tout. **Rien n'explique la révélation** : les parents n'étaient pas distraits
depuis ce matin, ils préparaient. Le joueur le comprend en voyant le gâteau, pas en le
lisant. Et Nino s'endort au moment de souffler, parce qu'il a fait tout ça aujourd'hui et
que personne ne le sait.

**La scène prend son temps**, et c'est réglé dans le texte : certaines répliques portent une
`pause` en millisecondes, et le jeu attend, écran vide, avant d'ouvrir la boîte suivante. Sans ces
silences, la dernière scène du jeu défilait aussi vite qu'un dialogue de couloir et la fin tombait
comme un couperet. La bougie farceuse est là pour la même raison : **il faut une blague entre le
souffle et le noir**, sinon le jeu s'arrête au milieu d'une respiration.

L'écran de fin est dans la palette du jour — c'est le matin de son anniversaire — et il
compte ce qui a été **trouvé**, pas ce qui a été réussi : les cachettes d'Hermione, les pièces. Il n'y a pas de score dans ce jeu.

## Le générique

**Fondu, et le jeu repasse par ses propres écrans.** Onze pièces, une par carton, avec une ligne de
remerciement en bas — et à chaque fois **celui qu'on remercie est reposé là où on l'a rencontré** :
Moon sur son canapé, Gérard dans la baignoire, l'araignée dans la mezzanine, l'écureuil dans la cour,
Hermione sous le lit. À la fin du jeu presque aucun n'est encore chez lui — le chat est sorti avec les
parents, le poisson est parti à la mer, l'araignée a dansé et s'en est allée — et remercier une pièce
vide n'a pas le même effet.

**La forme est celle d'un générique de film** : le nom en capitales, le poste, puis un détail dit
sans rire. Tout le comique est dans le poste — et jamais dans une vanne ajoutée par-dessus.

| | |
|---|---|
| **MOON** | dans son propre rôle. Cachet : un bout de pizza. |
| **GÉRARD** | rôle du poisson. A quitté le tournage avant la fin. |
| **L'ARAIGNÉE** | poèmes et chorégraphie. Dix haïkus, une danse, aucun rappel. |
| **L'ÉCUREUIL** | mauvaises idées. Nie toute participation. |
| **LE JARDINIER** | arrosage. N'a pas arrosé. |
| **LA MAÎTRESSE** | notation. A noté une croûte de pizza. |
| **L'ÉLÉPHANT DES MACHINES** | effets spéciaux : pluie. Douze mètres, aucune doublure. |
| **PAPA** | bateau, chapeau, alibis. Cascades exécutées par lui-même. |
| **LA TOUR DE BRETAGNE** | décors. N'a pas bougé de la nuit. |
| **MAMAN** | production, gâteau, sept bougies. Savait depuis ce matin. |
| **HERMIONE** | cachettes. Aucune n'a jamais été expliquée. |
| **NINO** | tout le reste. Sept ans depuis ce matin. |

Puis **les mentions de fin**, celles que personne ne lit dans les vrais films :

> *Aucun animal n'a été maltraité. L'écureuil a un avis différent.*
> *Ce couloir a quatre portes et un escalier. Il n'a jamais servi à rien.*
> *Toute ressemblance avec des personnes réelles est parfaitement assumée.*

Personne n'est remercié pour son travail : ils sont crédités pour **ce qu'ils ont fait dans
l'histoire**, avec le sérieux d'une fiche technique.

Techniquement, c'est **le jeu lui-même qui joue le générique** : le mode cinéma est une variante de
la scène de jeu (`cinema` dans l'arrivée), donc les décors, les animations et les personnages sont
les vrais. Ce mode ne visite rien, ne sauvegarde rien, ne pose aucun drapeau d'heure et coupe
l'interface — sinon un générique laisserait des traces dans la partie qu'il conclut. La caméra
traverse lentement les pièces plus larges que l'écran, les lignes se replient toutes seules, et
chaque carton tient **trois secondes six** — deux secondes six pour les mentions de fin, qui sont des
vannes d'une ligne et non des cartons de personnage. À quatre secondes pour tout le monde, le
générique passait la minute et on l'attendait.

**On ne peut pas le sauter.** Il y avait ESPACE pour passer, et le premier joueur l'a sauté sans le
vouloir — la même touche venait de fermer la boîte précédente. Un générique de quarante secondes à
la fin d'un jeu qu'on vient de finir n'est pas une punition ; le rater par accident, si.

## L'écran de fin, en deux pages

La première compte ce que Nino a **trouvé** — Hermione, les pièces, la note du projet d'art — et
rien de plus : il n'y a pas de score dans ce jeu.

La seconde raconte **ce qu'il a fait cette nuit-là**, une ligne par chose qui a réellement eu
lieu :

> CETTE NUIT-LÀ — *Un ventilateur achevé. Un chat qui parle. Un poisson sauvé. Dix haïkus, et une
> danse. Un rêve de fusée. Une vitre cassée. (le chat) Un éléphant, deux fois. Un poisson parti
> pour la mer. Un bateau au fond de l'Erdre. Un mensonge à la terrasse. Sept plantes sauvées. Un
> vol au-dessus de Nantes.*

**Rien n'y est obligatoire** : les lignes sans leur drapeau n'existent pas, deux parties ne
donnent pas la même page, et aucune ne reproche l'absence d'une autre. Deux chiffres ne disaient
rien d'une nuit où l'on a coulé le bateau de son père et envoyé un poisson à la mer.

Contrainte de la page : **vingt-neuf caractères par ligne** (au-delà, ça sort des cent soixante
pixels) et neuf pixels d'interligne, pour que onze lignes tiennent sans toucher le « ESPACE ».

## Branches proposées

Chacune part d'un objet que Nino peut **déjà** toucher dans le jeu. « Coût » = ce
qu'il faut ajouter au moteur, au-delà des pièces et des dialogues.

### A. L'Océan de l'Évier — *la bonde de la baignoire*
Elle fait un bruit d'océan. On tire la bonde, et la salle de bain se vide vers le bas.
Au fond : tout ce qui a été perdu dans les canalisations, rangé par un poisson qui
prend son travail très au sérieux. Nino remonte **la petite cuillère** que maman
cherche depuis des années — ce qui change ce que maman dit, pour toujours.
*Palette `eau` (existe). Coût : aucun, tout est déjà là.*

### B. Le Fond de l'Armoire — *l'armoire des parents*
Le fond est plus loin qu'il ne devrait. C'est un couloir de manteaux qui ne finit pas,
jusqu'aux affaires d'enfance des parents. Au bout, un garçon de six ans qui ressemble
beaucoup à papa, et qui ne comprend pas pourquoi Nino le fixe.
*Coût : une pièce qui se rejoue sur elle-même jusqu'à ce qu'on fasse la bonne chose.*

### C. Dans la Lumière — *le vidéoprojecteur*
L'ombre de Nino fait signe avant lui. S'il entre dans le carré de lumière, il devient
plat : dans ce monde, **on ne marche que dans ce qui est éclairé**. Il en ressort avec
son ombre en compagnon — elle atteint ce que Nino n'atteint pas.
*Palette `tv` (existe). Coût : zones éclairées franchissables + un suiveur.*

### D. Le Terrain qui n'existe pas — *le ballon de la cour*
Le ballon revient tout seul parce que quelqu'un le renvoie. Derrière la haie, la même
cour, mais les copains y sont déjà, à un jeu dont les règles changent chaque fois qu'on
demande à quoi on joue. **C'est l'entrée du chapitre école** : les copains se nomment ici.
*Coût : un mini-jeu très simple, et un règlement qui se réécrit.*

### E. Nantes en vélo — *le pneu à plat*
Une pompe traîne dans les cartons de la mezzanine. Réparé, le vélo ouvre la ville :
la Loire, le passage Pommeraye, le jardin des plantes — et **l'Éléphant des Machines**,
qui marche, qu'on peut suivre, et sur lequel on peut monter.
*Palette `ville` (existe). Coût : un déplacement rapide, plusieurs écrans de ville.*

### F. Remonter l'Erdre — *papa capitaine* (déjà jouable : tremper les pieds)
« Monte pas, ça bouge. » Il faut donc un autre bateau. L'île de Versailles, son jardin
japonais, et un héron qui exige des papiers.
*Coût : un bateau qui avance (plateforme mobile), de l'eau franchissable.*

## L'écran-titre se remplit

**L'affiche est une photo de famille qui se prend pendant qu'on joue.** Au début, Nino et
Moon sont seuls. (Le portail qui tournait au centre est parti : l'affiche raconte les
rencontres, pas la mécanique.) Chaque personnage principal rejoint l'écran-titre une
fois rencontré : l'araignée dès son premier haïku — pendue à son fil sous le « LES » du
titre, elle monte et descend de quelques pixels, avec une pause à chaque bout — l'écureuil,
Gérard dans son seau (il en saute de temps en temps), Hermione dès qu'on l'a
trouvée une fois, papa en capitaine, Gérard en l'air (il ne se pose jamais) — et
l'éléphant, qui n'est pas un invité mais le décor : du sol jusqu'au-delà du haut de
l'écran, la tête coupée par le cadre, la trompe qui descend boire derrière la famille.
Le fond de l'affiche est un bleu plus noir que la teinte 0 de la palette : les
personnages sont dessinés avec cette teinte en contour, et sur un fond de la même teinte
ils fondaient dedans. Le titre lit la sauvegarde sans la charger pour de vrai ;
recommencer à zéro vide l'affiche avec le reste.

Sur le toit, **la lune se regarde** — et c'est Moon qui répond : son histoire avec elle
se raconte là, une fois en entier (les seize heures de sommeil s'expliquent enfin), puis
en deux lignes. C'est le seul endroit du jeu où Moon parle de lui.

C'est la récompense discrète de l'écran qu'on voit le plus : lancer le jeu raconte où on
en est, sans un chiffre.

## Repartir à zéro

**En pleine partie, ÉCHAP ramène à l'écran-titre** — après une question, parce qu'un enfant qui
cherche la touche du pistolet à eau ne veut pas se retrouver au menu :

> *Revenir à l'écran-titre ?* — **Oui / Non**

Rien n'est perdu : le jeu sauvegarde à chaque porte et à chaque objet ramassé, et le titre proposera
de continuer. C'est **le chemin pour tout recommencer** : ÉCHAP, puis R.

L'écran-titre propose **« R : REPARTIR À ZÉRO »** dès qu'une partie existe — et il pose la question
avant d'obéir :

> **TOUT EFFACER ?**
> *ESPACE : OUI   ÉCHAP : NON*

Une partie représente parfois des heures de chasse à Hermione, et l'écran-titre est le premier
endroit où un enfant de sept ans essaie toutes les touches pour voir ce qu'elles font. La question
ne clignote pas, contrairement à l'invite habituelle : **on ne fait pas clignoter ce qui efface une
partie.** S'il n'y a rien à effacer, R démarre simplement une partie neuve, sans rien demander.

## Les raccourcis de développement

**Cinq touches, et seulement des chiffres** : `1` le réveil, `2` la cour, `3` Nantes, `4` l'Erdre,
`5` la tour. Les lettres étaient branchées elles aussi — et un enfant qui cherche la touche du
pistolet à eau se retrouvait téléporté au pied de la Tour de Bretagne sans comprendre pourquoi. Les
autres étapes restent accessibles depuis la console : `nino.etape('f')`, et `nino.etapes()` en donne
la liste.

Chaque saut **repart de zéro** et ne pose que ce que l'étape déclare, sinon les états s'empilent. Et
ça écrase la partie en cours : c'est un outil de développement, pas un menu.

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
- [x] D'autres pièces à collectionner : il y en a dix-neuf, et l'écran de fin les compte.

**Son** — **quarante et un sons sur quarante-quatre sont branchés**, et la liste complète
est écrite : [`src/data/sons.ts`](../src/data/sons.ts), 94 fichiers attendus, 79 posés.
`npx tsx tools/sons.ts` dit à tout moment ce qui manque, par priorité, avec le nom exact
du fichier à poser dans `public/sons/`. **Tout ce qui se synthétise est synthétisé**
(`npx tsx tools/synthese.ts`) : les cris des cinq bêtes qui parlent, les huit prouts du
rêve, le pistolet, la pluie, le plouf, le robinet, la rafale, le héron, le grognement,
les bougies, la danse et le départ de l'araignée, l'objet qui tombe et la colère — tous
marqués `provisoire` quand un vrai enregistrement fera mieux. Ne restent introuvables que
les voix humaines : le babil d'Hermione et les dix « HERMIONE ! » de Maman.

Trois règles de mise en son, dans le code :

- **Deux timbres pour deux rôles.** Le récit tape son triangle soufflé ; les personnages
  ont un carré filtré — le grain d'une bouche — transposé par personnage comme avant.
- **Chaque bête crie à l'ouverture de sa réplique.** Moon miaule, le poisson fait une
  bulle, l'écureuil pépie, l'araignée fait deux petits pas secs, l'Éléphant barrit — une
  fois par boîte, par-dessus le bip du texte.
- **Les majuscules grondent.** Toute réplique criée — « NON MAIS CE CHAT », « HERMIONE ! »,
  Nino qui refuse de se lever — déclenche un grondement. Quatre capitales d'affilée
  suffisent à faire une colère.

**La musique est branchée.** Une carte pièce → musique dans `sons.ts` (`musiquePour`),
trois ambiances — la maison, la ville, l'eau — et une seule boucle à la fois, qui
appartient au jeu et pas à une scène : toute la maison partage la même boucle sans
qu'elle reparte du début, et sortir dans la cour la coupe. L'écran-titre, le rêve de la
fusée et l'écran de fin demandent la leur par son nom. **Quatre pistes sont posées**,
toutes du lot chiptune d'Abstraction (CC0), toutes marquées `provisoire` :

- `musique-chambre` — « Out of Time » **ralentie de moitié** : une octave plus bas, deux
  minutes de boucle, la piste la plus calme du lot. Il fait trop chaud et il ne se passe
  rien. C'est la pièce où tout commence, elle garde sa musique à elle.
- `musique-maison` — « Princess Quest (No Boing) » ralentie de moitié et posée un quart
  moins fort, pour le reste de la maison : plus douce que la chambre — on y passe, on n'y
  habite pas.
- `musique-eau` — « Deep Blue » ralentie de moitié aussi : la canicule ralentit tout, et
  les deux moitiés lentes du jeu partagent le même traitement.
- `musique-ville` — « Modern Bits » telle quelle, la plus mécanique du lot.
- `musique-fusee` — « Penguin Town » **accélérée d'un quart** : plus aiguë, plus vite,
  plus bête. C'est un rêve.
- `musique-mezzanine` — « Sanctuary » ralentie de moitié : la seule pièce de la maison
  qui n'a pas la musique de la maison. C'est là-haut que vivait l'araignée, et personne
  ne monte jamais.
- `musique-fin` — « Out of Time » **au quart de sa vitesse** : la mélodie de la maison,
  mais du soir — deux octaves sous l'original, une sous la maison, exactement ce que
  demandait le registre.

Ne restent que les six notes de l'écran-titre : poser le `.ogg` suffit.

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
