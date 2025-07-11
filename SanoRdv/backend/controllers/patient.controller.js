import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import * as jdenticon from 'jdenticon';
import { Buffer } from 'buffer';

import Patient from '../models/patient.model.js';
import { generateIna } from '../utils/generateIna.js';
import { sendINEEmail } from '../utils/mail.util.js';

dotenv.config();

const CONFIG = {
  BCRYPT_ROUNDS: 12,
  ALLOWED_DOMAINS: ['gmail.com', 'icloud.com', 'yahoo.com', 'outlook.com'],
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
const sanitizeInput = (input) => (typeof input === 'string' ? input.trim().toLowerCase() : input);

const generateAvatarBase64 = (nom, prenom) => {
  const initials = `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  const size = 256;
  const svg = jdenticon.toSvg(initials, size);
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

const handleError = (error, res, message = 'Erreur serveur') => {
  console.error(error);
  return res.status(500).json({ message });
};

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
      photo = '', // optionnel
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

    // Génère avatar si pas de photo fournie
    let avatarImage = photo;
    if (!avatarImage || avatarImage.trim() === '') {
      avatarImage = generateAvatarBase64(sanitizedNom, sanitizedPrenom);
    }

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
      photo: avatarImage,
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
    if (!errors.isEmpty()) {
      return res.status(400).json({ erreurs: errors.array() });
    }

    const patientId = req.params.id;

    // Vérification de la présence de req.body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Le corps de la requête est vide ou invalide." });
    }

    // Déstructuration après vérification
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
      groupeSanguin,
      allergies
    } = req.body;

    // Trouver le patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Email
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
      const emailUsed = await Patient.findOne({ email: sanitizedEmail, _id: { $ne: patientId } });
      if (emailUsed) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }
      patient.email = sanitizedEmail;
    }

    // Téléphone
    if (telephone) {
      const phoneUsed = await Patient.findOne({ telephone, _id: { $ne: patientId } });
      if (phoneUsed) {
        return res.status(400).json({ message: 'Numéro de téléphone déjà utilisé' });
      }
      patient.telephone = sanitizeInput(telephone);
    }

    // Mot de passe
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

    // Mise à jour des autres champs si présents
    if (nom) patient.nom = sanitizeInput(nom);
    if (prenom) patient.prenom = sanitizeInput(prenom);
    if (sex) patient.sex = sex;
    if (localite !== undefined) patient.localite = sanitizeInput(localite);
    if (dateNaissance !== undefined) {
      const parsedDate = new Date(dateNaissance);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Date de naissance invalide' });
      }
      patient.dateNaissance = parsedDate;
    }
    if (adresse !== undefined) patient.adresse = sanitizeInput(adresse);
    if (photo !== undefined) patient.photo = photo;
    if (groupeSanguin !== undefined) patient.groupeSanguin = sanitizeInput(groupeSanguin);
    if (allergies !== undefined) patient.allergies = sanitizeInput(allergies);

    // Sauvegarde
    await patient.save();

    // Suppression du mot de passe dans la réponse
    const patientObj = patient.toObject();
    delete patientObj.motDePasse;

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      patient: patientObj,
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
