/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  TOUS LES TEXTES DU JEU
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * **C'est le seul fichier à ouvrir pour changer ce qui se dit.** Toutes les phrases du
 * jeu sont ici : les répliques, les noms des lieux, les haïkus, les cris de Maman, les
 * énigmes, les boutons, l'écran de fin.
 *
 * Trois règles pour écrire dedans :
 *
 *  1. **Les guillemets `«  »` marquent la parole.** Sans eux, c'est le jeu qui raconte ;
 *     avec eux, c'est quelqu'un qui parle.
 *  2. **Trois lignes par boîte de dialogue.** Au-delà, la suite passe à la boîte suivante
 *     toute seule, et une ligne trop longue est coupée automatiquement — mais c'est plus
 *     joli de choisir soi-même où ça coupe.
 *  3. **Apostrophes typographiques `’`** (jamais `'`, qui fermerait la chaîne), et accents
 *     sur les capitales : la police du jeu les dessine tous.
 *
 * Le reste — quand une réplique sort (`when`), ce qu'elle change (`effects`) — est de la
 * mécanique, décrite dans `dialogues.ts`. On peut l'ignorer et ne réécrire que les
 * phrases : rien ne casse.
 */
import { state } from '../systems/state';
import type { DialogueBeat } from './dialogues';
import type { ItemId } from './items';

// ═══════════════════════════════════════════════════════════════ 1. l'interface

/** L'écran-titre. */
export const TITRE = {
  ligne1: 'LES AVENTURES',
  ligne2: 'DE NINO',
  continuer: 'ESPACE : CONTINUER',
  commencer: 'APPUIE SUR ESPACE',
  recommencer: 'R : RECOMMENCER',
};

/** Le journal, ouvert avec Entrée. */
export const JOURNAL = {
  titre: 'JOURNAL',
  /**
   * Les intitulés des pages. **Le nombre de pages « LIEUX » n'est plus écrit ici** : il se
   * calcule sur la liste des lieux, sinon les pièces ajoutées après coup n'apparaissent
   * jamais dans le journal — c'est arrivé à l'école, à la rue des bars, à la terrasse et au
   * pied de la tour.
   */
  pageLieux: 'LIEUX',
  pageSac: 'SAC',
  pagePieces: 'PIÈCES',
  pied: 'ESPACE : fermer',
  soeurComptee: (n: number, total: number) => `Hermione retrouvée ${n} fois sur ${total}.`,
  /** Le projet d'art, une fois rendu. Avant, on n'en parle pas. */
  noteComptee: (n: number) => `Projet d’art : ${n} sur 20.`,
  sacVide: [
    '(Le sac est vide.)',
    '',
    'Nino n’a rien dans les poches.',
    'Ça n’a pas duré longtemps la',
    'dernière fois.',
  ],
  aucunePiece: [
    'Aucune pièce.',
    '',
    'Nino n’en a encore trouvé aucune.',
    'Il ne sait pas non plus ce que',
    'ce serait.',
  ],
  lieuInconnu: '?  . . . . . . . .',
};

/** Ce que le jeu annonce en passant, dans le petit bandeau. */
export const ANNONCES = {
  hermioneTrouvee: (n: number, total: number) => `Hermione retrouvée !  ${n}/${total}`,
  objetRecu: (nom: string) => `${nom} !`,
};

/** Le rêve de la fusée, dans le grand lit. */
export const FUSEE = {
  consigne: 'Nino sur une fusée.',
  demarrer: 'ESPACE pour pousser',
  score: (n: number) => `${n} tuyau${n > 1 ? 'x' : ''}.`,
  reessayer: 'ESPACE pour réessayer',
  gagnePiece: 'Une pièce.',
  gagneEncore: 'Encore une fois.',
  reveil: 'ESPACE pour te réveiller',
  /** Rien n'obligeait à le dire, et personne ne trouvait la sortie du rêve. */
  abandonner: 'ÉCHAP pour te réveiller',
};

/** Le vol en parapente, depuis le toit de la tour. */
export const VOL = {
  consigne: 'Viser sa fenêtre.',
  demarrer: 'ESPACE pour sauter',
  rafale: 'Une rafale.',
  /** Les hérons de l'Erdre rentrent à la même heure que lui. */
  heron: 'Un héron !',
  heronTouche: 'Le héron n’a pas aimé.',
  /** Quand la maison apparaît au loin, après une bonne demi-minute de vol. */
  maison: 'La maison !',
  /** Et quand il rentre dans un immeuble, ce qui arrive. */
  immeuble: 'Boum.',
  immeubleEncore: 'Pardon !',
  /**
   * **Trois essais.** Le compteur reste affiché en haut à gauche pendant tout le vol, et au
   * troisième raté une rafale le repose sur le toit : on n'est jamais enfermé dans le vol, et
   * il n'y a rien à perdre — le parapente est toujours là, en haut.
   */
  essais: (n: number) => `ESSAIS ${n}`,
  repose: 'Le vent le repose sur le toit.',
  reposeSuite: 'ESPACE',
  rate: 'Raté.',
  lumiere: 'Une lumière s’allume.',
  reussi: 'Pile dedans.',
  atterrir: 'ESPACE pour atterrir',
};

/** L'écran de fin. */
export const FIN = {
  titre: 'FIN',
  voeu: 'Bon anniversaire, Nino.',
  compte: (soeur: string, pieces: string) => `Hermione ${soeur}   Pièces ${pieces}`,
  /** Et la note du projet d'art, si Nino l'a rendu. */
  note: (n: number) => `Projet d’art ${n}/20`,
  suite: 'ESPACE',
};

// ═══════════════════════════════════════════════════════════════ 2. les lieux

/** Le nom affiché en bandeau à l'arrivée. */
export const LIEUX: Record<string, string> = {
  chambre: 'La chambre de Nino',
  couloir: 'Le couloir',
  'chambre-parents': 'La chambre des parents',
  mezzanine: 'La mezzanine',
  sdb: 'La salle de bain',
  cuisine: 'La cuisine',
  salon: 'Le salon',
  cour: 'La cour',
  nantes: 'Nantes',
  ecole: 'L’école',
  bars: 'La rue des bars',
  erdre: 'Le bord de l’Erdre',
  terrasse: 'Une terrasse, la nuit',
  'tour-pied': 'Au pied de la tour',
  'tour-hall': 'La Tour de Bretagne',
  'tour-13': 'Treizième étage',
  'tour-27': 'Vingt-septième étage',
  'tour-31': 'Trente-et-unième étage',
  'tour-toit': 'Le toit de la tour',
};

// ═══════════════════════════════════════════════════════════════ 3. le réveil

/**
 * Ce que Nino se dit s'il refuse de sortir du lit. Une ligne par refus ; au dernier, la
 * chaleur le met dehors tout seul.
 */
export const CHALEUR = [
  'Il fait trop chaud.',
  'IL FAIT TROP CHAUD !',
  'IL FAIT BEAUCOUP TROP CHAUD !!',
];

/** La question posée à chaque fois. */
export const SORTIR_DU_LIT = 'Sortir du lit ?';

// ═══════════════════════════════════════════════════════════════ 4. Hermione

/** Ce qu'elle répond, quoi qu'il arrive et où qu'elle soit. */
export const RENCONTRE = ['...'];

/**
 * Ce que crie Maman. Une variation par trouvaille : l'exaspération monte, puis elle
 * renonce à comprendre. Court, toujours.
 */
export const RAPPELS: string[][] = [
  ['« HERMIONE ! Viens ici ! »'],
  ['« HERMIONE ! Tu ne peux pas être là ! »'],
  ['« HERMIONE ! Comment tu es montée là ?! »'],
  ['« HERMIONE ! Non. Non non non. »'],
  ['« HERMIONE ! »'],
  ['« HERMIONE ! Nino, tu la surveilles ? »'],
  ['« HERMIONE ! Mais comment... »'],
  ['« HERMIONE. »'],
  ['« HERMIONE ! Bon. D’accord. »'],
  ['« ... HERMIONE. »'],
];

/** La dernière fois : Maman renonce, et Hermione reste. */
export const RAPPEL_FINAL: string[] = [
  '« HERMIONE ! »',
  '...',
  '« Bon. »',
  '« Elle reste avec toi. »',
];

// ═══════════════════════════════════════════════════════════════ 5. l'araignée

/**
 * Ses haïkus. Elle en dit un par visite, dans l'ordre, puis elle reprend au début.
 * Trois lignes chacun, jamais plus : c'est la forme qui fait le comique.
 *
 * En ajouter = une ligne de plus ici, rien d'autre.
 */
