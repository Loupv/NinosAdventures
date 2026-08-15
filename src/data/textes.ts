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

/**
 * L'écran-titre.
 *
 * **Repartir à zéro se demande deux fois.** La touche efface une partie entière — parfois plusieurs
 * heures de chasse à Hermione — et l'écran-titre est le premier endroit où un enfant de sept ans
 * essaie toutes les touches pour voir. Une question, deux réponses, et personne ne perd sa nuit par
 * curiosité.
 */
export const TITRE = {
  ligne1: 'LES AVENTURES',
  ligne2: 'DE NINO',
  continuer: 'ESPACE : CONTINUER',
  commencer: 'APPUIE SUR ESPACE',
  recommencer: 'R : REPARTIR À ZÉRO',
  effacer: 'TOUT EFFACER ?',
  effacerOui: 'ESPACE : OUI',
  effacerNon: 'ÉCHAP : NON',
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
  pagePlantes: 'PLANTES',
  /** Le compte des plantes arrosées, en haut de sa page. */
  plantesComptees: (n: number, total: number) => `Plantes sauvées : ${n} sur ${total}.`,
  aucunePlante: [
    'Aucune plante arrosée.',
    '',
    'Il fait chaud pour tout',
    'le monde, même pour ce',
    'qui ne parle pas.',
  ],
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
    // Trente caractères par ligne : au-delà, le journal coupe au bord du cadre.
    'La page est vide.',
    'Pour l’instant.',
  ],
  lieuInconnu: '?  . . . . . . . .',
};

/** Ce que le jeu annonce en passant, dans le petit bandeau. */
export const ANNONCES = {
  hermioneTrouvee: (n: number, total: number) => `Hermione retrouvée !  ${n}/${total}`,
  objetRecu: (nom: string) => `${nom} !`,
  pieceTrouvee: (nom: string) => `${nom} !`,
};

/** Le rêve de la fusée, dans le grand lit. */
export const FUSEE = {
  consigne: 'Nino sur une fusée.',
  demarrer: 'ESPACE pour pousser',
  score: (n: number) => `${n} tuyau${n > 1 ? 'x' : ''}.`,
  // Les deux commandes tiennent sur une seule ligne de cent soixante pixels : au-delà, elles
  // sortaient de l'écran par les deux bords.
  reessayer: 'ESPACE encore',
  gagnePiece: 'Une pièce.',
  gagneEncore: 'Encore une fois.',
  reveil: 'ESPACE pour te réveiller',
  /** Rien n'obligeait à le dire, et personne ne trouvait la sortie du rêve. */
  abandonner: 'ÉCHAP réveil',
};

/** Le vol en parapente, depuis le toit de la tour. */
export const VOL = {
  consigne: 'Viser sa fenêtre.',
  demarrer: 'ESPACE saut   ÉCHAP toit',
  rafale: 'Une rafale.',
  /** Les hérons de l'Erdre rentrent à la même heure que lui — annoncés quand on les voit. */
  heron: 'Des hérons !',
  heronTouche: 'Le héron n’a pas aimé.',
  /** Quand la maison apparaît au loin : la cible, dite par ce qui la distingue. */
  maison: 'La fenêtre qui clignote !',
  /** On repasse au-dessus de la rivière, à mi-vol : le seul repère que Nino connaît. */
  erdre: 'L’Erdre !',
  /** Et quand il rentre dans un immeuble, ce qui arrive. */
  immeuble: 'Boum.',
  immeubleEncore: 'Pardon !',
  /** ÉCHAP à tout moment : le vent le repose sur le toit, et il repart quand il veut. */
  repose: 'Le vent le repose sur le toit.',
  reposeSuite: 'ESPACE',
  rate: 'Raté. On y retourne.',
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
  /** Le titre de la seconde page. */
  titre2: 'CETTE NUIT-LÀ',
};

/**
 * **Ce qu'il a fait cette nuit-là.** Seconde page de l'écran de fin : une ligne par chose qui a
 * réellement eu lieu, dans l'ordre où on les a faites. Compter deux chiffres — la petite sœur et les
 * pièces — ne dit rien d'une nuit où on a coulé le bateau de son père et envoyé un poisson à la mer.
 *
 * **Rien n'est obligatoire ici**, et c'est le principe : deux parties donnent deux listes
 * différentes, et aucune ligne ne reproche l'absence d'une autre. Une ligne sans son drapeau
 * n'existe pas.
 */
export const CETTE_NUIT: Array<{ flag: string; ligne: string }> = [
  { flag: 'ventilo-casse', ligne: 'Un ventilateur achevé.' },
  { flag: 'chat-parle', ligne: 'Un chat qui parle.' },
  { flag: 'bouchon-retire', ligne: 'Un poisson sauvé.' },
  { flag: 'araignee-partie', ligne: 'Dix haïkus, et une danse.' },
  { flag: 'reve-fait', ligne: 'Un rêve de fusée.' },
  { flag: 'fenetre-cassee', ligne: 'Une vitre cassée. (le chat)' },
  { flag: 'elephant-salue', ligne: 'Un éléphant, deux fois.' },
  { flag: 'poisson-parti', ligne: 'Un poisson parti pour la mer.' },
  { flag: 'bateau-coule', ligne: 'Un bateau au fond de l’Erdre.' },
  { flag: 'joie-bateau', ligne: 'Un mensonge à la terrasse.' },
  { flag: 'plantes-toutes', ligne: 'Sept plantes sauvées.' },
  { flag: 'parapente-rentre', ligne: 'Un vol au-dessus de Nantes.' },
];

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

/**
 * **Sortir de la partie**, avec ÉCHAP, depuis n'importe où dans le jeu. Rien n'est perdu — le jeu
 * sauvegarde à chaque porte et à chaque objet — mais on demande quand même : revenir au titre en
 * plein milieu d'une chasse à Hermione parce qu'on a cherché la touche du pistolet à eau, c'est
 * agaçant.
 *
 * C'est de là qu'on repart à zéro : l'écran-titre a la touche R, et lui aussi pose la question.
 */
export const QUITTER = { question: 'Revenir à l’écran-titre ?', choix: ['Oui', 'Non'] };

// ═══════════════════════════════════════════════════════════════ 4. Hermione

/** Ce qu'elle répond, quoi qu'il arrive et où qu'elle soit. */
export const RENCONTRE = ['...'];

/**
 * **Ce qu'elle dit en renonçant à la chasse.** Cinq cachettes dans la maison, elle a compris qu'elle
 * n'y arrivera pas — et au moment de repartir avec Hermione, elle rend le pistolet à eau confisqué.
 * C'est la seule récompense de la maison, et elle vient d'une capitulation : elle a maintenant autre
 * chose à faire que de surveiller un jouet.
 */
export const PISTOLET_RENDU = {
  qui: 'Maman',
  lignes: [
    '« Merci de m’avoir aidée, Nino. »',
    '« Exceptionnellement, je te rends ton pistolet à eau. »',
    '« Il est au fond du coffre. »',
    '« Et tu ne t’en sers pas sur ta maîtresse. »',
  ],
};

