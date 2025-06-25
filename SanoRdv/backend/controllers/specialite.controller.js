import Specialite from '../models/specialite.model.js';
import { sanitizeInputsimple } from '../utils/helpers.js';

export const ajouterSpecialite = async (req, res) => {
  try {
    let { nom, description } = req.body;

    // Nettoyage des données
    nom = sanitizeInputsimple(nom).toUpperCase();
    description = sanitizeInputsimple(description);

    // Validation
    if (!nom) {
      return res.status(400).json({ message: 'Le nom de la spécialité est obligatoire.' });
    }

    // Vérifier si la spécialité existe déjà
    const specialiteExistante = await Specialite.findOne({ nom });
    if (specialiteExistante) {
      return res.status(400).json({ message: 'Cette spécialité existe déjà.' });
    }

    // Création de la nouvelle spécialité
    const nouvelleSpecialite = new Specialite({
      nom,
      ...(description && { description })
    });

    await nouvelleSpecialite.save();

    return res.status(201).json({
      message: '✅ Spécialité ajoutée avec succès',
      specialite: {
        id: nouvelleSpecialite._id,
        nom: nouvelleSpecialite.nom,
        description: nouvelleSpecialite.description,
        dateCreation: nouvelleSpecialite.dateCreation
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la spécialité:', error);
    return res.status(500).json({ 
      message: '❌ Erreur serveur lors de l\'ajout de la spécialité', 
      erreur: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};

export const listerSpecialites = async (req, res) => {
  try {
    const { actif } = req.query;
    let query = {};

    if (actif === 'true' || actif === 'false') {
      query.actif = actif === 'true';
    }

    const specialites = await Specialite.find(query).sort({ nom: 1 });

    return res.status(200).json({
      message: 'Liste des spécialités récupérée avec succès',
      specialites: specialites.map(spec => ({
        id: spec._id,
        nom: spec.nom,
        description: spec.description,
        actif: spec.actif,
        dateCreation: spec.dateCreation
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des spécialités:', error);
    return res.status(500).json({ 
      message: '❌ Erreur serveur lors de la récupération des spécialités',
      erreur: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};

export const modifierSpecialite = async (req, res) => {
  try {
    const { id } = req.params;
    let { nom, description, actif } = req.body;

    // Nettoyage des données
    if (nom) nom = sanitizeInput(nom).toUpperCase();
    if (description) description = sanitizeInput(description);

    // Vérifier si la spécialité existe
    const specialite = await Specialite.findById(id);
    if (!specialite) {
      return res.status(404).json({ message: 'Spécialité non trouvée.' });
    }

    // Vérifier si le nouveau nom existe déjà (pour une autre spécialité)
    if (nom && nom !== specialite.nom) {
      const nomExisteDeja = await Specialite.findOne({ nom, _id: { $ne: id } });
      if (nomExisteDeja) {
        return res.status(400).json({ message: 'Ce nom de spécialité est déjà utilisé.' });
      }
    }

    // Mise à jour
    const updates = {};
    if (nom) updates.nom = nom;
    if (description) updates.description = description;
    if (typeof actif === 'boolean') updates.actif = actif;

    const specialiteModifiee = await Specialite.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: '✅ Spécialité modifiée avec succès',
      specialite: {
        id: specialiteModifiee._id,
        nom: specialiteModifiee.nom,
        description: specialiteModifiee.description,
        actif: specialiteModifiee.actif
      }
    });

  } catch (error) {
    console.error('Erreur lors de la modification de la spécialité:', error);
    return res.status(500).json({ 
      message: '❌ Erreur serveur lors de la modification de la spécialité',
      erreur: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};

export const desactiverSpecialite = async (req, res) => {
  try {
    const { id } = req.params;

    const specialite = await Specialite.findByIdAndUpdate(
      id,
      { actif: false },
      { new: true }
    );

    if (!specialite) {
      return res.status(404).json({ message: 'Spécialité non trouvée.' });
    }

    return res.status(200).json({
      message: '✅ Spécialité désactivée avec succès',
      specialite: {
        id: specialite._id,
        nom: specialite.nom,
        actif: specialite.actif
      }
    });

  } catch (error) {
    console.error('Erreur lors de la désactivation de la spécialité:', error);
    return res.status(500).json({ 
      message: '❌ Erreur serveur lors de la désactivation de la spécialité',
      erreur: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};