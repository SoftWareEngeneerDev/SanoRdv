// import Creneau from './models/creneau.model.js';
import Creneau from '../models/creneau.model.js';  // Import du modèle Creneau

// ------------Fonction pour ajouter un créneau---------------------------
export const AjouterCreneau = async (req, res) => {
  try {
    const { agenda, debut, fin, statut, rendezVous } = req.body;

    // Validation de la durée (30 minutes exactement)
    const dureeMs = new Date(fin) - new Date(debut);
    if (dureeMs !== 30 * 60 * 1000) {
      return res.status(400).json({ 
        message: 'La durée du créneau doit être exactement de 30 minutes' 
      });
    }

    const nouveauCreneau = new Creneau({
      agenda,
      debut: new Date(debut),
      fin: new Date(fin),
      statut: statut || 'libre',
      rendezVous: rendezVous || null
    });

    await nouveauCreneau.save();
    res.status(201).json(nouveauCreneau);
  } catch (error) {
    if (error.message.includes('chevauche')) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(400).json({ 
        message: error.message || 'Erreur lors de la création du créneau' 
      });
    }
  }
};




//---------------------Fonction pour modifier un créneau--------------------

// 
export const ModifierCreneau = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Bloque la modification si le créneau est réservé
    const creneauExist = await Creneau.findById(id);
    if (!creneauExist) {
      return res.status(404).json({ message: 'Créneau non trouvé' });
    }

    if (creneauExist.statut === 'réservé') {
      return res.status(403).json({ 
        message: 'Impossible de modifier un créneau réservé' 
      });
    }

    // Validation durée 30min si fin/debut modifiés
    if (updates.debut || updates.fin) {
      const fin = updates.fin ? new Date(updates.fin) : creneauExist.fin;
      const debut = updates.debut ? new Date(updates.debut) : creneauExist.debut;
      if ((fin - debut) !== 30 * 60 * 1000) {
        return res.status(400).json({ 
          message: 'La durée doit rester de 30 minutes' 
        });
      }
    }

    const creneau = await Creneau.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json(creneau);
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Erreur lors de la modification du créneau' 
    });
  }
};




//-------------------------Fonction pour supprimer un créneau-------------------

export const SupprimerCreneau = async (req, res) => {
  try {
    const { id } = req.params;
    const creneau = await Creneau.findById(id);

    if (!creneau) {
      return res.status(404).json({ message: 'Créneau non trouvé' });
    }

    if (creneau.statut === 'réservé') {
      return res.status(403).json({ 
        message: 'Impossible de supprimer un créneau réservé' 
      });
    }

    await Creneau.findByIdAndDelete(id);
    res.status(200).json({ message: 'Créneau supprimé avec succès' });
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Erreur lors de la suppression du créneau' 
    });
  }
};



//---------------- Fonction pour afficher tous les créneaux -----------

export const AfficherCreneau = async (req, res) => {
  try {
    const { id } = req.params;
    const creneau = await Creneau.findById(id)
      .populate('agenda', 'nom')
      .populate('rendezVous', 'patient motif');

    if (!creneau) {
      return res.status(404).json({ message: 'Créneau non trouvé' });
    }

    // Formatage pour la réponse
    const response = {
      ...creneau.toObject(),
      debut: creneau.debut.toISOString(),
      fin: creneau.fin.toISOString(),
      duree: creneau.dureeMinutes(),
      estDisponible: creneau.estDisponible()
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Erreur lors de la récupération du créneau' 
    });
  }
};

export default {
  AjouterCreneau,
  ModifierCreneau,
  SupprimerCreneau,
  AfficherCreneau
};