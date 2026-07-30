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
import type { Bareme, DialogueBeat, Devoir } from './dialogues';
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
    'La page est vide, pour l’instant.',
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
  // Le bateau vient de pencher : c'est tout ce qu'il en dit, et il continue à visser.
  '« Hm… pas bon. »',
  '« Ce n’est rien. »',
  '« C’est de l’eau. »',
  '« Un capitaine ne quitte pas son navire. »',
  '« Ça va se stabiliser. »',
  '« Bon. »',
  '« Blublublub. »',
];

/**
 * **La joie d'avoir un bateau**, telle qu'on en parle à une terrasse — et **ce n'est pas la même
 * conversation** selon ce que Nino a fait de son après-midi.
 *
 * S'il a coulé le bateau, le parrain s'enthousiasme pour la liberté du marin sans savoir, et papa
 * approuve **au conditionnel** : le « ahem » fait tout le travail, personne ne dit ce qui s'est
 * passé, et Nino est le seul à la table à savoir pourquoi.
 *
 * Si le bateau flotte encore, ils parlent du bouchon qui fuit — et papa promet une sortie en mer
 * qu'il sait très bien ne pas pouvoir tenir. La même gêne, à un naufrage près.
 */
export const LA_JOIE_DU_BATEAU: Record<'coule' | 'flotte', Array<{ qui: string; lignes: string[] }>> =
  {
    coule: [
      {
        qui: 'Le parrain',
        lignes: ['« Ce qui est bien, avec un bateau… »', '« C’est qu’on part quand on veut. »'],
      },
      { qui: 'Le parrain', lignes: ['« Personne ne te demande rien. »', '« Moi, j’en rêve. »'] },
      { qui: 'Papa', lignes: ['« Oh oui. »', '« Ça doit être bien… »', '« Ahem. »'] },
    ],
    flotte: [
      { qui: 'Le parrain', lignes: ['« Alors, ce bouchon ? »'] },
      { qui: 'Papa', lignes: ['« Réglé. »', '« Enfin. »', '« Presque. »'] },
      { qui: 'Le parrain', lignes: ['« Tu m’emmènes, un jour ? »', '« En mer. »'] },
      { qui: 'Papa', lignes: ['« Bien sûr. »', '« Quand le bouchon tiendra. »', '« Ahem. »'] },
    ],
  };

/**
 * **Ce qu'il dit quand la vitre casse et que personne ne gronde.** Rien d'utile : il rit. C'est sa
 * seule contribution, et il n'a jamais rien proposé à personne.
 */
export const ECUREUIL_RIT = '« Hé hé hé. »';

/**
 * **Papa bricole tout haut.** Il ne voit pas Nino : il a un bouchon qui fuit, et il commente son
 * propre travail comme on le fait quand on est seul sur un bateau. Ces phrases sortent toutes
 * seules, au-dessus de lui, sans boîte et sans qu'on ait rien demandé — c'est ce qui le rend
 * occupé. Un père occupé est un père qu'on peut regarder sans lui parler.
 */
export const PAPA_BRICOLE = [
  '« Si je mets ça là… »',
  '« Hmm. Ça vient d’où, ça ? »',
  '« Un coup de scie ici, quelques clous là. »',
];

/**
 * **Sa conclusion sous l'averse.** Sa femme part en courant avec sa fille sous le bras, il pleut
 * sur tout l'écran, et lui ne lève pas la tête de sa coque. La météo, c'est un sujet.
 */
export const PAPA_GRAIN = '« On dirait qu’un gros grain se prépare. »';

/**
 * **Ce que papa dit en nageant.** Il remonte tout seul, il a gardé son chapeau, et il s'en va
 * vers la droite en nage tranquille. Le poisson n'y est pour rien : on le voyait à côté de lui
 * sans comprendre ce qu'il faisait là, et un poisson qui remorque un adulte ne se lit pas.
 *
 * Une phrase flottante pendant qu'il nage, et rien d'autre : ce qui se voit ne se raconte pas.
 */
