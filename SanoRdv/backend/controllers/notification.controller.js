
import Notification from '../models/notification.model.js';
import RendezVous from '../models/rendezvous.model.js';
import nodemailer from 'nodemailer';
import { DateTime } from 'luxon';

// Configuration du transporteur NodeMailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Templates de notification
const templates = {
  patient: {
    Confirmation: (rdv) => ({
      subject: `Confirmation de votre rendez-vous du ${formatDate(rdv.date)}`,
      text: `Votre rendez-vous avec le Dr ${rdv.medecin.nom} est confirmé pour le ${formatDate(rdv.date)} à ${formatTime(rdv.date)}.`,
      html: modelPatientEmail(rdv, 'confirmé')
    }),
    Annulation: (rdv) => ({
      subject: `Annulation de votre rendez-vous du ${formatDate(rdv.date)}`,
      text: `Votre rendez-vous avec le Dr ${rdv.medecin.nom} prévu le ${formatDate(rdv.date)} a été annulé.`,
      html: modelPatientEmail(rdv, 'annulé')
    }),
    Rappel: (rdv) => ({
      subject: `Rappel: Rendez-vous demain à ${formatTime(rdv.date)}`,
      text: `Rappel: Vous avez un rendez-vous avec le Dr ${rdv.medecin.nom} demain à ${formatTime(rdv.date)}.`,
      html: modelPatientEmail(rdv, 'rappel')
    })
  },
  medecin: {
    Confirmation: (rdv) => ({
      subject: `Nouveau rendez-vous avec ${rdv.patient.nom}`,
      text: `Vous avez un nouveau rendez-vous avec ${rdv.patient.nom} le ${formatDate(rdv.date)} à ${formatTime(rdv.date)}.`,
      html: modelMedecinEmail(rdv, 'nouveau')
    }),
    Annulation: (rdv) => ({
      subject: `Annulation de rendez-vous avec ${rdv.patient.nom}`,
      text: `Le rendez-vous avec ${rdv.patient.nom} prévu le ${formatDate(rdv.date)} a été annulé.`,
      html: modelMedecinEmail(rdv, 'annulé')
    })
  }
};

// Fonctions utilitaires
const formatDate = (date) => DateTime.fromJSDate(date).setLocale('fr').toLocaleString(DateTime.DATE_FULL);
const formatTime = (date) => DateTime.fromJSDate(date).setLocale('fr').toLocaleString(DateTime.TIME_SIMPLE);

const modelPatientEmail = (rdv, status) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">Rendez-vous ${status}</h2>
    <p>Bonjour ${rdv.patient.nom},</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Statut:</strong> ${status.toUpperCase()}</p>
      <p><strong>Date:</strong> ${formatDate(rdv.date)}</p>
      <p><strong>Heure:</strong> ${formatTime(rdv.date)}</p>
      <p><strong>Médecin:</strong> Dr. ${rdv.medecin.nom}</p>
      ${status === 'annulé' ? '<p><strong>Motif:</strong> Veuillez contacter le secrétariat</p>' : ''}
    </div>

    <p>Cordialement,<br>L'équipe médicale</p>
  </div>
`;

const modelMedecinEmail = (rdv, status) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">Rendez-vous ${status}</h2>
    <p>Dr. ${rdv.medecin.nom},</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Patient:</strong> ${rdv.patient.nom}</p>
      <p><strong>Date:</strong> ${formatDate(rdv.date)}</p>
      <p><strong>Heure:</strong> ${formatTime(rdv.date)}</p>
      ${status === 'annulé' ? '<p><strong>Motif:</strong> Le patient a annulé</p>' : ''}
    </div>

    <p>Cordialement,<br>Le système de gestion</p>
  </div>
`;

// Fonction principale d'envoi
const envoieNotification = async (rdvId, recipientType, notificationType) => {
  const rdv = await RendezVous.findById(rdvId).populate('patient medecin');
  if (!rdv) throw new Error('Rendez-vous non trouvé');

  const template = templates[recipientType][notificationType](rdv);
  const recipient = recipientType === 'patient' ? rdv.patient : rdv.medecin;

  // Création de la notification en base
  const notification = new Notification({
    contenu: template.text,
    canal: 'Email',
    destinataire: recipient._id,
    rendezVous: rdvId,
    statut: 'En attente',
    type: notificationType
  });

  await notification.save();

  try {
    // Envoi de l'email
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
export const notifPatientConfirmation = (rdvId) => envoieNotification(rdvId, 'patient', 'Confirmation');
export const notifPatientAnnulation = (rdvId) => envoieNotification(rdvId, 'patient', 'Annulation');
export const notifPatientRappel = (rdvId) => envoieNotification(rdvId, 'patient', 'Rappel');
export const notifMedecinConfirmation = (rdvId) => envoieNotification(rdvId, 'medecin', 'Confirmation');
export const notifMedecinAnnulation = (rdvId) => envoieNotification(rdvId, 'medecin', 'Annulation');

// Planificateur de rappels (à appeler dans un cron job)
export const scheduleRappels = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endDate = new Date(tomorrow);
  endDate.setHours(23, 59, 59, 999);

  const rdvs = await RendezVous.find({
    date: { $gte: tomorrow, $lte: endDate }
  }).populate('patient medecin');

  for (const rdv of rdvs) {
    await notifPatientRappel(rdv._id);
    console.log(`Rappel envoyé pour le RDV ${rdv._id}`);
  }
};

