import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  register
} from '../controllers/patient.controller.js';


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
    console.log('Requête /register reçue avec:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }
    next();
  },
  register
);

export default router;
