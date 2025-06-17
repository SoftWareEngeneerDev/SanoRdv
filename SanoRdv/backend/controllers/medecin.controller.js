import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Medecin from '../models/medecin.model.js';
import { sendAdminCredentials } from '../utils/email.medecin.js';

dotenv.config();

const CONFIG = {
  BCRYPT_ROUNDS: 12,
  ALLOWED_DOMAINS: ['gmail.com', 'icloud.com', 'yahoo.com', 'outlook.com'],
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitizeInput = (input) => (typeof input === 'string' ? input.trim() : input);

// Validation de la date de naissance (optionnelle)
const isValidDateNaissance = (dateStr) => {
  if (!dateStr) return true; // Optionnel, donc valide si vide
  const date = new Date(dateStr);
  const now = new Date();
  const minAge = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
  const maxAge = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  
  return date >= minAge && date <= maxAge;
};

// Fonction utilitaire pour formater la réponse
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
  dateNaissance: medecin.dateNaissance ? medecin.dateNaissance.toISOString().split('T')[0] : null,
  dateCreation: medecin.dateCreation || medecin.createdAt
});

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
      IDmedecin,
      localite,
      dateNaissance,
    } = req.body;

    // Nettoyage des données
    nom = sanitizeInput(nom);
    prenom = sanitizeInput(prenom);
    email = sanitizeInput(email)?.toLowerCase();
    telephone = sanitizeInput(telephone);
    specialite = sanitizeInput(specialite);
    anneeExperience = Number(anneeExperience);
    IDmedecin = sanitizeInput(IDmedecin);
    localite = sanitizeInput(localite);
    dateNaissance = sanitizeInput(dateNaissance);

    // Validation des champs OBLIGATOIRES uniquement
    const champsObligatoires = {
      nom,
      prenom,
      email,
      telephone,
      specialite,
      anneeExperience,
      motDePasse,
      IDmedecin
    };

    const champManquant = Object.entries(champsObligatoires).find(([key, value]) => {
      if (key === 'anneeExperience') return isNaN(value) || value === null;
      return !value || value === '';
    });

    if (champManquant) {
      return res.status(400).json({ 
        message: `Le champ "${champManquant[0]}" est obligatoire.`,
        champsOptionnels: ['localite', 'dateNaissance']
      });
    }

    // Validations spécifiques
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Format email invalide.' });
    }

    const domain = email.split('@')[1];
    if (!CONFIG.ALLOWED_DOMAINS.includes(domain)) {
      return res.status(400).json({
        message: 'Domaine email non autorisé.',
        allowedDomains: CONFIG.ALLOWED_DOMAINS,
      });
    }

    if (anneeExperience < 0 || anneeExperience > 70) {
      return res.status(400).json({ message: "Année d'expérience doit être entre 0 et 70." });
    }

    // Validation de la date de naissance (optionnelle)
    if (dateNaissance && !isValidDateNaissance(dateNaissance)) {
      return res.status(400).json({ 
        message: 'Date de naissance invalide. Le médecin doit avoir entre 18 et 100 ans.' 
      });
    }

    // Vérification de l'existence
    const medecinExistant = await Medecin.findOne({
      $or: [{ email }, { IDmedecin }],
    });

    if (medecinExistant) {
      const champDuplique = medecinExistant.email === email ? 'email' : 'identifiant';
      return res.status(400).json({ 
        message: `⚠️ Ce ${champDuplique} est déjà utilisé par un autre médecin.` 
      });
    }

    // Hachage du mot de passe
    const hash = await bcrypt.hash(motDePasse, CONFIG.BCRYPT_ROUNDS);

    // Préparation des données du médecin
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
      dateCreation: new Date()
    };

    // Ajout conditionnel des champs optionnels
    const donneesCompletes = {
      ...donneesBase,
      // Localité : optionnelle, peut être éditée plus tard
      ...(localite && localite.length > 0 && { localite }),
      // Date de naissance : optionnelle, peut être éditée plus tard
      ...(dateNaissance && { dateNaissance: new Date(dateNaissance) }),
    };

    // Création du médecin
    const nouveauMedecin = new Medecin(donneesCompletes);
    await nouveauMedecin.save();

    // Envoi de l'email avec les identifiants
    try {
      await sendAdminCredentials(email, `${prenom} ${nom}`, motDePasse);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      
      // Le médecin est créé mais l'email a échoué
      return res.status(201).json({
        message: '⚠️ Médecin ajouté avec succès mais erreur lors de l\'envoi de l\'email.',
        medecin: formatMedecinResponse(nouveauMedecin),
        avertissement: 'Veuillez communiquer manuellement les identifiants au médecin.',
        erreurEmail: emailError.message,
      });
    }

    // Succès complet
    return res.status(201).json({
      message: '✅ Médecin ajouté avec succès et email envoyé',
      medecin: formatMedecinResponse(nouveauMedecin),
      // infos: {
      //   champsOptionnels: {
      //     localite: nouveauMedecin.localite ? 'Renseignée' : 'Non renseignée (modifiable plus tard)',
      //     dateNaissance: nouveauMedecin.dateNaissance ? 'Renseignée' : 'Non renseignée (modifiable plus tard)'
      //   }
      // }
    });

  } catch (error) {
    console.error('Erreur serveur lors de l\'ajout du médecin:', error);
    return res.status(500).json({ 
      message: '❌ Erreur serveur lors de l\'ajout du médecin', 
      erreur: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};

// Fonction pour modifier les informations optionnelles (à ajouter si nécessaire)
export const modifierInformationsOptionnelles = async (req, res) => {
  try {
    const { id } = req.params;
    let { localite, dateNaissance } = req.body;

    // Nettoyage
    localite = sanitizeInput(localite);
    dateNaissance = sanitizeInput(dateNaissance);

    // Validation de la date si fournie
    if (dateNaissance && !isValidDateNaissance(dateNaissance)) {
      return res.status(400).json({ 
        message: 'Date de naissance invalide. Le médecin doit avoir entre 18 et 100 ans.' 
      });
    }

    // Préparation des données à mettre à jour
    const miseAJour = {};
    if (localite) miseAJour.localite = localite;
    if (dateNaissance) miseAJour.dateNaissance = new Date(dateNaissance);

    if (Object.keys(miseAJour).length === 0) {
      return res.status(400).json({ 
        message: 'Aucune information à mettre à jour.' 
      });
    }

    const medecinMisAJour = await Medecin.findByIdAndUpdate(
      id, 
      miseAJour, 
      { new: true, runValidators: true }
    );

    if (!medecinMisAJour) {
      return res.status(404).json({ message: 'Médecin non trouvé.' });
    }

    return res.status(200).json({
      message: '✅ Informations optionnelles mises à jour avec succès',
      medecin: formatMedecinResponse(medecinMisAJour)
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return res.status(500).json({ 
      message: '❌ Erreur serveur lors de la mise à jour', 
      erreur: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};