import express from 'express';
import { body, validationResult } from 'express-validator';

import Patient from '../models/patient.model.js'; // Modèle Patient
import {
  register,
  getPatientBasicInfo,
  getPatientInfo,
  updateProfile,
} from '../controllers/patient.controller.js';

const router = express.Router();

// Middleware validation pour updateProfile
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

// Récupération liste patients (sans mot de passe)
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().select('-motDePasse -__v');
    res.json({ patients });
  } catch (error) {
    console.error('❌ Erreur récupération patients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des patients' });
  }
});

// Routes récupération infos patient
router.get('/patient/:patientId/info', getPatientBasicInfo);
router.get('/patient/:patientId/basic', getPatientInfo);

// Route modification profil patient (route FIXE /me)
router.put(
  '/me',
  profileUpdateValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });
    next();
  },
  updateProfile
);

export default router;
