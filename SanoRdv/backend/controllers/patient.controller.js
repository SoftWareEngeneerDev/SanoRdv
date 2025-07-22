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
    console.log("Données reçues du frontend :", req.body);
    const errors = validationResult(req);
    console.log("Erreurs de validation :", errors.array()); 
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
      groupeSanguin = '',   // ajouté
      allergies = '',      // ajouté
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
      groupeSanguin,   // inséré ici
      allergies,       // inséré ici
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
    const patientId = req.params.id;

    // Validation de l'ID patient
    if (!patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID patient manquant' 
      });
    }

    // Vérifier si le patient existe
    const existingPatient = await Patient.findById(patientId);
    if (!existingPatient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient non trouvé' 
      });
    }

    // Construire l'objet de mise à jour dynamiquement
    const updatedData = {};
    
    // Mapping des champs envoyés vers les champs de la base
    const fieldMapping = {
      'nom': 'nom',
      'prenom': 'prenom', 
      'email': 'email',
      'telephone': 'telephone',
      'sexe': 'sex', // sexe -> sex
      'dateNaissance': 'dateNaissance',
      'groupesanguin': 'groupeSanguin', // groupesanguin -> groupeSanguin
      'allergie': 'allergies', // allergie -> allergies
      'localite': 'localite',
      'adresse': 'adresse'
    };

    // Ajouter seulement les champs fournis dans la requête
    Object.keys(req.body).forEach(sentField => {
      const dbField = fieldMapping[sentField];
      
      if (dbField && req.body[sentField] !== undefined) {
        // Si le champ est une chaîne vide, on peut choisir de le traiter
        if (req.body[sentField] === '') {
          updatedData[dbField] = null; // ou '' selon votre préférence
        } else {
          updatedData[dbField] = req.body[sentField];
        }
      }
    });

    // Gestion spéciale pour les allergies (peut être un array)
    if (req.body.allergie !== undefined) {
      if (Array.isArray(req.body.allergie)) {
        updatedData.allergies = req.body.allergie;
      } else if (typeof req.body.allergie === 'string') {
        // Si c'est une chaîne, on peut la convertir en array ou la laisser telle quelle
        updatedData.allergies = req.body.allergie;
      }
    }

    // Gestion de la photo
    if (req.file) {
      updatedData.photo = req.file.path;
    }

    // Validation de l'email si fourni
    if (updatedData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updatedData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'email invalide'
        });
      }

      // Vérifier l'unicité de l'email si différent de l'actuel
      if (updatedData.email !== existingPatient.email) {
        const emailExists = await Patient.findOne({ 
          email: updatedData.email,
          _id: { $ne: patientId }
        });
        
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Cet email est déjà utilisé par un autre patient'
          });
        }
      }
    }

    // Validation du téléphone si fourni
    if (updatedData.telephone) {
      const phoneRegex = /^[+]?[\d\s\-()]{8,}$/;
      if (!phoneRegex.test(updatedData.telephone)) {
        return res.status(400).json({
          success: false,
          message: 'Format de téléphone invalide'
        });
      }
    }

    // Validation de la date de naissance
    if (updatedData.dateNaissance) {
      const birthDate = new Date(updatedData.dateNaissance);
      const today = new Date();
      
      if (birthDate > today) {
        return res.status(400).json({
          success: false,
          message: 'La date de naissance ne peut pas être dans le futur'
        });
      }
      
      // Vérifier un âge raisonnable (ex: maximum 120 ans)
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age > 120) {
        return res.status(400).json({
          success: false,
          message: 'Date de naissance invalide'
        });
      }
    }

    // Validation du groupe sanguin
    if (updatedData.groupeSanguin) {
      const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (!validBloodTypes.includes(updatedData.groupeSanguin)) {
        return res.status(400).json({
          success: false,
          message: 'Groupe sanguin invalide. Valeurs autorisées: A+, A-, B+, B-, AB+, AB-, O+, O-'
        });
      }
    }

    // Validation du sexe
    if (updatedData.sex) {
      const validSexes = ['M', 'F', 'Masculin', 'Féminin', 'Homme', 'Femme', 'masculin', 'féminin', 'homme', 'femme'];
      if (!validSexes.includes(updatedData.sex)) {
        return res.status(400).json({
          success: false,
          message: 'Sexe invalide'
        });
      }
    }

    // Ajouter la date de dernière modification
    updatedData.updatedAt = new Date();

    // Mise à jour du patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId, 
      { $set: updatedData }, // Utiliser $set pour une mise à jour partielle
      {
        new: true,
        runValidators: true,
        context: 'query' // Important pour les validations mongoose
      }
    ).select('-motDePasse');

    // Log de l'activité (optionnel)
    console.log(`✅ Profil patient ${patientId} mis à jour:`, Object.keys(updatedData));

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      patient: updatedPatient,
      updatedFields: Object.keys(updatedData) // Indiquer quels champs ont été modifiés
    });

  } catch (error) {
    console.error('❌ Erreur updateProfile:', error);
    
    // Gestion des erreurs spécifiques
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID patient invalide'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
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