export const HAIKUS: string[][] = [
  ['Le mur est plus froid', 'que moi qui suis une bête.', 'C’est l’inverse d’août.'],
  ['Huit pattes, et donc', 'huit fois moins de chagrin', 'pour chaque patte.'],
  ['Personne ne monte', 'jamais dans la mezzanine.', 'Sauf toi. Et le chat.'],
  ['La poussière tombe', 'à la même vitesse', 'que les grandes personnes.'],
  ['J’ai tissé un piège.', 'Il n’attrape que le vent.', 'Le vent ne dit rien.'],
  ['Ta mère m’a bien vue.', 'Elle a préféré partir.', 'Nous nous respectons.'],
  ['L’été est un mur.', 'On attend qu’il se fatigue.', 'Il se fatiguera.'],
  ['Quand tu seras grand,', 'tu ne me verras plus.', 'Ce n’est pas grave.'],
  ['Il fait chaud ici.', 'Il fait chaud partout ailleurs.', 'Ici, c’est plus haut.'],
  ['Je ne mange rien.', 'J’attends. C’est un métier.', 'Personne ne postule.'],
];

/** La toute première fois qu'on la voit : une phrase, puis son premier haïku. */
export const PRESENTATION_ARAIGNEE = 'Une araignée géante occupe la mezzanine.';

/** Ce qu'elle annonce avant de danser. */
export const CHANSON: string[] = [
  '« Voilà. »',
  '« Je n’ai plus de poèmes. »',
  '« Il me reste la danse. »',
];

/** Après la danse, quand elle est sortie de l'écran en pirouettant. */
export const ARAIGNEE_PARTIE = ['Elle est partie...'];

/**
 * Ce qu'elle chante *pendant* la danse : un bout entre chaque mouvement, affiché
 * au-dessus d'elle sans arrêter la chorégraphie.
 */
export const COUPLETS: string[] = [
  'Tou-tou',
  'tou-tou-tou',
  'Tou !',
  'tou-tou-tou-tou',
  'TOU.',
];

/**
 * Le numéro de Moon dans le salon : il annonce, il fait tomber le bol, papa hurle, et
 * il donne à Nino le temps qu'il lui reste.
 */
export const DIVERSION = {
  annonce: ['« Regarde bien. »'],
  papa: ['« NON MAIS CE CHAT. »'],
  minuterie: ['« Tu vas voir !! »'],
};

/** Le bateau de papa qui remonte la rivière, pendant qu'on est sur le quai. */
/**
 * **Le naufrage, réplique par réplique.** Le bateau descend tout doucement pendant huit
 * secondes, et papa ne descend pas de son bateau. Ces phrases flottent au-dessus de lui,
 * sans boîte et sans bloquer : on regarde, on n'appuie sur rien, c'est le seul moment du jeu
 * qui se déroule tout seul.
 *
 * La dernière arrive quand l'eau lui passe au-dessus de la tête. Ne pas la changer.
 */
export const NAUFRAGE = [
  '« Ce n’est rien. »',
  '« C’est de l’eau. »',
  '« Un capitaine ne quitte pas son navire. »',
  '« Ça va se stabiliser. »',
  '« Bon. »',
  '« Blublublub. »',
];

/** Quand il remonte : avec un poisson si Nino l'a sauvé, tout seul sinon. */
export const REPECHAGE = {
  poisson: ['Le poisson remonte, papa accroché à lui.', 'Papa a gardé son chapeau.'],
  seul: ['Papa remonte tout seul, en nageant.', 'Il a gardé son chapeau.'],
};

/**
 * Les vannes de l'écureuil quand un tir de ballon rate la fenêtre. Elles s'affichent
 * au-dessus de lui, sans arrêter le jeu — on est en train de jouer au ballon, ce n'est
 * pas le moment de lire une boîte de dialogue.
 *
 * Elles sortent dans l'ordre, puis reprennent au début. Chacune tient sur une ligne
 * courte : c'est écrit en tout petit au-dessus d'un écureuil de dix pixels.
 */
export const ECUREUIL_VANNES = [
  '« Raté. »',
  '« Oh là là. »',
  '« Tu VISES ? »',
  '« Moi je dis rien. »',
  '« C’est large, hein. »',
  '« Ça va, tu t’amuses ? »',
  '« Bon. »',
];

/**
 * Et quand on vient lui demander des comptes — **au pistolet à eau**. C'est la seule
 * chose que l'écureuil ne discute pas, et c'est enfin à quoi sert le pistolet trouvé
 * dans le coffre de la chambre : lui parler ne le fait plus fuir, l'arroser oui.
 */
export const ECUREUIL_TREMPE = ['« Non. »', '« Non non non — »'];
export const ECUREUIL_FUITE = 'L’écureuil détale, trempé.';

/**
 * Et dans la tour, où l'arroser ne sert à rien : il change de coin, il râle, et son
 * énigme reste entière. C'est du texte flottant, sans boîte — on n'interrompt pas
 * l'escalade pour ça.
 */
export const ECUREUIL_MOUILLE = ['« HÉ ! »', '« Ça va pas ?! »', '« C’était pour quoi, ça ? »'];

/**
 * **Ce que dit chacun quand on l'arrose.** Une phrase flottante, sans boîte : on peut
 * arroser tout le monde tout le temps, ça ne doit jamais couper le jeu.
 *
 * Personne ne se fâche vraiment. C'est le principe : le pistolet à eau ne sert à rien,
 * et tout le monde a déjà eu une journée. Les listes tournent, phrase après phrase, pour
 * que ça vaille le coup d'insister.
 */
export const ARROSES: Record<string, string[]> = {
  maman: ['« Nino. »', '« Non. »', '« Range ça. »'],
  papa: ['« Ah. »', '« De l’eau. »', '« Bon. »'],
  moon: ['Moon ne bouge pas.', 'Moon ferme un œil.', 'Moon soupire.'],
  poisson: ['« ... »', '« C’est de l’eau. »', '« Merci ? »'],
  araignee: ['« Tiède. »', '« Encore. »'],
  elephant: ['« Enfin. »', '« Il fait tellement chaud. »'],
  hermione: ['Hermione rit très fort.', 'Hermione en veut encore.'],
  parrain: ['« Il pleut ? »', '« Dedans ? »'],
};

/** Et pour tous les autres. */
export const ARROSE_DEFAUT = ['« Hé. »', '« ... »', 'Personne ne réagit.'];

// ═══════════════════════════════════════════════════════════════ 6. le poisson

/** Le nom qui s'affiche au-dessus de la boîte. */
export const POISSON = 'Le poisson';

/** Sa vie, une boîte de dialogue à la fois. Racontée une seule fois par partie. */
export const VIE: string[][] = [
  ['« Je m’appelle Gérard. »'],
  [
    '« Je suis né dans un sac en plastique. »',
    '« Après, il y a eu un bocal. »',
    '« Puis un autre bocal. »',
  ],
  ['« Puis plus rien pendant très longtemps. »'],
  ['« Et un matin : cette baignoire. »', '« Je n’ai jamais compris comment. »'],
  ['« Voilà. »', '« C’était ma vie. »'],
];

/**
 * Le chat entre et **s'arrête à la porte pour regarder**. Puis il avance de quelques pas à
 * chaque phrase, doucement, et le poisson change de ton d'une boîte à l'autre.
 *
 * Une boîte = un pas de plus. La dernière porte la question : à ce moment-là le chat est
 * au bord de la baignoire, et il n'y a plus rien à ajouter.
 */
export const PANIQUE: string[][] = [
  ['« Ah. »'],
  ['« Il y a un chat, à la porte. »'],
  ['« Il avance. »'],
  ['« Il avance encore. »'],
  ['« Bon. »', '« Tu peux retirer le bouchon ? »', '« Tout de suite, plutôt. »'],
];

export const RETIRE = [
  'Nino retire le bouchon.',
  'Le poisson descend, très digne, la tête la première.',
  '« Merci, on se reverra. »',
];

/**
 * Ce qu'il répond si on dit non. **Il ne lâche pas l'affaire** : il y a un chat dans la
 * pièce, ce n'est plus une faveur qu'il demande. La question revient tout de suite, et il
 * n'y a pas d'autre issue que le bouchon.
 */
export const REFUS: string[][] = [
  ['« Non ?! »', '« Regarde-le. Regarde-moi. »'],
  ['« Je ne demande pas pour le plaisir. »'],
  ['« Le bouchon. »', '« S’il te plaît. »'],
  ['« Nino. »'],
];

/**
 * Ce que Moon en pense — et il ne le dit que s'il a déjà eu sa pizza : c'est elle qui
 * l'a fait parler, on ne va pas revenir là-dessus pour un poisson.
 */
export const LE_CHAT = ['« C’était mon poisson. »'];

/** Le bruit qu'il fait au moment où le poisson disparaît par le trou. Pas un mot. */
export const GROGNEMENT = ['Moon grogne.'];

// ═══════════════════════════════════════════════════════════════ 7. la fin

/** Il rentre par la fenêtre, il cache le parapente, il se couche. */
export const SEMBLANT = [
  ['Nino plie le parapente. Mal.', 'Il le pousse sous le lit.'],
  ['Le ciel commence à être gris, dehors.'],
  ['Il se glisse sous la couette.', 'Il ferme les yeux très fort.'],
];

/** Les parents entrent. Ils parlent à voix basse, ce qui est pire. */
export const PARENTS: Array<{ qui?: string; lignes: string[] }> = [
  { qui: 'Maman', lignes: ['« Il dort. »'] },
  { qui: 'Papa', lignes: ['« À sept heures du matin ? »'] },
  { qui: 'Maman', lignes: ['« Nino. »', '« Nino, viens. »'] },
];

