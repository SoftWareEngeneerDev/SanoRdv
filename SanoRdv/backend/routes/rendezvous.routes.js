import express from 'express';
import { prendreRendezVous, annulerRendezVous } from '../controllers/rendezvous.controller.js';
// import { authMiddleware } from '../middlewares/auth.middleware.js';
const router = express.Router();
// :coche_blanche: Créer un rendez-vous (authentification requise)
router.post('/rendezvous', prendreRendezVous);
// :coche_blanche: Annuler un rendez-vous (authentification requise)
router.put('/rendezvous/:id/annuler', annulerRendezVous);
export default router;