/**
 * **Ce que Maman crie, cachette par cachette.** Le cri est écrit pour l'endroit : « Comment tu es
 * montée là ?! » n'a aucun sens sous un lit, et c'est pourtant ce qu'elle disait — les cris étaient
 * tirés d'une liste dans l'ordre des trouvailles, pas dans celui des cachettes.
 *
 * Une pièce, une cachette, un cri. Le dernier est aussi la capitulation.
 */
export const CRIS: Record<string, string[]> = {
  couloir: ['« HERMIONE ! »', '« Viens ici. »'],
  'chambre-parents': ['« HERMIONE ! »', '« Comment tu es montée là ?! »'],
  chambre: ['« HERMIONE ! »', '« Sors de là-dessous. »'],
  mezzanine: ['« HERMIONE ! »', '« Tu ne peux pas être là. »', '« Personne ne monte ici. »'],
  sdb: ['« HERMIONE ! »', '...', '« Bon. »', '« Elle reste avec toi. »'],
};

/** La dernière fois : Maman renonce, et Hermione reste. */

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
  // **La révélation.** On ne peut jamais lui parler sur son bateau, il ne lève pas la
  // tête, il ne nous voit pas — et au moment de couler, sans se retourner :
  '« Nino. »',
  '« Ne dis pas à ta mère. »',
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
      { qui: 'Papa', lignes: ['« Oh oui. »'] },
      { qui: 'Le parrain', lignes: ['« Et le tien, il va bien ? »'] },
      // La meilleure réplique du jeu : son bateau est au fond de l'Erdre depuis cet après-midi.
      { qui: 'Papa', lignes: ['« Il fuit un tout petit peu. »', '« Ahem. »'] },
    ],
    flotte: [
      { qui: 'Le parrain', lignes: ['« Alors, ce bouchon ? »'] },
      { qui: 'Papa', lignes: ['« Réglé. »', '« Enfin. »', '« Presque. »'] },
      { qui: 'Le parrain', lignes: ['« Tu m’emmènes, un jour ? »', '« En mer. »'] },
      { qui: 'Papa', lignes: ['« Bien sûr. »', '« Quand le bouchon tiendra. »', '« Ahem. »'] },
    ],
  };

/**
 * **Le jardinier arrive dans la pièce où la septième plante a bu.** N'importe laquelle — une
 * chambre, une salle de bain, le hall d'une tour de trente-deux étages : il pousse la porte la plus
 * proche, il traverse, il remercie.
 *
 * Puis il se rend compte d'où il est. C'est le seul personnage du jeu qui **relève l'absurde** —
 * tous les autres l'avalent sans broncher — et c'est drôle pour cette raison exacte : il aura fallu
 * arroser sept plantes pour qu'un adulte se demande enfin ce qu'il fait là.
 */
export const JARDINIER_MERCI = {
  qui: 'Gilbert',
  lignes: [
    '« Ah. »',
    '« C’est toi qui les as arrosées ? »',
    '« Toutes ? »',
    '« Elles vont mieux que moi. »',
    '« Merci, petit. »',
  ],
};

export const JARDINIER_PART = {
  qui: 'Gilbert',
  lignes: ['« ... »', '« Qu’est-ce que je fais là, moi ? »', '« Bon. »', '« Je m’en vais. »'],
};

/**
 * **Les sept plantes du jeu, et la quête d'à-côté.** Chacune a soif, chacune se souvient d'avoir
 * été arrosée (drapeau `arrosee-<id>`), et le journal les compte. Ce n'est pas une collection
 * cachée : elles sont toutes en pleine vue, dans des pièces qu'on traverse de toute façon.
 *
 * **La liste vit ici et pas dans `rooms.ts`** pour la même raison qu'`OFFRABLES` : le journal, le
 * jardinier et l'écran de fin en ont besoin, et `rooms.ts` importe déjà ce fichier — l'inverse
 * ferait un cycle.
 *
 * La huitième plante du jeu, celle du treizième étage, **est en plastique** : elle ne compte pas,
 * et arroser du plastique ne donne rien d'autre qu'une réplique.
 */
export const PLANTES: Array<{ id: string; ou: string }> = [
  { id: 'plante-chambre', ou: 'La chambre' },
  { id: 'plante-couloir', ou: 'Le couloir' },
  { id: 'plante-salon', ou: 'Le salon' },
  { id: 'plante-cuisine', ou: 'La cuisine' },
  { id: 'plante-bars', ou: 'La rue des bars' },
  { id: 'plante-ecole', ou: 'Devant l’école' },
  { id: 'plante-hall', ou: 'Le hall de la tour' },
];

/**
 * **Ce qui a déjà été rendu à la maîtresse.** Un drapeau par objet — `rendu-<id>` — et elle compte :
 * au troisième elle s'étonne, au cinquième elle constate, au huitième elle va chercher une boîte.
 * Sans ça, elle réagissait au cinquième objet comme au premier.
 */
export const rendu = (id: string) => `rendu-${id}`;
export const rendus = () => OFFRABLES.filter((id) => state.flag(rendu(id))).length;

/** Le drapeau qui dit qu'une plante a été arrosée. */
export const arrosee = (id: string) => `arrosee-${id}`;

/** Combien sont sauvées. */
export const plantesSauvees = () => PLANTES.filter((p) => state.flag(arrosee(p.id))).length;

/**
 * **Ce que dit une plante.** Trois états, et c'est la scène qui choisit : un dialogue ne sait pas
 * de quel objet il parle, et les sept plantes partagent le même texte.
 *
 * L'indice n'est pas un tutoriel : une plante qui a soif devant un enfant qui a un pistolet à eau,
 * ça suffit. On ne nomme jamais la touche.
 */
export const PLANTE = {
  seche: ['Une plante.', 'La terre est sèche, sèche, sèche.'],
  sechePistolet: ['Une plante.', 'La terre est sèche, sèche, sèche.', 'Nino a ce qu’il faut.'],
  arrosee: ['Une plante.', 'Elle a l’air beaucoup plus contente.'],
};

/** Ce qu'on voit quand une plante reçoit enfin de l'eau. Elle ne dit rien : elle pousse. */
export const PLANTE_ARROSEE = 'La plante semble soudainement revivre.';

/** Et quand c'était la dernière. Personne ne félicite : le jeu constate, et c'est mieux. */
export const PLANTES_TOUTES = ['Plus une seule plante n’a soif.'];

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
  '« Ce bouchon fuit. »',
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

/**
 * **La troisième bêtise, à la terrasse.** Le pigeon arrosé décolle par-dessus la table de
 * papa et emporte les deux verres. Papa a tout vu — son fils, le pistolet, le jet — et il
 * accuse le pigeon quand même : dehors, c'est toujours le pigeon, comme à la maison c'est
 * toujours le chat. Le parrain, lui, tire la seule conclusion utile.
 */
