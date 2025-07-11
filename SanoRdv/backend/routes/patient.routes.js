import express from 'express';
import { body, validationResult } from 'express-validator';
<<<<<<< HEAD
import { register, getPatientBasicInfo, getPatientInfo } from '../controllers/patient.controller.js';



import Patient from '../models/patient.model.js'; // ✅ à ajouter tout en haut


const router = express.Router();

/* ==========================================================================
   📌 INSCRIPTION
   ========================================================================== */
=======

import Patient from '../models/patient.model.js'; // Modèle Patient
import {
  register,
  getPatientBasicInfo,
  getPatientInfo,
  updateProfile, // <-- À importer depuis ton contrôleur
} from '../controllers/patient.controller.js';

const router = express.Router();

// Middleware validation pour updateProfile (exemple)
const profileUpdateValidation = [
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('motDePasse').optional().isLength({ min: 8 }).withMessage('Mot de passe trop court'),
  body('confirmationMotDePasse').optional().custom((value, { req }) => {
    if (value !== req.body.motDePasse) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    return true;
  }),
  body('sex')
    .optional()
    .isIn(['masculin', 'féminin', 'autre'])
    .withMessage('Sexe invalide'),
  body('dateNaissance')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date de naissance invalide'),
];

// Route d'inscription
>>>>>>> origin/master
router.post(
  '/register',
  [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('telephone').notEmpty().withMessage('Téléphone requis'),
    body('motDePasse')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit faire au moins 6 caractères'),
    body('confirmationMotDePasse').custom((value, { req }) => {
      if (value !== req.body.motDePasse) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
    body('sex')
      .optional()
      .isIn(['masculin', 'féminin', 'autre'])
      .withMessage('Sexe invalide'),
    body('dateNaissance')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Date de naissance invalide'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });
    next();
  },
  register
);

<<<<<<< HEAD
=======
// Route récupération liste patients (sans mot de passe)
>>>>>>> origin/master
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().select('-motDePasse -__v');
    res.json({ patients });
  } catch (error) {
    console.error('❌ Erreur récupération patients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des patients' });
  }
});

<<<<<<< HEAD



// Route pour récupérer les informations de base du patient (nom, prénom, email)
router.get('/patient/:patientId/info', getPatientBasicInfo);

// Route alternative
router.get('/patient/:patientId/basic', getPatientInfo);

// Route avec l'ID spécifique de votre patient
router.get('/patient/685942963ab92ec0447dfc2a/info', getPatientBasicInfo);
=======
// Routes récupération infos patient
router.get('/patient/:patientId/info', getPatientBasicInfo);
router.get('/patient/:patientId/basic', getPatientInfo);

// Route modification profil patient
router.put(
  '/patients/:id',
  profileUpdateValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });
    next();
  },
  updateProfile
);
>>>>>>> origin/master

export default router;
