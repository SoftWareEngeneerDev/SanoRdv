import express from 'express';
import {
  notifPatientConfirmation,
  notifPatientAnnulation,
  notifPatientRappel,
  notifMedecinConfirmation,
  notifMedecinAnnulation,
  scheduleRappels
} from '../controllers/notification.controller.js'; 
import { getNotifications } from '../controllers/notification.controller.js';

const router = express.Router();

// Routes pour les notifications
// Notification de confirmation pour le patient
router.post('/notification/patient/confirmation', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifPatientConfirmation(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Notification de confirmation envoyée au patient.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Notification de confirmation pour le médecin
router.post('/notification/medecin/confirmation', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifMedecinConfirmation(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Notification de confirmation envoyée au médecin.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Notification d'annulation pour le patient
router.post('/notification/patient/annulation', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifPatientAnnulation(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Notification d\'annulation envoyée au patient.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Notification d'annulation pour le médecin
router.post('/notification/medecin/annulation', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifMedecinAnnulation(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Notification d\'annulation envoyée au médecin.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Notification de rappel pour le patient
router.post('/notification/patient/rappel', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifPatientRappel(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Rappel envoyé au patient.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour récupérer les notifications d'un patient ou d'un médecin
router.get('/notification/:type/:id', async (req, res) => {
  const { type, id } = req.params; // Récupère le type (patient/medecin) et l'ID
  try {
    // Vérifiez que le type est valide
    if (!['patient', 'medecin'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Le type de destinataire doit être "patient" ou "medecin".' });
    }

    // Utilisez le contrôleur pour récupérer les notifications du destinataire
    const notifications = await getNotifications(type, id);

    if (!notifications.length) {
      return res.status(404).json({ success: false, message: `Aucune notification trouvée pour ce ${type}.` });
    }

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour récupérer les notifications d'un patient ou d'un médecin
router.get('/:type/:id', getNotifications);

export default router;
