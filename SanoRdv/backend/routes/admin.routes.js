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
  modifierProfilAdmin
} from '../controllers/admin.controller.js';

dotenv.config();

const router = express.Router();
const jsonBodyParser10mb = express.json({ limit: '10mb' });

/* -------------------------------------------------------------------------- */
/*                            ADMIN – ROUTES                                  */
/* -------------------------------------------------------------------------- */

// 🔐 Route protégée pour créer un super admin depuis Postman
router.post('/create-super-admin', async (req, res) => {
  const { email, motDePasse, prenom, nom, photo, secret } = req.body;

  if (secret !== process.env.ADMIN_CREATION_SECRET) {
    return res.status(403).json({ success: false, message: 'Clé secrète invalide' });
  }

  try {
    const result = await createDefaultAdmin(email, motDePasse, { prenom, nom, photo });

    if (result.success) {
      return res.status(201).json({
        message: 'Super administrateur créé avec succès',
        admin: result.admin,
        emailSent: result.emailSent
      });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Erreur lors de la création du super admin :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Création d’un admin générique (classique)
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

// Init admin (usage unique)
router.post('/init', createDefaultAdmin);

// Modifier le profil admin (avec limite 10mb)
router.put('/:id', jsonBodyParser10mb, modifierProfilAdmin);

/* -------------------------------------------------------------------------- */
/*                            MÉDECINS – CRUD                                 */
/* -------------------------------------------------------------------------- */

router.post('/ajouter', ajouterMedecin);

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

router.put('/medecins/:id', modifierMedecin);
router.delete('/medecins/:id', supprimerMedecin);
router.patch('/medecins/:id/desactivation', desactiverMedecin);
router.patch('/medecins/:id/activation', activerMedecin);

/* -------------------------------------------------------------------------- */
/*                             PATIENTS – CRUD                                */
/* -------------------------------------------------------------------------- */

router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().select('-motDePasse -__v');
    res.json({ patients });
  } catch (error) {
    console.error('Erreur chargement patients:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.put('/patients/:id', modifierPatient);
router.delete('/patients/:id', supprimerPatient);
router.patch('/patients/:id/desactivation', desactiverPatient);
router.patch('/patients/:id/activation', activerPatient);

export default router;
