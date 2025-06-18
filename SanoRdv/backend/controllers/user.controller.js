// ==========================
// 🔐 AUTHENTICATION CONTROLLER
// ==========================

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';

import Admin from '../models/admin.model.js';
import Medecin from '../models/medecin.model.js'; 
import Patient from '../models/patient.model.js';

import { sanitizeInput, handleError } from '../utils/helpers.js';
import { sendResetPasswordEmail } from '../utils/mail.util.js';

// Cache temporaire pour codes (réinitialisation, etc.)
const codeCache = new NodeCache({ stdTTL: 900 }); 

// Variables d'environnement avec valeurs par défaut
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production';
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'your_reset_secret_here_change_in_production';
const RESET_CODE_EXPIRY = 2 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const TOKEN_EXPIRY = '24h';
const BCRYPT_ROUNDS = 12;

// Patterns de validation
const PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  numeroId: /^\d{4,}$/,
  ine: /^(INE[-_]?)?\d{4,}$/i,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

const USER_MODELS = {
  admin: Admin,
  medecin: Medecin,
  patient: Patient
};

// ==========================
// 🔍 UTILITY FUNCTIONS
// ==========================

/**
 * Trouve un utilisateur par identifiant (email, ID, numéro, etc.)
 * @param {string} identifier - Identifiant de l'utilisateur
 * @returns {Promise<{user: object|null, role: string|null}>}
 */
const findUser = async (identifier) => {
  const cleanId = sanitizeInput(identifier);
  try {
    // Recherche par Email
    if (PATTERNS.email.test(cleanId)) {
      const [admin, medecin, patient] = await Promise.all([
        Admin.findOne({ email: new RegExp(`^${cleanId}$`, 'i') }).select('+motDePasse'),
        Medecin.findOne({ email: new RegExp(`^${cleanId}$`, 'i') }).select('+motDePasse'),
        Patient.findOne({ email: new RegExp(`^${cleanId}$`, 'i') }).select('+motDePasse')
      ]);
      if (admin) return { user: admin, role: 'admin' };
      if (medecin) return { user: medecin, role: 'medecin' };
      if (patient) return { user: patient, role: 'patient' };
    }

    // Recherche par ID personnalisé (admin, medecin, patient)
    const checks = [
      { model: Admin, key: 'IDadmin', role: 'admin' },
      { model: Medecin, key: 'IDmedecin', role: 'medecin' },
      { model: Patient, key: 'IDpatient', role: 'patient' }
    ];

    for (const { model, key, role } of checks) {
      const user = await model.findOne({ [key]: new RegExp(`^${cleanId}$`, 'i') }).select('+motDePasse');
      if (user) return { user, role };
    }

    // Recherche par numeroId (ancien système)
    if (PATTERNS.numeroId.test(cleanId)) {
      const medecin = await Medecin.findOne({ numeroIdentification: cleanId }).select('+motDePasse');
      if (medecin) return { user: medecin, role: 'medecin' };
    }

    // Recherche par INE (ancien système)
    if (PATTERNS.ine.test(cleanId)) {
      const ineVariants = [cleanId, cleanId.replace(/^(INE[-_]?)/i, '')];
      const patient = await Patient.findOne({ ine: { $in: ineVariants.map(i => new RegExp(`^${i}$`, 'i')) } }).select('+motDePasse');
      if (patient) return { user: patient, role: 'patient' };
    }

    return { user: null, role: null };
  } catch (error) {
    console.error('❌ Erreur recherche utilisateur:', error);
    throw error;
  }
};

/**
 * Trouve un utilisateur par email uniquement
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<{user: object|null, role: string|null}>}
 */
const findUserByEmail = async (email) => {
  const cleanEmail = sanitizeInput(email);
  try {
    const [admin, medecin, patient] = await Promise.all([
      Admin.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') }),
      Medecin.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') }),
      Patient.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') })
    ]);
    if (admin) return { user: admin, role: 'admin' };
    if (medecin) return { user: medecin, role: 'medecin' };
    if (patient) return { user: patient, role: 'patient' };
    return { user: null, role: null };
  } catch (error) {
    console.error('❌ Erreur recherche par email:', error);
    throw error;
  }
};

/**
 * Met à jour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} role - Rôle de l'utilisateur
 * @param {object} updateData - Données à mettre à jour
 * @returns {Promise<object>}
 */
const updateUser = async (userId, role, updateData) => {
  const Model = USER_MODELS[role];
  if (!Model) throw new Error(`Rôle invalide: ${role}`);
  try {
    return await Model.findByIdAndUpdate(userId, updateData, { new: true });
  } catch (error) {
    console.error(`❌ Erreur mise à jour ${role}:`, error);
    throw error;
  }
};

// ==========================
// 🔑 AUTH CONTROLLERS
// ==========================

/**
 * Connexion utilisateur
 * @param {object} req - Requête HTTP
 * @param {object} res - Réponse HTTP
 */
