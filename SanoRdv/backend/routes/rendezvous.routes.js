import express from 'express';
import { prendreRendezVous, annulerRendezVous } from '../controllers/rendezvous.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ Créer un rendez-vous (authentification requise)
router.post('/rendezvous', authMiddleware, prendreRendezVous);

// ✅ Annuler un rendez-vous (authentification requise)
router.put('/rendezvous/:id/annuler', authMiddleware, annulerRendezVous);

export default router;
