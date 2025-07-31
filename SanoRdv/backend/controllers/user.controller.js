import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import Medecin from '../models/medecin.model.js';
import Patient from '../models/patient.model.js';
import { sanitizeInput, handleError } from '../utils/helpers.js';
import { sendResetPasswordEmail } from '../utils/mail.util.js';
import NodeCache from 'node-cache';

// Cache pour les codes de réinitialisation
const codeCache = new NodeCache({
  stdTTL: 25 * 60, // 25 minutes de durée de vie par défaut
  checkperiod: 60 // Vérification et nettoyage toutes les 60 secondes
});

// Variables d'environnement avec valeurs par défaut pour le développement
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production';
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'your_reset_secret_here_change_in_production';

// Configuration pour la sécurité et la réinitialisation
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes
const TOKEN_EXPIRY = '24h';
const BCRYPT_ROUNDS = 12;
const BUFFER_TIME = 2 * 60 * 1000;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute en millisecondes
const RESET_CODE_EXPIRY = 20 * 60 * 1000; // 20 minutes en millisecondes
const RESET_TOKEN_EXPIRY = '15m'; // 15 minutes pour le token JWT
const MAX_RESET_ATTEMPTS = 3; // Nombre maximum de tentatives de code

// Patterns de validation
const PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  IDadmin: /^admin[_-]\d+$/i, // Accepte admin_44810 ou admin-44810 (insensible à la casse)
  IDmedecin: /^MED-\d+$/i,
  IDpatient: /^INE-\d{8}-\d{6}$/i,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Mapping des modèles
const USER_MODELS = {
  admin: Admin,
  medecin: Medecin,
  patient: Patient
};

/**
 * Trouve un utilisateur par identifiant (email ou ID spécifique selon le rôle)
 */
