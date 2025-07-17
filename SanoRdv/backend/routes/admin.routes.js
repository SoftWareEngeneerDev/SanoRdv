import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

import Medecin from '../models/medecin.model.js';
import Patient from '../models/patient.model.js';
import { ajouterPatient } from '../controllers/admin.controller.js';


import {
  ajouterMedecin,
  createDefaultAdmin,
  modifierMedecin,
  modifierPatient,
  supprimerMedecin,
  supprimerPatient,
  desactiverMedecin,
  desactiverPatient,
  activerPatient,
  activerMedecin
} from '../controllers/admin.controller.js';


// 📌 Route pour créer l'admin par défaut
router.post('/init', createDefaultAdmin);


// 📌 Médecins

// Ajouter un médecin
router.post('/ajouter', ajouterMedecin);

// Liste de tous les médecins
router.get('/medecins', async (req, res) => {
  try {
    const medecins = await Medecin.find().select('-motDePasse -__v');
    res.json({ medecins });
  } catch (error) {
    console.error('Erreur lors du chargement des médecins:', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des médecins' });
  }
});

// ✅ Nouveau : Récupérer un médecin par ID
router.get('/medecins/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const medecin = await Medecin.findById(id).select('-motDePasse -__v');
    if (!medecin) {
      return res.status(404).json({ message: 'Médecin introuvable' });
    }
    res.json(medecin);
  } catch (error) {
    console.error('Erreur récupération médecin par ID :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un médecin
router.put('/medecins/:id', modifierMedecin);

// Supprimer un médecin
router.delete('/medecins/:id', supprimerMedecin);

// Activer / désactiver un médecin
router.patch('/medecins/:id/desactivation', desactiverMedecin);
router.patch('/medecins/:id/activation', activerMedecin);


// 📌 Patients

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

// Ajouter un patient
router.post('/patients', ajouterPatient); // ✅ Ajout patient


// Modifier un patient
router.put('/patients/:id', modifierPatient);

// Supprimer un patient
router.delete('/patients/:id', supprimerPatient);

// Activer / désactiver un patient
router.patch('/patients/:id/desactivation', desactiverPatient);
router.patch('/patients/:id/activation', activerPatient);


export default router;
