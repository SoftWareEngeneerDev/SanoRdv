import Admin from '../models/admin.model.js';
import bcrypt from 'bcrypt';
import { sendAdminCredentials } from '../utils/email.admin.js';
import { sendMedecinCredentials } from '../utils/email.medecin.js';
import Medecin from '../models/medecin.model.js';
import dotenv from 'dotenv';
import Patient from '../models/patient.model.js';
import mongoose from 'mongoose';
import * as jdenticon from 'jdenticon';
import { Buffer } from 'buffer';

const generateAvatarBase64 = (nom, prenom) => {
  const initials = `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  const size = 256;
  const svg = jdenticon.toSvg(initials, size);
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};


dotenv.config();

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
  BCRYPT_ROUNDS: 12,
  ALLOWED_DOMAINS: ['gmail.com', 'icloud.com', 'yahoo.com', 'outlook.com'],
};

// =============================================================================
// UTILITAIRES
// =============================================================================
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitizeInput = (input) => (typeof input === 'string' ? input.trim() : input);

const isValidDateNaissance = (dateStr) => {
  if (!dateStr) return true;
  const date = new Date(dateStr);
  const now = new Date();
  const minAge = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
  const maxAge = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  return date >= minAge && date <= maxAge;
};

const formatMedecinResponse = (medecin) => ({
  id: medecin._id,
  nom: medecin.nom,
  prenom: medecin.prenom,
  email: medecin.email,
  telephone: medecin.telephone,
  IDmedecin: medecin.IDmedecin,
  specialite: medecin.specialite,
  anneeExperience: medecin.anneeExperience,
  role: medecin.role,
  localite: medecin.localite || null,
  adresse: medecin.adresse || null,
  nationalite: medecin.nationalite || null,
  photo: medecin.photo || null,
  dateNaissance: medecin.dateNaissance ? medecin.dateNaissance.toISOString().split('T')[0] : null,
  dateCreation: medecin.dateCreation || medecin.createdAt
});

const genererIDMedecin = async (maxTentatives = 3) => {
  let tentative = 0;

  while (tentative < maxTentatives) {
    try {
      const dernierMedecin = await Medecin.findOne(
        { IDmedecin: { $regex: /^MED-\d{4}$/ } },
        { IDmedecin: 1 }
      ).sort({ IDmedecin: -1 });

      let numeroSuivant = 1;

      if (dernierMedecin && dernierMedecin.IDmedecin) {
        const numeroActuel = parseInt(dernierMedecin.IDmedecin.split('-')[1]);
        numeroSuivant = numeroActuel + 1;

        if (numeroSuivant > 9999) {
          throw new Error('Limite des IDs atteinte');
        }
      }

      const numeroFormate = numeroSuivant.toString().padStart(4, '0');
      const nouvelID = `MED-${numeroFormate}`;

      const existeDeja = await Medecin.findOne({ IDmedecin: nouvelID });
      if (!existeDeja) {
        return nouvelID;
      }

      tentative++;
    } catch (error) {
      console.error(`Tentative ${tentative + 1} échouée:`, error);
      tentative++;
      if (tentative >= maxTentatives) {
        const timestamp = Date.now().toString().slice(-4);
        return `MED-${timestamp}`;
      }
    }
  }
};

// =============================================================================
// CONTRÔLEURS ADMIN
// =============================================================================
export const createDefaultAdmin = async (email, motDePasse, additionalInfo = {}) => {
  try {
    const IDadmin = `ADMIN_${Math.floor(10000 + Math.random() * 90000)}`;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return {
        success: false,
        message: 'Un administrateur avec cet email existe déjà',
        admin: existingAdmin
      };
    }

    const avatar = additionalInfo.photo
      ? additionalInfo.photo
      : generateAvatarBase64(additionalInfo.nom, additionalInfo.prenom);

    const admin = new Admin({
      email,
      motDePasse, // Ne pas hasher ici
      IDadmin,
      role: 'admin',
      isActive: true,
      ...additionalInfo,
      nom: additionalInfo.nom || 'Administrateur',
      prenom: additionalInfo.prenom || 'Système',
      photo: avatar
    });

    const savedAdmin = await admin.save();

    let emailSent = false;
    try {
      await sendAdminCredentials(
        email,
        additionalInfo.prenom || 'Système',
        additionalInfo.nom || 'Administrateur',
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


export const modifierProfilAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { email, photo } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Administrateur introuvable." });
    }

    // Mise à jour uniquement des champs email et photo
    if (email) admin.email = email;
    if (photo) admin.photo = photo;

    await admin.save();

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      admin: {
        _id: admin._id,
        IDadmin: admin.IDadmin,
        email: admin.email,
        photo: admin.photo,
        role: admin.role,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil admin :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du profil." });
  }
};



export const listAdmins = async () => {
  try {
    const admins = await Admin.find({ role: 'admin' })
      .select('-motDePasse')
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

// =============================================================================
// CONTRÔLEURS MÉDECIN
// =============================================================================

export const ajouterMedecin = async (req, res) => {
  try {
    let {
      nom,
      prenom,
      email,
      telephone,
      specialite,
      anneeExperience,
      motDePasse,
      localite,
      dateNaissance,
      photo,
      adresse,
      nationalite
    } = req.body;

    // Nettoyage
    nom = sanitizeInput(nom);
    prenom = sanitizeInput(prenom);
    email = sanitizeInput(email)?.toLowerCase();
    telephone = sanitizeInput(telephone);
    specialite = sanitizeInput(specialite);
    anneeExperience = Number(anneeExperience);
    motDePasse = sanitizeInput(motDePasse);
    localite = sanitizeInput(localite);
    dateNaissance = sanitizeInput(dateNaissance);
    photo = sanitizeInput(photo);
    adresse = sanitizeInput(adresse);
    nationalite = sanitizeInput(nationalite);

    // Validation champs obligatoires
    const champsObligatoires = { nom, prenom, email, telephone, specialite, anneeExperience, motDePasse };
    const champManquant = Object.entries(champsObligatoires).find(([key, value]) => {
      if (key === 'anneeExperience') return isNaN(value) || value === null;
      return !value || value === '';
    });
    if (champManquant) {
      return res.status(400).json({
        message: `Le champ "${champManquant[0]}" est obligatoire.`,
        champsOptionnels: ['localite', 'dateNaissance', 'photo', 'adresse', 'nationalite']
      });
    }

    // Validation email
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Format email invalide.' });
    }
    const domain = email.split('@')[1];
    if (!CONFIG.ALLOWED_DOMAINS.includes(domain)) {
      return res.status(400).json({
        message: 'Domaine email non autorisé.',
        allowedDomains: CONFIG.ALLOWED_DOMAINS
      });
    }

    // Validation année d'expérience
    if (anneeExperience < 0 || anneeExperience > 70) {
      return res.status(400).json({ message: "Année d'expérience invalide (0 - 70)" });
    }

    // Validation date de naissance
    if (dateNaissance && !isValidDateNaissance(dateNaissance)) {
      return res.status(400).json({
        message: 'Date de naissance invalide. Le médecin doit avoir entre 18 et 100 ans.'
      });
    }

    // Génération ID médecin
    const IDmedecin = await genererIDMedecin();

    // Vérification unicité email
    const medecinExistant = await Medecin.findOne({ email });
    if (medecinExistant) {
      return res.status(400).json({
        message: '⚠️ Cet email est déjà utilisé par un autre médecin.'
      });
    }

    // Hashage mot de passe
    const hash = await bcrypt.hash(motDePasse, CONFIG.BCRYPT_ROUNDS);

    // Génération avatar si photo absente ou vide
    if (!photo || photo.trim() === '') {
      photo = generateAvatarBase64(nom, prenom);
    }

    // Préparation données médecin
    const donneesBase = {
      nom,
      prenom,
      email,
      telephone,
      specialite,
      anneeExperience,
      motDePasse: hash,
      IDmedecin,
      role: 'medecin',
      dateCreation: new Date(),
      photo,
    };

    const donneesCompletes = {
      ...donneesBase,
      ...(localite && { localite }),
      ...(dateNaissance && { dateNaissance: new Date(dateNaissance) }),
      ...(adresse && { adresse }),
      ...(nationalite && { nationalite })
    };

    // Création médecin
    const nouveauMedecin = new Medecin(donneesCompletes);
    await nouveauMedecin.save();

    // Envoi email
    try {
      await sendMedecinCredentials(email, `${prenom} ${nom}`, motDePasse, IDmedecin);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      return res.status(201).json({
        message: '⚠️ Médecin ajouté, mais erreur lors de l\'envoi de l\'email.',
        medecin: nouveauMedecin,
        identifiants: { email, IDmedecin, motDePasse },
        erreurEmail: emailError.message
      });
    }

    return res.status(201).json({
      message: '✅ Médecin ajouté avec succès et email envoyé',
      medecin: nouveauMedecin,
      identifiants: { email, IDmedecin }
    });

  } catch (error) {
    console.error('Erreur serveur lors de l\'ajout du médecin:', error);
    return res.status(500).json({
      message: '❌ Erreur serveur lors de l\'ajout du médecin',
      erreur: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};


export const modifierMedecin = async (req, res) => {
  try {
    // Vérifie que l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID médecin invalide' });
    }

    const updated = await Medecin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Médecin introuvable' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const supprimerMedecin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID médecin invalide' });
    }

    const deleted = await Medecin.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Médecin introuvable' });
    }
    res.json({ message: 'Médecin supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const desactiverMedecin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID médecin invalide' });
    }

    const medecin = await Medecin.findById(req.params.id);
    if (!medecin) {
      return res.status(404).json({ message: 'Médecin introuvable' });
    }

    medecin.isActive = false;
    await medecin.save();

    res.json({ message: 'Compte médecin désactivé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const activerMedecin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID médecin invalide' });
    }

    const medecin = await Medecin.findById(req.params.id);
    if (!medecin) {
      return res.status(404).json({ message: 'Médecin introuvable' });
    }

    medecin.isActive = true;
    await medecin.save();

    res.json({ message: 'Compte médecin activé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =============================================================================
// CONTRÔLEURS PATIENT
// =============================================================================
export const modifierPatient = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const supprimerPatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const desactiverPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient introuvable' });
    }

    patient.isActive = false;
    await patient.save();

    res.json({ message: 'Compte patient désactivé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const activerPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient introuvable' });
    }

    patient.isActive = true;  // Forcer à true
    await patient.save();

    res.json({ message: 'Compte patient activé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =============================================================================
// EXPORT PAR DÉFAUT
// =============================================================================
const adminController = {
  createDefaultAdmin,
  listAdmins,
  ajouterMedecin,
  modifierMedecin,
  supprimerMedecin,
  desactiverMedecin,
  modifierPatient,
  supprimerPatient,
  desactiverPatient
};

export default adminController;
