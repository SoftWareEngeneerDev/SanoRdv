import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ta_clef_secrete';

// Stockage temporaire en mémoire des tokens invalidés (blacklist)
// À migrer vers Redis ou une base persistante en production
const blacklistedTokens = new Set();

/**
 * Middleware d'authentification JWT
 * Vérifie la présence et la validité du token JWT dans le header Authorization
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: 'Session expirée ou déconnectée' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // injecter les infos décodées dans req pour les routes suivantes
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée' });
    }
    return res.status(403).json({ message: 'Token invalide' });
  }
};

/**
 * Ajoute un token à la blacklist (à appeler par exemple lors d’un logout)
 * @param {string} token - Token JWT à invalider
 */
export const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};
