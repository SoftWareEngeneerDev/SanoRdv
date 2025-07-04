import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import Patient from '../models/patient.model.js';
import { generateIna } from '../utils/generateIna.js';
import { sendINEEmail, sendResetPasswordEmail } from '../utils/mail.util.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || JWT_SECRET;

const CONFIG = {
  BCRYPT_ROUNDS: 12,
  TOKEN_EXPIRY: '1h',
  RESET_TOKEN_EXPIRY: '15m',
  RESET_CODE_EXPIRY: 15 * 60 * 1000,
  ALLOWED_DOMAINS: ['gmail.com', 'icloud.com', 'yahoo.com', 'outlook.com'],
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 15 * 60 * 1000,
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
const sanitizeInput = (input) => (typeof input === 'string' ? input.trim().toLowerCase() : input);

const handleError = (error, res, message = 'Erreur serveur') => {
  console.error(error);
  return res.status(500).json({ message });
};

// ===========================
// CONTROLEUR : Inscription
// ===========================
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });

    const {
      nom,
      prenom,
      email,
      telephone,
      motDePasse,
      confirmationMotDePasse,
      sex,
      localite = '',
      dateNaissance = '',
      adresse = '',
      role = 'patient',
      photo = '',   // Ajout photo optionnelle
    } = req.body;

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedNom = nom?.trim();
    const sanitizedPrenom = prenom?.trim();

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ message: 'Format email invalide' });
    }
    const domain = sanitizedEmail.split('@')[1];
    if (!CONFIG.ALLOWED_DOMAINS.includes(domain)) {
      return res.status(400).json({
        message: 'Domaine email non autorisé',
        allowedDomains: CONFIG.ALLOWED_DOMAINS,
      });
    }

    if (!isValidPassword(motDePasse)) {
      return res.status(400).json({
        message:
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
      });
    }
    if (motDePasse !== confirmationMotDePasse) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    const existingUser = await Patient.findOne({
      $or: [{ email: sanitizedEmail }, { telephone }],
    });
    if (existingUser) {
      if (existingUser.email === sanitizedEmail)
        return res.status(400).json({ message: 'Email déjà utilisé' });
      if (existingUser.telephone === telephone)
        return res.status(400).json({ message: 'Numéro de téléphone déjà utilisé' });
    }

    let IDpatient;
    let attempts = 0;
    const maxAttempts = 10;
    do {
      IDpatient = generateIna();
      attempts++;
      if (attempts > maxAttempts)
        throw new Error('Impossible de générer un IDpatient unique');
    } while (await Patient.findOne({ IDpatient }));

    const hashedPassword = await bcrypt.hash(motDePasse, CONFIG.BCRYPT_ROUNDS);

    const newUser = new Patient({
      nom: sanitizedNom,
      prenom: sanitizedPrenom,
      email: sanitizedEmail,
      telephone,
      motDePasse: hashedPassword,
      sex,
      IDpatient,
      localite,
      dateNaissance,
      adresse,
      photo,            // Sauvegarde la photo si fournie
      loginAttempts: 0,
      lockUntil: undefined,
      role,
    });

    await newUser.save();

    setImmediate(async () => {
      try {
        await sendINEEmail(sanitizedEmail, IDpatient, sanitizedPrenom, sanitizedNom);
      } catch (mailError) {
        console.error('Erreur envoi email INE:', mailError);
      }
    });

    return res.status(201).json({
      message: 'Utilisateur créé avec succès. Vérifiez votre email pour votre INE.',
      userId: newUser._id,
      IDpatient,
    });

  } catch (error) {
    return handleError(error, res, "Erreur lors de l'inscription");
  }
};

// ===========================
// CONTROLEUR : Modifier profil
// ===========================
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });

    const patientId = req.params.id; // ou depuis token selon ta gestion auth

    const {
      nom,
      prenom,
      email,
      telephone,
      motDePasse,
      confirmationMotDePasse,
      sex,
      localite,
      dateNaissance,
      adresse,
      photo,
    } = req.body;

    // Trouver le patient
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });

    // Validation email si modifié
    if (email) {
      const sanitizedEmail = sanitizeInput(email);
      if (!isValidEmail(sanitizedEmail)) {
        return res.status(400).json({ message: 'Format email invalide' });
      }
      const domain = sanitizedEmail.split('@')[1];
      if (!CONFIG.ALLOWED_DOMAINS.includes(domain)) {
        return res.status(400).json({
          message: 'Domaine email non autorisé',
          allowedDomains: CONFIG.ALLOWED_DOMAINS,
        });
      }
      // Vérifier unicité email (exclure patient actuel)
      const emailUsed = await Patient.findOne({ email: sanitizedEmail, _id: { $ne: patientId } });
      if (emailUsed) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }
      patient.email = sanitizedEmail;
    }

    // Vérifier unicité téléphone si modifié
    if (telephone) {
      const phoneUsed = await Patient.findOne({ telephone, _id: { $ne: patientId } });
      if (phoneUsed) {
        return res.status(400).json({ message: 'Numéro de téléphone déjà utilisé' });
      }
      patient.telephone = telephone;
    }

    // Hasher mot de passe si modifié
    if (motDePasse) {
      if (!isValidPassword(motDePasse)) {
        return res.status(400).json({
          message:
            'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
        });
      }
      if (motDePasse !== confirmationMotDePasse) {
        return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
      }
      patient.motDePasse = await bcrypt.hash(motDePasse, CONFIG.BCRYPT_ROUNDS);
    }

    // Mise à jour des autres champs si fournis
    if (nom) patient.nom = nom.trim();
    if (prenom) patient.prenom = prenom.trim();
    if (sex) patient.sex = sex;
    if (localite !== undefined) patient.localite = localite;
    if (dateNaissance !== undefined) patient.dateNaissance = dateNaissance;
    if (adresse !== undefined) patient.adresse = adresse;
    if (photo !== undefined) patient.photo = photo;

    await patient.save();

    // Retourner sans mot de passe
    const { motDePasse: _, ...patientData } = patient.toObject();
    res.status(200).json({
      message: "Profil mis à jour avec succès",
      patient: patientData,
    });

  } catch (error) {
    return handleError(error, res, "Erreur lors de la mise à jour du profil");
  }
};


// ===========================
// Contrôleurs existants...
// ===========================

// Contrôleur pour récupérer les informations de base du patient
export const getPatientBasicInfo = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Récupérer seulement nom, prénom et email du patient
    const patient = await Patient.findById(patientId)
      .select('nom prenom email')
      .lean();
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        nom: patient.nom,
        prenom: patient.prenom,
        email: patient.email
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des informations patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des informations'
    });
  }
};

// Alternative avec destructuring
export const getPatientInfo = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId, 'nom prenom email');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient introuvable'
      });
    }
    
    const { nom, prenom, email } = patient;
    
    res.json({
      success: true,
      patient: { nom, prenom, email }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message
    });
  }
};
