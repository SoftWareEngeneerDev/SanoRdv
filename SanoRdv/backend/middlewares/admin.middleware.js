import Admin from '../models/admin.model.js';

/**
 * 🛡️ Middleware pour empêcher la création de plusieurs comptes admin
 * Vérifie si un administrateur existe déjà dans la base.
 */
export const verifyAdminExists = async (req, res, next) => {
  try {
    const existingAdmin = await Admin.findOne({ role: 'admin' });

    if (existingAdmin) {
      return res.status(400).json({
        message: '❌ Un administrateur existe déjà. Création d’un second refusée.'
      });
    }

    next(); // ✅ Aucun admin trouvé, on passe à la suite
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'admin:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification de l\'admin' });
  }
};
