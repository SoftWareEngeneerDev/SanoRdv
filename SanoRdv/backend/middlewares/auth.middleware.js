import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ta_clef_secrete';

// Blacklist temporaire en mémoire (à changer en prod)
const blacklistedTokens = new Set();

export const authMiddleware = (req, res, next) => {
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
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erreur JWT :', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée' });
    }
    return res.status(403).json({ message: 'Token invalide' });
  }
};

export const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};