export const PAPA_NAGE = '« Ne dis rien à ta mère. »';

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

/**
 * **Le pigeon.** Il ne s'envole pas, il ne parle pas, il ne s'arrête pas : il se décale, et il
 * continue ce qu'il faisait. Une boîte par visite, dans l'ordre, puis on recommence — et le
 * pigeon s'écarte **quand la boîte se ferme**, pas avant : on lit ce qu'il fait, puis il le
 * fait, et on le voit.
 */
export const PIGEON: string[][] = [
  ['Un pigeon.', 'Il regarde le sol comme s’il y avait quelque chose.', 'Il n’y a rien.'],
  ['Le pigeon se décale de trois pas.', 'Il n’a pas regardé Nino une seule fois.'],
  ['Nino s’approche du pigeon.', 'Le pigeon fait comme s’il n’y avait personne.'],
  [
    'Le pigeon tourne la tête vers le trottoir vide.',
    'Il regarde exprès ailleurs.',
    'Pour avoir l’air occupé.',
  ],
  ['Le pigeon a autre chose à faire.', 'Il s’éloigne, sans se presser.'],
  ['Nino dit bonjour au pigeon.', 'Le pigeon continue de marcher.'],
];

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
  dessin: {
    nom: 'Dessin froissé',
    desc: 'Repêché au-dessus de la poubelle, devant l’école. Ce n’est pas celui de Nino. Quelqu’un l’a jeté, et maintenant il est plié en quatre dans sa poche.',
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
    role: 'Le poisson de la baignoire. Raconte sa vie avant de demander de l’aide, et n’en demande que quand le chat s’assoit au bord. Remercie plus tard, dans l’Erdre — puis part pour la mer, dans la trompe d’un éléphant.',
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
  'dessin',
  'chaussure',
  'bouchon',
  'noisette',
  'ticket',
  'ballon-degonfle',
  'plume',
  'pizza',
];

/**
 * **La discussion du projet d'art, objet par objet.**
 *
 * Chaque objet a son accueil (ce que la maîtresse dit en le voyant arriver sur sa table, la
 * dernière ligne étant sa première question) puis **deux questions**, avec trois réponses
 * chacune. Aucune n'est fausse ; elles valent de zéro à trois points, et le total donne la note
 * par le barème plus bas.
 *
 * Le principe d'écriture : **la réponse qui rapporte le plus est celle qui regarde l'objet
 * pour ce qu'il est**, pas celle qui cherche à faire joli. Et « je l'ai décidé » gagne toujours,
 * parce que c'est la réponse de Duchamp et que la maîtresse le sait.
 *
 * Les réponses tiennent en vingt caractères : la fenêtre de choix fait cent seize pixels
 * utiles, au-delà elles sont coupées en deux.
 */
const ACCUEILS: Record<string, string[]> = {
  chaussure: [
    '« Ah ! Tu as apporté quelque chose. »',
    'Nino pose une vieille chaussure sur la table.',
    '« À qui elle est, cette chaussure ? »',
  ],
  bouchon: [
    'Nino pose un bouchon de baignoire sur la table.',
    '« Un bouchon. »',
    '« Pourquoi celui-là ? »',
  ],
  noisette: [
    'Nino pose une noisette sur la table.',
    'La maîtresse la regarde. La noisette ne bouge pas.',
    '« Tu l’as trouvée où ? »',
  ],
  ticket: [
    'Nino pose un ticket de tram sur la table.',
    '« Poinçonné, en plus. »',
    '« Il va où, ce ticket ? »',
  ],
  'ballon-degonfle': [
    'Nino pose le ballon dégonflé de la rue sur la table.',
    '« Celui-là ? Il est à l’école, Nino. »',
    '« Tu l’as pris comment ? »',
  ],
  plume: [
    'Nino pose une plume sur la table.',
    '« Oh. »',
    '« De quel oiseau ? »',
  ],
  pizza: [
    'Nino pose un bout de pizza sur la table.',
    '« ... »',
    '« Elle est mâchée ? »',
  ],
  dessin: [
    'Nino déplie un dessin froissé sur la table.',
    '« Ah. »',
    '« Où tu l’as trouvé ? »',
  ],
};

