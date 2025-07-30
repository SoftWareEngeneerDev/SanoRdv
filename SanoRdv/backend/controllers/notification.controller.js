
// import Notification from '../models/notification.model.js';
// import Creneau from '../models/creneau.model.js';
// // import Patient from '../models/patient.model.js';
// // import medecin from '../models/medecin.model.js';
// import nodemailer from 'nodemailer';
// import { DateTime } from 'luxon';

// // Configuration du transporteur NodeMailer
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: process.env.SMTP_SECURE === 'true', // Si 'true', utilise TLS
//   auth: {
//     user: process.env.SMTP_USER, // L'adresse e-mail de l'utilisateur
//     pass: process.env.SMTP_PASS // Le mot de passe ou mot de passe d'application
//   },
//   tls: {
//     rejectUnauthorized: false // Option de validation des certificats SSL (si nécessaire)
//   }
// });


// // Templates de notification
// const templates = {
//   patient: {
//     Confirmation: (rdv) => ({
//       subject: `Confirmation de votre rendez-vous du ${formatDate(rdv.date)}`,
//       text: `Votre rendez-vous avec le Dr ${rdv.medecin.nom} est confirmé pour le ${formatDate(rdv.date)} à ${formatTime(rdv.time)}.`,
//       html: modelPatientEmail(rdv, 'confirmé')
//     }),
//     Annulation: (rdv) => ({
//       subject: `Annulation de votre rendez-vous du ${formatDate(rdv.date)}`,
//       text: `Votre rendez-vous avec le Dr ${rdv.medecin.nom} prévu le ${formatDate(rdv.date)} a été annulé.`,
//       html: modelPatientEmail(rdv, 'annulé')
//     }),
//     Rappel: (rdv) => ({
//       subject: `Rappel: Rendez-vous demain à ${formatTime(rdv.date)}`,
//       text: `Rappel: Vous avez un rendez-vous avec le Dr ${rdv.medecin.nom} ${rdv.medecin.prenom} demain à ${formatTime(rdv.date)}.`,
//       html: modelPatientEmail(rdv, 'rappel')
//     })
//   },
//   medecin: {
//     Confirmation: (rdv) => ({
//       subject: `Nouveau rendez-vous avec ${rdv.patient.nom}`,
//       text: `Vous avez un nouveau rendez-vous avec ${rdv.patient.nom} ${rdv.patient.prenom}  le ${formatDate(rdv.date)} à ${formatTime(rdv.time)}.`,
//       html: modelMedecinEmail(rdv, 'nouveau'),

//     }),
    
//     Annulation: (rdv) => ({
//       subject: `Annulation de rendez-vous avec ${rdv.patient.nom}`,
//       text: `Le rendez-vous avec ${rdv.patient.nom} prévu le ${formatDate(rdv.date)} a été annulé.`,
//       html: modelMedecinEmail(rdv, 'annulé')
//     })
//   }
// };

// // Fonctions utilitaires
// const formatDate = (date) => DateTime.fromJSDate(date).setLocale('fr').toLocaleString(DateTime.DATE_FULL);
// const formatTime = (date) => DateTime.fromJSDate(date).setLocale('fr').toLocaleString(DateTime.TIME_SIMPLE);

// const modelPatientEmail = (rdv, status) => `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//     <h2 style="color: #3173b4ff;">Rendez-vous ${status}</h2>
//     <p>Bonjour ${rdv.patient.nom},</p>
    
//     <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
//       <p><strong>Statut:</strong> ${status.toUpperCase()}</p>
//       <p><strong>Date:</strong> ${formatDate(rdv.date)}</p>
//       <p><strong>Heure:</strong> ${formatTime(rdv.time)}</p>
//       <p><strong>Médecin:</strong> Dr. ${rdv.medecin.nom}</p>
//       ${status === 'annulé' ? '<p><strong>Motif:</strong> Veuillez contacter le secrétariat</p>' : ''}
//     </div>

//     <p>Cordialement,<br>L'équipe médicale</p>
//   </div>
// `;

// const modelMedecinEmail = (rdv, status) => `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//     <h2 style="color: #2c3e50;">Rendez-vous ${status}</h2>
//     <p>Dr. ${rdv.medecin.nom},</p>
    
//     <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
//       <p><strong>Patient:</strong> ${rdv.patient.nom}</p>
//       <p><strong>Date:</strong> ${formatDate(rdv.date)}</p>
//       <p><strong>Heure:</strong> ${formatTime(rdv.time)}</p>
//       ${status === 'annulé' ? '<p><strong>Motif:</strong> Le patient a annulé</p>' : ''}
//     </div>

