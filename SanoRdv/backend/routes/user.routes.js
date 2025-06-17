import express from 'express';
import { body, validationResult } from 'express-validator';
import { login, forgotPassword, logout, resetPassword, verifyResetCode } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

//  Route POST /login
router.post(
  '/login',
  [
    body('UserID')
      .custom((value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const numericRegex = /^\d+$/;
        const ineRegex = /^INE-\d{8}-\d{6}$/;
        if (!emailRegex.test(value) && !numericRegex.test(value) && !ineRegex.test(value)) {
          throw new Error('Email, ID numérique ou INE requis');
        }
        return true;
      }),
    body('motDePasse').notEmpty().withMessage('Le mot de passe est obligatoire'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });

    login(req, res); //  on délègue au contrôleur
  }
);

/* ==========================================================================
    DÉCONNEXION (authentifié)
   ========================================================================== */
router.post('/logout', authenticate, logout);

/* ==========================================================================
    MOT DE PASSE OUBLIÉ - Envoi du code
   ========================================================================== */
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email invalide')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });
    next();
  },
  forgotPassword
);

/* ==========================================================================
   VÉRIFICATION DU CODE DE RÉINITIALISATION
   ========================================================================== */
router.post(
  '/verify-reset-code',
  [body('resetCode').notEmpty().withMessage('Code requis')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }
    next();
  },
  verifyResetCode
);

/* ==========================================================================
    RÉINITIALISATION DU MOT DE PASSE
   ========================================================================== */
router.post(
  '/reset-password',
  [
    body('motDePasse')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit faire au moins 6 caractères'),
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
