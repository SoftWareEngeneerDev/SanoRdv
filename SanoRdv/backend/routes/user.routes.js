import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  register,
  login,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

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

router.post(
  '/login',
  [
    body('UserID').custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const numericRegex = /^\d+$/;
      const ineRegex = /^INE-\d{8}-\d{6}$/;
      if (!emailRegex.test(value) && !numericRegex.test(value) && !ineRegex.test(value)) {
        throw new Error('Email ou ID numérique requis');
      }
      return true;
    }),
    body('motDePasse').notEmpty().withMessage('Le mot de passe est obligatoire'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });
    next();
  },
  login
);

router.post('/logout', authMiddleware, logout);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage("Email invalide")],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });
    next();
  },
  forgotPassword
);

router.post(
  '/verify-reset-code',
  [body('resetCode').notEmpty().withMessage('Code requis')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });
    next();
  },
  verifyResetCode
);

router.post(
  '/reset-password',
  [
    body('motDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit faire au moins 6 caractères'),
    body('confirmationMotDePasse').custom((value, { req }) => {
      if (value !== req.body.motDePasse) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });
    next();
  },
  resetPassword
);

export default router;