/**
 * Dans la cuisine. C'était ça, toute la journée.
 *
 * `son` déclenche un bruitage sur la réplique : c'est ici et pas dans le code, pour qu'on
 * puisse réécrire les phrases sans faire taire le souffle des bougies.
 */
export const FETE: Array<{ qui?: string; lignes: string[]; son?: string }> = [
  { lignes: ['Il fait jour dans la cuisine.', 'Ça sent le gâteau.'] },
  { qui: 'Maman', lignes: ['« JOYEUX ANNIVERSAIRE ! »'] },
  { qui: 'Papa', lignes: ['« JOYEUX ANNIVERSAIRE ! »'] },
  { lignes: ['Sept bougies.', 'Hermione tape sur la table.'] },
  { qui: 'Papa', lignes: ['« Souffle ! »'] },
  { lignes: ['Nino prend une très grande respiration.'], son: 'bougies' },
  { lignes: ['...'] },
  { lignes: ['Nino dort.'] },
];

// ═══════════════════════════════════════════════════════ 10. le sac et les pièces

/** Ce que le journal raconte des objets ramassés. */
export const OBJETS: Record<string, { nom: string; desc: string }> = {
  'pistolet-eau': {
    nom: 'Pistolet à eau',
    desc: 'Trouvé tout au fond du coffre à jouets. Il fonctionne encore, c’est déjà beaucoup pour un objet de ce coffre. X pour arroser.',
  },
  parapente: {
    nom: 'Parapente',
    desc: 'Trouvé sur le toit de la Tour de Bretagne. Personne ne l’a réclamé. Il tient sous un lit, une fois plié — mal plié, mais plié.',
  },
  chaussure: {
    nom: 'Vieille chaussure',
    desc: 'Trouvée sur le quai de l’Erdre. Elle a beaucoup marché, et pas avec Nino.',
  },
  bouchon: {
    nom: 'Bouchon de baignoire',
    desc: 'Celui qu’on a retiré pour laisser partir le poisson. Il a sauvé quelqu’un, ce bouchon, et personne ne le sait.',
  },
  noisette: {
    nom: 'Noisette',
    desc: 'Oubliée dans la cour. Par qui, on se demande — et on ne demandera pas.',
  },
  ticket: {
    nom: 'Ticket de tram',
    desc: 'Poinçonné, illisible, ramassé sous un tramway qui ne roule pas.',
  },
  'ballon-degonfle': {
    nom: 'Ballon dégonflé',
    desc: 'Le ballon de la cour d’école. Il est là depuis le mois dernier, et il n’a rien perdu de son calme.',
  },
  plume: {
    nom: 'Plume de héron',
    desc: 'Ramassée sur le quai. Les hérons passent par là — Nino le vérifiera plus tard, en parapente.',
  },
  pizza: {
    nom: 'Bout de pizza mâché',
    desc: 'Froid, un peu mou, et il manque un coin : Moon y a goûté sans même ouvrir les yeux. Personne ne le réclamera. Certains animaux le trouvent négociable quand même.',
  },
};

/** Les pièces à collectionner. On ne sait pas encore ce qu'elles veulent dire. */
export const PIECES_TEXTE: Record<string, { nom: string; provenance: string }> = {
  reve: {
    nom: 'Pièce du rêve',
    provenance: 'Gagnée sur une fusée, dans le rêve du grand lit.',
  },
};

// ═══════════════════════════════════════════════════════════════ 11. le casting

/** Les fiches du journal. Qui c'est, et ce qu'il fait là. */
export const CASTING: Record<string, { nom: string; role: string }> = {
  nino: {
    nom: 'Nino',
    role: 'Le héros. 7 ans. Prend très au sérieux les choses absurdes.',
  },
  moon: {
    nom: 'Moon',
    role: 'Le chat blanc. Dort sur le canapé. Se met à parler contre un bout de pizza, et devient le guide du jeu.',
  },
  hermione: {
    nom: 'Hermione',
    role: 'La petite sœur, un an. Elle est cachée quelque part, et elle change de cachette dès qu’on l’a trouvée. Ses cachettes deviennent de plus en plus impossibles, et personne ne s’en inquiète jamais.',
  },
  poisson: {
    nom: 'Gérard',
    role: 'Le poisson de la baignoire. Raconte sa vie avant de demander de l’aide, et n’en demande que quand le chat s’assoit au bord. Rend ses dettes, plus tard, dans l’Erdre.',
  },
  araignee: {
    nom: 'L’araignée',
    role: 'Géante, installée dans la mezzanine. Dit un haïku par visite. Quand elle les a tous dits, elle danse, elle part — et on la retrouve au 27e étage de la tour.',
  },
  ecureuil: {
    nom: 'L’écureuil',
    role: 'À moitié caché, toujours. Pousse Nino à viser la fenêtre avec le ballon, puis à couler le bateau de papa, puis garde un escalier avec une énigme. Nie tout, à chaque fois.',
  },
  parrain: {
    nom: 'Le parrain',
    role: 'Attablé avec papa sur une terrasse, la nuit. Ne s’étonne de rien, pas même d’un papa trempé, pas même d’un enfant de sept ans qui passe à cette heure-ci.',
  },
  elephant: {
    nom: 'L’Éléphant des Machines',
    role: 'Douze mètres de bois et d’acier, sur un palier du 31e étage. Personne ne demande comment il est monté. Pose la seule énigme dont il ne connaît pas la réponse.',
  },
  maman: {
    nom: 'Maman',
    role: 'Tient la cuisine et le réel. C’est elle qui envoie Nino vers le frigo sans savoir ce qu’elle déclenche.',
  },
  papa: {
    nom: 'Papa',
    role: 'Dans le salon, « cinq minutes » depuis quarante minutes. Et en même temps, chapeau de capitaine, il pilote un bateau sur l’Erdre. Ne trouve ça bizarre à aucun moment.',
  },
  maitresse: {
    nom: 'La maîtresse',
    role: 'Donnera des « devoirs » qui sont en fait des quêtes. Chapitre école, pas encore construit.',
  },
  copain1: { nom: 'Copain nº1 (à nommer)', role: 'Échange des objets. Croit Nino sur parole.' },
  copain2: { nom: 'Copain nº2 (à nommer)', role: 'Ne croit rien. Contre-poids comique.' },
  copain3: { nom: 'Copain nº3 (à nommer)', role: 'A déjà vu une dimension et n’en parle jamais.' },
};

// ══════════════════════════════════════════════════════ 12. toutes les répliques

/**
 * Les dialogues, un tableau par interlocuteur, du plus spécifique au plus général.
 * Écrits pour être lus à voix haute par un adulte : phrases courtes, absurde
 * traité très sérieusement, jamais de méchanceté.
 */
/**
 * **Ce qu'on peut offrir pour le projet d'art**, dans l'ordre où la maîtresse les regarde si
 * Nino en porte plusieurs. Tout ce qui traîne dans le jeu y passe — même le bout de pizza,
 * qu'elle ne garde pas : rien n'est jamais retiré du sac par un devoir.
 *
 * La liste est ici et pas dans `items.ts` pour rester à côté des accueils : ajouter un objet
 * au devoir, c'est deux lignes au même endroit.
 */
const OFFRABLES: ItemId[] = [
  'chaussure',
  'bouchon',
  'noisette',
  'ticket',
  'ballon-degonfle',
  'plume',
  'pizza',
];

/**
 * **Ce que la maîtresse dit selon l'objet posé sur sa table.** Une entrée par objet offrable ;
 * ajouter un objet au projet d'art = une ligne ici et une dans `OFFRABLES`.
 */
const ACCUEILS: Record<string, string[]> = {
  chaussure: [
    '« Ah ! Tu as apporté quelque chose. »',
    'Nino pose une vieille chaussure sur la table.',
    '« Bien. Explique-moi en quoi c’est de l’art. »',
  ],
  bouchon: [
    'Nino pose un bouchon de baignoire sur la table.',
    '« Un bouchon. »',
    '« Explique-moi en quoi c’est de l’art. »',
  ],
  noisette: [
    'Nino pose une noisette sur la table.',
    'La maîtresse la regarde. La noisette ne bouge pas.',
    '« Explique-moi en quoi c’est de l’art. »',
  ],
  ticket: [
    'Nino pose un ticket de tram sur la table.',
    '« Poinçonné, en plus. »',
    '« Explique-moi en quoi c’est de l’art. »',
  ],
  'ballon-degonfle': [
    'Nino pose le ballon dégonflé de la cour sur la table.',
    '« Celui-là ? Il est à l’école, Nino. »',
    '« Bon. Explique-moi en quoi c’est de l’art. »',
  ],
  plume: [
    'Nino pose une plume de héron sur la table.',
    '« Oh. »',
    '« Explique-moi en quoi c’est de l’art. »',
  ],
  pizza: [
    'Nino pose un bout de pizza mâché sur la table.',
    '« ... »',
    '« Explique-moi en quoi c’est de l’art. »',
  ],
};

