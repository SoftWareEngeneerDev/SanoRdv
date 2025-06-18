import express from 'express';
import { prendreRendezVous, annulerRendezVous } from '../controllers/rendezvous.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, prendreRendezVous);
router.put('/:id/annuler', authMiddleware, annulerRendezVous);

export default router;
