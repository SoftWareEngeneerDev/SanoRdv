import express from 'express';
import {
  prendreRendezVous,
  annulerRendezVous,
  modifierRendezVous,
  getRendezVousParMedecin,
  getRendezVousParPatient,
  getTousLesRendezVousPourAdmin
} from '../controllers/rendezvous.controller.js';
import RendezVous from '../models/rendezvous.model.js';


import { authentifier } from '../middlewares/auth.middleware.js'; // 🔐 Ajout du middleware

const router = express.Router();

// ✔️ Prendre un rendez-vous
router.post('/', prendreRendezVous);

// ✔️ Annuler un rendez-vous
// router.put('/annuler',authentifier, annulerRendezVous);
router.put('/:id/annuler', async (req, res) => {
  try {
    const rdv = await RendezVous.findByIdAndUpdate(req.params.id, { statut: 'annulé' }, { new: true });
    if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });
    res.json(rdv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✔️ Modifier un rendez-vous
// router.put('/:id/modifier', modifierRendezVous);
router.put('/:id/modifier', (req, res) => {
  console.log('Requête reçue pour modifier RDV', req.params.id, req.body);
  res.json({ success: true, message: 'Route modifier RDV OK', id: req.params.id, data: req.body });
});

// ✔️ Liste des RDV d’un médecin
router.get('/medecin/:medecinId', authentifier, getRendezVousParMedecin);

// ✔️ Liste des RDV d’un patient
router.get('/patient/:patientId', authentifier, getRendezVousParPatient);

// ✔️ Tous les RDV (admin uniquement)
router.get('/admin/tous', authentifier, getTousLesRendezVousPourAdmin);

export default router;