import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_renforcee_123!';

// Stockage des tokens invalidés (en production, utiliser Redis)
const tokenBlacklist = new Set();

/**
 * Middleware d'authentification JWT (version anglaise)
 * Vérifie la présence et la validité du token JWT
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🛑 Vérifie la présence du header et du format "Bearer token"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Authorization header manquant ou invalide' 
    });
  }

  const token = authHeader.split(' ')[1];

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ 
      success: false,
      message: 'Session expirée' 
    });
  }

  try {
    // ✅ Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      ...decoded,
      token // Ajout du token pour pouvoir le blacklister plus tard
    };
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' 
      ? 'Session expirée' 
      : 'Token invalide';
    
    res.status(401).json({ 
      success: false,
      message 
    });
  }
};

/**
 * Middleware d'authentification JWT (version française)
 * Alternative avec une approche légèrement différente
 */
export const authentifier = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentification requise' 
      });
    }

    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ 
        success: false,
        message: 'Session expirée' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: error.name === 'TokenExpiredError' 
        ? 'Session expirée' 
        : 'Token invalide'
    });
  }
};

/**
 * Middleware de vérification de rôle admin (version anglaise)
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Accès refusé: droits insuffisants' 
    });
  }
  next();
};

/**
 * Middleware de vérification de rôle admin (version française)
 */
export const estAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Accès réservé aux administrateurs' 
    });
  }
  next();
};

/**
 * Blackliste un token JWT (pour logout)
 * @param {string} token - Token à invalider
 */
export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  // Nettoyage automatique après 24h
  setTimeout(() => tokenBlacklist.delete(token), 86400000); 
};

/**
 * Vérifie si un token est blacklisté
 * @param {string} token - Token à vérifier
 * @returns {boolean} True si le token est blacklisté
 */
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

