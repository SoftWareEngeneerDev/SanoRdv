import express from 'express';
import { body, validationResult } from 'express-validator';
import { login, forgotPassword, logout, resetPassword, verifyResetCode } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

/* ==========================================================================
    VALIDATION PERSONNALISÉE POUR LES IDENTIFIANTS
   ========================================================================== */
const validateUserID = (value) => {
  // Regex pour les différents formats d'identifiants
  const patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    IDadmin: /^ADMIN_\d+$/i,           // Format: admin-1750251190039
    IDmedecin: /^MED-\d+$/i,           // Format: MED-001
    IDpatient: /^INE-\d{8}-\d{6}$/i   // Format: INE-20250618-113054
  };

  // Vérifier si l'identifiant correspond à l'un des formats acceptés
  const isValid = Object.values(patterns).some(pattern => pattern.test(value));
  
  if (!isValid) {
    throw new Error('Format d\'identifiant invalide. Utilisez un email, IDadmin (admin-xxxxx), IDmedecin (MED-xxx) ou IDpatient (INE-xxxxxxxx-xxxxxx)');
  }
  
  return true;
};

/* ==========================================================================
    VALIDATION RENFORCÉE DU MOT DE PASSE
   ========================================================================== */
const validatePassword = (value) => {
  // Critères de sécurité du mot de passe
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumbers = /\d/.test(value);
  const hasSpecialChar = /[@$!%*?&]/.test(value);

  if (value.length < minLength) {
    throw new Error(`Le mot de passe doit contenir au moins ${minLength} caractères`);
  }
  
  if (!hasUpperCase) {
    throw new Error('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!hasLowerCase) {
    throw new Error('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!hasNumbers) {
    throw new Error('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!hasSpecialChar) {
    throw new Error('Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)');
  }
  
  return true;
};

/* ==========================================================================
    ROUTE POST /login - CONNEXION
   ========================================================================== */
router.post(
  '/login',
  [
    // Validation de l'identifiant utilisateur
    body('UserID')
      .notEmpty()
      .withMessage('L\'identifiant utilisateur est obligatoire')
      .trim()
      .custom(validateUserID),
    
    // Validation du mot de passe
    body('motDePasse')
      .notEmpty()
      .withMessage('Le mot de passe est obligatoire')
      .isLength({ min: 1 })
      .withMessage('Le mot de passe ne peut pas être vide'),
  ],
  (req, res) => {
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erreurs de validation:', errors.array());
      return res.status(400).json({ 
        message: 'Données de connexion invalides',
        erreurs: errors.array(),
        error: 'VALIDATION_ERROR'
      });
    }

    // Log pour débugger
    console.log('🔐 Tentative de connexion avec:', {
      UserID: req.body.UserID,
      hasPassword: !!req.body.motDePasse
    });

    // Délégation au contrôleur
    login(req, res);
  }
);

/* ==========================================================================
    ROUTE POST /logout - DÉCONNEXION (authentifié)
   ========================================================================== */
router.post('/logout', authenticate, logout);

/* ==========================================================================
    ROUTE POST /forgot-password - MOT DE PASSE OUBLIÉ
   ========================================================================== */
router.post(
  '/forgot-password',
  [
    body('email')
      .notEmpty()
      .withMessage('L\'email est obligatoire')
      .isEmail()
      .withMessage('Format d\'email invalide')
      .normalizeEmail()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erreurs validation forgot-password:', errors.array());
      return res.status(400).json({ 
        message: 'Email invalide',
        erreurs: errors.array(),
        error: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  forgotPassword
);

/* ==========================================================================
    ROUTE POST /verify-reset-code - VÉRIFICATION DU CODE DE RÉINITIALISATION
   ========================================================================== */
router.post(
  '/verify-reset-code',
  [
    body('resetCode')
      .notEmpty()
      .withMessage('Le code de réinitialisation est obligatoire')
      .isLength({ min: 4, max: 10 })
      .withMessage('Le code doit contenir entre 4 et 10 caractères')
      .trim(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Format d\'email invalide')
      .normalizeEmail()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erreurs validation verify-reset-code:', errors.array());
      return res.status(400).json({ 
        message: 'Code de vérification invalide',
        erreurs: errors.array(),
        error: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  verifyResetCode
);

/* ==========================================================================
    ROUTE POST /reset-password - RÉINITIALISATION DU MOT DE PASSE
   ========================================================================== */
router.post(
  '/reset-password',
  [
    body('motDePasse')
      .notEmpty()
      .withMessage('Le nouveau mot de passe est obligatoire')
      .custom(validatePassword),
    
    body('confirmationMotDePasse')
      .notEmpty()
      .withMessage('La confirmation du mot de passe est obligatoire')
      .custom((value, { req }) => {
        if (value !== req.body.motDePasse) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        return true;
      }),
  
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erreurs validation reset-password:', errors.array());
      return res.status(400).json({ 
        message: 'Données de réinitialisation invalides',
        erreurs: errors.array(),
        error: 'VALIDATION_ERROR'
      });
    }
    next();
  },
  resetPassword
);

/* ==========================================================================
    ROUTE GET /validate-token - VALIDATION DU TOKEN (optionnelle)
   ========================================================================== */
router.get('/validate-token', authenticate, (req, res) => {
  // Si le middleware authenticate passe, le token est valide
  res.status(200).json({
    message: 'Token valide',
    user: {
      id: req.user.userId,
      role: req.user.role,
      email: req.user.email
    },
    isValid: true
  });
});


export default router;