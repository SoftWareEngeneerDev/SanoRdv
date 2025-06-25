import express from 'express';
const router = express.Router();
import Medecin from '../models/medecin.model.js';
import Patient from '../models/patient.model.js';

import {
  ajouterMedecin,
  createDefaultAdmin,
  modifierMedecin,
  modifierPatient,
  supprimerMedecin,
  supprimerPatient,
  desactiverMedecin,
  desactiverPatient,
  activerPatient ,
  activerMedecin
} from '../controllers/admin.controller.js';

// Route pour créer l'admin par défaut
router.post('/init', createDefaultAdmin);

// Ajouter un médecin
router.post('/ajouter', ajouterMedecin);

// Liste des médecins
router.get('/medecins', async (req, res) => {
  try {
    const medecins = await Medecin.find().select('-motDePasse -__v');
    res.json({ medecins });
  } catch (error) {
    console.error('Erreur lors du chargement des médecins:', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des médecins' });
  }
});

// Modifier un médecin (ID MongoDB)
router.put('/medecins/:id', modifierMedecin);

// Supprimer un médecin
router.delete('/medecins/:id', supprimerMedecin);

// Activer / désactiver un médecin (via IDmedecin)
router.patch('/medecins/:id/desactivation', desactiverMedecin);
router.patch('/medecins/:id/activation', activerMedecin);

// Liste des patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().select('-motDePasse -__v');
    res.json({ patients });
  } catch (error) {
    console.error('Erreur chargement patients:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un patient
router.put('/patients/:id', modifierPatient);

// Supprimer un patient
router.delete('/patients/:id', supprimerPatient);

// Activer / désactiver un patient
router.patch('/patients/:id/desactivation', desactiverPatient);
router.patch('/patients/:id/activation', activerPatient );

export default router;