export const login = async (req, res) => {
  try {
    const { UserID, motDePasse } = req.body;
    
    // Validation des entrées
    if (!UserID || !motDePasse) {
      return res.status(400).json({ 
        message: 'Identifiant et mot de passe requis.', 
        error: 'MISSING_CREDENTIALS',
        success: false
      });
    }

    // Recherche de l'utilisateur
    const { user, role } = await findUser(UserID);
    if (!user || !user.motDePasse) {
      return res.status(401).json({ 
        message: 'Identifiant ou mot de passe incorrect.', 
        error: 'INVALID_CREDENTIALS',
        success: false
      });
    }

    // Vérification du verrouillage du compte
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        message: `Compte verrouillé. Réessayez dans ${remaining} minutes.`, 
        error: 'ACCOUNT_LOCKED',
        success: false
      });
    }

    // Vérification sécurisée du mot de passe
    let isValid;
    try {
      isValid = await bcrypt.compare(
        motDePasse.toString(), 
        user.motDePasse.toString()
      );
    } catch (bcryptError) {
      console.error('❌ Erreur de comparaison bcrypt:', bcryptError);
      return res.status(500).json({
        message: 'Erreur lors de la vérification du mot de passe.',
        error: 'SERVER_ERROR',
        success: false
      });
    }

    if (!isValid) {
      const attempts = (user.loginAttempts || 0) + 1;
      const update = { 
        loginAttempts: attempts,
        lastFailedAttempt: new Date()
      };
      
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        update.lockUntil = Date.now() + LOCKOUT_TIME;
        update.loginAttempts = 0; // Reset pour le prochain verrouillage
      }
      
      await updateUser(user._id, role, update);
      
      return res.status(401).json({ 
        message: 'Mot de passe incorrect.', 
        error: 'INVALID_CREDENTIALS',
        attemptsLeft: MAX_LOGIN_ATTEMPTS - attempts,
        success: false
      });
    }

    // Réinitialisation des tentatives après succès
    if (user.loginAttempts > 0 || user.lockUntil) {
      await updateUser(user._id, role, { 
        $unset: { 
          loginAttempts: "", 
          lockUntil: "",
          lastFailedAttempt: "" 
        },
        lastLogin: new Date()
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        role, 
        email: user.email,
        lastLogin: new Date()
      }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRY }
    );

    // Audit de connexion réussie
    await updateUser(user._id, role, {
      lastLogin: new Date(),
      loginCount: (user.loginCount || 0) + 1
    });

    // Réponse sécurisée sans données sensibles
    const userData = {
      id: user._id,
      role,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      lastLogin: user.lastLogin,
      ...(role === 'medecin' && { 
        numeroIdentification: user.numeroIdentification,
        specialite: user.specialite
      }),
      ...(role === 'patient' && { 
        ine: user.ine,
        dateNaissance: user.dateNaissance
      })
    };

    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: userData,
      success: true
    });

  } catch (error) {
    console.error('❌ Erreur login:', error);
    return res.status(500).json({
      
      message: 'Erreur serveur lors de la connexion',
      error: 'INTERNAL_SERVER_ERROR',
      success: false
    });
  }
};
/**
 * Déconnexion utilisateur
 * @param {object} req - Requête HTTP
 * @param {object} res - Réponse HTTP
 */
export const logout = async (req, res) => {
  try {
    // En cas de système avec blacklist de tokens, ajouter ici la logique
    // Pour le moment, la déconnexion est gérée côté client en supprimant le token
    
    console.log('✅ Déconnexion réussie');
    res.status(200).json({ 
      message: 'Déconnexion réussie.',
      success: true
    });
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    return handleError(error, res, 'Erreur lors de la déconnexion');
  }
};

/**
 * Demande de réinitialisation de mot de passe
 * @param {object} req - Requête HTTP
 * @param {object} res - Réponse HTTP
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !PATTERNS.email.test(email)) {
      return res.status(400).json({ 
        message: 'Email invalide.',
        error: 'INVALID_EMAIL'
      });
    }

    const { user, role } = await findUserByEmail(email);

    // Message générique pour éviter l'énumération
    if (!user) {
      return res.status(200).json({ 
        message: "Si cet email existe, un code de réinitialisation a été envoyé.",
        success: true
      });
    }

    // Génération du code (6 chiffres)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = await bcrypt.hash(resetCode, 8);

    // Mise à jour de l'utilisateur
    await updateUser(user._id, role, {
      resetCode: hashedResetCode,
      resetCodeExpire: Date.now() + RESET_CODE_EXPIRY,
      resetAttempts: 0
    });

    // Stockage en cache pour vérification ultérieure
    codeCache.set(resetCode, email);

    // Envoi de l'email
    try {
      await sendResetPasswordEmail(
        user.email, 
        resetCode, 
        role, 
        user.nom, 
        user.prenom
      );
      console.log('✅ Email envoyé');
    } catch (emailError) {
      console.error('❌ Erreur email:', emailError);
    }

    res.status(200).json({
      message: 'Code envoyé à votre email.',
      success: true
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return handleError(error, res, 'Erreur lors de la demande de réinitialisation');
  }
};

/**
 * Vérification du code de réinitialisation
 * @param {object} req - Requête HTTP
 * @param {object} res - Réponse HTTP
 */