/** Une question, ses trois réponses, et ce que chacune vaut. */
const DEVOIRS: Record<string, Devoir> = {
  chaussure: {
    etapes: [
      {
        reponses: ['À personne', 'À moi', 'Je ne sais pas'],
        retours: [
          { points: 2, lines: ['« Une chaussure à personne. »', '« Bon. »'] },
          { points: 0, lines: ['« Elle est beaucoup trop grande. »'] },
          { points: 3, lines: ['« Voilà. »', '« C’est déjà une réponse. »'] },
        ],
      },
      {
        lines: ['« Et en quoi c’est de l’art ? »'],
        reponses: ['Elle a marché', 'Elle est sale', 'Je l’ai décidé'],
        retours: [
          { points: 2, lines: ['« Longtemps, et on ne sait pas où. »'] },
          { points: 0, lines: ['« Ça, c’est vrai. »'] },
          { points: 3, lines: ['La maîtresse repose la chaussure très doucement.'] },
        ],
      },
    ],
  },
  bouchon: {
    etapes: [
      {
        reponses: ['Il a sauvé un poisson', 'Il traînait', 'Il est joli'],
        retours: [
          { points: 3, lines: ['« Un bouchon qui sauve un poisson. »', '« Continue. »'] },
          { points: 0, lines: ['« Ah. »'] },
          { points: 1, lines: ['« Il est rond, c’est sûr. »'] },
        ],
      },
      {
        lines: ['« Et en quoi c’est de l’art ? »'],
        reponses: ['Il ne bouche plus rien', 'Il a servi', 'C’est rond'],
        retours: [
          { points: 3, lines: ['« Un bouchon qui ne bouche plus. »', '« Oui. »'] },
          { points: 2, lines: ['« À quelque chose d’important, même. »'] },
          { points: 0, lines: ['« Oui. »', '« Bon. »'] },
        ],
      },
    ],
  },
  noisette: {
    etapes: [
      {
        reponses: ['Un écureuil', 'Dans ma cour', 'Je ne sais plus'],
        retours: [
          { points: 3, lines: ['« Un écureuil l’a oubliée. »', '« Évidemment. »'] },
          { points: 1, lines: ['« Elle était là, comme ça. »'] },
          { points: 2, lines: ['« Personne ne sait, alors. »'] },
        ],
      },
      {
        lines: ['« Et en quoi c’est de l’art ? »'],
        reponses: ['Il y a un arbre dedans', 'C’est petit', 'Ça se mange'],
        retours: [
          { points: 3, lines: ['« ... »', '« Un arbre entier, là-dedans. »'] },
          { points: 2, lines: ['« Petit, et personne ne la regarde. »'] },
          { points: 0, lines: ['« Pas celle-là. Elle est vide. »'] },
        ],
      },
    ],
  },
  ticket: {
    etapes: [
      {
        reponses: ['Nulle part', 'Il a déjà servi', 'À l’Erdre'],
        retours: [
          { points: 3, lines: ['« Un ticket qui ne va nulle part. »', '« Bien. »'] },
          { points: 2, lines: ['« Quelqu’un est monté avec, oui. »'] },
          { points: 1, lines: ['« Le tram ne va pas jusqu’à l’eau. »'] },
        ],
      },
      {
        lines: ['« Et en quoi c’est de l’art ? »'],
        reponses: ['Je l’ai décidé', 'Il a été gardé', 'C’est du papier'],
        retours: [
          { points: 3, lines: ['« Voilà. »', '« C’est exactement ça. »'] },
          { points: 2, lines: ['« Par terre, ce n’est pas gardé. »', '« Mais presque. »'] },
          { points: 0, lines: ['« Du papier, oui. »'] },
        ],
      },
    ],
  },
  'ballon-degonfle': {
    etapes: [
      {
        reponses: ['Il m’a suivi', 'Il était tout seul', 'Je l’ai pris'],
        retours: [
          { points: 3, lines: ['« Il t’a suivi. »', '« D’accord. »'] },
          { points: 2, lines: ['« Depuis le mois dernier, oui. »'] },
          { points: 1, lines: ['« Au moins tu le dis. »'] },
        ],
      },
      {
        lines: ['« Et en quoi c’est de l’art ? »'],
        reponses: ['Il ne rebondit plus', 'On a joué avec', 'Il est rond'],
        retours: [
          { points: 3, lines: ['« Un ballon qui ne rebondit plus. »', '« C’est triste et c’est beau. »'] },
          { points: 2, lines: ['« Toute l’école a joué avec. »'] },
          { points: 0, lines: ['« Plus vraiment, justement. »'] },
        ],
      },
    ],
  },
  plume: {
    etapes: [
      {
        reponses: ['Un héron', 'Je ne sais pas', 'Un pigeon'],
        retours: [
          { points: 3, lines: ['« Un héron. »', '« Tu l’as vu ? »', '« Bien. »'] },
          { points: 2, lines: ['« Un oiseau, en tout cas. »'] },
          { points: 1, lines: ['« Les pigeons n’ont pas de plumes comme ça. »'] },
        ],
      },
      {
        lines: ['« Et en quoi c’est de l’art ? »'],
        reponses: ['Elle volait', 'Je l’ai décidé', 'Elle est douce'],
        retours: [
          { points: 3, lines: ['« Elle volait, et maintenant elle est là. »'] },
          { points: 3, lines: ['« Voilà. »', '« C’est ça. »'] },
          { points: 1, lines: ['« Oui. »'] },
        ],
      },
    ],
  },
  dessin: {
    etapes: [
      {
        reponses: ['Dans la poubelle', 'Par terre', 'C’est le mien'],
        retours: [
          { points: 3, lines: ['« Dans la poubelle. »', '« Oui. C’est là qu’il était. »'] },
          { points: 1, lines: ['« Les dessins finissent par terre, c’est vrai. »'] },
          { points: 0, lines: ['« Non. »', '« Celui-là n’est pas de toi, Nino. »'] },
        ],
      },
      {
        lines: ['« Et en quoi c’est de l’art ? »'],
        reponses: ['Quelqu’un l’a jeté', 'Je l’ai décidé', 'C’est un dessin'],
        retours: [
          { points: 3, lines: ['« Jeté, et te voilà avec. »', '« Oui. »'] },
          { points: 3, lines: ['« Voilà. »', '« C’est ça. »'] },
          { points: 1, lines: ['« Un dessin, oui. »'] },
        ],
      },
    ],
  },
  pizza: {
    etapes: [
      {
        reponses: ['C’est le chat', 'Elle était comme ça', 'C’est moi'],
        retours: [
          { points: 3, lines: ['« Le chat. »', '« Bien sûr. »'] },
          { points: 0, lines: ['« Mmh. »'] },
          { points: 1, lines: ['« Au moins tu le dis. »'] },
        ],
      },
      {
        lines: ['« Et en quoi c’est de l’art ? »'],
        reponses: ['Je l’ai décidé', 'Quelqu’un l’a commencée', 'Ça se mange'],
        retours: [
          { points: 3, lines: ['« ... »', '« Tu as gagné, Nino. »'] },
          { points: 2, lines: ['« Un chat, mais quelqu’un. »'] },
          { points: 0, lines: ['« Plus maintenant. »'] },
        ],
      },
    ],
  },
};