const findUser = async (identifier) => {
  const cleanId = sanitizeInput(identifier);

  try {
    console.log(`🔍 Recherche utilisateur avec identifiant: "${cleanId}"`);

    // 1. Recherche par email (Admin, Médecin, Patient)
    if (PATTERNS.email.test(cleanId)) {
      console.log('📧 Recherche par email...');

      const escapedEmail = cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const [admin, medecin, patient] = await Promise.all([
        Admin.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }).select('+motDePasse +password'),
        Medecin.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }).select('+motDePasse +password'),
        Patient.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }).select('+motDePasse +password')
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

    // 2. Recherche par IDadmin (Admin uniquement) — ici modif pour insensible à la casse
    if (PATTERNS.IDadmin.test(cleanId)) {
      console.log('👑 Recherche par IDadmin...');
      const admin = await Admin.findOne({
        IDadmin: { $regex: new RegExp(`^${cleanId}$`, 'i') }
      }).select('+motDePasse +password');

      if (admin) {
        console.log('✅ Admin trouvé par IDadmin');
        return { user: admin, role: 'admin' };
      }
    }

    // 3. Recherche par IDmedecin (Médecin uniquement)
    if (PATTERNS.IDmedecin.test(cleanId)) {
      console.log('🩺 Recherche par IDmedecin...');
      const medecin = await Medecin.findOne({ IDmedecin: cleanId }).select('+motDePasse +password');

      if (medecin) {
        console.log('✅ Médecin trouvé par IDmedecin');
        return { user: medecin, role: 'medecin' };
      }
    }

    // 4. Recherche par IDpatient (Patient uniquement)
    if (PATTERNS.IDpatient.test(cleanId)) {
      console.log('🏥 Recherche par IDpatient...');
      const patient = await Patient.findOne({ IDpatient: cleanId }).select('+motDePasse +password');

      if (patient) {
        console.log('✅ Patient trouvé par IDpatient');
        return { user: patient, role: 'patient' };
      }
    }

    // 5. Recherche générale (fallback)
    console.log('🔍 Recherche générale dans tous les modèles...');
    const [adminById, medecinById, patientById] = await Promise.all([
      Admin.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { IDadmin: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
          { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }
        ]
      }).select('+motDePasse +password'),
      Medecin.findOne({
        $or: [
          { IDmedecin: cleanId },
          { email: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }
        ]
      }).select('+motDePasse +password'),
      Patient.findOne({
        $or: [
          { IDpatient: cleanId },
          { email: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }
        ]
      }).select('+motDePasse +password')
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

    console.log('🔐 Tentative de connexion:', {
      UserID: UserID ? 'fourni' : 'manquant',
      motDePasse: motDePasse ? 'fourni' : 'manquant'
    });

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

    if (!JWT_SECRET || JWT_SECRET === 'your_jwt_secret_here_change_in_production') {
      console.error('⚠️ JWT_SECRET non configuré en production');
      throw new Error('JWT_SECRET non configuré');
    }

    // Recherche de l'utilisateur dans la base
    const { user, role } = await findUser(UserID.trim());

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(401).json({
        message: "Identifiant ou mot de passe incorrect.",
        error: "INVALID_CREDENTIALS" 
      });
    }

    console.log(`✅ Utilisateur trouvé: ${role} - ${user.nom} ${user.prenom}`);

    // Vérification compte actif
    if (user.isActive === false || user.isActives === 'disabled') {
      console.log('❌ Compte désactivé');
      return res.status(403).json({
        message: "Ce compte est désactivé. Contactez l'administrateur.",
        error: "ACCOUNT_DISABLED"
      });
    }

    // Vérification compte verrouillé
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      console.log(`🔒 Compte verrouillé pour ${remainingTime} minutes`);
      return res.status(423).json({
        message: `Compte verrouillé. Réessayez dans ${remainingTime} minutes.`,
        error: "ACCOUNT_LOCKED",
        remainingTime
      });
    }

    // Vérification mot de passe
    const userPassword = user.motDePasse || user.password;
    if (!userPassword) {
      console.log('❌ Aucun mot de passe configuré');
      return res.status(500).json({
        message: "Erreur de configuration du compte.",
        error: "NO_PASSWORD_SET"
      });
    }

    const isPasswordValid = await bcrypt.compare(motDePasse, userPassword);

    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect');
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

    // Réinitialiser les tentatives après succès
    if (user.loginAttempts > 0) {
      await updateUser(user._id, role, {
        $unset: { loginAttempts: 1, lockUntil: 1 }
      });
    }

    // Générer token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Convertir en objet JS pour supprimer mot de passe
    let userObj = user.toObject ? user.toObject() : { ...user };

    // Supprimer champs sensibles
    delete userObj.motDePasse;
    delete userObj.password;

    // Ajouter rôle explicitement
    userObj.role = role;

    // Envoyer réponse avec token et profil complet
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: userObj
    });

  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    return res.status(500).json({
      message: "Erreur serveur lors de la connexion.",
      error: "SERVER_ERROR"
    });
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

    if (!email || typeof email !== 'string' || !PATTERNS.email.test(email.trim())) {
      return res.status(400).json({ 
        message: 'Email invalide.',
        error: 'INVALID_EMAIL'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { user, role } = await findUserByEmail(normalizedEmail);

    const genericResponse = {
      message: "Si cet email existe, un code de réinitialisation a été envoyé.",
      success: true
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const lastRequestTime = user.lastResetRequest || 0;
    const timeSinceLastRequest = Date.now() - lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_WINDOW) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastRequest) / 1000);
      return res.status(429).json({
        message: `Veuillez attendre ${remainingTime} secondes avant de redemander un code.`,
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: remainingTime
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = await bcrypt.hash(resetCode, BCRYPT_ROUNDS);
    const expirationTime = Date.now() + RESET_CODE_EXPIRY;

    try {
      await updateUser(user._id, role, {
        resetCode: hashedResetCode,
        resetCodeExpire: expirationTime,
        resetAttempts: 0,
        lastResetRequest: Date.now()
      });
    } catch (dbError) {
      console.error('Erreur BDD:', dbError);
      return res.status(500).json({
        message: 'Erreur interne du serveur.',
        error: 'DATABASE_ERROR'
      });
    }

    const cacheKey = `${resetCode}_${normalizedEmail}`;
    codeCache.set(cacheKey, {
      email: normalizedEmail,
      userId: user._id,
      role,
      timestamp: Date.now()
    });

    try {
      await sendResetPasswordEmail(user.email, resetCode, role, user.nom, user.prenom);
      console.log(`✅ Code envoyé à ${normalizedEmail} (Expire à ${new Date(expirationTime).toISOString()})`);
    } catch (emailError) {
      console.error('❌ Erreur email:', emailError);
      codeCache.del(cacheKey);
      await updateUser(user._id, role, {
        $unset: {
          resetCode: 1,
          resetCodeExpire: 1,
          resetAttempts: 1
        }
      });

      return res.status(500).json({
        message: 'Erreur lors de l\'envoi de l\'email.',
        error: 'EMAIL_SEND_ERROR'
      });
    }

    return res.status(200).json(genericResponse);

  } catch (error) {
    console.error('❌ Erreur forgotPassword:', error);
    return res.status(500).json({
      message: 'Erreur lors de la demande.',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * VÉRIFICATION DU CODE DE RÉINITIALISATION
 */
export const verifyResetCode = async (req, res) => {
  try {
    const { resetCode } = req.body;
    console.log('🔔 verifyResetCode called with resetCode:', resetCode);

    if (!resetCode || typeof resetCode !== 'string') {
      console.log('❌ Le code est requis ou non valide');
      return res.status(400).json({ 
        message: 'Le code est requis.',
        error: 'MISSING_CODE'
      });
    }

    const normalizedCode = resetCode.trim();
    console.log('Normalized code:', normalizedCode);

    // Recherche dans le cache
    let cacheKey = null;
    for (const key of codeCache.keys()) {
      if (key.startsWith(`${normalizedCode}_`)) {
        cacheKey = key;
        break;
      }
    }

    if (!cacheKey) {
      console.log('❌ Code invalide ou expiré (cacheKey non trouvé)');
      return res.status(400).json({
        message: 'Code invalide ou expiré.',
        error: 'INVALID_OR_EXPIRED'
      });
    }
    console.log('Cache key trouvée:', cacheKey);

    const cacheData = codeCache.get(cacheKey);
    if (!cacheData) {
      console.log('❌ Données cache introuvables pour la clé:', cacheKey);
      return res.status(400).json({
        message: 'Données de réinitialisation introuvables.',
        error: 'CACHE_MISSING'
      });
    }
    console.log('Données cache:', cacheData);

    const { userId, role } = cacheData;
    if (!userId || !role) {
      console.log('❌ Utilisateur ou rôle manquant dans cacheData:', cacheData);
      return res.status(400).json({
        message: 'Utilisateur ou rôle manquant.',
        error: 'INVALID_CACHE_DATA'
      });
    }
    console.log(`UserId: ${userId}, role: ${role}`);

    // Charger modèle
    const Model = { admin: Admin, medecin: Medecin, patient: Patient }[role];
    if (!Model) {
      console.log('❌ Rôle invalide:', role);
      return res.status(400).json({ message: 'Rôle invalide.', error: 'INVALID_ROLE' });
    }

    const user = await Model.findById(userId);
    if (!user || !user.resetCode || !user.resetCodeExpire) {
      console.log('❌ Utilisateur non trouvé ou état resetCode invalide', user);
      return res.status(400).json({ 
        message: 'Code invalide ou expiré.',
        error: 'INVALID_USER_STATE'
      });
    }
    console.log('Utilisateur trouvé:', user.email);

    if (Date.now() > user.resetCodeExpire) {
      console.log('❌ Code expiré pour utilisateur:', user.email);
      return res.status(400).json({ 
        message: 'Code expiré.',
        error: 'EXPIRED_CODE' 
      });
    }

    const isMatch = await bcrypt.compare(normalizedCode, user.resetCode);
    if (!isMatch) {
      console.log('❌ Code incorrect pour utilisateur:', user.email);
      return res.status(400).json({ 
        message: 'Code incorrect.', 
        error: 'WRONG_CODE' 
      });
    }
    console.log('✅ Code correct pour utilisateur:', user.email);

    // Générer token
    const token = jwt.sign({ userId, role }, JWT_RESET_SECRET, { expiresIn: '15m' });
    console.log('✅ Token généré:', token);

    return res.status(200).json({
      success: true,
      token,
      message: 'Code validé. Vous pouvez maintenant réinitialiser votre mot de passe.'
    });

  } catch (error) {
    console.error('❌ Erreur verifyResetCode:', error);
    return res.status(500).json({ 
      message: 'Erreur serveur.',
      error: 'SERVER_ERROR' 
    });
  }
};


/**
 * RÉINITIALISATION DU MOT DE PASSE
 */
export const resetPassword = async (req, res) => {
  try {
    const { motDePasse, confirmationMotDePasse } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!motDePasse || !confirmationMotDePasse) {
      return res.status(400).json({
        message: 'Mot de passe et confirmation requis.',
        error: 'MISSING_PASSWORD'
      });
    }

    if (motDePasse !== confirmationMotDePasse) {
      return res.status(400).json({
        message: 'Les mots de passe ne correspondent pas.',
        error: 'PASSWORD_MISMATCH'
      });
    }

    if (!token) {
      return res.status(401).json({
        message: 'Token manquant.',
        error: 'MISSING_TOKEN'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_RESET_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: 'Token invalide ou expiré.',
        error: 'INVALID_TOKEN'
      });
    }

    const { userId, role } = decoded;
    const Model = { admin: Admin, medecin: Medecin, patient: Patient }[role];

    if (!Model) {
      return res.status(400).json({ message: 'Rôle invalide.', error: 'INVALID_ROLE' });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    await Model.findByIdAndUpdate(userId, {
      motDePasse: hashedPassword,
      $unset: { resetCode: 1, resetCodeExpire: 1, resetAttempts: 1 }
    });

    return res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès.'
    });

  } catch (error) {
    console.error('❌ Erreur resetPassword:', error);
    return res.status(500).json({
      message: 'Erreur serveur.',
      error: 'SERVER_ERROR'
    });
  }
};

/*
 * VÉRIFICATION DU TOKEN DE RÉINITIALISATION
 */
export const verifyResetToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Token d\'autorisation manquant.',
        error: 'MISSING_TOKEN'
      });
    }

    const resetToken = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(resetToken, JWT_RESET_SECRET, {
        issuer: 'your-app-name',
        audience: 'password-reset'
      });
      
      if (decoded.purpose !== 'password_reset') {
        return res.status(403).json({ 
          message: 'Token non autorisé pour cette action.',
          error: 'INVALID_TOKEN_PURPOSE'
        });
      }

      // Vérification optionnelle que l'utilisateur existe toujours
      const { user } = await findUserByEmail(decoded.email);
      if (!user || user._id.toString() !== decoded.userId.toString()) {
        return res.status(404).json({
          message: 'Session invalide.',
          error: 'INVALID_SESSION'
        });
      }

      res.status(200).json({
        message: 'Token valide.',
        success: true,
        userRole: decoded.role,
        email: decoded.email,
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      });

    } catch (jwtError) {
      console.error('[DEBUG] Erreur de vérification JWT:', jwtError.message);
      
      let errorMessage = 'Token invalide ou expiré.';
      if (jwtError.name === 'TokenExpiredError') {
        errorMessage = 'Token expiré. Veuillez recommencer la procédure.';
      }
      
      return res.status(401).json({ 
        message: errorMessage,
        error: 'INVALID_TOKEN'
      });
    }

  } catch (error) {
    console.error('❌ Erreur dans verifyResetToken:', error);
    return res.status(500).json({
      message: 'Erreur lors de la vérification du token.',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * NETTOYAGE PÉRIODIQUE DU CACHE (optionnel)
 */
export const cleanupExpiredCodes = () => {
  const keys = codeCache.keys();
  let cleanedCount = 0;
  
  keys.forEach(key => {
    const data = codeCache.get(key);
    if (data && data.timestamp) {
      const age = Date.now() - data.timestamp;
      if (age > RESET_CODE_EXPIRY) {
        codeCache.del(key);
        cleanedCount++;
      }
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`🧹 Nettoyage du cache: ${cleanedCount} codes expirés supprimés`);
  }
};

// Planifier le nettoyage toutes les 5 minutes
setInterval(cleanupExpiredCodes, 5 * 60 * 1000);


async function findCodeInDatabase(normalizedCode) {
  try {
    // Chercher un utilisateur avec ce code (supposant que vous utilisez Mongoose)
    const user = await User.findOne({ 
      resetCode: { $exists: true },
      $where: function() {
        return bcrypt.compareSync(normalizedCode, this.resetCode);
      }
    });
    
    if (!user) return null;
    
    return {
      email: user.email,
      userId: user._id
    };
  } catch (error) {
    console.error('Erreur dans findCodeInDatabase:', error);
    return null;
  }
}