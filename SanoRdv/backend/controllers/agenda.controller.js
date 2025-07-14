import Agenda from '../models/agenda.model.js';
import Medecin from '../models/medecin.model.js'; // Assurez-vous que Medecin existe
import mongoose from 'mongoose'; // Importer mongoose pour l'ObjectId

// Créer un agenda
export const creerAgenda = async (req, res) => {
  const { date, statut, idMedecin } = req.body;

  if (!date || !idMedecin) {
    return res.status(400).json({
      success: false,
      message: "Les champs 'date' et 'idMedecin' sont requis."
    });
  }

  try {
    // Convertir idMedecin en ObjectId
    const objectIdMedecin = new mongoose.Types.ObjectId(idMedecin);

    // Vérifie si le médecin existe
    const medecin = await Medecin.findById(objectIdMedecin);
    if (!medecin) {
      return res.status(404).json({ success: false, message: 'Médecin introuvable.' });
    }

    const agenda = new Agenda({
      date,
      statut: statut || 'Actif',
      idMedecin: objectIdMedecin // Assurez-vous que l'ID soit au bon format
    });

    await agenda.save();

    res.status(201).json({
      success: true,
      message: 'Agenda créé avec succès',
      data: agenda
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