//     <p>Cordialement,<br>Le système de gestion</p>
//   </div>
// `;

// // Fonction principale d'envoi
// const envoieNotification = async (rdvId, recipientType, notificationType) => {
//   const rdv = await RendezVous.findById(rdvId).populate('patient medecin');
  
//   if (!rdv) {
//     throw new Error('Rendez-vous non trouvé');
//   }

//   // Vérification que les références sont peuplées correctement
//   const recipient = recipientType === 'patient' ? rdv.patient : rdv.medecin;
  
//   if (!recipient) {
//     throw new Error(`${recipientType} non trouvé dans le rendez-vous`);
//   }

//   if (!recipient.nom || !recipient.email) {
//     throw new Error(`Le ${recipientType} n'a pas de nom ou d'email dans la base de données`);
//   }

//   const template = templates[recipientType][notificationType](rdv);

//   // Création de la notification en base
//   const notification = new Notification({
//     contenu: template.text,
//     canal: 'Email',
//     destinataire: recipient._id,
//     rendezVous: rdvId,
//     statut: 'En attente',
//     type: notificationType,
//     destinataireModel: recipientType
//   });

//   await notification.save();

//   try {
//     // Envoi de l'email
//     await transporter.sendMail({
//       from: `"Clinique Médicale" <${process.env.SMTP_FROM}>`,
//       to: recipient.email,
//       subject: template.subject,
//       text: template.text,
//       html: template.html
//     });

//     notification.statut = 'Envoyé';
//     await notification.save();
//     return { success: true, notification };

//   } catch (error) {
//     notification.statut = 'Échec';
//     await notification.save();
//     throw error;
//   }
// };


// // Fonctions exportées
// export const notifPatientConfirmation = (rdvId) => envoieNotification(rdvId, 'patient', 'Confirmation');
// export const notifPatientAnnulation = (rdvId) => envoieNotification(rdvId, 'patient', 'Annulation');
// export const notifPatientRappel = (rdvId) => envoieNotification(rdvId, 'patient', 'Rappel');
// export const notifMedecinConfirmation = (rdvId) => envoieNotification(rdvId, 'medecin', 'Confirmation');
// export const notifMedecinAnnulation = (rdvId) => envoieNotification(rdvId, 'medecin', 'Annulation');
// //export const notifMedecintRappel = (rdvId) => envoieNotification(rdvId, 'medecin', 'Rappel');

// // Planificateur de rappels (à appeler dans un cron job)
// export const scheduleRappels = async () => {
//   const tomorrow = new Date();
//   tomorrow.setDate(tomorrow.getDate() + 1);
//   tomorrow.setHours(0, 0, 0, 0);

//   const endDate = new Date(tomorrow);
//   endDate.setHours(23, 59, 59, 999);

//   const rdvs = await RendezVous.find({
//     date: { $gte: tomorrow, $lte: endDate }
//   }).populate('patient medecin');

//   for (const rdv of rdvs) {
//     await notifPatientRappel(rdv._id);
//     console.log(`Rappel envoyé pour le RDV ${rdv._id}`);
//   }
// };

// // ------------------Fonction qui retourne les notifications du medecin ou du patient


// // Controller pour récupérer les notifications d'un patient ou d'un médecin
// export const getNotifications = async (req, res) => {
//   try {
//     const { type, id } = req.params;  // Type et ID du destinataire (patient ou medecin)

//     // Vérification du type de destinataire
//     if (!['patient', 'medecin'].includes(type)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Le type de destinataire doit être "patient" ou "medecin".'
//       });
//     }

//     // Trouver les notifications pour un patient ou un médecin
//     const notifications = await Notification.find({
//       destinataireModel: type, // patient ou medecin
//       destinataire: id // ID du destinataire
//     })
//       .populate('rendezVous')  // Peupler le modèle du rendez-vous si nécessaire
//       .sort({ createdAt: -1 }); // Trier les notifications par date décroissante

//     if (!notifications.length) {
//       return res.status(404).json({
//         success: false,
//         message: `Aucune notification trouvée pour ce ${type}.`
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       notifications
//     });
//   } catch (error) {
//     console.error("Erreur lors de la récupération des notifications:", error);
//     return res.status(500).json({
//       success: false,
//       message: 'Erreur serveur lors de la récupération des notifications.',
//       error: error.message
//     });
//   }
// };



