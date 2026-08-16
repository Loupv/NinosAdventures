/**
 * **Les réglages de la console.** Deux interrupteurs, et c'est tout : le son, et les
 * raccourcis de développement.
 *
 * Ils vivent **à côté de la partie**, dans leur propre clé : effacer la sauvegarde pour
 * recommencer une aventure ne doit pas rallumer un son qu'on avait coupé, ni réactiver
 * des raccourcis qu'on avait rangés.
 *
 * Les valeurs par défaut sont celles d'un jeu qu'on offre : **le son est allumé** — un
 * jeu muet au premier lancement, personne ne pense à aller chercher pourquoi — et **les
 * raccourcis sont éteints**, parce qu'un enfant qui cherche la touche du pistolet à eau
 * ne doit pas se retrouver téléporté au pied de la Tour de Bretagne.
 */
const CLEF = 'ninos-adventures/reglages/v1';

export interface Reglages {
  son: boolean;
  raccourcis: boolean;
}

const DEFAUTS: Reglages = { son: true, raccourcis: false };

function lire(): Reglages {
  try {
    const brut = localStorage.getItem(CLEF);
    if (!brut) return { ...DEFAUTS };
    const vu = JSON.parse(brut) as Partial<Reglages>;
    return {
      son: typeof vu.son === 'boolean' ? vu.son : DEFAUTS.son,
      raccourcis: typeof vu.raccourcis === 'boolean' ? vu.raccourcis : DEFAUTS.raccourcis,
    };
  } catch {
    // Navigateur sans stockage, mode privé, quota plein : on joue avec les défauts.
    return { ...DEFAUTS };
  }
}

export const reglages: Reglages = lire();

export function enregistrerReglages(): void {
  try {
    localStorage.setItem(CLEF, JSON.stringify(reglages));
  } catch {
    // Tant pis : le réglage vaut pour cette partie, il ne survivra pas à la fermeture.
  }
}
