import express from 'express';
import { ajouterMedecin } from '../controllers/medecin.controller.js';

const router = express.Router();

router.post('/ajouter', ajouterMedecin);

export default router;