/**
 * **Le barème.** Six points au maximum, quatre notes possibles, et **jamais de mauvaise
 * note** : le pire qu'on puisse faire est huit sur vingt pour avoir apporté quelque chose. La
 * première ligne dont `min` est atteint gagne, donc l'ordre est décroissant.
 */
/**
 * **Ce que dit un poisson qu'on envoie à la mer.** Une seule voyelle, tenue le temps du vol : il
 * n'a rien demandé de plus précis, et il avait dit d'accord.
 */
/**
 * **Ce qu'il se dit une fois le quai vide.** Trois mots, au moment où la caméra est revenue sur
 * lui : c'est le seul commentaire de toute la scène, et il ne raconte rien qu'on ait vu — il dit
 * ce que Nino en conclut, c'est-à-dire qu'il l'a échappé belle.
 */
export const MAMAN_PARTIE = ['Elle ne nous a pas vus…'];

export const POISSON_PART = { qui: 'Le poisson', lignes: ['« Aaaaaaaaaaaaaah. »'] };

export const BAREME: Bareme[] = [
  { min: 6, note: 20, lines: ['« ... »', '« Vingt sur vingt. »', '« Ne le dis pas aux autres. »'] },
  { min: 4, note: 16, lines: ['« Seize sur vingt. »', '« C’est très joli, ce que tu dis. »'] },
  { min: 2, note: 12, lines: ['« Douze sur vingt. »', '« C’est un début. »'] },
  { min: 0, note: 8, lines: ['« Huit sur vingt. »', '« Tu as apporté quelque chose, c’est déjà ça. »'] },
];

  /**
 * **La discussion au bord de l'eau.** Nino n'est pas dans cette conversation : il tombe dessus.
 * Le poisson se demande ce qu'il y a plus loin, l'éléphant répond « la mer », et ça finit par
 * un poisson dans une trompe. C'est comme ça que la pluie arrive — pas parce qu'on l'a
 * demandée, mais parce que deux animaux avaient une idée.
 *
 * Elle ne se déclenche qu'une fois qu'on a vu Maman sur son banc : avant, il n'y a pas de
 * problème à résoudre, et une conversation qui donne la solution avant l'énigme est un couloir.
 */