export const VERRES_PAPA = ['« NON MAIS CE PIGEON. »'];
export const VERRES_PARRAIN = ['« Garçon. »', '« La même chose. »', '« Dans un verre plus lourd. »'];
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
  parrain: ['« Il pleut ? »', '« Uniquement sur moi ? »'],
  // La plante du treizième étage. Elle ne compte pas dans les sept : elle ne boit pas.
  'plante-13': ['L’eau glisse sur le plastique.', 'La plante ne bougera plus jamais.'],
  jardinier: ['« Hé ! »', '« Sur les plantes, pas sur moi. »'],
  // **Les gens qu'un enfant de sept ans visera en premier.** Chacun sa réaction, et personne ne se
  // fâche vraiment : tout le monde a déjà eu une journée.
  maitresse: ['« Nino. »', '« Repose ça. »', '« Et j’ai tout vu. »'],
  copain1: ['« ENCORE ! »'],
  copain2: ['« Ça compte pas. »'],
  copain3: ['Le troisième copain ne dit rien.', 'Il ferme les yeux, et il attend la suite.'],
  'dame-baguettes': ['« Mes baguettes ! »', '« Elles étaient déjà molles. »'],
  conducteur: ['« Ah. »', '« Merci. »'],
  serveur: ['« C’est noté. »', '« Ça sera sur l’addition. »'],
  'monsieur-immobile': ['Le monsieur ne bouge pas.', 'Il attend toujours quelqu’un.'],
  accordeon: ['Il continue.', 'Toujours les six mêmes notes.'],
  'compteur-de-fenetres': ['« Quarante-hui... »', '« Zut. »', '« Je recommence. »'],
  passant: ['« Merci. »', '« Trente-quatre. »'],
};

/**
 * **Où finit un pigeon qu'on a dérangé six fois.** Il ne s'enfuit pas, il ne s'envole pas : il
 * **change de quartier**, et il se pose sur la chose la plus haute et la plus mal choisie de
 * l'écran — le toit du tram, la table où boivent papa et le parrain, le mur de l'école. Sans un
 * mot, comme d'habitude.
 */
export const PIGEON_PERCHOIR = ['Le pigeon a changé d’avis.', 'Il est monté.'];

/**
 * **Le pigeon.** Il ne s'envole pas, il ne parle pas, il ne s'arrête pas : il se décale, et il
 * continue ce qu'il faisait. Une boîte par visite, dans l'ordre, puis on recommence — et le
 * pigeon s'écarte **quand la boîte se ferme**, pas avant : on lit ce qu'il fait, puis il le
 * fait, et on le voit.
 */
export const PIGEON: string[][] = [
  ['Un pigeon.', 'Il regarde le sol comme s’il y avait quelque chose.', 'Il n’y a rien.'],
  ['Le pigeon se décale de trois pas.', 'Il n’a pas regardé Nino une seule fois.'],
  ['Le pigeon fait comme s’il n’y avait personne.', 'Personne du tout.'],
  [
    'Le pigeon tourne la tête vers le trottoir vide.',
    'Il regarde exprès ailleurs.',
    'Pour avoir l’air occupé.',
  ],
  ['Le pigeon a autre chose à faire.', 'Il s’éloigne, sans se presser.'],
  ['Le pigeon continue de marcher.', 'Il connaît le chemin.'],
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
export const FETE: Array<{ qui?: string; lignes: string[]; son?: string; pause?: number }> = [
  { lignes: ['Il fait jour dans la cuisine.', 'Ça sent le gâteau.'] },
  { qui: 'Maman', lignes: ['« JOYEUX ANNIVERSAIRE ! »'] },
  { qui: 'Papa', lignes: ['« JOYEUX ANNIVERSAIRE ! »'] },
  { lignes: ['Sept bougies.', 'Hermione tape sur la table.'] },
  { qui: 'Maman', lignes: ['« Tu as bien dormi ? »'], pause: 700 },
  { lignes: ['« ... »'], pause: 900 },
  { qui: 'Nino', lignes: ['« Oui. »'] },
  { qui: 'Papa', lignes: ['« Souffle ! »'] },
  { lignes: ['Nino prend une très grande respiration.'], son: 'bougies', pause: 900 },
  { lignes: ['...'], pause: 1200 },
  { lignes: ['Six bougies éteintes.', 'La septième repart toute seule.'], pause: 700 },
  { qui: 'Papa', lignes: ['« Ah. »', '« Celle-là, c’est une farce. »'] },
  { qui: 'Maman', lignes: ['« Ce n’est pas moi. »'] },
  { qui: 'Papa', lignes: ['« Ce n’est pas moi non plus. »'], pause: 800 },
  { lignes: ['Moon regarde ailleurs.'], pause: 1000 },
  { lignes: ['Nino souffle une deuxième fois.'], son: 'bougies', pause: 1100 },
  { lignes: ['Voilà.'], pause: 900 },
  { lignes: ['Nino dort.'] },
];

/**
 * **Le générique.** Nino s'endort sur la table, et le jeu repasse par ses propres écrans, un par
 * un, avec une ligne de remerciement en bas. Ce ne sont pas des crédits : c'est **la liste de ceux
 * à qui il doit sa journée**, et aucun d'eux n'est une personne réelle.
 *
 * Chaque entrée est une pièce du jeu et **trois lignes à la manière d'un générique** : le nom en
 * capitales, le poste, puis un détail dit sans rire. Le comique est dans le poste — « effets
 * spéciaux : pluie » pour un éléphant qui a fait tomber une trompe d'Erdre sur un quai — jamais
 * dans une vanne ajoutée par-dessus. Les trois derniers cartons sont les **mentions de fin** que
 * personne ne lit dans les vrais films. La pièce est rejouée telle quelle — ses
 * décors, ses personnages, ses animations — parce qu'un générique qui montre le jeu vaut mieux
 * qu'un générique qui déroule des noms sur du noir. On peut passer avec ESPACE : un enfant de sept
 * ans qui a fini un jeu a le droit d'être pressé.
 */
export const CREDITS: Array<{
  room: string;
  lignes: string[];
  /** Les mentions de fin passent plus vite : ce sont des vannes, pas des cartons de personnage. */
  court?: true;
  /**
   * **Celui qu'on remercie, remis à sa place le temps du carton.** À la fin du jeu, la plupart
   * d'entre eux ne sont plus là : le chat est sorti avec les parents, le poisson est parti à la
   * mer, l'araignée a dansé et s'en est allée. Un générique qui remercie une pièce vide, c'est
   * triste ; on les repose donc là où on les a rencontrés, juste pour la photo — et **au-dessus de
   * la bande de texte**, qui mange le bas de l'écran.
   */
  qui?: { sprite: string; x: number; y: number; frame?: string; anim?: string; scale?: number };
}> = [
  {
    room: 'salon',
    lignes: ['MOON', 'dans son propre rôle.', 'Cachet : un bout de pizza.'],
    qui: { sprite: 'moon', x: 16, y: 86, frame: 'idle-0', anim: 'moon-idle' },
  },
  {
    room: 'sdb',
    lignes: ['GÉRARD', 'rôle du poisson.', 'A quitté le tournage avant la fin.'],
    qui: { sprite: 'poisson', x: 24, y: 44, frame: 'saut-0', anim: 'poisson-saut' },
  },
  {
    room: 'mezzanine',
    lignes: ['L’ARAIGNÉE', 'poèmes et chorégraphie.', 'Dix haïkus, une danse, aucun rappel.'],
    qui: { sprite: 'araignee', x: 60, y: 74, frame: 'pattes-0', anim: 'araignee-pattes', scale: 2 },
  },
  {
    room: 'cour',
    lignes: ['L’ÉCUREUIL', 'mauvaises idées.', 'Nie toute participation.'],
    qui: { sprite: 'ecureuil', x: 124, y: 72, frame: 'queue-0', anim: 'ecureuil-queue' },
  },
  { room: 'nantes', lignes: ['LE JARDINIER', 'arrosage.', 'N’a pas arrosé.'] },
  { room: 'ecole', lignes: ['LA MAÎTRESSE', 'notation.', 'A noté une croûte de pizza.'] },
  {
    room: 'erdre',
    lignes: [
      'L’ÉLÉPHANT DES MACHINES',
      'effets spéciaux : pluie.',
      'Douze mètres, aucune doublure.',
    ],
  },
  {
    room: 'terrasse',
    lignes: ['PAPA', 'bateau, chapeau, alibis.', 'Cascades exécutées par lui-même.'],
  },
  { room: 'tour-toit', lignes: ['LA TOUR DE BRETAGNE', 'décors.', 'N’a pas bougé de la nuit.'] },
  {
    room: 'cuisine',
    lignes: ['MAMAN', 'production, gâteau, sept bougies.', 'Savait depuis ce matin.'],
  },
  {
    room: 'chambre',
    lignes: ['HERMIONE', 'cachettes.', 'Aucune n’a jamais été expliquée.'],
    qui: { sprite: 'hermione', x: 20, y: 40, frame: 'idle-0', anim: 'hermione-idle' },
  },
  // ── Et les mentions de fin, celles que personne ne lit jamais dans les vrais films ──
  { room: 'bars', lignes: ['Aucun animal n’a été maltraité.', 'L’écureuil a un avis différent.'] , court: true },
  {
    room: 'couloir',
    lignes: ['Ce couloir a quatre portes', 'et un escalier.', 'Il n’a jamais servi à rien.'],
    court: true,
  },
  {
    room: 'tour-pied',
    lignes: ['Toute ressemblance avec des personnes', 'réelles est parfaitement assumée.'],
    court: true,
  },
];

/** La toute dernière ligne du générique, et ce qu'on lit avant qu'il commence. */
export const GENERIQUE = {
  fin: ['NINO', 'tout le reste.', 'Sept ans depuis ce matin.'],
  /** Sur la table de la cuisine, la tête dans les bras. */
  endormi: ['Nino s’endort sur la table.'],
};

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
    nom: 'Bout de pizza',
    desc: 'Froid, un peu mou, d’hier. Personne ne le réclamera. Certains animaux le trouvent négociable.',
  },
  croute: {
    nom: 'Croûte de pizza',
    desc: 'Ce que Moon a laissé : il a mangé tout le reste sans ouvrir les yeux. Une croûte mâchée n’a plus aucune valeur, sauf comme œuvre.',
  },
};

