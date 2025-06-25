/ utils/notification.util.js
import { sendMail } from './mail.util.js';
/**
 * Gère les notifications liées aux rendez-vous (confirmation, annulation, etc.)
 *
 * @param {'confirmation' | 'annulation'} type - Type de notification
 * @param {Object} data - Données associées à la notification
 * @param {string} data.email - Email du patient
 * @param {string} data.ine - Identifiant du RDV
 * @param {string} data.prenom - Prénom du patient
 * @param {string} data.nom - Nom du patient
 */
export const notifierRendezVous = async (type, data) => {
  const { email, ine, prenom, nom } = data;
  let sujet = '';
  let texte = '';
  switch (type) {
    case 'confirmation':
      sujet = 'Confirmation de votre rendez-vous';
      texte = `Bonjour ${prenom} ${nom},\n\nVotre rendez-vous (ID : ${ine}) a été confirmé.\n\nMerci.`;
      break;
    case 'annulation':
      sujet = 'Annulation de votre rendez-vous';
      texte = `Bonjour ${prenom} ${nom},\n\nVotre rendez-vous (ID : ${ine}) a été annulé.\n\nMerci.`;
      break;
    default:
      throw new Error(`Type de notification inconnu : ${type}`);
  }
  try {
    await sendMail(email, sujet, texte);
  } catch (err) {
    console.error('Erreur d’envoi de notification :', err.message);
  }
};




