import Creneau from '../models/creneau.model.js';
/**
 * Ajouter un créneau (libre, réservé, ou bloqué)
 */
export async function AjouterCreneau(req, res) {
  try {
    const { agendaId, debut, fin, statut, rendezVousId } = req.body;
    const nouveauCreneau = new Creneau({
      agendaId,
      debut,
      fin,
      statut: statut || 'libre',
      rendezVousId: rendezVousId || null,
    });
    await nouveauCreneau.save();
    res.status(201).json({ message: 'Créneau ajouté avec succès', data: nouveauCreneau });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'ajout du créneau', error: error.message });
  }
}
/**
 * Modifier un créneau existant
 */
export async function ModifierCreneau(req, res) {
  try {
    const creneau = await Creneau.findById(req.params.idCreneau);
    if (!creneau) {
      return res.status(404).json({ message: 'Créneau non trouvé' });
    }
    creneau.debut = req.body.debut || creneau.debut;
    creneau.fin = req.body.fin || creneau.fin;
    creneau.statut = req.body.statut || creneau.statut;
    creneau.rendezVousId = req.body.rendezVousId || creneau.rendezVousId;
    await creneau.save();
    res.status(200).json({ message: 'Créneau modifié avec succès', data: creneau });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la modification du créneau', error: error.message });
  }
}
/**
 * Supprimer un créneau
 */
export async function SupprimerCreneau(req, res) {
  try {
    const creneau = await Creneau.findByIdAndDelete(req.params.idCreneau);
    if (!creneau) {
      return res.status(404).json({ message: 'Créneau non trouvé' });
    }
    res.status(200).json({ message: 'Créneau supprimé avec succès', data: creneau });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la suppression du créneau', error: error.message });
  }
}
/**
 * Afficher tous les créneaux (avec filtres facultatifs : agendaId, statut)
 */
export async function AfficheCreneau(req, res) {
  try {
    const filters = {};
    if (req.query.agendaId) {
      filters.agendaId = req.query.agendaId;
    }
    if (req.query.statut) {
      filters.statut = req.query.statut; // libre, réservé, bloqué
    }
    const creneaux = await Creneau.find(filters).sort({ debut: 1 });
    if (creneaux.length === 0) {
      return res.status(404).json({ message: 'Aucun créneau trouvé' });
    }
    res.status(200).json({ success: true, data: creneaux });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erreur lors de l\'affichage des créneaux', error: error.message });
  }
}
/**
 * Afficher uniquement les créneaux disponibles (statut libre)
 */
export async function AfficheCreneauxDisponibles(req, res) {
  try {
    const filters = { statut: 'libre' };
    if (req.query.agendaId) {
      filters.agendaId = req.query.agendaId;
    }
    const creneauxLibres = await Creneau.find(filters).sort({ debut: 1 });
    if (creneauxLibres.length === 0) {
      return res.status(404).json({ message: 'Aucun créneau disponible' });
    }
    res.status(200).json({ success: true, data: creneauxLibres });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erreur lors de la récupération des créneaux', error: error.message });
  }
}
/**
 * Bloquer un créneau sans rendez-vous (ex. pause déjeuner)
 */
export async function BloquerCreneau(req, res) {
  try {
    const { agendaId, debut, fin } = req.body;
    if (!agendaId || !debut || !fin) {
      return res.status(400).json({ message: 'agendaId, heure de début et fin sont requis.' });
    }
    const creneauBloque = new Creneau({
      agendaId,
      debut,
      fin,
      statut: 'bloqué',
      rendezVousId: null,
    });
    await creneauBloque.save();
    res.status(201).json({
      message: 'Créneau bloqué avec succès',
      data: creneauBloque
    });
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors du blocage du créneau', error: err.message });
  }
}
export default {
  AjouterCreneau,
  ModifierCreneau,
  SupprimerCreneau,
  AfficheCreneau,
  AfficheCreneauxDisponibles,
  BloquerCreneau
};