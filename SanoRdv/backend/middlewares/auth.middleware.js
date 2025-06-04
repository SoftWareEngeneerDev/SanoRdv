import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ta_clef_secrete';

export const authenticateToken = (req, res, next) => {
  // Récupérer le token dans l'en-tête Authorization (Bearer token)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer token"

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // on peut récupérer userId, role, etc.
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};