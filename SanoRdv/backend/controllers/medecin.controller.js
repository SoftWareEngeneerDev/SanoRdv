import Admin from '../models/admin.model.js';
import Patient from '../models/patient.model.js';
import Medecin from '../models/medecin.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Configuration (adaptable)
const CONFIG = {
  ALLOWED_DOMAINS: ['gmail.com', 'icloud.com', 'yahoo.com', 'outlook.com'],
  BCRYPT_ROUNDS: 12,
};

// Utilitaires simples
const sanitizeInput = (input) => (typeof input === 'string' ? input.trim() : input);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Formatteur pour réponse médecin (exclure motDePasse, __v, etc)
const formatMedecinResponse = (medecin) => {
  if (!medecin) return null;
  const {
    _id,
    nom,
    prenom,
    email,
    telephone,
    specialite,
    anneeExperience,
    localite,
    dateNaissance,
    photo,
    adresse,
    nationalite,
    role,
    sexe,
    parcours,
    IDmedecin,
    isActive,
    createdAt,
    updatedAt,
  } = medecin;
  return {
    _id,
    nom,
    prenom,
    email,
    telephone,
    specialite,
    anneeExperience,
    localite,
    dateNaissance,
    photo,
    adresse,
    nationalite,
    sexe,
    parcours,
    role,
    IDmedecin,
    isActive,
    createdAt,
    updatedAt,
  };
};

// ============================================
// Changer statut Médecin
export const changerStatutMedecin = async (req, res) => {
  try {
    const medecin = await Medecin.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    if (!medecin) return res.status(404).json({ message: "Médecin non trouvé" });
    res.json(formatMedecinResponse(medecin));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Changer statut Patient
export const changerStatutPatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: "Patient non trouvé" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier profil Médecin
export const modifierMedecin = async (req, res) => {
  try {
    const medecinId = req.params.id;

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
      nationalite,
      sexe,
      parcours
    } = req.body;

    nom = nom ? sanitizeInput(nom) : undefined;
    prenom = prenom ? sanitizeInput(prenom) : undefined;
    email = email ? sanitizeInput(email).toLowerCase() : undefined;
    telephone = telephone ? sanitizeInput(telephone) : undefined;
    specialite = specialite ? sanitizeInput(specialite) : undefined;
    anneeExperience = anneeExperience !== undefined ? Number(anneeExperience) : undefined;
    motDePasse = motDePasse ? sanitizeInput(motDePasse) : undefined;
    localite = localite ? sanitizeInput(localite) : undefined;
    dateNaissance = dateNaissance ? sanitizeInput(dateNaissance) : undefined;
    photo = photo ? sanitizeInput(photo) : undefined;
    adresse = adresse ? sanitizeInput(adresse) : undefined;
    nationalite = nationalite ? sanitizeInput(nationalite) : undefined;
    sexe = sexe ? sanitizeInput(sexe) : undefined; // 🔧 nettoyage
    parcours = parcours ? sanitizeInput(parcours) : undefined; // ✅ Ajout ici


    const medecin = await Medecin.findById(medecinId);
    if (!medecin) return res.status(404).json({ message: "Médecin non trouvé" });

    if (email && email !== medecin.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Email invalide" });
      }
      const domain = email.split('@')[1];
      if (!CONFIG.ALLOWED_DOMAINS.includes(domain)) {
        return res.status(400).json({ message: "Domaine email non autorisé" });
      }
      const emailExist = await Medecin.findOne({ email });
      if (emailExist) {
        return res.status(400).json({ message: "Email déjà utilisé" });
      }
      medecin.email = email;
    }

    if (anneeExperience !== undefined) {
      if (isNaN(anneeExperience) || anneeExperience < 0 || anneeExperience > 70) {
        return res.status(400).json({ message: "Année d'expérience invalide (0-70)" });
      }
      medecin.anneeExperience = anneeExperience;
    }

    if (dateNaissance) {
      const date = new Date(dateNaissance);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Date de naissance invalide" });
      }
      medecin.dateNaissance = date;
    }

    if (nom) medecin.nom = nom;
    if (prenom) medecin.prenom = prenom;
    if (telephone) medecin.telephone = telephone;
    if (specialite) medecin.specialite = specialite;
    if (localite) medecin.localite = localite;
    if (photo) medecin.photo = photo;
    if (adresse) medecin.adresse = adresse;
    if (nationalite) medecin.nationalite = nationalite;
    if (sexe) medecin.sexe = sexe; // 🔧 attribution
     if (parcours) medecin.parcours = parcours; // ✅ Affectation ici


    if (motDePasse) {
      if (motDePasse.length < 8) {
        return res.status(400).json({ message: "Mot de passe trop court (min 8 caractères)" });
      }
      medecin.motDePasse = await bcrypt.hash(motDePasse, CONFIG.BCRYPT_ROUNDS);
    }

    await medecin.save();

    return res.status(200).json({
      message: "Profil médecin mis à jour avec succès",
      medecin: formatMedecinResponse(medecin)
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du médecin:', error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
};



export const getMedecinById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validation basique de l'id (optionnel, selon Mongoose)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID médecin invalide' });
    }

    const medecin = await Medecin.findById(id).select('-motDePasse'); // retire motDePasse de la réponse

    if (!medecin) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }

    return res.status(200).json(medecin);
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};