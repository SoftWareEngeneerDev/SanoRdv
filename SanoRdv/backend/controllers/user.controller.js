import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import Medecin from '../models/medecin.model.js'; 
import Patient from '../models/patient.model.js';
import { sanitizeInput, handleError } from '../utils/helpers.js';
import { sendResetPasswordEmail } from '../utils/mail.util.js'; // Import du service d'email
import NodeCache from 'node-cache';
const codeCache = new NodeCache({ stdTTL: 900 }); 

// Variables d'environnement avec valeurs par défaut pour le développement
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production';
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'your_reset_secret_here_change_in_production';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const TOKEN_EXPIRY = '2h';
const RESET_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const BCRYPT_ROUNDS = 12;

// Patterns de validation améliorés
const PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  numeroId: /^\d{4,}$/, // Numéro d'identification médecin
  ine: /^(INE[-_]?)?\d{4,}$/i, // INE avec ou sans préfixe
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Mapping des modèles
const USER_MODELS = {
  admin: Admin,
  medecin: Medecin,
  patient: Patient
};

/**
 * Trouve un utilisateur par identifiant (email, numéro ID, ou INE)
 * Version améliorée avec meilleure détection des types
 */
const findUser = async (identifier) => {
  const cleanId = sanitizeInput(identifier);
  
  try {
    console.log(`🔍 Recherche utilisateur avec identifiant: "${cleanId}"`);
    
    // 1. Recherche par email (Admin, Médecin, Patient)
    if (PATTERNS.email.test(cleanId)) {
      console.log('📧 Recherche par email...');
      
      // Recherche dans tous les modèles
      const [admin, medecin, patient] = await Promise.all([
        Admin.findOne({ 
          email: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
        }).select('+motDePasse'),
        Medecin.findOne({ 
          email: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
        }).select('+motDePasse'),
        Patient.findOne({ 
          email: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
        }).select('+motDePasse')
      ]);
      
      if (admin) {
        console.log('✅ Admin trouvé par email');
        return { user: admin, role: 'admin' };
      }
      if (medecin) {
        console.log('✅ Médecin trouvé par email');
        return { user: medecin, role: 'medecin' };
      }
      if (patient) {
        console.log('✅ Patient trouvé par email');
        return { user: patient, role: 'patient' };
      }
    }
    
    // 2. Recherche par numéro ID (Médecin uniquement)
    if (PATTERNS.numeroId.test(cleanId)) {
      console.log('🔢 Recherche par numéro ID médecin...');
      const medecin = await Medecin.findOne({ 
        numeroIdentification: cleanId 
      }).select('+motDePasse');
      
      if (medecin) {
        console.log('✅ Médecin trouvé par numéro ID');
        return { user: medecin, role: 'medecin' };
      }
    }
    
    // 3. Recherche par INE (Patient uniquement)
    if (PATTERNS.ine.test(cleanId)) {
      console.log('🆔 Recherche par INE...');
      
      // Normaliser l'INE (enlever les préfixes et tirets)
      const normalizedINE = cleanId.replace(/^(INE[-_]?)/i, '');
      
      // Rechercher avec différentes variantes
      const patient = await Patient.findOne({
        $or: [
          { ine: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { ine: { $regex: new RegExp(`^INE[-_]?${normalizedINE}$`, 'i') } },
          { ine: normalizedINE }
        ]
      }).select('+motDePasse');
      
      if (patient) {
        console.log('✅ Patient trouvé par INE');
        return { user: patient, role: 'patient' };
      }
    }
    
    // 4. Recherche générale par identifiant unique
    console.log('🔍 Recherche générale dans tous les modèles...');
    const [adminById, medecinById, patientById] = await Promise.all([
      Admin.findOne({ 
        $or: [
          { email: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }
        ]
      }).select('+motDePasse'),
      Medecin.findOne({ 
        $or: [
          { numeroIdentification: cleanId },
          { email: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }
        ]
      }).select('+motDePasse'),
      Patient.findOne({ 
        $or: [
          { ine: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { email: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }
        ]
      }).select('+motDePasse')
    ]);
    
    if (adminById) {
      console.log('✅ Admin trouvé par recherche générale');
      return { user: adminById, role: 'admin' };
    }
    if (medecinById) {
      console.log('✅ Médecin trouvé par recherche générale');
      return { user: medecinById, role: 'medecin' };
    }
    if (patientById) {
      console.log('✅ Patient trouvé par recherche générale');
      return { user: patientById, role: 'patient' };
    }

    console.log('❌ Aucun utilisateur trouvé');
    return { user: null, role: null };
  } catch (error) {
    console.error('❌ Erreur lors de la recherche utilisateur:', error);
    throw error;
  }
};

/**
 * Trouve un utilisateur par email pour la récupération de mot de passe
 */
const findUserByEmail = async (email) => {
  const cleanEmail = sanitizeInput(email);
  
  try {
    console.log(`🔍 Recherche par email pour reset: "${cleanEmail}"`);
    
    const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const [admin, medecin, patient] = await Promise.all([
      Admin.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }),
      Medecin.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }),
      Patient.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } })
    ]);

    if (admin) {
      console.log('✅ Admin trouvé pour reset');
      return { user: admin, role: 'admin' };
    }
    if (medecin) {
      console.log('✅ Médecin trouvé pour reset');
      return { user: medecin, role: 'medecin' };
    }
    if (patient) {
      console.log('✅ Patient trouvé pour reset');
      return { user: patient, role: 'patient' };
    }
    
    console.log('❌ Aucun utilisateur trouvé pour reset');
    return { user: null, role: null };
  } catch (error) {
    console.error('❌ Erreur lors de la recherche par email:', error);
    throw error;
  }
};