/** Les pièces à collectionner. On ne sait pas encore ce qu'elles veulent dire. */
export const PIECES_TEXTE: Record<string, { nom: string; provenance: string }> = {
  reve: {
    nom: 'Pièce du rêve',
    provenance: 'Gagnée sur une fusée, dans le rêve du grand lit.',
  },
  frigo: {
    nom: 'Pièce du frigo',
    provenance: 'Sous le frigo. Attrapée par le côté.',
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
    role: 'Attablé avec papa à une terrasse, un verre devant lui. Ne s’étonne de rien : ni d’un papa trempé, ni d’un enfant de sept ans qui passe tout seul, ni d’un bateau qui aurait coulé.',
  },
  elephant: {
    nom: 'L’Éléphant des Machines',
    role: 'Douze mètres de bois et d’acier. Il boit dans l’Erdre, puis il est sur un palier du 31e étage. Personne ne demande comment il est monté — sauf Nino, une fois, tout bas. Pose la seule énigme dont il ne connaît pas la réponse.',
  },
  maman: {
    nom: 'Maman',
    role: 'Tient la cuisine et le réel. C’est elle qui envoie Nino vers le frigo sans savoir ce qu’elle déclenche.',
  },
  papa: {
    nom: 'Papa',
    role: 'Dans le salon, « cinq minutes » depuis quarante minutes. Et en même temps, chapeau de capitaine, il pilote un bateau sur l’Erdre. Ne trouve ça bizarre à aucun moment.',
  },
  jardinier: {
    nom: 'Gilbert, le jardinier',
    role: 'Sur la place, avec son chapeau et son tablier. Se plaint de la chaleur, n’arrive pas à suivre, et ne demande jamais rien à personne. Dit merci si les sept plantes du jeu ont été arrosées sans lui.',
  },
  maitresse: {
    nom: 'La maîtresse',
    role: 'Réclame le projet d’art de Nino, derrière les grilles de l’école. N’importe quel objet fait l’affaire ; ce qu’elle note, c’est ce qu’on en dit.',
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
  'croute',
];

/**
 * **Ce que Nino porte et n'a pas encore montré.** Quand il y en a plusieurs, la scène ouvre un
 * choix : c'est Nino qui décide ce qu'il pose sur la table, pas l'ordre de la liste.
 */
export const portables = (): ItemId[] =>
  OFFRABLES.filter((id) => state.has(id) && !state.flag(rendu(id)));

/** La question du choix, et la ligne qui fait tourner la liste quand il porte plus de trois choses. */
export const QUEL_OBJET = {
  question: ['« Montre-moi. »', '« Qu’est-ce que tu m’apportes ? »'],
  autre: 'Autre chose...',
};

/**
 * **La discussion d'un objet précis**, pour quand Nino l'a choisi lui-même : le même contenu
 * que le beat correspondant de `maitresse`, construit à la demande.
 */
export const beatObjet = (id: ItemId): DialogueBeat => ({
  speaker: 'La maîtresse',
  lines: ACCUEILS[id],
  devoir: DEVOIRS[id],
  effects: { flag: rendu(id) },
});

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
  croute: [
    'Nino pose une croûte de pizza mâchée sur la table.',
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
      /**
       * **Le bouchon ne peut pas valoir vingt.** C'est le premier objet qu'on peut avoir, dès la
       * salle de bain : décrocher la meilleure note dessus vidait les sept autres de tout intérêt.
       * Cinq points au maximum, donc seize sur vingt — une bonne note, pas la meilleure, et la
       * maîtresse le dit à sa façon : *« C'est un bouchon, Nino. »*
       */
      {
        lines: ['« Et en quoi c’est de l’art ? »'],
        reponses: ['Il ne bouche plus', 'Il a servi', 'C’est rond'],
        retours: [
          {
            points: 2,
            lines: ['« Un bouchon qui ne bouche plus. »', '« C’est joliment dit. »', '« C’est un bouchon, Nino. »'],
          },
          { points: 1, lines: ['« À quelque chose d’important, même. »'] },
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
        reponses: ['Un arbre est dedans', 'C’est petit', 'Ça se mange'],
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
          { points: 3, lines: ['« Exactement ça. »'] },
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
          { points: 3, lines: ['« C’est ça. »', '« Tu as bien regardé. »'] },
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
  croute: {
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
        reponses: ['Je l’ai décidé', 'Quelqu’un a commencé', 'Ça se mange'],
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
 * **Ce qu'elle dit quand ce n'est pas la première fois.** Elle garde la meilleure note, et elle le
 * dit : un enfant qui revient avec un autre objet doit savoir que rien n'est perdu, et qu'il n'a
 * rien à craindre d'essayer moins bien.
 */
export const RENOTE = {
  mieux: ['« Mieux que la dernière fois. »'],
  pareil: ['« Pareil que la dernière fois. »'],
  moins: ['« Tu avais fait mieux. »', '« Je garde la meilleure. »'],
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

  /**
   * **Le pistolet à eau n'est plus dans le coffre : il est confisqué.** C'était le seul objet du jeu
   * qui change vraiment quelque chose, et on le trouvait dans les trente premières secondes en
   * ouvrant un coffre au passage. Maintenant il faut que Maman le rende — ce qu'elle fait quand elle
   * renonce à la chasse à Hermione, c'est-à-dire au seul moment de la maison qui se mérite.
   */
  coffre: [
    // **Le pistolet d'abord.** Quand Maman vient de dire où il est, ouvrir le coffre doit le
    // donner — même si c'est la première fois qu'on l'ouvre. Dans l'autre ordre, un enfant qui
    // venait exprès le chercher s'entendait répondre qu'il n'y est plus.
    {
      when: () => state.flag('pistolet-rendu') && !state.has('pistolet-eau'),
      lines: [
        'Nino ouvre le coffre à jouets.',
        'Des briques, une trottinette cassée, un dinosaure.',
        'Et, tout au fond, son pistolet à eau.',
      ],
      effects: { give: 'pistolet-eau', flag: 'coffre-ouvert' },
    },
    {
      when: () => !state.flag('coffre-ouvert'),
      lines: [
        'Nino ouvre le coffre à jouets.',
        'Des briques, une trottinette cassée, un dinosaure.',
        'Son pistolet à eau n’y est plus.',
      ],
      effects: { flag: 'coffre-ouvert' },
    },
    {
      when: () => !state.flag('pistolet-teste') && state.has('pistolet-eau'),
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
      lines: [
        '« Nino, ce n’est pas l’heure de manger ! »',
        '« Et je cherche ta sœur. »',
        '« Alors non. »',
      ],
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
        'Le frigo ronronne, grand ouvert.',
        'Il ne reste plus rien d’intéressant dedans. Que des légumes.',
        'On devrait peut-être le fermer, non ?',
      ],
    },
  ],

  'evier-cuisine': [
    {
      lines: ['L’eau du robinet est tiède.', 'Même l’eau a chaud aujourd’hui.'],
    },
  ],

  /**
   * **Le côté du frigo.** Il n'y a rien à voir tant qu'on ne s'est pas allongé par terre : c'est le
   * renseignement qui crée l'objet. Ensuite, il suffit d'aller chercher — et ce qu'on ramène n'est
   * pas seul, parce que sous un frigo il n'y a jamais qu'une chose.
   */
  'cote-frigo': [
    {
      when: () => state.pieces.has('frigo'),
      lines: ['Le côté du frigo.', 'Il y reste de la poussière et un bouchon de stylo.'],
    },
    {
      lines: [
        'Nino passe le bras sur le côté du frigo.',
        'De la poussière, un bouchon de stylo, et quelque chose de dur.',
        'Une pièce.',
      ],
      effects: { piece: 'frigo', flag: 'piece-frigo-prise' },
    },
  ],

  /**
   * **S'allonger par terre sert à quelque chose.** C'était la plus jolie interaction du jeu et la
   * plus inutile : Nino se couche sur le carrelage parce qu'il fait frais, et voilà. De tout en
   * bas, **on voit sous le frigo** — et quelque chose brille au fond, que personne ne pouvait voir
   * debout.
   *
   * **Mais on ne l'attrape pas de là** : se coucher par terre ne donne que le renseignement. Il
   * faut ensuite aller passer la main **sur le côté du frigo**, ce qui fait deux gestes au lieu
   * d'un — et le second n'existe que parce qu'on a fait le premier.
   */
  carrelage: [
    {
      when: () => !state.flag('sous-le-frigo'),
      lines: [
        'Nino s’allonge de tout son long sur le carrelage.',
        'Joue contre le sol. C’est le meilleur endroit de la maison.',
        'D’ici, on voit sous le frigo.',
        'Quelque chose brille, tout au fond.',
        'Le bras ne passe pas.',
        'Il faudrait essayer par le côté.',
      ],
      effects: { flag: 'sous-le-frigo' },
    },
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
      // **Il en laisse la croûte**, et c'est elle qu'on garde : le seul objet du jeu qui change
      // de nom en changeant de main.
      effects: { take: 'pizza', give: 'croute', flag: 'chat-parle' },
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
        'C’est un radiateur qui ronronne.',
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

  /**
   * **Papa plante sa propre blague.** On le retrouvera capitaine d'un bateau qui « fuit un
   * tout petit peu » : ici, avant même de sortir de la maison, il regarde un tutoriel de
   * colmatage « pour un ami ». Personne ne relève, et ceux qui refont le jeu sourient dès
   * le salon.
   */
  'papa-salon': [
    {
      lines: [
        'Papa regarde une vidéo, très concentré.',
        '« Colmater une coque : dix astuces. »',
        '« C’est pour un ami », dit papa.',
      ],
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

  /**
   * **La maison endormie, la nuit du retour.** Nino traverse sur la pointe des pieds : ses
   * parents dorment dans le grand lit, Hermione dans son lit de bébé. Personne ne cherche
   * personne — c'est la première fois du jeu.
   */
  'parents-dorment': [
    { lines: ['Papa et Maman dorment.', 'Pour une fois, personne ne cherche personne.'] },
  ],
  'lit-bebe': [
    { lines: ['Hermione dort dans son petit lit.', 'Elle a eu une grande journée, elle aussi.'] },
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
  /**
   * **Le miroir prend de l'avance.** Quatre visites, et le reflet dérive : il est en retard, il
   * attend, il commence avant, puis il n'est plus là. Rien ne se passe si on n'y retourne pas —
   * c'est une blague pour ceux qui se relavent la figure quatre fois, et ceux-là méritent une
   * blague.
   */
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
    {
      when: () => !state.flag('miroir-attend'),
      lines: ['Le Nino du miroir attend que le vrai Nino commence.'],
      effects: { flag: 'miroir-attend' },
    },
    {
      when: () => !state.flag('miroir-avance'),
      lines: [
        'Le Nino du miroir se passe de l’eau sur la figure.',
        'Nino n’a pas encore bougé.',
      ],
      effects: { flag: 'miroir-avance' },
    },
    {
      when: () => !state.flag('miroir-vide'),
      lines: ['Le miroir est vide.', 'Il reviendra.'],
      effects: { flag: 'miroir-vide' },
    },
    { lines: ['Le Nino du miroir est revenu.', 'Il fait comme si de rien n’était.'] },
  ],

  /**
   * Le même écureuil, dans les roseaux, avec une idée plus grosse. Même structure que
   * dans la cour : il propose, il insiste, il nie.
   */
  /**
   * Le même écureuil, derrière le banc de la terrasse, avec sa troisième idée. Toujours le
   * même patron — il propose, il insiste, il nie — et trois victimes de plus en plus loin
   * de chez Nino : la fenêtre de sa maison, le bateau de son père, les verres d'un inconnu.
   */
  'ecureuil-terrasse': [
    {
      when: () => state.flag('verres-tombes'),
      speaker: 'L’écureuil',
      lines: ['« Je ne connais pas ce pigeon. »', '« Je connais personne. »'],
    },
    {
      when: () => state.flag('ecureuil-verre'),
      speaker: 'L’écureuil',
      lines: ['« Le pigeon. »', '« Il est toujours sec. »'],
    },
    {
      speaker: 'L’écureuil',
      lines: ['« Psst. »', '« T’es précis ? »', '« Prouve-le. Arrose le pigeon. »'],
      effects: { flag: 'ecureuil-verre' },
    },
  ],

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

  // **Le poisson de l'Erdre ne parle plus au bord de l'eau** : il saute, il est occupé, et
  // tout se dit à l'éléphant. Son indice du bouchon était devenu redondant — c'est l'écureuil
  // qui donne la clé du naufrage — et il garde la parole là où elle compte : dans la scène du
  // départ, la tête hors de l'eau.

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
    // **Tant que Nino n'a pas vu ses parents dehors, il y a du monde derrière ce mur.** La
    // diversion ne vide pas la maison : les parents courent après le chat dedans. C'est la
    // première visite de l'Erdre — où on les retrouve, lui sur son bateau, elle au bout du
    // quai — qui fait le silence.
    {
      when: () => !state.vu('erdre'),
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
  /**
   * **Le monsieur qui n'ira pas se baigner.** Il est au bord de l'eau depuis un moment, il a une
   * bonne raison de ne pas y aller, et elle n'est pas bonne. Après l'averse, il ne se demande pas
   * d'où venait la pluie : il en commente l'odeur, ce qui est très exactement la bonne réaction
   * dans ce jeu — l'eau sortait de la trompe d'un éléphant, et personne n'a rien à redire.
   */
  baigneur: [
    {
      when: () => state.flag('maman-quai-partie'),
      speaker: 'Le monsieur',
      lines: ['« Cette pluie a une étrange odeur de cacahuète. »'],
    },
    {
      speaker: 'Le monsieur',
      lines: ['« J’irais bien me baigner. »', '« Mais ces poissons me font un peu peur. »'],
    },
  ],

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
      // C'est ici que Nino voit papa en capitaine pour la première fois : le drapeau sert
      // à l'écran-titre (papa rejoint l'affiche) — l'interaction avec lui n'existe plus.
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

  /**
   * **La plante du couloir.** Trois états : elle a soif, elle a soif et Nino a de quoi (sans lui
   * dire lequel — un pistolet à eau se devine), et elle est arrosée. C'est la seule interaction du
   * couloir, et la seule chose du jeu qui **change d'apparence pour de bon** sans que ce soit une
   * bêtise.
   */
  plante: [
    {
      when: () => state.flag('plante-arrosee'),
      lines: ['La plante du couloir.', 'Elle a l’air beaucoup plus contente.'],
    },
    {
      when: () => state.has('pistolet-eau'),
      lines: ['La plante du couloir.', 'La terre est sèche, sèche, sèche.', 'Nino a ce qu’il faut.'],
    },
    { lines: ['La plante du couloir.', 'La terre est sèche, sèche, sèche.'] },
  ],

  /**
   * **Le jardinier de la place.** Il se plaint de la chaleur, ce qui est le sport local, et il
   * n'arrive pas à suivre. Trois états : rien d'arrosé, quelques-unes, et **les sept** — là il
   * remercie, et c'est le seul merci du jeu qu'on ait à mériter.
   *
   * Il ne demande jamais rien. Personne ne donne de quête ici : il se plaint, et un enfant avec un
   * pistolet à eau en tire ses propres conclusions.
   */
  jardinier: [
    // **La présentation d'abord.** Sans elle, on écoutait un monsieur au chapeau dire « il y en a
    // qui vont mieux » sans savoir de quoi il parlait, ni que c'était son métier.
    {
      when: () => !state.flag('gilbert-vu'),
      speaker: 'Gilbert',
      lines: [
        '« Moi c’est Gilbert. »',
        '« Je m’occupe des plantes de la ville. »',
        '« Enfin. J’essaie. »',
        '« Il fait trop chaud, tout crève. »',
      ],
      effects: { flag: 'gilbert-vu' },
    },
    // Il a déjà dit merci en personne, dans la pièce de la septième plante : ici il ne recommence
    // pas, il constate. Un merci qui se répète n'est plus un merci.
    {
      when: () => plantesSauvees() >= PLANTES.length,
      speaker: 'Gilbert',
      lines: ['« Ah, c’est toi. »', '« Elles vont toutes bien. »', '« Je n’y suis pour rien. »'],
    },
    {
      when: () => plantesSauvees() > 0,
      speaker: 'Gilbert',
      lines: [
        '« Il y en a qui vont mieux. »',
        '« Ce n’est pas moi. »',
        '« Je n’ai pas le temps, avec cette chaleur. »',
      ],
    },
    {
      speaker: 'Gilbert',
      lines: [
        '« Il fait trop chaud. »',
        '« Tout crève. »',
        '« J’arrose, j’arrose... »',
        '« Et le lendemain, à refaire. »',
      ],
    },
  ],

  /**
   * **La nuit tombe ici, et nulle part ailleurs.** Personne ne la voit tomber : on lève la tête sur
   * une tour qui bouche le ciel, et il fait déjà sombre. C'est la seule narration d'ambiance du jeu
   * qui se déclenche toute seule — elle ne demande rien, elle ne bloque rien, elle dit l'heure.
   */
  // La tour n'est pas mentionnée : à l'arrivée sur le parvis elle est encore hors champ,
  // un écran plus loin. C'est le regard levé à la porte qui la racontera.
  'nuit-tombe': [
    {
      lines: ['Le ciel a changé pendant qu’on marchait.', 'La nuit est tombée.'],
    },
  ],

  'plante-tour': [
    { lines: ['Une plante en plastique.', 'Elle est là depuis 1976, elle aussi.'] },
  ],

  /**
   * **Trois fenêtres, trois hauteurs.** Les paliers de la tour sont volontairement identiques au
   * pixel près — c'est la blague de l'ascension — mais rien ne disait qu'on montait. Une fenêtre
   * par étage, et c'est le paysage qui compte les étages à la place du joueur : les voitures, puis
   * les toits, puis plus rien du tout.
   */
  'fenetre-13': [
    { lines: ['La fenêtre est ouverte.', 'D’ici, les voitures font le bruit de la mer.'] },
  ],

  'fenetre-27': [
    { lines: ['D’ici, on ne voit plus que les toits.', 'Et l’Erdre, tout au fond.'] },
  ],

  'fenetre-31': [
    { lines: ['D’ici, on ne voit plus rien.', 'C’est peut-être un nuage.'] },
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

  /**
   * **Le poisson au seau, premier gardien.** Il revient tout juste de la mer — l'eau salée
   * gratte — et puisqu'il est là, il considère que la règle des tours s'applique à lui
   * aussi : une énigme par étage, et arriver tout en haut. Dans un seau. Personne ne
   * relève. C'est lui qui annonce la quête, et sa solennité est très sérieuse.
   */
  'poisson-tour': [
    {
      when: () => state.flag('enigme-poisson'),
      speaker: 'Le poisson',
      lines: ['« Ne m’attends pas. »', '« J’en suis à l’étage un. »'],
      // **Pas de tête qui sort ici** : une fois l'énigme résolue, le poisson entier saute
      // déjà au-dessus du seau — la superposer faisait deux poissons.
    },
    {
      speaker: 'Le poisson',
      lines: [
        'Une bassine d’eau, posée au milieu du hall.',
        '« Je reviens de la mer. »',
        '« L’eau salée, ça gratte. Personne ne le dit. »',
        '« Puisque je suis là : une énigme par étage, et tout en haut. »',
        '« C’est la règle des tours. Toi aussi, ça te concerne. »',
        '« Qu’est-ce qui monte et descend sans bouger ? »',
      ],
      // Il sort la tête pour parler : c'est la révélation du seau.
      montre: { sprite: 'seau', frame: 'saute-0', x: 97, y: 40, depth: 72 },
      enigme: {
        reponses: ['La mer', 'L’ascenseur', 'Un escalier'],
        bonne: 0,
        juste: {
          lines: [
            '« La marée. Oui. »',
            'Le seau frémit. Il y a un escalier, maintenant.',
            '« Monte. Moi, j’y vais à mon rythme. »',
          ],
          montre: { sprite: 'seau', frame: 'saute-0', x: 97, y: 40, depth: 72 },
          effects: { flag: 'enigme-poisson' },
        },
        faux: {
          lines: ['« Non. »', '« Indice : j’en reviens. »'],
          montre: { sprite: 'seau', frame: 'saute-0', x: 97, y: 40, depth: 72 },
        },
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
        reponses: ['C’est un beau poème', 'Une chaussette perdue', 'Rien du tout'],
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
    // Le poisson est parti pour la mer. Personne n'en parle, et surtout pas lui.
    {
      when: () => state.flag('poisson-parti'),
      lines: ['L’Éléphant regarde l’eau.', 'Il y a un poisson en moins.', 'Ça ne se voit pas.'],
    },
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
      // **Un objet ne se rend qu'une fois** : sinon on repassait le même bouchon jusqu'à tomber
      // sur la bonne réponse, et la note ne voulait plus rien dire.
      when: () => state.flag('devoir-donne') && state.has(id) && !state.flag(rendu(id)),
      speaker: 'La maîtresse',
      lines: ACCUEILS[id],
      devoir: DEVOIRS[id],
      // Elle se souvient de ce qu'on lui a déjà apporté : c'est ce qui lui fait dire « encore un ? »
      effects: { flag: rendu(id) },
    })),
    // **Elle compte ce qu'on lui apporte.** Au troisième objet elle s'étonne, au cinquième elle
    // constate, au huitième elle capitule — et c'est le seul endroit du jeu qui récompense un
    // enfant qui rapporte tout ce qu'il trouve.
    {
      when: () => rendus() >= 8,
      speaker: 'La maîtresse',
      lines: ['« Bon. »', '« Je vais chercher une boîte. »'],
    },
    {
      when: () => rendus() >= 5,
      speaker: 'La maîtresse',
      lines: ['« Tu as vidé la rue, Nino. »', '« Rapporte-moi autre chose si tu veux. »'],
    },
    {
      when: () => rendus() >= 3,
      speaker: 'La maîtresse',
      lines: ['« Encore un ? »', '« Rapporte-moi autre chose si tu veux. »'],
    },
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

  /**
   * **Les trois copains, et ce que Nino a fait cette nuit.** Le premier croit tout et surenchérit,
   * le deuxième nie tout au nom de la physique, et le troisième ne dit rien — il fait oui de la
   * tête, une fois, **sur la seule chose qui est vraie**. Comme tout est vrai, il hoche à chaque
   * fois, et c'est ça la blague.
   *
   * Sans ces répliques, Nino arrivait à l'école après avoir coulé un bateau et traversé Nantes en
   * parapente, et ses copains lui parlaient de la récré.
   */
  copain1: [
    {
      when: () => state.flag('bateau-coule'),
      speaker: 'Un copain',
      lines: [
        '« Tu as coulé le bateau de ton père ?! »',
        '« Moi mon père il a même pas de bateau. »',
      ],
    },
    {
      when: () => state.flag('parapente-rentre'),
      speaker: 'Un copain',
      lines: ['« Tu as volé ? »', '« En vrai ? »', '« Moi aussi, une fois. »', '« Presque. »'],
    },
    {
      when: () => state.flag('poisson-parti'),
      speaker: 'Un copain',
      lines: ['« Un éléphant a envoyé un poisson à la mer ? »', '« Ah. »', '« Normal. »'],
    },
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
      when: () => state.flag('bateau-coule'),
      speaker: 'Un autre copain',
      lines: ['« Les bateaux, ça coule pas. »', '« C’est de la physique. »'],
    },
    {
      when: () => state.flag('parapente-rentre'),
      speaker: 'Un autre copain',
      lines: ['« On peut pas voler. »', '« Sinon tout le monde le ferait. »'],
    },
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
      when: () =>
        state.flag('bateau-coule') || state.flag('parapente-rentre') || state.flag('poisson-parti'),
      lines: [
        'Le troisième copain ne dit rien.',
        'Il regarde Nino un long moment.',
        'Il sait.',
        'Il fait oui de la tête, une fois.',
      ],
    },
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
  /**
   * La porte de la tour fait d'abord lever la tête — une fois — puis elle redevient une
   * porte. Les grandes marches du parvis qui portaient ce regard étaient illisibles à
   * l'écran : un empilement de lignes horizontales.
   */
  'porte-tour': [
    {
      when: () => !state.flag('tour-vue'),
      lines: [
        'Nino lève la tête.',
        'Des fenêtres, des fenêtres, des fenêtres.',
        'Ça continue au-dessus de l’écran.',
      ],
      effects: { flag: 'tour-vue' },
    },
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
    /**
     * **La seule fois où un adulte commence à se poser la question.** Il a vu sa femme rentrer en
     * courant sous une pluie tombée d'un ciel bleu, et il va jusqu'à « mais comment » — puis il
     * laisse tomber, parce que c'est ce que font les adultes de ce jeu. L'amorce avortée rend
     * toutes les autres non-réactions plus drôles, à condition qu'elle n'arrive qu'une fois.
     */
    {
      when: () => state.flag('poisson-parti') && !state.flag('papa-doute'),
      speaker: 'Papa',
      lines: [
        '« Il paraît qu’il a plu, cet après-midi. »',
        '« Sur le quai. »',
        '« Juste sur le quai. »',
        '« Mais comment… »',
        '« Peu importe. »',
      ],
      effects: { flag: 'papa-doute' },
    },
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
    // Après le passage du pigeon : il attend son verre plus lourd — **une fois**. La réplique
    // rend ensuite la parole aux blagues du bateau : « ton père est tout mouillé » et le
    // bouchon raconté deux fois valent mieux qu'une commande qui radote par-dessus.
    {
      when: () => state.flag('verres-tombes') && !state.flag('parrain-verres-dit'),
      speaker: 'Le parrain',
      lines: ['« On attend les verres. »', '« Des lourds. »'],
      effects: { flag: 'parrain-verres-dit' },
    },
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
      lines: ['« Tiens. »', '« Le fils de quelqu’un. »', '« Il y en a partout, ce soir. »'],
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

  /**
   * **Moon, le dernier gardien, sur le toit — sous sa lune.** Trente-deux étages pour
   * apprendre pourquoi le chat s'appelle Moon, et c'est dit sans aucune emphase, comme tout
   * ce qui compte dans ce jeu. Sa question est la plus difficile de toutes, et sa bonne
   * réponse est la seule chose que le jeu ait jamais voulu dire. Réussir fait apparaître le
   * parapente : c'est lui, la récompense.
   */
  /**
   * **Regarder la lune, c'est faire parler Moon.** Son histoire avec elle se raconte ici,
   * une fois en entier — le motif des seize heures de sommeil revient, et il s'explique
   * enfin — puis en deux lignes les fois suivantes. C'est le seul endroit du jeu où Moon
   * parle de lui.
   */
  lune: [
    {
      when: () => state.flag('lune-histoire'),
      speaker: 'Moon',
      lines: ['« On se regarde, c’est tout. »', '« Ça nous suffit. »'],
    },
    {
      speaker: 'Moon',
      lines: [
        '« Tu la regardes aussi. »',
        '« Petit, je dormais seize heures par jour pour la voir huit. »',
        '« Une nuit, elle a eu besoin d’un gardien. »',
        '« Personne d’autre ne s’était réveillé. »',
        '« Voilà l’histoire. »',
      ],
      effects: { flag: 'lune-histoire' },
    },
  ],

  'moon-toit': [
    {
      when: () => state.flag('enigme-moon-toit'),
      speaker: 'Moon',
      lines: ['« Tu sais l’heure, maintenant. »', '« Vas-y. Je surveille. »'],
    },
    {
      speaker: 'Moon',
      lines: [
        '« On m’appelle Moon. »',
        '« Gardien de la lune. »',
        '« Tu veux rentrer sans inquiéter personne. »',
        '« Alors réponds à la plus difficile de toutes les questions. »',
        '« Quelle heure est-il ? »',
      ],
      enigme: {
        reponses: ['L’heure de rentrer', 'Minuit', 'Tard'],
        bonne: 0,
        juste: {
          lines: [
            '« Exact. »',
            'Moon pousse quelque chose du bout de la patte.',
            'Un parapente, plié contre le parapet.',
          ],
          effects: { flag: 'enigme-moon-toit' },
        },
        faux: { lines: ['« Non. »', '« Regarde le ciel. Pense à la maison. »'] },
      },
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
        oui: { lines: ['Nino saute.'] },
        non: {
          lines: ['Nino replie le parapente.', 'Il reste un moment à regarder la ville.'],
        },
      },
    },
  ],

  // ---------------------------------------------------------------- Nantes
  'velos-ville': [{ lines: ['Trois vélos.', 'Six pneus à plat.'] }],

  /**
   * **L'employé des Machines de l'île.** Le personnage le plus terne de la place porte la
   * plus grosse information du jeu, et il la donne comme un problème d'effectifs : l'éléphant
   * s'est échappé. Le joueur, lui, a vu cet éléphant boire l'Erdre — et le jeu ne fera
   * **jamais** le rapprochement à sa place : l'absurde est constaté, jamais expliqué.
   *
   * Ses répliques suivent l'éléphant à la trace, toujours avec un temps de retard : il
   * apprend par ouï-dire ce que Nino a vu de ses yeux.
   */
  machines: [
    {
      when: () => state.flag('elephant-tour-vu'),
      speaker: 'L’employé',
      lines: ['« On me dit qu’il est monté dans une tour. »', '« Je ne monte pas le chercher. »'],
    },
    {
      when: () => state.flag('elephant-vu'),
      speaker: 'L’employé',
      lines: ['« Il paraît qu’il pleut au bord de l’Erdre. »', '« Aucun rapport, je suppose. »'],
    },
    {
      when: () => state.flag('machines-vu'),
      speaker: 'L’employé',
      lines: ['« Pas d’éléphant. »', '« Il finira bien par avoir soif. »'],
    },
    {
      speaker: 'L’employé',
      lines: [
        '« Je travaille aux Machines de l’île. »',
        '« Enfin. Je travaillais. »',
        '« L’éléphant s’est échappé. »',
      ],
      effects: { flag: 'machines-vu' },
    },
  ],

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
  // **On ne parle jamais à papa sur son bateau.** Il bricole, il marmonne tout seul
  // (`PAPA_BRICOLE` — c'est là que le bouchon se dit), et il ne lève pas la tête : il ne
  // nous voit pas. C'est ce qui rend la révélation du naufrage possible — « Nino. Ne dis
  // pas à ta mère. » — dite sans se retourner, au moment de couler.

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
