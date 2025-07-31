import express from 'express';
import {
  prendreRendezVous,
  annulerRendezVous,
  getRendezVousParMedecin,
  getRendezVousParPatient,
  getTousLesRendezVousPourAdmin,
  getRendezVousParId,
  getStatistiquesParMedecin,
  getRendezVousAVenir,
  getRendezVousPasses,
  getTousLesRendezVous
} from '../controllers/rendezvous.controller.js';

import { authentifier } from '../middlewares/auth.middleware.js'; // 🔐 Ajout du middleware

const router = express.Router();

// ✔️ Prendre un rendez-vous
router.post('/', prendreRendezVous);

// ✔️ Annuler un rendez-vous
router.patch('/annuler/:id', annulerRendezVous);

// ✔️ Nouvelles routes pour rendez-vous à venir et passés
router.get('/a-venir', authentifier, getRendezVousAVenir);
router.get('/passes', authentifier, getRendezVousPasses);
router.get('/tous', authentifier, getTousLesRendezVous);

// ✔️ Liste des RDV d'un médecin
router.get('/medecin/:medecinId', authentifier, getRendezVousParMedecin);
router.get('/statistiques/:medecinId', authentifier, getStatistiquesParMedecin);

// ✔️ Liste des RDV d'un patient
router.get('/patient/:patientId', authentifier, getRendezVousParPatient);

// ✔️ Tous les RDV (admin uniquement)
router.get('/admin/tous', authentifier, getTousLesRendezVousPourAdmin);
router.get('/:id', authentifier, getRendezVousParId);

export default router;