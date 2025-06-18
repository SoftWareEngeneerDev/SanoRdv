import express from 'express';
import { ajouterDisponibilite, supprimerDisponibilite, obtenirDisponibilitesFiltrees } from '../controllers/medecin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/:medecinId/disponibilites', authMiddleware, ajouterDisponibilite);
router.delete('/:medecinId/disponibilites', authMiddleware, supprimerDisponibilite);
router.get('/:medecinId/disponibilites', obtenirDisponibilitesFiltrees);

export default router;
