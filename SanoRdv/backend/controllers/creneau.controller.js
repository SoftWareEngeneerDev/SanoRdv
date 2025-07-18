import mongoose from 'mongoose'; //  nécessaire pour ObjectId
import Creneau from '../models/creneau.model.js';
import Agenda from '../models/agenda.model.js';
import { genererCreneauxParDate } from '../utils/genererCreneauxParDate.creneau.js';
import { modifierStatusParHeure } from '../utils/modifierStatusParHeure.creneau.js';


//-----------Fonction qui permet de générer et enregistrer----------
// export async function genererEtEnregistrerCreneau(agendaId, date, heuresIndisponibles = []) {
//   if (!agendaId || !date) {
//     throw new Error("Champs 'agendaId' et 'date' requis.");
//   }

//   if (!mongoose.Types.ObjectId.isValid(agendaId)) {
//     throw new Error("Identifiant 'agendaId' invalide.");
//   }

//   const objectIdAgenda = new mongoose.Types.ObjectId(agendaId); //  conversion correcte

//   // 1. Générer les créneaux de la journée
//   let timeSlots = genererCreneauxParDate(date);

//   // 2. Marquer les créneaux indisponibles
//   if (heuresIndisponibles.length > 0) {
//     timeSlots = modifierStatusParHeure(timeSlots, heuresIndisponibles);
//   }

//   // 3. Mise à jour si créneau existant
//   const existing = await Creneau.findOne({
//     agenda: objectIdAgenda,
//     date: new Date(date)
//   });

//   if (existing) {
//     existing.timeSlots = timeSlots;
//     const updated = await existing.save();
//     return { operation: 'update', data: updated };
//   }

//   // 4. Création si non existant
//   const nouveau = new Creneau({
//     agenda: objectIdAgenda,
//     date: new Date(date),
//     timeSlots
//   });

//   const saved = await nouveau.save();
//   return { operation: 'create', data: saved };
// }

export async function genererEtEnregistrerCreneau(agendaId, date, heuresIndisponibles) {
    try {
        // Générer les créneaux
        const timeSlots = await genererCreneauxParDate(date);
        
        // Marquer les heures indisponibles
        const updatedTimeSlots = timeSlots.map(slot => {
            if (heuresIndisponibles.includes(slot.time)) {
                return { ...slot, status: 'indisponible' };
            }
            return slot;
        });

        // Créer et sauvegarder le créneau
        const nouveauCreneau = new Creneau({
            date: new Date(date),
            timeSlots: updatedTimeSlots,
            agenda: agendaId
        });

        await nouveauCreneau.save();

        return {
            success: true,
            data: nouveauCreneau
        };
    } catch (error) {
        console.error("Erreur lors de la génération des créneaux:", error);
        throw error;
    }
}
//------------------------------------------------------------------


//  Supprimer créneau
export async function supprimerCreneau(agendaId, date) {
  if (!agendaId || !date) {
    throw new Error("Les champs 'agendaId' et 'date' sont requis");
  }

  if (!mongoose.Types.ObjectId.isValid(agendaId)) {
    throw new Error("Identifiant 'agendaId' invalide.");
  }

  const objectIdAgenda = new mongoose.Types.ObjectId(agendaId);

  const result = await Creneau.deleteOne({
    agenda: objectIdAgenda,
    date: new Date(date)
  });

  if (result.deletedCount === 0) {
    throw new Error("Aucun créneau trouvé pour cette date et cet agenda.");
  }

  return result;
}

//  Obtenir agenda avec ses créneaux
export const obtenirAgenda = async (req, res) => {
  try {
    const { agendaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agendaId)) {
      return res.status(400).json({ success: false, message: "ID d'agenda invalide" });
    }

    const agenda = await Agenda.findById(agendaId).populate('creneaux');

    if (!agenda) {
      return res.status(404).json({ success: false, message: 'Agenda introuvable' });
    }

    res.status(200).json({ success: true, data: agenda });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Obtenir créneaux par date
export async function getCreneauxParDate(agendaId, date) {
  if (!agendaId || !date) {
    throw new Error("Les champs 'agendaId' et 'date' sont requis");
  }

  if (!mongoose.Types.ObjectId.isValid(agendaId)) {
    throw new Error("Identifiant 'agendaId' invalide.");
  }

  const objectIdAgenda = new mongoose.Types.ObjectId(agendaId);

  const creneau = await Creneau.findOne({
    agenda: objectIdAgenda,
    date: new Date(date),
  });

  if (!creneau) {
    throw new Error("Aucun créneau trouvé pour cette date et cet agenda.");
  }

  return creneau;
}

//  Filtrer les créneaux par statut
export async function filtrerCreneauxParStatut(agendaId, date, statut) {
  if (!agendaId || !date || !statut) {
    throw new Error("Les champs 'agendaId', 'date' et 'statut' sont requis");
  }

  if (!mongoose.Types.ObjectId.isValid(agendaId)) {
    throw new Error("Identifiant 'agendaId' invalide.");
  }

  const objectIdAgenda = new mongoose.Types.ObjectId(agendaId);

  const creneau = await Creneau.findOne({
    agenda: objectIdAgenda,
    date: new Date(date),
  });

  if (!creneau) {
    throw new Error("Aucun créneau trouvé pour cette date et cet agenda.");
  }

  const timeSlotsFiltres = creneau.timeSlots.filter(slot => slot.status === statut);

  return {
    agenda: creneau.agenda,
    date: creneau.date,
    timeSlots: timeSlotsFiltres
  };
}

//  Export final
export default {
  genererEtEnregistrerCreneau,
  supprimerCreneau,
  getCreneauxParDate,
  filtrerCreneauxParStatut
};