import Notification from '../models/notification.model.js';
import Creneau from '../models/creneau.model.js';
import nodemailer from 'nodemailer';
import { DateTime } from 'luxon';


// Configuration du transporteur NodeMailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const combineDateTimeISO = (date, time) => {
  if (!date || !time) return null;

  const [hour, minute] = time.split(':');
  const dt = DateTime.fromJSDate(date).set({
    hour: parseInt(hour, 10),
    minute: parseInt(minute, 10),
    second: 0,
    millisecond: 0
  });

  return dt.toISO();
};

// Fonctions utilitaires pour formater date et heure
const formatDate = (date) => DateTime.fromJSDate(date).setLocale('fr').toLocaleString(DateTime.DATE_FULL);
const formatTime = (date) => DateTime.fromJSDate(date).setLocale('fr').toLocaleString(DateTime.TIME_SIMPLE);

// Templates email pour patient
const modelPatientEmail = (creneau, timeSlot, status) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #3173b4ff;">Rendez-vous ${status}</h2>
    <p>Bonjour ${timeSlot.patientId.nom} ${timeSlot.patientId.prenom},</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Statut:</strong> ${status.toUpperCase()}</p>
      <p><strong>Date et heure :</strong> ${DateTime.fromISO(creneau.dateHeureISO).setLocale('fr').toLocaleString(DateTime.DATETIME_FULL)}</p>
      <p><strong>Médecin:</strong> Dr. ${creneau.agenda.medecin.nom} ${creneau.agenda.medecin.prenom}</p>
      ${status === 'annulé' ? '<p><strong>Motif:</strong> Veuillez contacter le secrétariat</p>' : ''}
    </div>
    <p>Cordialement,<br>L'équipe médicale</p>
  </div>
`;

// Templates email pour médecin
const modelMedecinEmail = (creneau, timeSlot, status) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">Rendez-vous ${status}</h2>
    <p>Dr. ${creneau.agenda.medecin.nom} ${creneau.agenda.medecin.prenom},</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Date et heure :</strong> ${DateTime.fromISO(creneau.dateHeureISO).setLocale('fr').toLocaleString(DateTime.DATETIME_FULL)}</p>
      <p><strong>Heure:</strong> ${timeSlot.time}</p>
      ${status === 'annulé' ? '<p><strong>Motif:</strong> Le patient a annulé</p>' : ''}
    </div>
    <p>Cordialement,<br>Le système de gestion</p>
  </div>
`;

// Templates de notification
const templates = {
  patient: {
    Confirmation: (creneau, timeSlot) => ({
      subject: `Confirmation de votre rendez-vous du ${formatDate(creneau.date)}`,
      text: `Votre rendez-vous avec le Dr ${creneau.agenda.medecin.nom} ${creneau.agenda.medecin.prenom} est confirmé pour le ${formatDate(creneau.date)} à ${timeSlot.time}.`,
      html: modelPatientEmail(creneau, timeSlot, 'confirmé')
    }),
    Annulation: (creneau, timeSlot) => ({
      subject: `Annulation de votre rendez-vous du ${formatDate(creneau.date)}`,
      text: `Votre rendez-vous avec le Dr ${creneau.agenda.medecin.nom} ${creneau.agenda.medecin.prenom} prévu le ${formatDate(creneau.date)} a été annulé.`,
      html: modelPatientEmail(creneau, timeSlot, 'annulé')
    }),
    Rappel: (creneau, timeSlot) => ({
      subject: `Rappel: Rendez-vous demain à ${timeSlot.time}`,
      text: `Rappel: Vous avez un rendez-vous avec le Dr ${creneau.agenda.medecin.nom} ${creneau.agenda.medecin.prenom}  demain à ${timeSlot.time}.`,
      html: modelPatientEmail(creneau, timeSlot, 'rappel')
    })
  },
  medecin: {
    Confirmation: (creneau, timeSlot) => ({
      subject: `Nouveau rendez-vous avec ${timeSlot.patientId.nom}`,
      text: `Vous avez un nouveau rendez-vous avec ${timeSlot.patientId.nom} ${timeSlot.patientId.prenom} le ${formatDate(creneau.date)} à ${timeSlot.time}.`,
      html: modelMedecinEmail(creneau, timeSlot, 'nouveau')
    }),
    Annulation: (creneau, timeSlot) => ({
      subject: `Annulation de rendez-vous avec ${timeSlot.patientId.nom} ${timeSlot.patientId.prenom}`,
      text: `Le rendez-vous avec ${timeSlot.patientId.nom} ${timeSlot.patientId.prenom} prévu le ${formatDate(creneau.date)} a été annulé.`,
      html: modelMedecinEmail(creneau, timeSlot, 'annulé')
    })
  }
};

