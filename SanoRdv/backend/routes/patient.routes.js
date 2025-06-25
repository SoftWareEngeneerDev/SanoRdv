import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, getPatientBasicInfo, getPatientInfo } from '../controllers/patient.controller.js';



import Patient from '../models/patient.model.js'; // ✅ à ajouter tout en haut


const router = express.Router();

/* ==========================================================================
   📌 INSCRIPTION
   ========================================================================== */
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

router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().select('-motDePasse -__v');
    res.json({ patients });
  } catch (error) {
    console.error('❌ Erreur récupération patients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des patients' });
  }
});




// Route pour récupérer les informations de base du patient (nom, prénom, email)
router.get('/patient/:patientId/info', getPatientBasicInfo);

// Route alternative
router.get('/patient/:patientId/basic', getPatientInfo);

// Route avec l'ID spécifique de votre patient
router.get('/patient/685942963ab92ec0447dfc2a/info', getPatientBasicInfo);

export default router;