export const verifyResetCode = async (req, res) => {
  try {
    const { resetCode } = req.body;

    if (!resetCode) {
      return res.status(400).json({ 
        message: 'Code requis.',
        error: 'MISSING_CODE'
      });
    }

    // Récupération de l'email depuis le cache
    const email = codeCache.get(resetCode);
    if (!email) {
      return res.status(400).json({ 
        message: 'Code invalide ou expiré.',
        error: 'INVALID_CODE'
      });
    }

    // Vérification de l'utilisateur
    const { user, role } = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ 
        message: 'Session invalide. Recommencez.',
        error: 'INVALID_SESSION'
      });
    }

    // Vérification de l'expiration
    if (!user.resetCodeExpire || user.resetCodeExpire <= Date.now()) {
      return res.status(400).json({ 
        message: 'Code expiré. Redemandez-en un.',
        error: 'CODE_EXPIRED'
      });
    }

    // Vérification des tentatives
    if ((user.resetAttempts || 0) >= 3) {
      return res.status(429).json({
        message: 'Trop de tentatives. Redemandez un code.',
        error: 'TOO_MANY_ATTEMPTS'
      });
    }

    // Vérification du code
    const isValidCode = await bcrypt.compare(resetCode.toString().trim(), user.resetCode);
    if (!isValidCode) {
      await updateUser(user._id, role, { 
        resetAttempts: (user.resetAttempts || 0) + 1 
      });
      return res.status(400).json({
        message: 'Code incorrect.',
        error: 'INVALID_CODE',
        attemptsRemaining: 2 - (user.resetAttempts || 0)
      });
    }

    // Génération du token JWT
    const resetToken = jwt.sign(
      { userId: user._id, role, purpose: 'password_reset', email },
      JWT_RESET_SECRET,
      { expiresIn: '15m' }
    );

    // Suppression du code du cache
    codeCache.del(resetCode);

    res.status(200).json({
      message: 'Code validé. Vous pouvez réinitialiser votre mot de passe.',
      resetToken,
      success: true
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return handleError(error, res, 'Erreur lors de la vérification du code');
  }
};

/**
 * Réinitialisation du mot de passe
 * @param {object} req - Requête HTTP
 * @param {object} res - Réponse HTTP
 */
export const resetPassword = async (req, res) => {
  try {
    const { motDePasse, confirmationMotDePasse } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Token manquant.',
        error: 'MISSING_TOKEN'
      });
    }

    const resetToken = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(resetToken, JWT_RESET_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        message: 'Token invalide ou expiré.',
        error: 'INVALID_TOKEN'
      });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(403).json({ 
        message: 'Token invalide.',
        error: 'INVALID_TOKEN_PURPOSE'
      });
    }

    // Validation des mots de passe
    if (!motDePasse || !confirmationMotDePasse) {
      return res.status(400).json({ 
        message: 'Mot de passe et confirmation requis.',
        error: 'MISSING_PASSWORDS'
      });
    }

    if (!PATTERNS.password.test(motDePasse)) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
        error: 'INVALID_PASSWORD_FORMAT'
      });
    }

    if (motDePasse !== confirmationMotDePasse) {
      return res.status(400).json({ 
        message: 'Les mots de passe ne correspondent pas.',
        error: 'PASSWORDS_MISMATCH'
      });
    }

    // Hashage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, BCRYPT_ROUNDS);

    // Mise à jour de l'utilisateur
    await updateUser(decoded.userId, decoded.role, {
      motDePasse: hashedPassword,
      $unset: {
        resetCode: 1,
        resetCodeExpire: 1,
        resetAttempts: 1,
        loginAttempts: 1,
        lockUntil: 1
      }
    });

    res.status(200).json({ 
      message: 'Mot de passe réinitialisé avec succès.',
      success: true
    });

  } catch (error) {
    console.error('❌ Erreur réinitialisation:', error);
    return handleError(error, res, 'Erreur lors de la réinitialisation');
  }
};

/**
 * Vérification du token de réinitialisation
 * @param {object} req - Requête HTTP
 * @param {object} res - Réponse HTTP
 */
export const verifyResetToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Token manquant.',
        error: 'MISSING_TOKEN'
      });
    }

    const resetToken = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(resetToken, JWT_RESET_SECRET);
      
      if (decoded.purpose !== 'password_reset') {
        return res.status(403).json({ 
          message: 'Token invalide.',
          error: 'INVALID_TOKEN_PURPOSE'
        });
      }

      res.status(200).json({
        message: 'Token valide.',
        success: true,
        userRole: decoded.role,
        email: decoded.email
      });

    } catch (jwtError) {
      return res.status(401).json({ 
        message: 'Token invalide ou expiré.',
        error: 'INVALID_TOKEN'
      });
    }

  } catch (error) {
    console.error('❌ Erreur vérification token:', error);
    return handleError(error, res, 'Erreur lors de la vérification du token');
  }
};

export { findUser, findUserByEmail, updateUser };