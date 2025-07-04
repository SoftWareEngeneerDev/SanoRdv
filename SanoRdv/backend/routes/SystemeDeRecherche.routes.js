import express from 'express';
import { rechercheAvanceeParLettre, autocompletionAvancee } from '../controllers/SystemeDeRecherche.controller.js';

const router = express.Router();

// Route pour la recherche avancée par lettre
router.get('/recherche-avancee', rechercheAvanceeParLettre);

// Route pour l'autocomplétion avancée
router.get('/autocompletion-avancee', autocompletionAvancee);

export default router;
