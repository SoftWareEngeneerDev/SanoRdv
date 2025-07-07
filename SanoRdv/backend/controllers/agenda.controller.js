import Agenda from '../models/agenda.model.js';
import Creneau from '../models/creneau.model.js';

/**
 * Crée un nouvel agenda pour un jour donné
 * body attendu : { jour: '2025-06-25' }
 */
export const creerAgenda = async (req, res) => {
  try {
    const { jour } = req.body;

    // Vérifie si un agenda existe déjà pour ce jour
    const jourDate = new Date(jour);
    const existingAgenda = await Agenda.findOne({ jour: jourDate });
    if (existingAgenda) {
      return res.status(400).json({
        success: false,
        message: 'Un agenda existe déjà pour ce jour.'
      });
    }

    // Récupère les créneaux déjà existants pour cette date
    const startOfDay = new Date(jourDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(jourDate.setHours(23, 59, 59, 999));

    const creneauxDuJour = await Creneau.find({
      debut: { $gte: startOfDay, $lte: endOfDay }
    });

    const agenda = new Agenda({
      jour: jourDate,
      creneaux: creneauxDuJour.map(c => c._id)
    });

    await agenda.save();

    res.status(201).json({
      success: true,
      message: 'Agenda créé avec succès',
      data: agenda
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de l’agenda',
      error: err.message
    });
  }
};

/**
 * Récupère un agenda avec ses créneaux et les rendez-vous liés à chaque créneau
 * param attendu : agendaId
 */
export const obtenirAgenda = async (req, res) => {
  try {
    const { agendaId } = req.params;

    const agenda = await Agenda.findById(agendaId).populate({
      path: 'creneaux',
      populate: { path: 'rendezVous' }
    });

    if (!agenda) {
      return res.status(404).json({
        success: false,
        message: 'Agenda introuvable'
      });
    }

    res.status(200).json({
      success: true,
      data: agenda
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la récupération de l’agenda',
      error: err.message
    });
  }
};
