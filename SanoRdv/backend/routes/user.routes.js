import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, logout } from '../controllers/user.controller.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('nom').notEmpty().withMessage('Le nom est obligatoire'),
    body('prenom').notEmpty().withMessage('Le prénom est obligatoire'),
    body('email').isEmail().withMessage('Email invalide'),
    body('telephone').notEmpty().withMessage('Le téléphone est obligatoire'),
    body('motDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('dateNaissance').optional().isISO8601().toDate().withMessage('Date de naissance invalide'),
  ],
  (req, res, next) => {
    // Valide les erreurs ici
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }
    next();
  },
  register
);
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email ou ID invalide'),
    body('motDePasse').notEmpty().withMessage('Le mot de passe est obligatoire'),
  ],
  login
);
router.post('/logout', logout);
export default router;