export const AU_BORD_DE_LEAU: Array<{ qui: string; lignes: string[] }> = [
  { qui: 'Le poisson', lignes: ['« Je me demande ce qu’il y a plus loin. »'] },
  { qui: 'L’Éléphant', lignes: ['« La mer. »'] },
  { qui: 'Le poisson', lignes: ['« C’est comment ? »'] },
  { qui: 'L’Éléphant', lignes: ['« Salé. »'] },
  { qui: 'Le poisson', lignes: ['« J’aimerais voir ça un jour. »'] },
  { qui: 'L’Éléphant', lignes: ['« Je peux t’aider. »', '« Monte dans ma trompe. »'] },
  { qui: 'Le poisson', lignes: ['« ... »', '« D’accord. »'] },
];


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
    { lines: ['L’album n’est plus là.', 'Il reste un vide sur l’étagère.'] },
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

  /**
   * **Qui gronde dépend de qui est là.** Papa tant qu'il est dans le salon ; Maman si elle est
   * rentrée sous la pluie de l'éléphant ; et **personne** entre les deux — papa est sur son bateau
   * ou à sa terrasse, la maison est vide, et une vitre qui casse dans une maison vide ne fait pas
   * de bruit. Il ne reste que l'écureuil, qui rit.
   *
   * Dans les deux cas où il y a quelqu'un, c'est le chat qui prend : c'est toujours le chat.
   */
  'fenetre-cassee': [
    {
      when: () => !state.flag('parents-sortis'),
      speaker: 'Papa',
      lines: ['« NON MAIS CE CHAT. »'],
    },
    {
      when: () => state.flag('maman-quai-partie'),
      speaker: 'Maman',
      lines: ['« NON MAIS CE CHAT. »'],
    },
  ],

  // ------------------------------------------------ la Tour de Bretagne
  /**
   * **Pourquoi on ne passe pas à l'est.** Ce n'est pas une porte fermée, c'est **Maman assise
   * au bout du quai**, Hermione sur les genoux, en train d'attendre papa. Elle regarde le
   * bateau, donc elle regarde aussi le passage. Il faudra qu'elle s'en aille d'elle-même — et
   * elle ne s'en ira que s'il se met à pleuvoir.
   */
  /**
   * **La maison est fermée.** Maman est rentrée se mettre à l'abri de la pluie qu'un éléphant a
   * fabriquée, et Nino est dehors à une heure où il devrait dormir. On ne raconte pas la punition :
   * il suffit qu'il n'ait aucune envie d'ouvrir cette porte.
   */
  'maison-fermee': [
    {
      lines: ['Maman est rentrée.', 'Elle est là, derrière la porte.', 'Ce n’est pas le moment.'],
    },
  ],

  'quai-est': [
    {
      lines: [
        'Le quai continue derrière le banc.',
        'Maman est assise dessus, Hermione sur les genoux.',
        'Impossible de passer sans qu’elle le voie.',
      ],
    },
  ],

  /**
   * **Ce n'est pas elle qui le repère : c'est lui qui s'arrête.** Il les voit avant d'être vu, il
   * comprend le problème tout seul, et il ne va pas plus loin. Un enfant qui se fait attraper par
   * sa mère n'a rien à résoudre ; un enfant qui la voit de loin, oui.
   */
  'maman-voit': [
    // Les fois suivantes, une ligne : il le sait déjà, et relire les trois mêmes phrases à
    // chaque pas vers la droite finirait par ressembler à un mur qui parle.
    {
      when: () => state.flag('maman-quai-vue'),
      lines: ['Ils sont toujours là.'],
    },
    {
      lines: [
        'C’est Maman.',
        'Et papa est sur son bateau.',
        'Ils ne doivent pas nous voir.',
      ],
      effects: { flag: 'maman-quai-vue' },
    },
  ],

  /** Ce que Maman en conclut, et ce qu'elle fait — très vite. */
  'maman-pluie': [
    {
      speaker: 'Maman',
      // On ne raconte pas qu'elle part en courant : on la regarde partir en courant.
      lines: ['Maman lève la tête.', '« Il pleut ! »'],
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
    /**
     * **Son énigme n'en est pas une, et c'est ça l'énigme.** Elle récite un poème auquel personne ne
     * peut rien comprendre — c'est un poème, pas une devinette — et elle demande ce que ça veut
     * dire. La bonne réponse est de ne rien chercher : c'est beau, ça suffit.
     *
     * Elle est poétesse depuis dix haïkus dans une mezzanine. On ne pouvait pas lui donner une
     * charade à la place.
     */
    {
      speaker: 'L’araignée',
      lines: [
        '« Le fer blanc du mardi »',
        '« ne dort jamais deux fois »',
        '« sous la même chaussette. »',
        '« Qu’est-ce que ça veut dire ? »',
      ],
      enigme: {
        reponses: ['C’est un beau poème', 'Que tu as perdu une chaussette', 'Rien du tout'],
        bonne: 0,
        juste: {
          lines: [
            '« Voilà. »',
            '« Ça ne veut rien dire. »',
            '« C’est un poème. »',
            'Elle tire un fil. Les marches suivantes apparaissent.',
          ],
          effects: { flag: 'enigme-araignee' },
        },
        faux: { lines: ['« Non. »', '« Tu cherches trop. »', '« Écoute encore. »'] },
      },
    },
  ],

  elephant: [
    // **La seule fois où quelqu'un se pose la question.** Un éléphant de douze mètres sur un palier
    // du trentième étage, et personne n'a jamais expliqué comment. Nino, lui, la pense.
    {
      when: () => !state.flag('elephant-tour-vu'),
      lines: ['Comment il est arrivé ici ?…'],
      effects: { flag: 'elephant-tour-vu' },
    },
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

  /**
   * **Celle de l'école, où il y a quelque chose.** Un dessin froissé posé dessus, jeté par
   * quelqu'un — et c'est exactement l'objet qu'un projet d'art réclame. Le choix compte : on
   * peut refuser de regarder, et la blague de la poubelle reste intacte.
   */
  'poubelle-ecole': [
    {
      when: () => state.has('dessin') || state.flag('dessin-pris'),
      lines: ['La poubelle de l’école.', 'Il n’y a plus rien d’intéressant dedans.'],
    },
    {
      lines: [
        'La poubelle, devant l’école.',
        'Il y a un papier froissé posé dessus.',
        'Regarder ?',
      ],
      choice: {
        oui: {
          lines: [
            'C’est un dessin.',
            'Ce n’est pas celui de Nino.',
            'Il le déplie, le replie en quatre, et le garde.',
          ],
          effects: { give: 'dessin', flag: 'dessin-pris' },
        },
        non: { lines: ['Nino ne regarde pas dedans.', 'Il a bien réfléchi.'] },
      },
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
  'panneau-ecole': [
    {
      lines: [
        'Le panneau d’affichage, accroché à la grille fermée.',
        'Des dessins derrière la vitre.',
        'Il y en a un de Nino.',
      ],
    },
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
      devoir: DEVOIRS[id],
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
        'Un ballon dégonflé, dans la rue.',
        'Il est passé par-dessus la grille il y a longtemps.',
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
    // Il n'est trempé que s'il est tombé à l'eau : le naufrage n'est pas obligatoire, et la
    // terrasse ne doit pas raconter une baignade qui n'a pas eu lieu.
    {
      when: () => state.flag('papa-terrasse-vu') && state.flag('bateau-coule'),
      speaker: 'Le parrain',
      lines: ['« Ton père est tout mouillé. »', '« Je n’ai rien demandé. »'],
    },
    {
      when: () => state.flag('papa-terrasse-vu'),
      speaker: 'Le parrain',
      lines: ['« Il t’a raconté son bouchon ? »', '« À moi, deux fois. »'],
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
        'Personne ne l’a réclamé.',
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

  /**
   * **Le monsieur du thermomètre.** Il traverse la place en annonçant la température à qui
   * veut, et elle monte à chaque fois qu'on le croise. Il ne répond jamais à Nino, il
   * l'informe — et à la fin il n'a plus de chiffres, seulement l'ombre qui n'existe pas.
   */
  passant: [
    {
      when: () => state.flag('passant-4'),
      speaker: 'Le monsieur',
      lines: ['« Je ne dis plus rien. »', '« Ça ne sert à rien de le dire. »'],
    },
    {
      when: () => state.flag('passant-3'),
      speaker: 'Le monsieur',
      lines: [
        '« Trente-neuf à l’ombre. »',
        '« Il n’y a pas d’ombre. »',
        'Il repart, très droit.',
      ],
      effects: { flag: 'passant-4' },
    },
    {
      when: () => state.flag('passant-2'),
      speaker: 'Le monsieur',
      lines: [
        '« Trente-sept. »',
        '« J’ai un thermomètre dans la poche. »',
        '« Il ne se trompe jamais. »',
      ],
      effects: { flag: 'passant-3' },
    },
    {
      when: () => state.flag('passant-1'),
      speaker: 'Le monsieur',
      lines: ['« Trente-cinq, maintenant. »', '« Ça monte encore. »'],
      effects: { flag: 'passant-2' },
    },
    {
      speaker: 'Le monsieur',
      lines: [
        'Un monsieur en chemise s’arrête juste devant Nino.',
        '« Il fait trente-quatre. »',
        'Puis il repart, comme s’il avait fait sa commission.',
      ],
      effects: { flag: 'passant-1' },
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
        'La flèche de la tour pointe vers le haut de la rue.',
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
    /**
     * **Il bricole, et il ne lève pas la tête.** Maman l'attend au bout du quai avec Hermione :
     * il n'a plus d'alibi à donner à personne, il a un bouchon qui fuit. C'est aussi là que
     * Nino entend parler du bouchon pour la première fois.
     */
    {
      when: () => !state.flag('papa-capitaine-vu'),
      speaker: 'Papa',
      lines: [
        'Sur le bateau, il y a Papa, à genoux dans la coque.',
        'Il porte son chapeau de capitaine.',
        '« Deux minutes, Nino ! »',
        '« J’ai un bouchon qui fuit. »',
      ],
      effects: { flag: 'papa-capitaine-vu' },
    },
    {
      speaker: 'Papa',
      lines: ['« Deux minutes. »', 'Ça fait deux minutes depuis un moment.'],
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
