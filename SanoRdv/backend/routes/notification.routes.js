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


//-----------------------------Patient-------------------------------------
// ------Route pour envoyer une confirmation de rendez-vous au patient-----
//-------------------------------------------------------------------------
router.post('/notification/patient/confirmation/:rdvId', async (req, res) => {
  const { rdvId } = req.params;
  try {
    const result = await notifPatientConfirmation(rdvId);
    res.status(200).json({ success: true, message: 'Confirmation envoyée', notification: result.notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de la confirmation', error: error.message });
  }
});

// Route pour envoyer une annulation de rendez-vous au patient
router.post('/notification/patient/annulation/:rdvId', async (req, res) => {
  const { rdvId } = req.params;
  try {
    const result = await notifPatientAnnulation(rdvId);
    res.status(200).json({ success: true, message: 'Annulation envoyée', notification: result.notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'annulation', error: error.message });
  }
});

// Route pour envoyer un rappel de rendez-vous au patient
router.post('/notification/patient/rappel/:rdvId', async (req, res) => {
  const { rdvId } = req.params;
  try {
    const result = await notifPatientRappel(rdvId);
    res.status(200).json({ success: true, message: 'Rappel envoyé', notification: result.notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du rappel', error: error.message });
  }
});


//-------------------------Médecin--------------------------------------
// ---Route pour envoyer une confirmation de rendez-vous au médecin-----
//----------------------------------------------------------------------
router.post('/notification/medecin/confirmation/:rdvId', async (req, res) => {
  const { rdvId } = req.params;
  try {
    const result = await notifMedecinConfirmation(rdvId);
    res.status(200).json({ success: true, message: 'Confirmation envoyée au médecin', notification: result.notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de la confirmation au médecin', error: error.message });
  }
});

// Route pour envoyer une annulation de rendez-vous au médecin
router.post('/notification/medecin/annulation/:rdvId', async (req, res) => {
  const { rdvId } = req.params;
  try {
    const result = await notifMedecinAnnulation(rdvId);
    res.status(200).json({ success: true, message: 'Annulation envoyée au médecin', notification: result.notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'annulation au médecin', error: error.message });
  }
});

// Route pour planifier et envoyer des rappels automatiques pour les rendez-vous de demain
router.post('/notification/schedule/rappels', async (req, res) => {
  try {
    await scheduleRappels();
    res.status(200).json({ success: true, message: 'Rappels envoyés pour les rendez-vous de demain' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi des rappels', error: error.message });
  }
});


// Route pour récupérer les notifications d'un patient ou d'un médecin
router.get('/:type/:id', getNotifications);

export default router;
