// backend/utils/helpers.js

/**
 * Nettoie une chaîne de caractères en retirant espaces superflus, caractères dangereux, etc.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  // Supprime espaces avant/après et caractères non imprimables
  let sanitized = input.trim();
  // Ici tu peux ajouter d'autres nettoyages selon besoin (ex : échappement, whitelist, etc.)
  // Par exemple pour enlever balises HTML :
  sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, "");
  return sanitized;
}

/**
 * Gère les erreurs envoyées par les fonctions async, et renvoie une réponse HTTP.
 * @param {Error} error
 * @param {Response} res - Express response object
 * @param {string} message - Message personnalisé à renvoyer
 */
export function handleError(error, res, message = 'Erreur serveur') {
  console.error(error);
  return res.status(500).json({
    message,
    error: error.message || error.toString()
  });
}
export const sanitizeInputsimple = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/\s+/g, ' ');
};
