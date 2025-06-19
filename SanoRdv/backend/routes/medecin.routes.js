import express from 'express';
import { ajouterMedecin } from '../controllers/medecin.controller.js';
import { rechercherMedecins } from '../controllers/medecin.controller.js';

const router = express.Router();

router.post('/ajouter', ajouterMedecin);
router.get('/recherche', rechercherMedecins);

export default router;
