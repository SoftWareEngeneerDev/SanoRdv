// import Creneau from './models/creneau.model.js';
import Creneau from '../models/creneau.model.js';  // Import du modèle Creneau

// Fonction pour ajouter un créneau
export async function AjouterCreneau(req, res) {
  try {
    // Créer un nouveau créneau à partir des données envoyées dans la requête
    const nouveauCreneau = new Creneau({
      agendaId: req.body.agendaId,  // Agenda associé
      debut: req.body.debut,        // Heure de début
      fin: req.body.fin,            // Heure de fin
      statut: req.body.statut || 'libre', // Statut par défaut 'libre'
      rendezVousId: req.body.rendezVousId || null // Rendez-vous associé, facultatif
    });

    // Sauvegarder le créneau dans la base de données
    await nouveauCreneau.save();

    // Retourner une réponse avec succès
    res.status(201).json({ message: 'Créneau ajouté avec succès', data: nouveauCreneau });
  } catch (error) {
    // Gérer les erreurs
    res.status(400).json({ message: 'Erreur lors de l\'ajout du créneau', error: error.message });
  }
}





//---------------------------------

// Fonction pour modifier un créneau
export async function ModifierCreneau(req, res) {
  try {
    // Trouver le créneau à modifier avec son ID
    const creneau = await Creneau.findById(req.params.idCreneau);
    if (!creneau) {
      return res.status(404).json({ message: 'Créneau non trouvé' });
    }

    // Mettre à jour les champs du créneau avec les nouvelles données envoyées dans la requête
    creneau.debut = req.body.debut || creneau.debut;
    creneau.fin = req.body.fin || creneau.fin;
    creneau.statut = req.body.statut || creneau.statut;
    creneau.rendezVousId = req.body.rendezVousId || creneau.rendezVousId;

    // Sauvegarder les modifications dans la base de données
    await creneau.save();

    // Retourner une réponse avec succès
    res.status(200).json({ message: 'Créneau modifié avec succès', data: creneau });
  } catch (error) {
    // Gérer les erreurs
    res.status(400).json({ message: 'Erreur lors de la modification du créneau', error: error.message });
  }
}




//---------------------------------------------

// Fonction pour supprimer un créneau
export async function SupprimerCreneau(req, res) {
  try {
    // Trouver et supprimer le créneau avec son ID
    const creneau = await Creneau.findByIdAndDelete(req.params.idCreneau);
    if (!creneau) {
      return res.status(404).json({ message: 'Créneau non trouvé' });
    }

    // Retourner une réponse avec succès
    res.status(200).json({ message: 'Créneau supprimé avec succès', data: creneau });
  } catch (error) {
    // Gérer les erreurs
    res.status(400).json({ message: 'Erreur lors de la suppression du créneau', error: error.message });
  }
}

//---------------------------------------
// Fonction pour afficher tous les créneaux
export async function AfficheCreneau(req, res) {
  try {
    // Optionnel : tu peux ajouter des filtres pour les créneaux, par exemple par agendaId
    const filters = {};
    if (req.query.agendaId) {
      filters.agendaId = req.query.agendaId;  // Filtrer par agendaId si spécifié dans la requête
    }

    // Récupérer tous les créneaux qui correspondent aux filtres
    const creneaux = await Creneau.find(filters);

    // Vérifier s'il y a des créneaux
    if (creneaux.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucun créneau trouvé' });
    }

    // Retourner les créneaux en réponse
    res.status(200).json({ success: true, data: creneaux });
  } catch (error) {
    // Gérer les erreurs
    res.status(400).json({ success: false, message: 'Erreur lors de l\'affichage des créneaux', error: error.message });
  }
}


export default {
  AjouterCreneau,
  ModifierCreneau,
  SupprimerCreneau,
  AfficheCreneau
};