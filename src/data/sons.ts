/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  TOUS LES SONS DU JEU — la liste de ce qu'il reste à trouver
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Rien n'est encore branché : **ce fichier est la liste de courses**, et il deviendra le
 * registre du jour où les fichiers arriveront. Chaque entrée dit quand le son se joue, ce
 * qu'on cherche, et **combien de variantes** il en faut.
 *
 * ── La règle des variantes ──
 *
 * Un son qu'on entend trois fois par minute lasse en deux minutes. Pour ceux-là on
 * cherche **plusieurs enregistrements du même geste**, et le jeu en pioche un au hasard —
 * jamais le même que le précédent (`piocher()` s'en occupe). Trois suffisent à faire
 * disparaître l'effet de répétition ; le pas de Nino en veut quatre, et le prout de la
 * fusée huit, parce que c'est la blague la plus rejouée du jeu.
 *
 * ── Où poser les fichiers ──
 *
 * Dans `public/sons/`, nommés `<id>-1.wav`, `<id>-2.wav`… même pour un son unique
 * (`porte-1.wav`). Formats : **.wav** court et sec, ou **.ogg** pour les boucles longues.
 * `npx tsx tools/sons.ts` dit à tout moment ce qui manque.
 *
 * ── Ce qu'on cherche, en général ──
 *
 * Le jeu a quatre couleurs et une police d'un pixel : les sons doivent aller avec.
 * Court, sec, un peu pauvre. Une Game Boy n'a pas de reverb.
 *
 * ── Où les trouver ──
 *
 * Les sources en CC0 (domaine public, rien à créditer) sont listées dans
 * `public/sons/LISEZ-MOI.md` : les 512 bruitages 8-bit de SubspaceAudio couvrent presque
 * tous les sons d'interface, les chiptunes de Juhani Junkala font les musiques, et
 * jsfxr/jfxr fabriquent n'importe quel bip en dix secondes.
 *
 * Les onze entrées marquées `maison` ne se trouvent nulle part : Maman qui crie, Hermione
 * qui babille, Moon qui miaule, le ballon dans la cour, les prouts. Un bruitage acheté
 * sera toujours plus propre, et toujours moins juste.
 */

/** Rangs de priorité, du plus urgent au plus tard. */
export type Priorite = 'indispensable' | 'important' | 'plus tard';

export interface Son {
  id: string;
  /** Quand il se joue, dans le jeu. */
  quand: string;
  /**
   * Combien d'enregistrements différents du même geste. 1 = son unique ; au-delà, le jeu
   * en pioche un au hasard à chaque fois.
   */
  variantes: number;
  /** Ce qu'on cherche : matière, durée, référence. */
  cherche: string;
  priorite: Priorite;
  /** Vrai pour les boucles (musiques, ambiances) : format long, .ogg. */
  boucle?: boolean;
  /** À enregistrer à la maison plutôt qu'à télécharger. */
  maison?: boolean;
  /**
   * Le fichier posé vient du pack 512 et **fait l'affaire en attendant** : il joue son
   * rôle mais ce n'est pas le bon son. À remplacer par l'enregistrement maison.
   */
  provisoire?: boolean;
  /**
   * Fabriqué par `npx tsx tools/synthese.ts`, et pas trouvé : on voulait un contrôle exact
   * sur ce qui pique l'oreille. Relancer l'outil réécrit exactement le même fichier.
   */
  fabrique?: boolean;
  /**
   * Vrai quand les fichiers sont **réellement dans `public/sons/`** : c'est ce qui décide
   * si le jeu tente de les charger. `npx tsx tools/sons.ts` prévient si un drapeau ne
   * correspond plus au contenu du dossier.
   */
  present?: boolean;
}

/**
 * Les voix. Personne ne prononce de mot : chaque personnage a **le même bip de 43 ms**,
 * rejoué à une autre hauteur et à une autre vitesse. C'est le rythme du texte qui fait la
 * parole, exactement comme sur la console d'origine.
 *
 * `detune` est en centièmes de demi-ton — 1200 = une octave au-dessus. `recit` est la voix
 * du jeu lui-même, quand personne ne parle : plus basse et plus discrète que tout le reste.
 */
export const VOIX: Record<string, { detune: number; rate: number; volume: number }> = {
  recit: { detune: -200, rate: 1, volume: 0.09 },
  Nino: { detune: 600, rate: 1.1, volume: 0.1 },
  Moon: { detune: 900, rate: 1.25, volume: 0.1 },
  Maman: { detune: 300, rate: 1, volume: 0.11 },
  Papa: { detune: -500, rate: 0.9, volume: 0.11 },
  Hermione: { detune: 1400, rate: 1.3, volume: 0.1 },
  'Le poisson': { detune: 100, rate: 0.85, volume: 0.09 },
  'L’araignée': { detune: -300, rate: 0.75, volume: 0.1 },
  'L’écureuil': { detune: 1100, rate: 1.4, volume: 0.09 },
  'L’Éléphant': { detune: -1100, rate: 0.6, volume: 0.12 },
};

export const SONS: Son[] = [
  // ── Ce qui se répète tout le temps ────────────────────────────────────────
  {
    id: 'texte',
    present: true,
    fabrique: true,
    quand: 'Chaque caractère qui s’écrit dans une boîte de dialogue.',
    variantes: 1,
    cherche:
      'Fabriqué par `tools/synthese.ts` : un triangle de 34 ms à 380 Hz, filtré quatre fois. Le son le plus rejoué du jeu — un carré, même bas, devient une agression au bout d’une minute (brillance 0,141 pour le bip du pack, 0,003 pour celui-ci). **Une seule variante suffit** : on la rejoue à des hauteurs différentes selon qui parle. Une voix par personnage pour le prix d’un son.',
    priorite: 'important',
  },
  {
    id: 'pas',
    present: true,
    fabrique: true,
    quand: 'Nino marche : un son tous les quatorze pixels parcourus.',
    variantes: 4,
    cherche:
      'Fabriqué : **du bruit blanc filtré, aucune note** — le canal « noise » de la console. Les pas du pack avaient une hauteur, et une hauteur qui revient tous les quatorze pixels devient une mélodie. Quatre variantes de longueurs et de filtrages différents pour que la marche ne fasse pas machine à coudre.',
    priorite: 'important',
  },
  {
    id: 'prout',
    present: true,
    provisoire: true,
    quand: 'Chaque appui sur Espace dans le rêve de la fusée.',
    variantes: 8,
    cherche:
      'Des prouts. Huit, tous différents : court, long, aigu, hésitant, celui qui repart. C’est la fonctionnalité la plus importante du projet, et elle mérite d’être faite sérieusement. En attendant, huit synthétiques (une impulsion dont la hauteur renégocie tous les dix millisecondes) tiennent la scène.',
    priorite: 'indispensable',
    maison: true,
  },
  {
    id: 'ballon',
    present: true,
    provisoire: true,
    quand: 'Coup de pied dans le ballon de la cour.',
    variantes: 3,
    cherche: 'Un vrai coup de pied dans un ballon en plastique, à l’extérieur. 200 ms.',
    priorite: 'important',
    maison: true,
  },
  {
    id: 'rebond',
    present: true,
    provisoire: true,
    quand: 'Le ballon touche un mur, le vélo, le réverbère.',
    variantes: 3,
    cherche: 'Le même ballon contre un mur. Plus mat, plus court que le coup de pied.',
    priorite: 'important',
    maison: true,
  },
  {
    id: 'plouf',
    present: true,
    provisoire: true,
    quand: 'Le poisson traverse la surface — baignoire et Erdre.',
    variantes: 4,
    cherche:
      'Une main dans une bassine. Deux petits (baignoire), deux plus gros (rivière). 150 ms.',
    priorite: 'important',
    maison: true,
  },
  {
    id: 'escalier',
    present: true,
    provisoire: true,
    quand: 'Chaque étage gravi dans la Tour de Bretagne.',
    variantes: 3,
    cherche:
      'Une volée de marches en béton, enregistrée en montant. On l’entend quatre fois de suite : trois variantes minimum.',
    priorite: 'plus tard',
    maison: true,
  },
  {
    id: 'porte',
    present: true,
    provisoire: true,
    quand: 'Changement de pièce.',
    variantes: 3,
    cherche: 'Une poignée, un battant. Discret : ça se joue à chaque écran.',
    priorite: 'important',
    maison: true,
  },
  {
    id: 'menu',
    present: true,
    fabrique: true,
    quand: 'Le curseur change de ligne dans une fenêtre de choix.',
    variantes: 2,
    cherche:
      'Fabriqué : un carré de 38 ms, filtré trois fois — il garde le grain de la console sans en avoir l’arête. Deux hauteurs, 300 et 340 Hz, piochées au hasard.',
    priorite: 'important',
  },
  {
    id: 'valider',
    present: true,
    fabrique: true,
    quand: 'Un choix est validé — oui, non, une réponse d’énigme.',
    variantes: 1,
    cherche:
      'Fabriqué : deux carrés, 330 puis 440 Hz, une quarte. Ça se lit comme « pris en compte » sans faire fanfare.',
    priorite: 'important',
  },
  {
    id: 'robinet',
    present: true,
    provisoire: true,
    quand: 'Nino ouvre l’eau de la baignoire.',
    variantes: 2,
    cherche:
      'De l’eau qui coule dans une baignoire vide, puis dans une baignoire qui se remplit — ce n’est pas le même son, et c’est tout l’intérêt d’en avoir deux. Deux ou trois secondes suffisent. Le vrai robinet de la vraie salle de bain.',
    priorite: 'important',
    maison: true,
  },
  {
    id: 'pistolet',
    present: true,
    provisoire: true,
    quand: 'Le jet du pistolet à eau, sur l’écureuil de la cour.',
    variantes: 2,
    cherche:
      'Un pschitt court et mouillé, une demi-seconde. Le vrai pistolet à eau de la maison, deux pressions différentes — ou une bouche qui souffle dans une paille dans un verre d’eau, c’est le même son et c’est plus drôle à enregistrer. En attendant : deux bouffées de bruit synthétiques.',
    priorite: 'important',
    maison: true,
  },
  {
    id: 'heron',
    present: true,
    provisoire: true,
    quand: 'Un héron passe devant le parapente, ou se fait bousculer.',
    variantes: 2,
    cherche:
      'Un cri rauque, court, très laid — un héron ne chante pas, il proteste. Un vrai cri de héron cendré, deux variantes, une demi-seconde chacune.',
    priorite: 'plus tard',
  },
  {
    id: 'refus',
    present: true,
    quand: 'Une porte fermée à clé, un passage qui refuse.',
    variantes: 2,
    cherche: 'Un petit « toc » sourd. Surtout pas un buzzer : personne n’a échoué.',
    priorite: 'plus tard',
  },
  {
    id: 'hermione',
    quand: 'Chaque fois qu’on la trouve — elle répond « ... ».',
    variantes: 4,
    cherche:
      'Un babil d’un an, quatre prises. Si Hermione peut les enregistrer elle-même, c’est mieux que tout ce qu’on trouvera ailleurs.',
    priorite: 'important',
    maison: true,
  },
  {
    id: 'cri-maman',
    quand: 'Maman débarque en criant « HERMIONE ! »',
    variantes: 10,
    cherche:
      'Les dix variations sont déjà écrites dans textes.ts. **À faire dire par la vraie Maman**, dans l’ordre : l’exaspération monte, puis elle renonce.',
    priorite: 'important',
    maison: true,
  },

  // ── Les moments uniques ───────────────────────────────────────────────────
  {
    id: 'chat',
    present: true,
    provisoire: true,
    quand: 'On parle à Moon avant qu’il ne parle — et à chaque réplique de lui ensuite.',
    variantes: 3,
    cherche:
      'Un miaulement de chat blanc pas très concerné. Moon, si possible. En attendant : trois glissades de triangle qui montent et redescendent.',
    priorite: 'important',
    maison: true,
  },
  /**
   * ── Les voix des bêtes ──
   *
   * Chaque animal qui parle pousse **son cri à l'ouverture de sa réplique**, en plus du bip
   * du texte : le poisson fait une bulle, l'écureuil pépie, l'araignée fait deux petits pas
   * secs, l'Éléphant barrit. Tous synthétisés par `tools/synthese.ts` — des glissandos.
   */
  {
    id: 'poisson',
    present: true,
    fabrique: true,
    quand: 'Le poisson prend la parole.',
    variantes: 2,
    cherche: 'Une bulle : une note qui coule vers le bas, très filtrée — on l’entend sous l’eau.',
    priorite: 'important',
  },
  {
    id: 'araignee',
    present: true,
    fabrique: true,
    quand: 'L’araignée prend la parole.',
    variantes: 2,
    cherche:
      'Deux tout petits pas secs, presque rien : c’est une bête silencieuse qui veut bien faire un effort.',
    priorite: 'important',
  },
  {
    id: 'ecureuil',
    present: true,
    fabrique: true,
    quand: 'L’écureuil prend la parole.',
    variantes: 2,
    cherche: 'Deux pépiements pressés, tout en haut — il parle comme il vole des verres.',
    priorite: 'important',
  },
  {
    id: 'araignee-danse',
    present: true,
    fabrique: true,
    quand: 'L’araignée entame sa danse d’adieu, au 27e étage.',
    variantes: 1,
    cherche: 'Quatre notes qui montent, une petite valse d’adieu en carré.',
    priorite: 'plus tard',
  },
  {
    id: 'araignee-part',
    present: true,
    fabrique: true,
    quand: 'L’araignée s’envole en tournant vers le haut de l’écran.',
    variantes: 1,
    cherche: 'Une longue glissade vers le haut, de plus en plus loin.',
    priorite: 'plus tard',
  },
  {
    id: 'pluie',
    present: true,
    fabrique: true,
    quand: 'La pluie de l’éléphant, sur l’Erdre — en boucle tant qu’il pleut.',
    variantes: 1,
    cherche:
      'Du bruit très sombre, long, aux fondus larges : deux lectures qui se chevauchent font une averse continue.',
    priorite: 'plus tard',
  },
  {
    id: 'voix',
    present: true,
    fabrique: true,
    quand: 'Chaque caractère qu’un personnage prononce — le récit garde le bip du texte.',
    variantes: 1,
    cherche:
      'Un carré filtré quatre fois : les harmoniques impaires font le « grain » d’une bouche, là où le triangle du texte n’est qu’un souffle. Transposé par personnage, comme le bip du texte.',
    priorite: 'important',
  },
  {
    id: 'objet-tombe',
    present: true,
    fabrique: true,
    quand: 'Un objet tombe et atterrit : les verres de la terrasse, le bol de la diversion.',
    variantes: 2,
    cherche: 'Un clonk : le choc, puis la note de l’objet qui s’éteint. Le verre sonne plus haut que le bol.',
    priorite: 'plus tard',
  },
  {
    id: 'colere',
    present: true,
    fabrique: true,
    quand: 'Toute réplique criée EN MAJUSCULES : « NON MAIS CE CHAT », « HERMIONE ! », Nino qui refuse de se lever.',
    variantes: 2,
    cherche: 'Un grondement qui descend. C’est la règle du jeu : les majuscules grondent.',
    priorite: 'plus tard',
  },
  {
    id: 'grognement',
    present: true,
    provisoire: true,
    quand: 'Le poisson disparaît par le trou de la baignoire, sous le nez du chat.',
    variantes: 2,
    cherche:
      'Un grognement de chat contrarié — pas un miaulement, ce son de gorge qu’ils font quand on leur retire quelque chose. Moon, encore une fois, si on arrive à l’énerver assez.',
    priorite: 'important',
    maison: true,
  },
  {
    id: 'objet-trouve',
    present: true,
    quand: 'Un objet entre dans le sac.',
    variantes: 1,
    cherche: 'Trois notes qui montent, en carré. Court.',
    priorite: 'important',
  },
  {
    id: 'piece',
    present: true,
    quand: 'Une pièce à collectionner est gagnée.',
    variantes: 1,
    cherche: 'Plus long et plus brillant que objet-trouve : c’est rare.',
    priorite: 'important',
  },
  {
    id: 'enigme-juste',
    present: true,
    quand: 'Bonne réponse à un gardien de la tour.',
    variantes: 1,
    cherche: 'Deux notes, vers le haut. Sobre — l’animal, lui, ne s’enthousiasme pas.',
    priorite: 'plus tard',
  },
  {
    id: 'enigme-faux',
    present: true,
    quand: 'Mauvaise réponse.',
    variantes: 2,
    cherche:
      'Une note basse, douce. **Pas un son d’échec** : on peut redemander autant qu’on veut, le jeu ne punit jamais.',
    priorite: 'plus tard',
  },
  {
    id: 'vitre-cassee',
    present: true,
    quand: 'Le ballon casse la fenêtre de la cour.',
    variantes: 1,
    cherche: 'Du verre, puis un silence. Le silence fait la moitié du gag.',
    priorite: 'important',
  },
  {
    id: 'bateau-coule',
    present: true,
    quand: 'On tire sur la corde et le bateau descend.',
    variantes: 1,
    cherche:
      'Un glouglou lent, très grave, quatre secondes. « Tout doucement, sans un bruit » — donc presque rien.',
    priorite: 'important',
  },
  {
    id: 'elephant',
    present: true,
    provisoire: true,
    quand: 'On parle à l’Éléphant des Machines.',
    variantes: 2,
    cherche:
      'Du bois qui craque, de la vapeur, un jet d’eau. Le vrai éléphant de Nantes fait exactement ce bruit-là.',
    priorite: 'plus tard',
  },
  {
    id: 'portail',
    present: true,
    quand: 'Passage par la fenêtre du salon, saut du toit.',
    variantes: 1,
    cherche: 'Un souffle qui monte, une seconde.',
    priorite: 'plus tard',
  },
  {
    id: 'rafale',
    present: true,
    provisoire: true,
    quand: 'Le vent pousse le parapente.',
    variantes: 3,
    cherche: 'Du vent dans un micro, court. Trois forces différentes.',
    priorite: 'plus tard',
  },
  {
    id: 'bougies',
    present: true,
    provisoire: true,
    quand: 'Nino souffle ses sept bougies — et s’endort avant la fin.',
    variantes: 1,
    cherche:
      'Une grande inspiration, puis rien. Puis, tout doucement, une respiration d’enfant qui dort. C’est le dernier son du jeu : il doit être le plus doux.',
    priorite: 'indispensable',
    maison: true,
  },

  // ── Les musiques ──────────────────────────────────────────────────────────
  {
    id: 'musique-fusee',
    present: true,
    provisoire: true,
    quand: 'Pendant le rêve de la fusée.',
    variantes: 1,
    cherche:
      'Dans l’esprit de Nyan Cat : boucle chiptune très courte, très rapide, très bête. Le fichier posé : « Penguin Town » (Abstraction, CC0), la plus courte du lot, **accélérée d’un quart** — plus aiguë, plus vite, plus bête. Vingt-huit secondes de boucle.',
    priorite: 'important',
    boucle: true,
  },
  {
    id: 'musique-maison',
    present: true,
    provisoire: true,
    quand: 'La maison, sauf la chambre de Nino et la mezzanine : couloir, cuisine, salon, salle de bain — et la cour, qui est encore la maison.',
    variantes: 1,
    cherche:
      'Plus douce que la chambre : on y passe, on n’y habite pas. Le fichier posé : « Princess Quest (No Boing) » (Abstraction, CC0) ralentie de moitié et posée un quart moins fort — la deuxième piste la plus calme du lot, sans aucun bruitage dedans.',
    priorite: 'plus tard',
    boucle: true,
  },
  {
    id: 'musique-chambre',
    present: true,
    provisoire: true,
    quand: 'La chambre de Nino — la pièce où tout commence.',
    variantes: 1,
    cherche:
      'Lent, un peu vide, quatre voix maximum. Il fait trop chaud et il ne se passe rien : la musique doit avoir cette température. Le fichier posé : « Out of Time » (Abstraction, CC0) **ralentie de moitié** — une octave plus bas, cent vingt-deux secondes de boucle. C’était la piste la plus calme du lot (0,86 attaque/s, mesuré), et son titre ne s’invente pas.',
    priorite: 'plus tard',
    boucle: true,
  },
  {
    id: 'musique-ville',
    present: true,
    provisoire: true,
    quand: 'Nantes, l’école, les bars, la Tour de Bretagne — la ville commence passé la cour.',
    variantes: 1,
    cherche:
      'Plus vif, plus mécanique. Dehors, ça bouge. Le fichier posé : « Modern Bits » (Abstraction, CC0), telle quelle — la plus mécanique du lot, deux minutes de boucle.',
    priorite: 'plus tard',
    boucle: true,
  },
  {
    id: 'musique-eau',
    present: true,
    provisoire: true,
    quand: 'Le bord de l’Erdre.',
    variantes: 1,
    cherche:
      'Presque rien : trois notes qui reviennent, et de l’eau derrière. Le fichier posé : « Deep Blue » (Abstraction, CC0) **ralentie de moitié**, comme la maison — trois minutes et demie d’une boucle qui traîne les pieds. Le titre décidait pour nous.',
    priorite: 'plus tard',
    boucle: true,
  },
  {
    id: 'musique-fin',
    present: true,
    provisoire: true,
    quand: 'L’écran de fin, après les bougies.',
    variantes: 1,
    cherche:
      'La mélodie de la maison, mais du soir : plus lente, une octave plus bas. Trente secondes suffisent, elle ne tourne qu’une fois. Le fichier posé fait exactement ça : « Out of Time » au quart de sa vitesse — deux octaves sous l’original, une sous la maison.',
    priorite: 'important',
    boucle: true,
  },
  {
    id: 'musique-parapente',
    present: true,
    provisoire: true,
    quand: 'Le vol en parapente, du saut à l’atterrissage.',
    variantes: 1,
    cherche:
      'De l’arcade : vif, héroïque, un peu bête. Le fichier posé : « Save the City » (Abstraction, CC0), telle quelle — le titre fait très bien l’affaire pour un enfant qui rentre chez lui en parapente.',
    priorite: 'plus tard',
    boucle: true,
  },
  {
    id: 'nuit',
    present: true,
    fabrique: true,
    quand: 'Dehors et dans la tour, dès que la nuit est tombée — en boucle.',
    variantes: 1,
    cherche:
      'Des grillons : un fond de bruit très sombre, presque rien, et deux ou trois stridulations par boucle. Joué en boucle par-dessus la musique.',
    priorite: 'plus tard',
  },
  {
    id: 'musique-mezzanine',
    present: true,
    provisoire: true,
    quand: 'La mezzanine — la seule pièce de la maison qui n’a pas la musique de la maison.',
    variantes: 1,
    cherche:
      'Un peu mystérieuse : c’est là-haut que vivait l’araignée, et personne ne monte jamais. Le fichier posé : « Sanctuary » (Abstraction, CC0) ralentie de moitié, comme tout ce qui est lent dans ce jeu.',
    priorite: 'plus tard',
    boucle: true,
  },
  {
    id: 'titre',
    quand: 'L’écran-titre.',
    variantes: 1,
    cherche: 'Six notes, et on entre dans le jeu. Personne n’attend sur un écran-titre.',
    priorite: 'plus tard',
    boucle: true,
  },
];

const PAR_ID = new Map(SONS.map((s) => [s.id, s]));

export const son = (id: string) => PAR_ID.get(id);

/**
 * **Quelle musique dans quelle pièce.** Trois ambiances pour tout le monde extérieur du
 * jeu : la maison, la ville, l'eau. Une pièce absente d'ici = silence, et une musique dont
 * le fichier n'est pas encore posé ne joue rien — la carte peut donc être complète avant
 * les fichiers.
 *
 * L'écran-titre, le rêve de la fusée et l'écran de fin ne passent pas par cette carte :
 * chacun est une scène à part, qui demande sa musique par son nom.
 */
const MUSIQUE_PAR_PIECE: Record<string, string> = {
  chambre: 'musique-chambre',
  couloir: 'musique-maison',
  'chambre-parents': 'musique-maison',
  mezzanine: 'musique-mezzanine',
  sdb: 'musique-maison',
  cuisine: 'musique-maison',
  salon: 'musique-maison',
  // La cour est encore la maison : sa musique la suit dehors, et ne change qu'à Nantes.
  cour: 'musique-maison',
  nantes: 'musique-ville',
  ecole: 'musique-ville',
  'tour-pied': 'musique-ville',
  'tour-hall': 'musique-ville',
  'tour-toit': 'musique-ville',
  bars: 'musique-ville',
  terrasse: 'musique-ville',
  erdre: 'musique-eau',
};

/** La musique d'une pièce, ou `undefined` pour le silence. */
export const musiquePour = (room: string): string | undefined => MUSIQUE_PAR_PIECE[room];

/** Le dossier où le jeu ira les chercher. */
export const DOSSIER = 'sons';

/** Le nom de fichier attendu pour une variante donnée (1-indexée). */
export const fichier = (id: string, n: number) => `${DOSSIER}/${id}-${n}.wav`;

/** Tous les fichiers attendus, pour savoir ce qui manque. */
export const fichiersAttendus = (): string[] =>
  SONS.flatMap((s) =>
    Array.from({ length: s.variantes }, (_, i) =>
      s.boucle ? `${DOSSIER}/${s.id}-${i + 1}.ogg` : fichier(s.id, i + 1),
    ),
  );

/** La dernière variante jouée pour chaque son : on évite de la ressortir. */
const dernier = new Map<string, number>();

/**
 * Pioche une variante au hasard, **jamais celle qui vient d'être jouée**. C'est ce
 * détail qui fait qu'un son répété ne s'entend plus comme une répétition — sans lui, le
 * hasard rejoue deux fois la même une fois sur trois, et l'oreille n'entend que ça.
 *
 * Renvoie le numéro de variante (1-indexé), ou `undefined` si le son est inconnu.
 */
export function piocher(id: string): number | undefined {
  const s = PAR_ID.get(id);
  if (!s) return undefined;
  if (s.variantes === 1) return 1;
  const avant = dernier.get(id);
  let n = 1 + Math.floor(Math.random() * s.variantes);
  if (n === avant) n = (n % s.variantes) + 1;
  dernier.set(id, n);
  return n;
}
