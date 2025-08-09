// 


import express from 'express';
import {
  notifPatientConfirmation,
  notifPatientAnnulation,
  notifPatientRappel,
  notifMedecinConfirmation,
  notifMedecinAnnulation,
  getNotifications
} from '../controllers/notification.controller.js'; 

const router = express.Router();

// --- Notifications Patient ---
router.post('/patient/confirmation', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifPatientConfirmation(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Notification de confirmation envoyée au patient.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/patient/annulation', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifPatientAnnulation(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Notification d\'annulation envoyée au patient.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/patient/rappel', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifPatientRappel(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Rappel envoyé au patient.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Notifications Médecin ---
router.post('/medecin/confirmation', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifMedecinConfirmation(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Notification de confirmation envoyée au médecin.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/medecin/annulation', async (req, res) => {
  const { creneauId, timeSlotId } = req.body;
  try {
    await notifMedecinAnnulation(creneauId, timeSlotId);
    res.status(200).json({ success: true, message: 'Notification d\'annulation envoyée au médecin.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Récupération des notifications ---
// router.get('/:type/:id', async (req, res) => {
//   const { type, id } = req.params;
//   try {
//     if (!['patient', 'medecin'].includes(type)) {
//       return res.status(400).json({ success: false, message: 'Le type de destinataire doit être "patient" ou "medecin".' });
//     }

//     const notifications = await getNotifications(type, id);

//     if (!notifications.length) {
//       return res.status(404).json({ success: false, message: `Aucune notification trouvée pour ce ${type}.` });
//     }

//     res.status(200).json({ success: true, notifications });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

router.get('/:type/:id', getNotifications);


export default router;
