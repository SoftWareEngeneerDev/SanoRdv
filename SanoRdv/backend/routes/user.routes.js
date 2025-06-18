import express from 'express';
import { body, validationResult } from 'express-validator';
import { login, forgotPassword, logout, resetPassword, verifyResetCode } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

//  Route POST /login
router.post(
  '/login',
  [
    // ✅ Validation du champ UserID
    body('UserID')
      .notEmpty().withMessage('L\'identifiant (UserID) est requis.')
      .custom((value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const numericRegex = /^\d{4,}$/;
        const ineRegex = /^(INE[-_]?)?\d{4,}$/i;
        const systemIDRegex = /^(admin|MED|patient)[-_]\w+$/i;

        if (
          !emailRegex.test(value) &&
          !numericRegex.test(value) &&
          !ineRegex.test(value) &&
          !systemIDRegex.test(value)
        ) {
          throw new Error('Identifiant invalide : Email, ID numérique, INE ou ID système requis');
        }

        return true;
      }),

    // ✅ Validation du mot de passe
    body('motDePasse')
      .notEmpty().withMessage('Le mot de passe est obligatoire.')
      .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }

    // ✅ Si tout est bon, délégation au contrôleur
    login(req, res);
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