/**
 * Met à jour un utilisateur dans la base de données
 */
const updateUser = async (userId, role, updateData) => {
  const Model = USER_MODELS[role];
  if (!Model) {
    throw new Error(`Rôle invalide: ${role}`);
  }
  
  try {
    return await Model.findByIdAndUpdate(userId, updateData, { new: true });
  } catch (error) {
    console.error(`❌ Erreur mise à jour utilisateur ${role}:`, error);
    throw error;
  }
};

/**
 * CONNEXION
 */
export const login = async (req, res) => {
  try {
    const { UserID, motDePasse } = req.body;
    
    console.log('🔐 Tentative de connexion:', { UserID: UserID ? 'fourni' : 'manquant', motDePasse: motDePasse ? 'fourni' : 'manquant' });

    // Validation des données
    if (!UserID || !motDePasse) {
      console.log('❌ Données manquantes');
      return res.status(400).json({ 
        message: "Identifiant et mot de passe requis.",
        error: "MISSING_CREDENTIALS"
      });
    }

    if (typeof motDePasse !== 'string' || motDePasse.trim() === '') {
      console.log('❌ Mot de passe invalide');
      return res.status(400).json({ 
        message: "Mot de passe invalide.",
        error: "INVALID_PASSWORD"
      });
    }

    // Vérification des variables d'environnement
    if (!JWT_SECRET || JWT_SECRET === 'your_jwt_secret_here_change_in_production') {
      console.error('⚠️ JWT_SECRET non configuré en production');
    }

    // Recherche de l'utilisateur
    const { user, role } = await findUser(UserID);

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(401).json({ 
        message: "Identifiant ou mot de passe incorrect.",
        error: "INVALID_CREDENTIALS"
      });
    }

    console.log(`✅ Utilisateur trouvé: ${role} - ${user.nom} ${user.prenom}`);

    // Vérifier si le compte est verrouillé
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      console.log(`🔒 Compte verrouillé pour ${remainingTime} minutes`);
      return res.status(423).json({ 
        message: `Compte verrouillé. Réessayez dans ${remainingTime} minutes.`,
        error: "ACCOUNT_LOCKED",
        remainingTime
      });
    }

    // Vérifier le mot de passe
    if (!user.motDePasse) {
      console.log('❌ Aucun mot de passe configuré');
      return res.status(500).json({ 
        message: "Erreur de configuration du compte.",
        error: "NO_PASSWORD_SET"
      });
    }

    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
    
    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect');
      // Incrémenter les tentatives échouées
      const loginAttempts = (user.loginAttempts || 0) + 1;
      const updateData = { loginAttempts };
      
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockUntil = Date.now() + LOCKOUT_TIME;
        console.log(`🔒 Compte verrouillé après ${loginAttempts} tentatives`);
      }
      
      await updateUser(user._id, role, updateData);
      
      return res.status(401).json({ 
        message: "Identifiant ou mot de passe incorrect.",
        error: "INVALID_CREDENTIALS",
        attemptsLeft: Math.max(0, MAX_LOGIN_ATTEMPTS - loginAttempts)
      });
    }

    console.log('✅ Mot de passe valide');

    // Réinitialiser les tentatives en cas de succès
    if (user.loginAttempts > 0) {
      await updateUser(user._id, role, {
        $unset: { loginAttempts: 1, lockUntil: 1 }
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    console.log(`✅ Connexion réussie pour ${role}: ${user.nom} ${user.prenom}`);

    // Réponse de succès
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        role,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        ...(role === 'medecin' && { numeroIdentification: user.numeroIdentification }),
        ...(role === 'patient' && { ine: user.ine })
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    return handleError(error, res, "Erreur lors de la connexion");
  }
};

/**
 * DÉCONNEXION
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
 * DEMANDE DE RÉINITIALISATION DE MOT DE PASSE
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

    // Limitation de débit (1 requête/min)
    if (user.resetCodeExpire && user.resetCodeExpire > Date.now() - 60000) {
      return res.status(429).json({
        message: 'Veuillez attendre 1 minute avant de redemander un code.',
        error: 'RATE_LIMIT_EXCEEDED'
      });
    }

    // Générer un code (6 chiffres)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = await bcrypt.hash(resetCode, 8);

    // Stocker en BDD (comme avant)
    await updateUser(user._id, role, {
      resetCode: hashedResetCode,
      resetCodeExpire: Date.now() + RESET_CODE_EXPIRY,
      resetAttempts: 0
    });

    // 🔹 Stocker aussi en cache { code: email } (pour éviter de redemander l'email)
    codeCache.set(resetCode, email); // Expire automatiquement après 15 min

    // Envoyer l'email (comme avant)
    try {
      await sendResetPasswordEmail(user.email, resetCode, role, user.nom, user.prenom);
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

export const verifyResetCode = async (req, res) => {
  try {
    const { resetCode } = req.body; // 🔹 On ne reçoit plus que le code

    if (!resetCode) {
      return res.status(400).json({ 
        message: 'Code requis.',
        error: 'MISSING_CODE'
      });
    }

    // 🔹 1. Trouver l'email associé au code dans le cache
    const email = codeCache.get(resetCode);
    if (!email) {
      return res.status(400).json({ 
        message: 'Code invalide ou expiré.',
        error: 'INVALID_CODE'
      });
    }

    // 2. Vérifier l'utilisateur (comme avant)
    const { user, role } = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ 
        message: 'Session invalide. Recommencez.',
        error: 'INVALID_SESSION'
      });
    }

    // 3. Vérifier l'expiration (comme avant)
    if (!user.resetCodeExpire || user.resetCodeExpire <= Date.now()) {
      return res.status(400).json({ 
        message: 'Code expiré. Redemandez-en un.',
        error: 'CODE_EXPIRED'
      });
    }

    // 4. Vérifier les tentatives (comme avant)
    if ((user.resetAttempts || 0) >= 3) {
      return res.status(429).json({
        message: 'Trop de tentatives. Redemandez un code.',
        error: 'TOO_MANY_ATTEMPTS'
      });
    }

    // 5. Vérifier le code (comme avant)
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

    // 6. Générer un token JWT final (comme avant)
    const resetToken = jwt.sign(
      { userId: user._id, role, purpose: 'password_reset', email },
      JWT_RESET_SECRET,
      { expiresIn: '15m' }
    );

    // 7. Supprimer le code du cache (éviter la réutilisation)
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
 * RÉINITIALISATION DU MOT DE PASSE
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

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, BCRYPT_ROUNDS);

    // Mettre à jour le mot de passe
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
 * VÉRIFICATION DU TOKEN DE RÉINITIALISATION
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