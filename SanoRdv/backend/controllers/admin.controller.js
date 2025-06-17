import Admin from '../models/admin.model.js';
import { sendAdminCredentials } from '../utils/email.admin.js';
import crypto from 'crypto';

// 🔐 Génère un mot de passe sécurisé
function generateSecurePassword(length = 12) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';

  // Assurer au moins un caractère de chaque type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Compléter avec des caractères aléatoires
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mélanger les caractères avec un shuffle Fisher-Yates
  password = password.split('');
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

// 🔤 Génère un IDadmin unique
function generateIDadmin() {
  const prefix = 'admin';
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${randomSuffix}`;
}

// 📧 Génère un email admin si non fourni
function generateAdminEmail() {
  const domain = process.env.ADMIN_EMAIL_DOMAIN || 'sanoRdv.local';
  const randomPart = crypto.randomBytes(3).toString('hex');
  return `admin_${randomPart}@${domain}`;
}

// 🎯 Fonction principale pour créer l'admin
// Ajout du paramètre forceCreate pour forcer la création
export const createDefaultAdmin = async (forceCreate = false) => {
  try {
    console.log('🔍 Vérification existence admin...');

    // Vérifier si un admin existe déjà
    const existingAdmin = await Admin.findOne({ role: 'admin' });

    if (existingAdmin && !forceCreate) {
      console.log('⚠️  Un admin existe déjà');
      return {
        success: false,
        message: 'Un administrateur existe déjà dans le système',
        admin: {
          id: existingAdmin._id,
          IDadmin: existingAdmin.IDadmin,
          email: existingAdmin.email,
          createdAt: existingAdmin.createdAt
        }
      };
    }

    if (existingAdmin && forceCreate) {
      console.log('⚠️  Forçage création admin, création en cours...');
    } else {
      console.log(' Aucun admin trouvé, création en cours...');
    }

    // Générer les identifiants
    const IDadmin = generateIDadmin();
    const rawPassword = generateSecurePassword(14);
    const email = process.env.ADMIN_EMAIL || generateAdminEmail();

    console.log('📝 Identifiants générés:');
    console.log(`   - IDadmin: ${IDadmin}`);
    console.log(`   - Email: ${email}`);
    console.log(`   - Password: ${rawPassword}`);

    // Créer l'admin (le mot de passe sera hashé automatiquement par le middleware pre('save'))
    const admin = new Admin({
      IDadmin,
      email,
      password: rawPassword,
      nom: 'BIKIEGA',
      prenom: 'ADAMA FARIL',
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('💾 Admin sauvegardé en base de données');

    // Essayer d'envoyer les identifiants par email
    let emailSent = false;
    try {
      await sendAdminCredentials(email, IDadmin, rawPassword);
      emailSent = true;
      console.log('📧 Email envoyé avec succès');
    } catch (emailError) {
      console.warn('⚠️  Erreur envoi email:', emailError.message);
      console.log('💡 Les identifiants seront affichés dans la console');
    }

    return {
      success: true,
      message: 'Administrateur créé avec succès',
      emailSent,
      admin: {
        id: admin._id,
        IDadmin,
        email,
        password: rawPassword, // Mot de passe en clair pour l'affichage
        createdAt: admin.createdAt
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors de la création admin:', error);
    throw new Error(`Erreur création admin: ${error.message}`);
  }
};

// 🔄 Fonction pour réinitialiser le mot de passe admin
export const resetAdminPassword = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error('Admin non trouvé');
    }

    const newPassword = generateSecurePassword(14);
    admin.password = newPassword; // Sera hashé automatiquement
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;

    await admin.save();

    return {
      success: true,
      message: 'Mot de passe réinitialisé',
      newPassword
    };
  } catch (error) {
    throw new Error(`Erreur réinitialisation: ${error.message}`);
  }
};

// 📊 Fonction pour lister tous les admins
export const listAdmins = async () => {
  try {
    const admins = await Admin.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    return {
      success: true,
      count: admins.length,
      admins
    };
  } catch (error) {
    throw new Error(`Erreur liste admins: ${error.message}`);
  }
};
