
import Medecin from '../models/medecin.model.js';
import Rendezvous from '../models/RendezVous.js';

export const supprimerDisponibilite = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { date, slot } = req.body;

    const medecin = await Medecin.findById(medecinId);
    if (!medecin) return res.status(404).json({ message: 'Médecin non trouvé' });

    const availability = medecin.availability.find(av => av.date === date);
    if (!availability) return res.status(404).json({ message: 'Date non disponible' });

    if (slot) {
      availability.slots = availability.slots.filter(s => s !== slot);
      if (availability.slots.length === 0) {
        medecin.availability = medecin.availability.filter(av => av.date !== date);
      }
    } else {
      medecin.availability = medecin.availability.filter(av => av.date !== date);
    }

    await medecin.save();
    res.status(200).json({ message: 'Disponibilité mise à jour', availability: medecin.availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const obtenirDisponibilitesFiltrees = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { date } = req.query;

    const medecin = await Medecin.findById(medecinId);
    if (!medecin) return res.status(404).json({ message: 'Médecin non trouvé' });

    const jour = medecin.availability.find(av => av.date === date);
    if (!jour) return res.status(200).json({ date, availableSlots: [] });

    const rdvs = await Rendezvous.find({ medecin: medecinId, date, status: { $ne: 'cancelled' } });
    const dejaPris = rdvs.map(r => r.time);
    const disponibles = jour.slots.filter(s => !dejaPris.includes(s));

    res.status(200).json({ date, availableSlots: disponibles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const ajouterDisponibilite = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { date, slots } = req.body;

    const medecin = await Medecin.findById(medecinId);
    if (!medecin) return res.status(404).json({ message: 'Médecin non trouvé' });

    const existing = medecin.availability.find(av => av.date === date);
    if (existing) {
      if (Array.isArray(slots)) {
        existing.slots = [...new Set([...existing.slots, ...slots])];
      }
    } else {
      medecin.availability.push({ date, slots });
    }

    await medecin.save();
    res.status(200).json({ message: 'Disponibilité ajoutée avec succès', availability: medecin.availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
