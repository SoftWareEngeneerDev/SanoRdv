import express from 'express';
import { body, validationResult } from 'express-validator';
import { modifierMedecin ,getMedecinById} from '../controllers/medecin.controller.js';

const router = express.Router();

const profileUpdateValidation = [
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('anneeExperience')
    .optional()
    .isInt({ min: 0, max: 70 })
    .withMessage("Année d'expérience invalide"),
  body('motDePasse')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Mot de passe trop court (min 8 caractères)'),
    // Ajoute d’autres validations au besoin
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }
    next();
  },
];

router.put('/:id', profileUpdateValidation, modifierMedecin);
router.get('/:id', getMedecinById);

export default router;
