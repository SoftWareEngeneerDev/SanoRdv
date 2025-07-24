import Medecin from '../models/medecin.model.js';
import Patient from '../models/patient.model.js';
import RendezVous from '../models/rendezvous.model.js';

/**
 * Contrôleur pour récupérer les statistiques du tableau de bord.
 */

// A implemeneter le nombre de medecin et de rendez-vous actif({ statut: 'actif' } et ({ statut: 'confirmé' }))


export const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const medecinsActifs = await Medecin.countDocuments();
    const totalRendezVous = await RendezVous.countDocuments();

    res.json({
      totalPatients,
      medecinsActifs,
      totalRendezVous
    });
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques du dashboard :', error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


