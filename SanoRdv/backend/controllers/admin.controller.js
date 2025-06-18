// ===============================
// 📁 admin.controller.js
// ===============================

import Admin from '../models/admin.model.js';
import bcrypt from 'bcrypt'; // Pour le hachage des mots de passe
import crypto from 'crypto'; // Pour générer un ID unique
import { sendAdminCredentials } from '../utils/email.admin.js'; // Pour l'envoi de mail

// 🔤 Génère un IDadmin unique
function generateIDadmin() {
  const prefix = 'admin';
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${randomSuffix}`;
}

// 📋 Liste tous les administrateurs existants
export const listAdmins = async () => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    return {
      count: admins.length,
      admins
    };
  } catch (err) {
    return {
      count: 0,
      admins: [],
      message: err.message
    };
  }
};

// 🎯 Crée un administrateur avec nom, prénom, email et mot de passe
// 🎯 Crée un administrateur avec nom, prénom, email et mot de passe
export const createDefaultAdmin = async ({ firstName, lastName, email, password }) => {
  try {
    // Vérifie si l'email est déjà utilisé
    const existing = await Admin.findOne({ email });
    if (existing) {
      return {
        success: false,
        message: 'Email déjà utilisé',
        admin: existing
      };
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouvel admin
    const newAdmin = new Admin({
      prenom: firstName.trim(),
      nom: lastName.trim(),
      email: email.trim(),
      motDePasse: hashedPassword,
      IDadmin: generateIDadmin(),
    });

    await newAdmin.save();

    // Envoi de l'email contenant l'ID et le mot de passe en clair (password)
    const emailSent = await sendAdminCredentials(
      newAdmin.email,
      newAdmin.prenom,
      newAdmin.nom,
      newAdmin.IDadmin,
      password
    );

    return {
      success: true,
      admin: newAdmin,
      emailSent
    };

  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
};
