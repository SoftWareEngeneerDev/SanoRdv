import express from 'express';
import { ajouterDisponibilite, supprimerDisponibilite, obtenirDisponibilitesFiltrees } from '../controllers/medecin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/disponibilites', authMiddleware, ajouterDisponibilite);
router.delete('/disponibilites', authMiddleware, supprimerDisponibilite);
router.get('/disponibilites', obtenirDisponibilitesFiltrees);

export default router;
