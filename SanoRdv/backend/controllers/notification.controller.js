// ------------- Fonction pour envoyer une notification de Confirmation ------------
const Notification = require('../models/notification.model.js');
const RendezVous = require('../models/rendezvous.model.js');
const medecin = require('../models/medecin.model.js');

// Fonction pour envoyer une notification de confirmation
const sendConfirmationNotification = async (rendezVousId) => {
  try {
    const rendezVous = await RendezVous.findById(rendezVousId).populate('patient médecin');
    
    if (!rendezVous) {
      console.log("Rendez-vous non trouvé");
      return;
    }

    // Créer la notification de confirmation
    const notification = new Notification({
      contenu: `Votre rendez-vous avec le Dr. ${rendezVous.medecin.nom} a été confirmé.`,
      canal: 'Email', // Ou SMS selon la préférence
      destinataire: rendezVous.patient._id, // Notification envoyée au patient
      rendezVous: rendezVousId,
      statut: 'En attente',
      type: 'Confirmation'
    });

    // Sauvegarder la notification dans la base de données
    await notification.save();

    // Exemple d'envoi par Email (fonction à définir)
    sendEmail(rendezVous.patient.email, notification.contenu);

    console.log('Notification de confirmation envoyée');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
};

// Fonction pour envoyer un email (exemple simple)
const sendEmail = (email, contenu) => {
  console.log(`Envoi d'email à ${email}: ${contenu}`);
  // Implémentation avec un service comme Nodemailer ou autre
};

module.exports = { sendConfirmationNotification };


//-------------- Fonction pour envoyer une notification d'Annulation ----------------
const sendCancellationNotification = async (rendezVousId) => {
  try {
    const rendezVous = await RendezVous.findById(rendezVousId).populate('patient médecin');
    
    if (!rendezVous) {
      console.log("Rendez-vous non trouvé");
      return;
    }

    // Créer la notification d'annulation
    const notification = new Notification({
      contenu: `Votre rendez-vous avec le Dr. ${rendezVous.médecin.nom} a été annulé.`,
      canal: 'Email', // Ou SMS selon la préférence
      destinataire: rendezVous.patient._id, // Notification envoyée au patient
      rendezVous: rendezVousId,
      statut: 'En attente',
      type: 'Annulation'
    });

    // Sauvegarder la notification dans la base de données
    await notification.save();

    // Exemple d'envoi par Email (fonction à définir)
    sendEmail(rendezVous.patient.email, notification.contenu);

    console.log('Notification d\'annulation envoyée');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification d\'annulation:', error);
  }
};


// -------------------------Fonction pour envoyer un Rappel avant le rendez-vous -------
const sendReminderNotification = async (rendezVousId) => {
  try {
    const rendezVous = await RendezVous.findById(rendezVousId).populate('patient médecin');
    
    if (!rendezVous) {
      console.log("Rendez-vous non trouvé");
      return;
    }

    // Créer la notification de rappel
    const notification = new Notification({
      contenu: `Rappel : Votre rendez-vous avec le Dr. ${rendezVous.médecin.nom} est prévu demain à ${rendezVous.créneau}.`,
      canal: 'Email', // Ou SMS selon la préférence
      destinataire: rendezVous.patient._id, // Notification envoyée au patient
      rendezVous: rendezVousId,
      statut: 'En attente',
      type: 'Rappel'
    });

    // Sauvegarder la notification dans la base de données
    await notification.save();

    // Exemple d'envoi par Email (fonction à définir)
    sendEmail(rendezVous.patient.email, notification.contenu);

    console.log('Notification de rappel envoyée');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de rappel:', error);
  }
};

// ------------------------------- MEDECIN -----------------------------------------
//Fonction pour notifier le Médecin lors de la confirmation d'un rendez-vous
const sendConfirmationNotificationToMedecin = async (rendezVousId) => {
  try {
    const rendezVous = await RendezVous.findById(rendezVousId).populate('patient médecin');
    
    if (!rendezVous) {
      console.log("Rendez-vous non trouvé");
      return;
    }

    // Créer la notification de confirmation pour le Médecin
    const notification = new Notification({
      contenu: `Un nouveau rendez-vous a été pris avec le patient ${rendezVous.patient.nom} pour ${rendezVous.créneau}.`,
      canal: 'Email', // Ou SMS selon la préférence
      destinataire: rendezVous.médecin._id, // Notification envoyée au Médecin
      rendezVous: rendezVousId,
      statut: 'En attente',
      type: 'Confirmation'
    });

    // Sauvegarder la notification dans la base de données
    await notification.save();

    // Exemple d'envoi par Email (fonction à définir)
    sendEmail(rendezVous.médecin.email, notification.contenu);

    console.log('Notification de confirmation envoyée au Médecin');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de confirmation au Médecin:', error);
  }
};


//--------------Fonction pour notifier le Médecin en cas d'annulation du rendez-vous--------
const sendCancellationNotificationToMedecin = async (rendezVousId) => {
  try {
    const rendezVous = await RendezVous.findById(rendezVousId).populate('patient médecin');
    
    if (!rendezVous) {
      console.log("Rendez-vous non trouvé");
      return;
    }

    // Créer la notification d'annulation pour le Médecin
    const notification = new Notification({
      contenu: `Le rendez-vous avec le patient ${rendezVous.patient.nom} a été annulé.`,
      canal: 'Email', // Ou SMS selon la préférence
      destinataire: rendezVous.médecin._id, // Notification envoyée au Médecin
      rendezVous: rendezVousId,
      statut: 'En attente',
      type: 'Annulation'
    });

    // Sauvegarder la notification dans la base de données
    await notification.save();

    // Exemple d'envoi par Email (fonction à définir)
    sendEmail(rendezVous.médecin.email, notification.contenu);

    console.log('Notification d\'annulation envoyée au Médecin');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification d\'annulation au Médecin:', error);
  }
};