// Fonction principale d'envoi
const envoieNotification = async (creneauId, timeSlotId, recipientType, notificationType) => {
  // On récupère le creneau avec le timeSlot spécifique et les relations patient/medecin
  const creneau = await Creneau.findById(creneauId)
    .populate('agenda.medecin')
    .populate('timeSlots.patientId');

  if (!creneau) throw new Error('Créneau non trouvé');

  // Trouver le timeSlot ciblé
  const timeSlot = creneau.timeSlots.id(timeSlotId);
  if (!timeSlot) throw new Error('TimeSlot non trouvé');

  // Identifier le destinataire (patient ou medecin)
  const recipient = recipientType === 'patient' ? timeSlot.patientId : creneau.agenda.medecin;

  if (!recipient) throw new Error(`${recipientType} non trouvé`);

  // Ajout du champ dateHeureISO
  const dateHeureISO = combineDateTimeISO(creneau.date, timeSlot.time);

  // Préparer un objet rdv synthétique pour tes templates
  const rdv = {
    date: creneau.date,
    time: timeSlot.time,
    patient: timeSlot.patientId,
    medecin: creneau.agenda.medecin,
    dateHeureISO
  };

  const template = templates[recipientType][notificationType](creneau, timeSlot);

  // Enregistrement notification en base
  const notification = new Notification({
    contenu: template.text,
    canal: 'Email',
    destinataire: recipient._id,
    rendezVous: creneauId,
    statut: 'En attente',
    type: notificationType,
    destinataireModel: recipientType
  });

  await notification.save();

  try {
    await transporter.sendMail({
      from: `"Clinique Médicale" <${process.env.SMTP_FROM}>`,
      to: recipient.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    });

    notification.statut = 'Envoyé';
    await notification.save();
    return { success: true, notification };
  } catch (error) {
    notification.statut = 'Échec';
    await notification.save();
    throw error;
  }
};


// Fonctions exportées
export const notifPatientConfirmation = (creneauId, timeSlotId) => envoieNotification(creneauId, timeSlotId, 'patient', 'Confirmation');
export const notifPatientAnnulation = (creneauId, timeSlotId) => envoieNotification(creneauId, timeSlotId, 'patient', 'Annulation');
export const notifPatientRappel = (creneauId, timeSlotId) => envoieNotification(creneauId, timeSlotId, 'patient', 'Rappel');
export const notifMedecinConfirmation = (creneauId, timeSlotId) => envoieNotification(creneauId, timeSlotId, 'medecin', 'Confirmation');
export const notifMedecinAnnulation = (creneauId, timeSlotId) => envoieNotification(creneauId, timeSlotId, 'medecin', 'Annulation');

// Planificateur de rappels (exemple à appeler dans un cron job)
export const scheduleRappels = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endDate = new Date(tomorrow);
  endDate.setHours(23, 59, 59, 999);

  // Trouver tous les créneaux de demain avec au moins un timeSlot réservé
  const creneaux = await Creneau.find({
    date: { $gte: tomorrow, $lte: endDate }
  }).populate({
    path: 'agenda',
    populate: { path: 'medecin', select: 'nom prenom email' }
  }).populate('timeSlots.patientId');

  for (const creneau of creneaux) {
    for (const ts of creneau.timeSlots) {
      if (ts.status === 'reserve') {
        await notifPatientRappel(creneau._id, ts._id);
        console.log(`Rappel envoyé pour le RDV ${creneau._id} timeSlot ${ts._id}`);
      }
    }
  }
};


// Controller pour récupérer les notifications d'un patient ou d'un médecin
export const getNotifications = async (req, res) => {
  try {
    const { type, id } = req.params;  // Type et ID du destinataire (patient ou medecin)

    if (!['patient', 'medecin'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Le type de destinataire doit être "patient" ou "medecin".'
      });
    }

    // Trouver les notifications pour un patient ou un médecin
    const notifications = await Notification.find({
      destinataireModel: type,
      destinataire: id
    })
      .populate('rendezVous')
      .sort({ createdAt: -1 });

    if (!notifications.length) {
      return res.status(404).json({
        success: false,
        message: `Aucune notification trouvée pour ce ${type}.`
      });
    }


    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notifications.',
      error: error.message
    });
  }
};
