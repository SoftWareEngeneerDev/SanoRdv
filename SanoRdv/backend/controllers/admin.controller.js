import Admin from '../models/admin.model.js';
import bcrypt from 'bcrypt';
import { sendAdminCredentials } from '../utils/email.admin.js';

export const createDefaultAdmin = async (email, motDePasse, additionalInfo = {}) => {
  try {
    const IDadmin = `ADMIN_${Math.floor(10000 + Math.random() * 90000)}`;

    // Vérification existence admin
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return {
        success: false,
        message: 'Un administrateur avec cet email existe déjà',
        admin: existingAdmin
      };
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Création admin avec valeurs par défaut
    const admin = new Admin({
      email,
      motDePasse: hashedPassword,
      IDadmin,
      role: 'admin',
      isActive: true,
      ...additionalInfo,
      nom: additionalInfo.nom || 'Administrateur',
      prenom: additionalInfo.prenom || 'Système'
    });

    const savedAdmin = await admin.save();

    // Envoi email avec paramètres corrects
    let emailSent = false;
    try {
      await sendAdminCredentials(
        email,
        additionalInfo.prenom || 'Système', // prénom avec valeur par défaut
        additionalInfo.nom || 'Administrateur', // nom avec valeur par défaut
        IDadmin,
        motDePasse
      );
      emailSent = true;
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
    }

    return {
      success: true,
      admin: savedAdmin,
      emailSent
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};
export const listAdmins = async () => {
  try {
    const admins = await Admin.find({ role: 'admin' }) // Utilisation de "role" au lieu de "isAdmin"
      .select('-motDePasse') // Assure que le mot de passe n'est pas retourné
      .sort({ createdAt: -1 });

    return {
      count: admins.length,
      admins
    };
  } catch (error) {
    return {
      count: 0,
      admins: [],
      error: error.message
    };
  }
};
