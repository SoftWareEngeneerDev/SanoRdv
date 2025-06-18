import jwt from 'jsonwebtoken';

// 🔐 Clé secrète pour signer les JWT
const JWT_SECRET = process.env.JWT_SECRET || 'ta_clef_secrete';

// 🧠 Blacklist temporaire en mémoire (utiliser Redis en prod pour la persistance)
const blacklistedTokens = new Set();

/**
 * ✅ Middleware d'authentification
 * Vérifie le token JWT dans le header "Authorization"
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🛑 Vérifie la présence du header et du format "Bearer token"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '⚠️ Token manquant ou mal formaté' });
  }

  const token = authHeader.split(' ')[1];

  // 🚫 Vérifie si le token est blacklisté (ex: après déconnexion)
  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: '🚫 Session expirée ou utilisateur déconnecté' });
  }

  try {
    // ✅ Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // ⬅️ Infos utiles injectées dans la requête
    next();
  } catch (err) {
    // 🕒 Token expiré
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '⏳ Session expirée' });
    }
    // ❌ Token invalide
    return res.status(403).json({ message: '❌ Token invalide' });
  }
};

/**
 * 🔒 Fonction pour invalider un token (ex: au logout)
 * @param {string} token - Le token JWT à invalider
 */
export const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};
