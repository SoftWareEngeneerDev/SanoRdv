import express from 'express';
import { body, validationResult } from 'express-validator';

import Patient from '../models/patient.model.js';
import {
  register,
  getPatientBasicInfo,
  getPatientInfo,
  updateProfile,
} from '../controllers/patient.controller.js';
import { upload } from '../middlewares/uploads.js';

const router = express.Router();

// Validation middleware
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

// Inscription (route complète, sans préfixe patient)
router.post(
  '/register',
  [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('telephone').notEmpty().withMessage('Téléphone requis'),
    body('motDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit faire au moins 6 caractères'),
    body('confirmationMotDePasse').custom((value, { req }) => {
      if (value !== req.body.motDePasse) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
    body('sex').optional().isIn(['masculin', 'féminin', 'autre']).withMessage('Sexe invalide'),
    body('dateNaissance').optional().isISO8601().toDate().withMessage('Date de naissance invalide'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });
    next();
  },
  register
);

// Liste patients (plus simple)
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().select('-motDePasse -__v');
    res.json({ patients });
  } catch (error) {
    console.error('❌ Erreur récupération patients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des patients' });
  }
});

// Récupérer infos basiques du patient
router.get('/:patientId/info', getPatientBasicInfo);

// Récupérer infos complètes du patient
router.get('/:patientId/basic', getPatientInfo);

// Modifier profil patient (avec upload photo optionnel)
router.put('/me/:id', upload.single('photo'), updateProfile);

export default router;
