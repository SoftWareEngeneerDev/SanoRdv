import express from 'express';
import {
  loginAdmin,
  creerPatient,
  creerMedecin,
  changerStatutMedecin,
  changerStatutPatient,
  modifierMedecin,
  modifierPatient,
  supprimerMedecin,
  supprimerPatient
} from '../controllers/admin.controller.js';

import { authMiddleware, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Connexion publique
router.post('/login', loginAdmin);

// Toutes les autres routes sont protégées par le token et rôle admin
router.use(authMiddleware, isAdmin);

router.post('/patients', creerPatient);
router.post('/medecins', creerMedecin);

router.put('/patients/:id/statut', changerStatutPatient);
router.put('/medecins/:id/statut', changerStatutMedecin);

router.put('/patients/:id', modifierPatient);
router.put('/medecins/:id', modifierMedecin);

router.delete('/patients/:id', supprimerPatient);
router.delete('/medecins/:id', supprimerMedecin);

export default router;

