// routes/rendezvous.routes.js
import express from 'express';
import { prendreRendezVous } from '../controllers/rendezvous.controller.js';
import { annulerRendezVous } from '../controllers/rendezvous.controller.js';
import { getRendezVousParMedecin } from '../controllers/rendezvous.controller.js';
const router = express.Router();
router.post('/prendre', prendreRendezVous);
router.post('/annuler', annulerRendezVous);
router.get('/medecin/:medecinId', getRendezVousParMedecin);
export default router;






