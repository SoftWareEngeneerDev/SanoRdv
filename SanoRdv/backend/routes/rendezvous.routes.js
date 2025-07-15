import express from 'express';
import {
  prendreRendezVous,
  annulerRendezVous,
  modifierRendezVous,
  getRendezVousParMedecin,
  getRendezVousParPatient,
  getTousLesRendezVousPourAdmin
} from '../controllers/rendezvous.controller.js';

const router = express.Router();

// ✔️ Prendre un rendez-vous
router.post('/', prendreRendezVous);

// ✔️ Annuler un rendez-vous
router.put('/annuler', annulerRendezVous);

// ✔️ Modifier un rendez-vous
router.put('/modifier', modifierRendezVous);

// ✔️ Liste des RDV d’un médecin (groupés par mois)
router.get('/medecin/:medecinId', getRendezVousParMedecin);

// ✔️ Liste des RDV d’un patient
router.get('/patient/:patientId', getRendezVousParPatient);

// ✔️ Tous les RDV (admin) avec détails
router.get('/admin/tous', getTousLesRendezVousPourAdmin);

export default router;
