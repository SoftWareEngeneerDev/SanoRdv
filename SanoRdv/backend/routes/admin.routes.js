import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import Medecin from '../models/medecin.model.js';
import Patient from '../models/patient.model.js';
import Admin from '../models/admin.model.js';
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
  activerMedecin,
  modifierProfilAdmin // <-- Import de ta nouvelle fonction contrôleur
} from '../controllers/admin.controller.js';

dotenv.config();

const router = express.Router();

// Middleware JSON personnalisé avec limite augmentée (10 Mo)
const jsonBodyParser10mb = express.json({ limit: '10mb' });

/* -------------------------------------------------------------------------- */
/*                              ADMIN  –  ROUTES                              */
/* -------------------------------------------------------------------------- */

// Créer l’admin “par défaut” (une seule fois)
router.post('/init', createDefaultAdmin);

router.post('/create-admin', async (req, res) => {
  try {
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_CREATION_SECRET) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { email, password, role = 'admin' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe obligatoires' });
    }

    if (await Admin.findOne({ email })) {
      return res.status(409).json({ message: 'Un admin avec cet email existe déjà' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ email, motDePasse: hashed, role });

    return res.status(201).json({
      message: 'Admin créé avec succès',
      admin: { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role }
    });
  } catch (error) {
    console.error('Erreur création admin :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier le profil admin (avec limite 10mb)
router.put('/:id', jsonBodyParser10mb, modifierProfilAdmin);

/* -------------------------------------------------------------------------- */
/*                              MÉDECINS – CRUD                               */
/* -------------------------------------------------------------------------- */

// Ajouter un médecin
router.post('/ajouter', ajouterMedecin);

// Liste de tous les médecins + total
router.get('/medecins', async (req, res) => {
  try {
    const medecins = await Medecin.find().select('-motDePasse -__v');
    const totalMedecins = await Medecin.countDocuments();
    res.json({ medecins, total: totalMedecins });
  } catch (error) {
    console.error('Erreur lors du chargement des médecins:', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des médecins' });
  }
});

// Récupérer un médecin par ID
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

// Modifier, supprimer, (dés)activer médecins
router.put('/medecins/:id', modifierMedecin);
router.delete('/medecins/:id', supprimerMedecin);
router.patch('/medecins/:id/desactivation', desactiverMedecin);
router.patch('/medecins/:id/activation', activerMedecin);

/* -------------------------------------------------------------------------- */
/*                               PATIENTS – CRUD                              */
/* -------------------------------------------------------------------------- */

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

// Modifier, supprimer, (dés)activer patients
router.put('/patients/:id', modifierPatient);
router.delete('/patients/:id', supprimerPatient);
router.patch('/patients/:id/desactivation', desactiverPatient);
router.patch('/patients/:id/activation', activerPatient);

export default router;