/**
 * **Les trois explications, pour n'importe quel objet.** Aucune n'est fausse, elles ne valent
 * pas la même note, et la meilleure est celle de Duchamp. Les phrases restent courtes : la
 * fenêtre de choix fait cent seize pixels utiles, au-delà elles sont coupées en deux.
 */
const EXPLICATIONS = {
  reponses: ['C’est un objet', 'Il a beaucoup vécu', 'Je l’ai décidé'],
  retours: [
    { note: 8, lines: ['« Oui. Ça, je vois. »', '« Huit sur vingt, Nino. »'] },
    {
      note: 16,
      lines: [
        '« Ah. »',
        '« Il a servi longtemps, et on ne sait pas à qui. »',
        '« Seize sur vingt. C’est joli, ça. »',
      ],
    },
    {
      note: 20,
      lines: [
        '« ... »',
        'La maîtresse regarde l’objet très longtemps.',
        '« Vingt sur vingt. »',
      ],
    },
  ],
};

export const DIALOGUES: Record<string, DialogueBeat[]> = {
  // ------------------------------------------------------------- la chambre
  /**
   * L'ouverture du jeu. Le texte du réveil et la montée de chaleur : la boucle du
   * choix est dans WorldScene.reveil, parce qu'elle se répète.
   */
  reveil: [
    {
      lines: [
        'Nino ouvre les yeux.',
        'Le soleil est déjà haut, et il fait chaud.',
        'Quelle heure il est ?',
      ],
    },
  ],

  'fenetre-chambre': [
    {
      when: () => !state.flag('volets-fermes'),
      lines: [
        'La fenêtre est ouverte. Dehors, le soleil tape sur la cour.',
        'Nino tire les volets.',
      ],
      effects: { flag: 'volets-fermes' },
    },
    { lines: ['Volets fermés.'] },
  ],

  'reveil-force': [{ lines: ['Nino sort du lit.', 'Il dégouline de sueur.'] }],

  /**
   * **Au sortir du rêve de la fusée.** Il se réveille dans le grand lit des parents, et sa
   * sœur est là, à dépasser du bord du lit : elle a rampé jusque là pendant qu'il dormait.
   * On ne le dit pas — on le voit. La réplique ne parle que du rêve.
   */
  'sortie-du-reve': [
    {
      lines: [
        'Nino ouvre les yeux.',
        'Quel drôle de rêve.',
        'Il y avait une fusée, et ça sentait bizarre.',
      ],
      effects: { flag: 'reve-raconte' },
    },
  ],

  lit: [
    {
      lines: ['Le lit est encore tout défait.', 'Se recoucher ?'],
      choice: {
        oui: {
          lines: [
            'Nino se recouche.',
            'Il fixe le plafond pendant une minute entière.',
            'C’est encore plus long qu’il pensait.',
            'Il se relève.',
          ],
          effects: { flag: 'recouche' },
          // On le voit dans le lit : sa tête sur l'oreiller, la bosse sous la couverture.
          montre: {
            sprite: 'nino-couche',
            x: 22,
            y: 18,
            depth: 60,
            cacheNino: true,
          },
        },
        non: { lines: ['Non. Pas un jour comme aujourd’hui.'] },
      },
    },
  ],

  // Lui parler, c'est toujours la même chose. C'est ça qui est drôle.
  'hermione-suit': [{ lines: ['...'] }],

  'lit-camp': [
    {
      lines: [
        'Un lit de camp, dans la mezzanine.',
        'Pas trop envie de dormir là avec cette chaleur...',
      ],
    },
  ],

  wc: [
    {
      lines: [
        'Les toilettes.',
        'On regarde dedans ? Un peu risqué.',
        'Rien.. Déçu ?',
      ],
    },
  ],

  coffre: [
    {
      when: () => !state.flag('coffre-ouvert'),
      lines: [
        'Nino ouvre le coffre à jouets.',
        'Des briques, une trottinette cassée, un dinosaure.',
        'Et, tout au fond, son pistolet à eau.',
      ],
      effects: { give: 'pistolet-eau', flag: 'coffre-ouvert' },
    },
    {
      when: () => !state.flag('pistolet-teste'),
      lines: [
        'Nino essaie le pistolet à eau.',
        'Sur lui-même, d’abord. Pour vérifier.',
        'Ça marche. X pour arroser quelque chose.',
      ],
      effects: { flag: 'pistolet-teste' },
    },
    { lines: ['Le dinosaure le regarde.', 'Toujours pareil.'] },
  ],

  ventilo: [
    {
      when: () => !state.flag('ventilo-casse'),
      lines: [
        'Nino appuie sur le bouton du ventilateur.',
        'Le ventilateur fait « klk klk klk ».',
        'Et puis plus rien.',
        'Il fait toujours aussi chaud.',
      ],
      effects: { flag: 'ventilo-casse' },
    },
    { lines: ['Le ventilateur est cassé.', 'Il fait semblant de réfléchir.'] },
  ],

  // -------------------------------------------------------------- la cuisine
  'porte-cour': [{ lines: ['La porte est fermée à clé.'] }],

  'panneau-sortie': [
    {
      lines: [
        'Sur la porte du fond, celle qui donne sur la cour, un mot de Maman :',
        '« NINO — PAS DEHORS SANS PRÉVENIR. »',
        'Techniquement, une fenêtre, ce n’est pas une porte.',
      ],
    },
  ],

  // -------------------------------------------------------------- la cuisine
  maman: [
    {
      when: () => state.flag('sueur') && !state.flag('maman-sueur'),
      speaker: 'Maman',
      lines: ['« Nino, tu mets de l’eau partout !! »'],
      effects: { flag: 'maman-sueur' },
    },
    {
      when: () => state.flag('chat-parle'),
      speaker: 'Maman',
      lines: [
        'Tu parles au chat, maintenant ?',
        '...',
        'Ton père fait ça aussi. C’est héréditaire, apparemment.',
      ],
    },
    {
      when: () => state.has('pizza'),
      speaker: 'Maman',
      lines: ['Tu manges de la pizza froide au réveil.', '...', 'Bon.'],
    },
    /**
     * **Tant qu'elle cherche Hermione, elle est dans la cuisine et elle garde le frigo.**
     * Elle la retrouve à chaque fois, et à chaque fois elle la reperd : c'est ce qui rend
     * la chasse indispensable, et c'est aussi toute la blague.
     */
    {
      when: () => state.hermione === 0,
      speaker: 'Maman',
      lines: [
        'Maman regarde derrière le frigo.',
        '« Tu n’as pas vu ta sœur ? »',
        '« Cherche-la, tu veux ? Je n’avance pas. »',
      ],
      effects: { flag: 'indice-hermione' },
    },
    {
      when: () => !state.flag('maman-au-salon'),
      speaker: 'Maman',
      lines: [
        '« Elle est repartie. »',
        '« Trois secondes. J’ai tourné la tête trois secondes. »',
      ],
    },
    {
      speaker: 'Maman',
      lines: [
        'Il fait bien trop chaud pour cuisiner, Nino.',
        'Va voir dans le frigo si tu as faim.',
        'Et ne laisse pas la porte ouverte.',
      ],
      effects: { flag: 'indice-frigo' },
    },
  ],

  frigo: [
    /** Elle est plantée devant, à chercher sa fille. On n'ouvre pas le frigo. */
    {
      when: () => !state.flag('maman-au-salon'),
      speaker: 'Maman',
      lines: ['« Pas maintenant, Nino. »', '« Je cherche ta sœur. »'],
    },
    {
      when: () => !state.flag('pizza-prise'),
      lines: [
        'Nino ouvre le frigo. Le froid lui tombe sur les pieds.',
        'C’est délicieux. Il reste comme ça un moment.',
        'Sur l’étagère du milieu : un bout de pizza d’hier.',
        'Nino le prend.',
      ],
      effects: { give: 'pizza', flag: 'pizza-prise' },
    },
    {
      lines: [
        'Le frigo ronronne.',
        'Il ne reste plus rien d’intéressant dedans. Que des légumes.',
      ],
    },
  ],

  'evier-cuisine': [
    {
      lines: ['L’eau du robinet est tiède.', 'Même l’eau a chaud aujourd’hui.'],
    },
  ],

  carrelage: [
    {
      when: () => !state.flag('carrelage-teste'),
      lines: [
        'Nino s’allonge de tout son long sur le carrelage de la cuisine.',
        'Joue contre le sol.',
        'C’est le meilleur endroit de la maison. Tout le monde le sait.',
      ],
      effects: { flag: 'carrelage-teste' },
    },
    {
      lines: ['Le carrelage a repris la température de Nino.', 'Il faut changer de carreau.'],
    },
  ],

  reverbere: [
    {
      when: () => !state.flag('ombre-testee'),
      lines: [
        'Nino se met dans l’ombre du réverbère.',
        'Elle fait exactement sa taille.',
        'Il reste là un moment, très content de lui.',
      ],
      effects: { flag: 'ombre-testee' },
    },
    { lines: ['L’ombre a bougé. Le soleil, lui, s’en fiche.'] },
  ],

  // ---------------------------------------------------------------- le salon
  moon: [
    {
      when: () => state.vu('nantes'),
      speaker: 'Moon',
      lines: ['« Alors ? »', '...', '« Ne raconte pas. Les chats savent déjà. »'],
    },
    // La diversion est une scène jouée, pas un dialogue : voir WorldScene.diversion.
    {
      when: () => state.flag('chat-parle'),
      speaker: 'Moon',
      lines: ['« La fenêtre, Nino. »', '« Personne ne surveille jamais les fenêtres. »'],
    },
    /**
     * **Il ne prend la pizza que s'il a vu le poisson.** Avant ça il dort d'un sommeil
     * imperturbable — et c'est la vue d'un poisson dans une baignoire qui lui donne faim.
     * Toute la sortie de la maison tient à ce fil.
     */
    {
      when: () => state.has('pizza') && state.flag('poisson-vu'),
      speaker: 'Moon',
      lines: [
        'Nino tend le bout de pizza au chat blanc.',
        'Moon renifle. Moon mange. Moon s’assoit très droit.',
        '« Bon. »',
        '« Puisque tu as payé, je vais te dire un truc. »',
        '« S’il fait chaud comme ça, c’est parce que le monde est trop petit aujourd’hui. »',
        '« Sors par la fenêtre du salon. Je m’occupe des adultes. »',
      ],
      effects: { take: 'pizza', flag: 'chat-parle' },
    },
    {
      when: () => state.has('pizza') && !state.flag('poisson-vu'),
      lines: [
        'Nino tend le bout de pizza au chat blanc.',
        'Moon dort.',
        'Moon en mâche un coin, sans ouvrir les yeux. Puis il dort encore.',
        'Il faudrait quelque chose de plus intéressant qu’une pizza.',
      ],
    },
    {
      when: () => !state.flag('chat-porte'),
      lines: [
        'Moon, le chat blanc, dort sur le canapé.',
        'Nino le prend sur ses genoux. Moon accepte, magnanime.',
        'Un chat, ça fait exactement trente-huit degrés.',
        'Nino le repose.',
      ],
      effects: { flag: 'chat-porte' },
    },
    {
      lines: [
        'Moon dort sur le canapé.',
        'Il ouvre un œil.',
        'Il le referme.',
        'Il faudrait une très bonne raison.',
      ],
    },
  ],

  canape: [{ lines: ['Le canapé.', 'Poilu de chat, chaud de soleil.'] }],

  'maman-salon': [
    {
      when: () => state.flag('indice-frigo'),
      speaker: 'Maman',
      lines: [
        'Oui, je sais. Je t’ai dit ça dans la cuisine.',
        'J’y suis aussi.',
        '...',
        'Ne commence pas.',
      ],
    },
    {
      speaker: 'Maman',
      lines: [
        'Il fait bien trop chaud pour bouger, Nino.',
        'Alors on ne bouge pas. On reste là. Tous les trois.',
      ],
    },
  ],

  'papa-salon': [
    {
      speaker: 'Papa',
      lines: ['« Cinq minutes, Nino. »', 'Ça fait quarante minutes que ça fait cinq minutes.'],
    },
  ],

  bibliotheque: [
    {
      when: () => !state.flag('bibliotheque-fouillee'),
      lines: [
        'Nino cherche un livre au hasard.',
        'Il tombe sur un album qu’il n’a jamais vu.',
        'Sur la couverture, un petit garçon enjambe une fenêtre.',
        'Nino remet le livre exactement où il était.',
      ],
      effects: { flag: 'bibliotheque-fouillee' },
    },
    { lines: ['L’album n’est plus là.', 'Nino ne dira rien à personne.'] },
  ],

  'table-ronde': [
    {
      when: () => state.flag('parents-sortis'),
      lines: [
        'Il ne reste qu’un bol sur la table.',
        'L’autre est par terre. Il ne s’est même pas cassé.',
      ],
    },
    {
      lines: [
        'La table ronde. Deux bols du petit déjeuner, encore là.',
        'Un des deux n’est pas à Nino.',
        'Un des deux n’est à personne, en fait.',
      ],
    },
  ],

  videoprojecteur: [
    {
      when: () => !state.flag('projecteur-allume'),
      lines: [
        'Nino appuie sur le bouton du vidéoprojecteur.',
        'Un grand carré de lumière apparaît sur le mur de droite.',
        'Dedans, il y a l’ombre de Nino.',
        'Elle lui fait un petit signe de la main. Nino, lui, n’a pas fait signe.',
      ],
      effects: { flag: 'projecteur-allume' },
    },
    {
      lines: [
        'Le carré de lumière est toujours sur le mur.',
        'L’ombre de Nino attend patiemment dedans.',
      ],
    },
  ],

  'fenetre-salon': [
    {
      when: () => state.flag('chat-parle'),
      lines: [
        'Moon a promis de s’occuper des adultes.',
        'Moon n’a encore rien fait du tout.',
        'Il faudrait peut-être aller le lui rappeler.',
      ],
    },
    {
      lines: [
        'La fenêtre du salon. Elle donne sur la cour.',
        'Papa et Maman sont installés juste là, à la table.',
        'On n’enjambe pas une fenêtre devant ses parents. Tout le monde sait ça.',
      ],
    },
  ],

  // Moon est dans la pièce à côté, hors champ. On ne le voit pas : on l'entend, et on
  // entend aussi comment ça se passe pour lui.
  'moon-retient': [{ speaker: 'Moon', lines: ['« Vas-y, je les retiens. »'] }],
  'papa-attrape': [{ speaker: 'Papa', lines: ['« VIENS LÀ, TOI !! »'] }],

  'fenetre-salon-ouvre': [
    {
      // Moon est sorti avec les parents : il n'est plus là pour commenter.
      lines: ['Nino monte sur l’accoudoir du canapé.', 'Enjamber la fenêtre ?'],
      choice: {
        oui: {
          lines: ['Nino enjambe la fenêtre.'],
          effects: { flag: 'fenetre-ouverte' },
        },
        non: {
          lines: ['Nino redescend du canapé.'],
        },
      },
    },
  ],

  // ------------------------------------------------------------ la mezzanine
  // L'araignée récite ses haïkus depuis haikus.ts, un par visite.

  // -------------------------------------------------- la chambre des parents
  armoire: [
    {
      when: () => !state.flag('armoire-suspecte'),
      lines: [
        'L’armoire des parents. Ça sent le pull.',
        'Nino a l’impression que le fond de l’armoire est plus loin qu’il ne devrait.',
        'Beaucoup plus loin.',
        'Il referme.',
      ],
      effects: { flag: 'armoire-suspecte' },
    },
    { lines: ['L’armoire attend.', 'Ce sera pour une autre fois.'] },
  ],

  'grand-lit': [
    {
      lines: [
        'Le grand lit des parents. Interdit de sauter dessus.',
        'Nino connaît la règle. Nino y pense quand même.',
        'Mais il fait si chaud, et les draps ont l’air si frais.',
        'S’allonger ?',
      ],
      choice: {
        oui: {
          lines: [
            'Nino s’allonge au milieu du grand lit.',
            'Les draps sentent le linge propre.',
            'Il ferme les yeux une seconde.',
            'Une seconde, pas...',
          ],
          effects: { flag: 'reve-ouvert' },
          montre: {
            sprite: 'nino-couche',
            x: 62,
            y: 26,
            depth: 80,
            cacheNino: true,
          },
        },
        non: {
          lines: ['Non. C’est le lit des parents.', 'Il y a des règles.'],
        },
      },
    },
  ],

  // --------------------------------------------------------- la salle de bain
  lavabo: [
    {
      when: () => !state.flag('miroir-retard'),
      lines: [
        'Nino se passe de l’eau sur la figure.',
        'Dans le miroir, il y a Nino.',
        'Un tout petit peu en retard.',
      ],
      effects: { flag: 'miroir-retard' },
    },
    { lines: ['Le Nino du miroir attend que le vrai Nino commence.'] },
  ],

  /**
   * Le même écureuil, dans les roseaux, avec une idée plus grosse. Même structure que
   * dans la cour : il propose, il insiste, il nie.
   */
  'ecureuil-erdre': [
    {
      when: () => state.flag('bateau-coule'),
      speaker: 'L’écureuil',
      lines: ['« Moi ? »', '« Je regardais l’eau. »'],
    },
    {
      when: () => state.flag('ecureuil-bateau'),
      speaker: 'L’écureuil',
      lines: ['« La corde. »', '« Personne ne la tient. »'],
    },
    {
      speaker: 'L’écureuil',
      lines: ['« Psst. »', '« T’es fort ? »', '« Prouve-le. Tire sur cette corde. »'],
      effects: { flag: 'ecureuil-bateau' },
    },
  ],

  /**
   * Trois états, et le deuxième dépend de la baignoire : **si Nino a sauvé le poisson,
   * c'est le poisson qui repêche papa**. Sinon papa se débrouille, et il n'a pas l'air
   * content. La chaîne de la salle de bain ne donne pas un objet, elle donne un sauveteur.
   */
  corde: [
    {
      when: () => state.flag('bateau-coule'),
      lines: ['La corde pend dans l’eau.'],
    },
    /**
     * **Tant que l'écureuil n'a rien dit, ce n'est qu'une corde.** L'idée de tirer dessus ne
     * vient pas de Nino : il ne saborderait pas le bateau de son père tout seul. C'est
     * l'écureuil qui la lui met dans la tête, et c'est tout le personnage.
     */
    {
      when: () => !state.flag('ecureuil-bateau'),
      lines: ['Une corde, tendue depuis le bateau.', 'Elle est bien serrée.'],
    },
    {
      when: () => state.flag('bouchon-retire'),
      lines: ['Une corde, tendue depuis le bateau.', 'Tirer ?'],
      choice: {
        oui: {
          lines: [
            'Nino tire sur la corde.',
            'Un bouchon saute au fond du bateau.',
            'Personne ne regardait.',
          ],
          effects: { flag: 'bateau-coule' },
        },
        non: { lines: ['Nino lâche la corde.', 'Elle se retend toute seule.'] },
      },
    },
    {
      lines: ['Une corde, tendue depuis le bateau.', 'Tirer ?'],
      choice: {
        oui: {
          lines: [
            'Nino tire sur la corde.',
            'Un bouchon saute au fond du bateau.',
            'Personne ne regardait.',
          ],
          effects: { flag: 'bateau-coule' },
        },
        non: { lines: ['Nino lâche la corde.', 'Elle se retend toute seule.'] },
      },
    },
  ],

  'papa-repeche': [
    {
      when: () => state.flag('bouchon-retire'),
      speaker: 'Papa',
      lines: ['« C’est un poisson qui m’a ramené. »', '« Un poisson. »'],
    },
    { speaker: 'Papa', lines: ['« Ne dis rien à ta mère. »'] },
  ],

  'poisson-erdre': [
    {
      when: () => state.flag('bateau-coule'),
      speaker: 'Le poisson',
      lines: ['« Voilà. »', '« Passe, maintenant. »'],
    },
    // Le bateau est là depuis le début : cette réplique attendait un drapeau qui n'existe
    // plus, et l'indice du bouchon ne sortait donc jamais.
    {
      speaker: 'Le poisson',
      lines: ['« Le bateau, là-bas. »', '« Il a un bouchon, lui aussi. »'],
    },
    {
      speaker: 'Le poisson',
      lines: [
        '« Merci pour le bouchon. »',
        '« Je n’oublie pas ces choses-là. »',
        '« Il n’y a rien à couler, pour l’instant. »',
      ],
    },
  ],

  baignoire: [
    {
      when: () => state.flag('bouchon-retire'),
      lines: ['La baignoire est vide.'],
    },
    { when: () => state.flag('eau-coule'), lines: ['L’eau coule.'] },
    {
      lines: ['La baignoire est vide.', 'Faire couler l’eau ?'],
      choice: {
        oui: {
          lines: ['L’eau coule.'],
          effects: { flag: 'eau-coule' },
        },
        non: { lines: ['...'] },
      },
    },
  ],

  // ------------------------------------------------------------------ la cour
  velo: [{ lines: ['Le vélo de Nino.', 'Un pneu à plat depuis le mois de mars.'] }],

  /**
   * L'écureuil du coin de la cour. Il ne demande rien pour lui, il ne gagne rien, il
   * n'explique rien : il pousse au crime et il se rétracte. C'est tout son personnage.
   */
  ecureuil: [
    {
      when: () => state.flag('fenetre-cassee'),
      speaker: 'L’écureuil',
      lines: ['« Je n’ai jamais dit ça. »', '« Je ne t’ai jamais parlé. »'],
    },
    {
      when: () => state.flag('ecureuil-vu'),
      speaker: 'L’écureuil',
      lines: ['« La fenêtre. »', '« Elle est toujours là. »'],
    },
    {
      speaker: 'L’écureuil',
      lines: ['« Psst. »', '« T’es bon au foot ? »', '« Prouve-le. Vise la fenêtre. »'],
      effects: { flag: 'ecureuil-vu' },
    },
  ],

  // Le ballon ne se raconte plus : on tape dedans, il rebondit sur les murs, et si on
  // vise la fenêtre elle casse. Papa, resté dedans, sait exactement qui accuser.
  'fenetre-cassee': [
    {
      speaker: 'Papa',
      lines: ['« NON MAIS CE CHAT. »'],
    },
  ],

  // ------------------------------------------------ la Tour de Bretagne
  /**
   * **Pourquoi on ne passe pas à l'est.** Le quai continue derrière le bateau : pour aller
   * plus loin, Nino devrait passer sous le nez de son père, debout à son bastingage. Ce n'est
   * pas une porte fermée, c'est un adulte qui regarde — et c'est ce qui rend le naufrage
   * indispensable. Une fois papa dans l'eau, plus personne ne surveille le quai.
   */
  'quai-est': [
    {
      lines: [
        'Le quai continue derrière le bateau.',
        'Papa est debout dessus, et il regarde de ce côté.',
        'Impossible de passer sans qu’il le voie.',
      ],
    },
  ],

  ascenseur: [{ lines: ['L’ascenseur.', '« HORS SERVICE »', 'Le papier est jauni.'] }],

  'maman-fete': [{ speaker: 'Maman', lines: ['« Sept ans. »', '« Sept. »'] }],
  'papa-fete': [{ speaker: 'Papa', lines: ['« On a préparé ça toute la journée. »'] }],
  'hermione-fete': [{ speaker: 'Hermione', lines: ['« ... »'] }],

  'plan-tour': [
    {
      lines: [
        'Un plan de la tour.',
        'Trente-deux étages.',
        'Nino compte jusqu’à douze, puis arrête.',
      ],
    },
  ],

  'porte-cabinet': [{ lines: ['« CABINET DENTAIRE »', 'Fermé.', 'Tant mieux.'] }],

  'plante-tour': [
    { lines: ['Une plante en plastique.', 'Elle est là depuis 1976, elle aussi.'] },
  ],

  'fenetre-tour': [
    { lines: ['La fenêtre est ouverte.', 'D’ici, les voitures font le bruit de la mer.'] },
  ],

  /**
   * Les quatre gardiens de la tour. Une énigme par étage, et **aucune mauvaise réponse ne
   * coûte quoi que ce soit** : on redemande autant qu'on veut. Chaque « faux » donne un
   * indice, jamais la réponse.
   */
  'escalier-garde': [
    {
      lines: [
        'Il n’y a pas d’escalier pour monter à l’étage.',
        'Pas encore.',
        'Quelqu’un ici doit savoir pourquoi.',
      ],
    },
  ],

  'moon-tour': [
    {
      when: () => state.flag('enigme-moon'),
      speaker: 'Moon',
      lines: ['« Tu montes ? »', '« Moi je descends. »'],
    },
    {
      speaker: 'Moon',
      lines: ['« Une question, et je bouge. »', '« Qui dort seize heures par jour, et personne ne lui dit rien ? »'],
      enigme: {
        reponses: ['Un chat', 'Un bébé', 'Papa'],
        bonne: 0,
        juste: {
          lines: ['« Voilà. »', 'Moon regarde le mur. Il y a un escalier, maintenant.', '« Monte. »'],
          effects: { flag: 'enigme-moon' },
        },
        faux: { lines: ['« Non. »', '« Réfléchis à qui tu parles. »'] },
      },
    },
  ],

  'ecureuil-tour': [
    {
      when: () => state.flag('enigme-ecureuil'),
      speaker: 'L’écureuil',
      lines: ['« Vas-y, monte. »', '« Moi j’ai des choses à faire ici. »'],
    },
    {
      speaker: 'L’écureuil',
      lines: ['« Psst. »', '« Qu’est-ce qui est mieux qu’une noisette ? »'],
      enigme: {
        reponses: ['Deux noisettes', 'Une pomme', 'Rien'],
        bonne: 0,
        juste: {
          lines: [
            '« Exactement. »',
            'L’escalier de l’étage est là, d’un coup.',
            '« Tu peux passer. »',
          ],
          effects: { flag: 'enigme-ecureuil' },
        },
        faux: { lines: ['« Non. »', '« Pense plus grand. »'] },
      },
    },
  ],

  'araignee-tour': [
    {
      when: () => state.flag('enigme-araignee'),
      speaker: 'L’araignée',
      lines: ['« Vas-y. »', '« Et tiens-toi bien. »'],
    },
    {
      speaker: 'L’araignée',
      lines: ['« Une aile, et pas d’oiseau. »', '« Un enfant dessous. »', '« Qu’est-ce que c’est ? »'],
      enigme: {
        reponses: ['Un parapente', 'Un cerf-volant', 'Un avion'],
        bonne: 0,
        juste: {
          lines: [
            '« Oui. »',
            'Elle tire un fil. Les marches suivantes apparaissent.',
            '« Tu vas en avoir besoin. »',
          ],
          effects: { flag: 'enigme-araignee' },
        },
        faux: { lines: ['« Non. »', '« Il n’y a pas de ficelle. »'] },
      },
    },
  ],

  elephant: [
    {
      when: () => state.flag('enigme-elephant'),
      speaker: 'L’Éléphant',
      lines: ['« ... »', 'Il crache un peu d’eau. Il fait très chaud, ici aussi.'],
    },
    {
      // Il l'a vu boire dans l'Erdre, et l'éléphant le sait.
      when: () => state.flag('elephant-vu') && !state.flag('elephant-salue'),
      speaker: 'L’Éléphant',
      lines: ['« On s’est déjà vus. »', '« En bas. »', '« Je bois beaucoup. »'],
      effects: { flag: 'elephant-salue' },
    },

    {
      speaker: 'L’Éléphant',
      lines: ['« Combien de pas, d’ici jusqu’à la mer ? »'],
      enigme: {
        reponses: ['Beaucoup', 'Douze mille', 'Je ne sais pas'],
        bonne: 2,
        juste: {
          lines: [
            '« Moi non plus. »',
            'Il se pousse. Derrière lui, l’escalier du toit.',
            '« Passe. »',
          ],
          effects: { flag: 'enigme-elephant' },
        },
        faux: { lines: ['« Non. »', '« Tu ne sais pas. »', '« Dis-le. »'] },
      },
    },
  ],

  // ------------------------------------------------------------- la place
  /**
   * **Le tram arrêté.** La chose la plus grosse de la place, et elle ne sert à rien. Le
   * conducteur ne s'excuse pas : il fait trop chaud, c'est un argument.
   */
  tram: [
    {
      lines: [
        'Un tramway, arrêté au milieu de la place.',
        'Les portes sont ouvertes.',
        'Il n’y a personne dedans.',
      ],
    },
  ],

  'conducteur-tram': [
    {
      when: () => state.flag('tram-explique'),
      speaker: 'Le conducteur',
      lines: ['« Toujours trop chaud. »'],
    },
    {
      speaker: 'Le conducteur',
      lines: [
        '« Il ne roule pas. »',
        '« Les rails ont chaud. »',
        '« Moi aussi, d’ailleurs. »',
      ],
      effects: { flag: 'tram-explique' },
    },
  ],

  accordeon: [
    {
      lines: [
        'Un monsieur joue de l’accordéon.',
        'Toujours les six mêmes notes.',
        'Il recommence.',
      ],
    },
  ],

  /** Le mobilier de la ville. Il ne sert à rien, et il répond quand on lui parle. */
  banc: [
    {
      lines: ['Un banc.', 'La pierre est brûlante.', 'Personne ne s’assoit là aujourd’hui.'],
    },
  ],

  poubelle: [
    { lines: ['Une poubelle de ville.', 'Nino ne regarde pas dedans.', 'Il a bien réfléchi.'] },
  ],

  pigeon: [
    {
      lines: [
        'Un pigeon.',
        'Il ne s’envole pas. Il se décale de trois pas.',
        'Il attend que Nino parte.',
      ],
    },
  ],

  arbre: [
    {
      lines: [
        'Le seul arbre de la cour.',
        'Toute l’ombre de l’école tient dessous.',
        'Il n’y a personne dedans.',
      ],
    },
  ],

  /**
   * **L'Éléphant des Machines, la première fois.** Douze mètres de bois et d'acier, en train
   * de boire dans l'Erdre — et personne sur le quai ne s'arrête. C'est cette rencontre-là qui
   * rend drôle la deuxième, trente-et-un étages plus haut : on ne demandera jamais comment il
   * est monté, mais on saura qu'il était en bas.
   */
  'elephant-erdre': [
    {
      when: () => state.flag('elephant-vu'),
      lines: ['L’éléphant boit toujours.', 'Ça doit faire beaucoup d’eau.'],
    },
    {
      lines: [
        'Un éléphant de douze mètres boit dans l’Erdre.',
        'Il est en bois, et il bouge les oreilles.',
        'Personne sur le quai ne s’arrête.',
      ],
      effects: { flag: 'elephant-vu' },
    },
  ],

  // ---------------------------------------------------------- l'école
  'grille-ecole': [
    {
      lines: [
        'La grille de l’école, grande ouverte.',
        'Un jour sans classe, et il y a du monde dans la cour.',
        'Personne ne trouve ça bizarre.',
      ],
    },
  ],

  'panneau-ecole': [
    { lines: ['Des dessins sont accrochés derrière la vitre.', 'Il y en a un de Nino.'] },
  ],

  /**
   * **La maîtresse et le projet d'art.** Le seul devoir du jeu, et il n'a pas de bonne
   * réponse : rapporter un objet et dire en quoi c'est de l'art. Les trois explications sont
   * toutes acceptées, elles ne valent simplement pas la même note — et la meilleure est celle
   * que Duchamp aurait donnée. Rien ne se bloque derrière : on peut passer sa vie sans
   * rendre le devoir.
   */
  maitresse: [
    // Un accueil par objet, puis **toujours les mêmes trois explications** : c'est la blague
    // du devoir. Ce qu'on apporte ne change que la tête de la maîtresse ; ce qui compte, c'est
    // ce qu'on en dit. On peut revenir avec autre chose, la meilleure note est gardée.
    ...OFFRABLES.map((id) => ({
      // Il faut qu'elle ait demandé : sinon Nino qui passe avec sa pizza dans la poche se
      // faisait noter avant même d'avoir entendu parler du devoir.
      when: () => state.flag('devoir-donne') && state.has(id),
      speaker: 'La maîtresse',
      lines: ACCUEILS[id],
      devoir: EXPLICATIONS,
    })),
    {
      when: () => state.note > 0,
      speaker: 'La maîtresse',
      lines: ['« C’est noté, Nino. »', '« Rapporte-moi autre chose si tu veux. »'],
    },
    {
      when: () => state.flag('devoir-donne'),
      speaker: 'La maîtresse',
      lines: ['« Alors ? »', '« Un objet, Nino. N’importe lequel. »'],
    },
    {
      speaker: 'La maîtresse',
      lines: [
        '« Bonjour Nino. »',
        '« Ton projet d’art. »',
        '« Rapporte-moi un objet, et explique-moi en quoi c’est de l’art. »',
      ],
      effects: { flag: 'devoir-donne' },
    },
  ],

  copain1: [
    {
      when: () => state.flag('copains-vus'),
      speaker: 'Un copain',
      lines: ['« Tu reviens quand ? »'],
    },
    {
      speaker: 'Un copain',
      lines: [
        '« Nino ! »',
        '« Tu sais que les chats parlent, en fait ? »',
        '« Non ? Bon. Moi non plus. »',
      ],
      effects: { flag: 'copains-vus' },
    },
  ],

  copain2: [
    {
      speaker: 'Un autre copain',
      lines: [
        '« Il raconte n’importe quoi. »',
        '« Les chats ne parlent pas. »',
        '« Et il n’y a pas de poisson dans les baignoires. »',
      ],
    },
  ],

  /** Celui qui a déjà vu une dimension, et qui n'en parle jamais. */
  copain3: [
    {
      lines: [
        'Le troisième copain ne dit rien.',
        'Il regarde Nino un long moment.',
        'Puis il fait oui de la tête, une fois.',
      ],
    },
  ],

  /** Les objets qu'on ramasse pour le projet d'art. Ils ne servent qu'à ça. */
  bouchon: [
    {
      lines: [
        'Le bouchon de la baignoire, posé sur le rebord.',
        'Il a laissé partir un poisson.',
        'Nino le met dans sa poche.',
      ],
      effects: { give: 'bouchon', flag: 'bouchon-pris' },
    },
  ],

  noisette: [
    {
      lines: ['Une noisette, dans un coin de la cour.', 'Nino la ramasse.'],
      effects: { give: 'noisette', flag: 'noisette-prise' },
    },
  ],

  ticket: [
    {
      lines: [
        'Un ticket de tram, par terre.',
        'Poinçonné. Illisible.',
        'Nino le plie en quatre et le garde.',
      ],
      effects: { give: 'ticket', flag: 'ticket-pris' },
    },
  ],

  plume: [
    {
      lines: ['Une plume, sur le quai.', 'Grise, très longue.', 'Nino la prend.'],
      effects: { give: 'plume', flag: 'plume-prise' },
    },
  ],

  /** Le projet d'art, avant de savoir que c'en est un. */
  chaussure: [
    {
      lines: [
        'Une vieille chaussure, sur le quai.',
        'Elle a beaucoup marché, et pas avec Nino.',
        'Il la prend.',
      ],
      effects: { give: 'chaussure', flag: 'chaussure-prise' },
    },
  ],

  'ballon-ecole': [
    {
      lines: [
        'Un ballon, dégonflé.',
        'Il est là depuis le mois dernier.',
        'Nino le prend. Personne ne dit rien.',
      ],
      effects: { give: 'ballon-degonfle', flag: 'ballon-pris' },
    },
  ],

  // ------------------------------------------------------- au pied de la tour
  /** Lever la tête. C'est tout le sujet de cet écran. */
  'tour-vue': [
    {
      lines: [
        'Nino lève la tête.',
        'Des fenêtres, des fenêtres, des fenêtres.',
        'Ça continue au-dessus de l’écran.',
      ],
    },
  ],

  'porte-tour': [
    { lines: ['La porte est ouverte.', 'Dedans, ça sent le tapis et l’ascenseur.'] },
  ],

  'panneau-tour': [
    {
      lines: [
        'TOUR DE BRETAGNE',
        'TRENTE-DEUX ÉTAGES',
        'Nino compte jusqu’à douze, puis renonce.',
      ],
    },
  ],

  'carton-tour': [
    { lines: ['Un carton vide, au pied de la tour.', 'Quelqu’un l’a mis là très soigneusement.'] },
  ],

  // ------------------------------------------------------ la rue des bars
  /**
   * On ne fait que traverser. Tout le monde ici est occupé à quelque chose qui n'a pas de
   * fin, et personne ne s'adresse vraiment à Nino : c'est ce qui rend la ville grande.
   */
  'bar-porte': [
    {
      lines: [
        'Un bar.',
        'Ça sent le café et le sirop.',
        'Des adultes debout parlent tous en même temps.',
      ],
    },
  ],

  /** Le deuxième bar de la rue. Deux portes, deux choses différentes à voir. */
  'bar-porte-2': [
    {
      lines: [
        'Un autre bar, plus petit.',
        'À l’intérieur, un chien dort sous une table.',
        'Il ouvre un œil, puis se rendort.',
      ],
    },
  ],

  'enseigne-bar': [{ lines: ['L’enseigne grince un peu.', 'Elle tourne toute seule.'] }],

  'table-bar': [
    {
      lines: ['Deux verres et un ticket sous un verre.', 'Personne à cette table.'],
    },
  ],

  'compteur-de-fenetres': [
    {
      speaker: 'Un monsieur',
      lines: ['« Quarante-trois. »', '« Quarante-quatre. »', '« Ne me parlez pas, je compte. »'],
    },
  ],

  'dame-baguettes': [
    {
      speaker: 'Une dame',
      lines: [
        '« J’ai acheté douze baguettes. »',
        '« On est deux. »',
        '« Je ne veux pas en parler. »',
      ],
    },
  ],

  'monsieur-immobile': [
    {
      lines: [
        'Un monsieur, parfaitement immobile.',
        'Il attend quelqu’un depuis assez longtemps pour avoir arrêté d’y croire.',
      ],
    },
  ],

  // ------------------------------------------------------ la terrasse, la nuit
  'bar-nuit': [
    {
      lines: [
        'Le bar est encore ouvert.',
        'Dedans, quelqu’un raconte une histoire très drôle à personne.',
      ],
    },
  ],

  /**
   * **La blague de papa.** Il est de dos à la rue, il a bu un demi, et il ne reconnaît pas
   * son fils — ou il fait semblant, et c'est encore mieux. Le rire qui s'éteint tout seul
   * est la seule chose du jeu qui dit que les adultes savent, un peu.
   */
  'papa-terrasse': [
    {
      when: () => state.flag('papa-terrasse-vu'),
      speaker: 'Papa',
      lines: ['« Il vous ressemblait vraiment, hein. »', '« ... »', '« Bon. »'],
    },
    {
      speaker: 'Papa',
      lines: [
        '« Vous savez... »',
        '« J’ai un fils qui vous ressemble comme deux gouttes d’eau. »',
        '« Mais lui il est couché à cette heure-ci. »',
        '« Haha... »',
        '« Haha... »',
        '« Ha. »',
      ],
      effects: { flag: 'papa-terrasse-vu' },
    },
  ],

  parrain: [
    {
      when: () => state.flag('papa-terrasse-vu'),
      speaker: 'Le parrain',
      lines: ['« Ton père est tout mouillé. »', '« Je n’ai rien demandé. »'],
    },
    {
      speaker: 'Le parrain',
      lines: ['« Tiens. »', '« Un client. »', '« Assieds-toi si tu veux. »'],
    },
  ],

  serveur: [
    {
      speaker: 'Le serveur',
      lines: ['« On ferme dans deux heures. »', '« Ou trois. »', '« Ça dépend d’eux. »'],
    },
  ],

  antenne: [
    { lines: ['Une antenne.', 'Elle vibre un peu.', 'C’est le vent, ou c’est la ville.'] },
  ],

  'vue-tour': [
    {
      lines: [
        'Toute la ville éteinte, d’un coup.',
        'Et au-dessus, le ciel entier.',
        'Nino n’avait jamais vu autant d’étoiles.',
      ],
    },
  ],

  /** Le ciel, si on insiste. Il est en train de tourner, et ça compte. */
  'ciel-tour': [
    {
      lines: [
        'Les étoiles ne bougent pas.',
        'Mais le ciel, derrière, commence à être gris.',
        'C’est bientôt le matin.',
      ],
    },
  ],

  parapente: [
    /**
     * **Après le retour seulement.** C'était `parapente-pris`, posé au moment du saut : si le
     * vol s'interrompait — page rechargée, jeu fermé — on retrouvait le toit avec un
     * parapente bien visible et cette phrase qui disait le contraire, sans plus aucune façon
     * de partir. Tant que Nino n'est pas rentré, le parapente est là et il repart.
     */
    {
      when: () => state.flag('parapente-rentre'),
      lines: ['Il n’y a plus de parapente sur le toit.', 'Il est sous son lit.'],
    },
    {
      lines: [
        'Un parapente, plié contre le parapet.',
        'À qui il est, on ne sait pas.',
        'Il faut rentrer avant que ses parents se réveillent.',
      ],
    },
  ],

  'parapente-envol': [
    {
      lines: [
        'Nino déplie le parapente.',
        'La maison est très loin, et sa fenêtre est toute petite.',
        'Sauter ?',
      ],
      choice: {
        oui: { lines: ['Nino saute.'], effects: { flag: 'parapente-pris' } },
        non: {
          lines: ['Nino replie le parapente.', 'Il reste un moment à regarder la ville.'],
        },
      },
    },
  ],

  // ---------------------------------------------------------------- Nantes
  'velos-ville': [{ lines: ['Trois vélos.', 'Six pneus à plat.'] }],

  passant: [
    {
      lines: [
        'Un monsieur en chemise passe très vite.',
        '« Il fait trente-quatre, hein ! »',
        'Il est déjà loin.',
      ],
    },
  ],

  /**
   * Le panneau de la place. **Il sert vraiment** : depuis que la ville fait six écrans, il
   * faut bien que quelque chose dise où mène quoi. Les distances sont fausses.
   */
  'panneau-directions': [
    {
      lines: [
        'ÉCOLE 200 m — QUAI DE L’ERDRE 400 m',
        'TOUR DE BRETAGNE 1 km',
        'Nino ne sait pas ce que c’est, un kilomètre.',
      ],
    },
  ],

  'panneau-erdre': [
    {
      lines: ['Une plaque bleue : QUAI DE L’ERDRE.', 'Une flèche pointe vers l’eau.'],
    },
  ],

  // ----------------------------------------------------------------- l'Erdre
  'papa-capitaine': [
    // L'eau lui arrive au chapeau : il n'y a plus de conversation possible.
    {
      when: () => state.flag('papa-dans-leau'),
      speaker: 'Papa',
      lines: ['« Blublublub. »'],
    },
    // Le bateau descend, et il trouve encore que tout va bien.
    {
      when: () => state.flag('bateau-coule'),
      speaker: 'Papa',
      lines: ['« Ne reste pas là. »', '« Enfin, si. Reste. »', '« Mais ne dis rien. »'],
    },
    {
      when: () => !state.flag('papa-capitaine-vu'),
      speaker: 'Papa',
      lines: [
        'Sur le bateau, il y a Papa.',
        'Il porte un chapeau de capitaine.',
        '« Ah, Nino ! Monte pas, ça bouge. »',
        '« Tu diras à ta mère que je suis resté au salon. »',
      ],
      effects: { flag: 'papa-capitaine-vu' },
    },
    {
      speaker: 'Papa',
      lines: ['« Cinq minutes, Nino. »', 'Le bateau ne bouge pas d’un centimètre.'],
    },
  ],

  bateau: [
    {
      when: () => state.flag('bateau-coule'),
      lines: ['Le bateau descend.', 'Très lentement, très régulièrement.'],
    },
    {
      lines: [
        'Un grand bateau blanc, au bout du quai.',
        'Il n’est attaché à rien, à part une corde.',
      ],
    },
  ],

  quai: [
    {
      when: () => !state.flag('pieds-eau'),
      lines: [
        'Nino s’assoit sur le quai et laisse pendre ses pieds dans l’Erdre.',
        'L’eau est froide. Vraiment froide.',
        'Quelque chose, en dessous, lui touche la cheville et repart.',
      ],
      effects: { flag: 'pieds-eau' },
    },
    {
      lines: ['L’eau est toujours là.', 'La chose en dessous aussi, sans doute.'],
    },
  ],
};
