
import Creneau from '../models/creneau.model.js';
import Agenda from '../models/agenda.model.js';
import { genererCreneauxParDate } from '../utils/genererCreneauxParDate.creneau.js';
import { modifierStatusParHeure } from '../utils/modifierStatusParHeure.creneau.js';



//-----------Fonction qui permet de generer et enregistrer----------
async function genererEtEnregistrerCreneau(agendaId, date, heuresIndisponibles = []) {
    if (!agendaId || !date) {
        throw new Error("Champs 'agendaId' et 'date' requis.");
    }

    // 1. Générer les créneaux de la journée
    let timeSlots = genererCreneauxParDate(date);

    // 2. Marquer les créneaux indisponibles selon les choix du médecin
    if (heuresIndisponibles.length > 0) {
        timeSlots = modifierStatusParHeure(timeSlots, heuresIndisponibles, 'indisponible');
    }

    // 3. Vérifie si un créneau existe déjà (update si oui)
    const existing = await Creneau.findOne({ agenda: agendaId, date: new Date(date) });

    if (existing) {
        existing.timeSlots = timeSlots;
        const updated = await existing.save();
        return { operation: 'update', data: updated };
    }

    // 4. Sinon, créer un nouveau
    const nouveau = new Creneau({
        agenda: agendaId,
        date: new Date(date),
        timeSlots
    });

    const saved = await nouveau.save();
    return { operation: 'create', data: saved };
}

//------------------------------------------------------------------


// --------------Fonction pour vérifier et supprimer les créneaux existants pour une date donnée

export async function supprimerCreneau(agendaId, date) {
  if (!agendaId || !date) {
    throw new Error("Les champs 'agendaId' et 'date' sont requis");
  }

  const result = await Creneau.deleteOne({
    agenda: agendaId,
    date: new Date(date)
  });

  if (result.deletedCount === 0) {
    throw new Error("Aucun créneau trouvé pour cette date et cet agenda.");
  }

  return result;
}

//---------------- Fonction pour obtenir un agenda avec ses créneaux --------
export const obtenirAgenda = async (req, res) => {
  try {
    const { agendaId } = req.params;
    // Popule le tableau creneaux de l'agenda
    const agenda = await Agenda.findById(agendaId).populate('creneaux');

    if (!agenda) {
      return res.status(404).json({ success: false, message: 'Agenda introuvable' });
    }

    res.status(200).json({ success: true, data: agenda });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// --------Pour afficher les créneaux d’un agenda à une date donnée --
export async function getCreneauxParDate(agendaId, date) {
  if (!agendaId || !date) {
    throw new Error("Les champs 'agendaId' et 'date' sont requis");
  }

  const creneau = await Creneau.findOne({
    agenda: agendaId,
    date: new Date(date),
  });

  if (!creneau) {
    throw new Error("Aucun créneau trouvé pour cette date et cet agenda.");
  }

  return creneau;
}

//--------------Fonction contrôleur – filtrer par statut-----------------------
// 
export async function filtrerCreneauxParStatut(agendaId, date, statut) {
  if (!agendaId || !date || !statut) {
    throw new Error("Les champs 'agendaId', 'date' et 'statut' sont requis");
  }

  const creneau = await Creneau.findOne({
    agenda: agendaId,
    date: new Date(date),
  });

  if (!creneau) {
    throw new Error("Aucun créneau trouvé pour cette date et cet agenda.");
  }

  // Filtrer les timeSlots selon le statut
  const timeSlotsFiltres = creneau.timeSlots.filter(slot => slot.status === statut);

  return {
    agenda: creneau.agenda,
    date: creneau.date,
    timeSlots: timeSlotsFiltres
  };
}

//---------------------------------------------------------------------------
export default {
    genererEtEnregistrerCreneau,
    supprimerCreneau,
    getCreneauxParDate,
    filtrerCreneauxParStatut
};
