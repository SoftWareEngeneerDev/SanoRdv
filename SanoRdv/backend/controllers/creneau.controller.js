
import mongoose from 'mongoose';
import Creneau from '../models/creneau.model.js';
import Patient from '../models/patient.model.js';
// import { retrieveTimeSlotsByDate } from '../utils/genererCreneauxParDate.creneau.js';


export async function retrieveOrCreateCreneau(agendaId, date) {
  try {

    if (!mongoose.Types.ObjectId.isValid(agendaId)) {
        throw new Error("Identifiant 'agendaId' invalide");
    }

    
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    // 2. Recherche dans la base de données
    // Trouver le creneau pour l'agenda indiquée
    const creneauExistant = await Creneau.findOne({ 
      agenda: agendaId,
      date: dateOnly
    });

    // // Affichage 
    // console.log('// ---------------------------------------------------');
    // console.log('Ce creneau existe dans la base de données:', creneauExistant, agendaId);
    // console.log('// ---------------------------------------------------');
    
    // Si un créneau existe déjà, le retourner
    if (creneauExistant) {
        console.log("Créneau existant récupéré :", creneauExistant);
        return {
            success: true,
            operation: 'retrieved',
            data: creneauExistant // Retourne simplement le créneau existant
        };
    }

    // Si le créneau n'existe pas, créer un nouveau créneau
    const timeSlots = [];
    const startTime = 8;  // Heure de début
    const endTime = 17.5;  // Heure de fin
    const interval = 0.5;  // Intervalle de 30 minutes

    for (let time = startTime; time <= endTime; time += interval) {
        const hours = Math.floor(time);
        const minutes = (time % 1 === 0.5) ? '30' : '00';
        const timeString = `${hours}:${minutes}`;
        timeSlots.push({
            time: timeString,
            status: 'disponible',
        });
    }

    // Créer un nouveau créneau
    const creneauToRetrieve = new Creneau({
        date: new Date(date),
        timeSlots: timeSlots,
        agenda: agendaId
    });

    // Sauvegarder le créneau
    await creneauToRetrieve.save();
    console.log("Nouveau créneau créé :", creneauToRetrieve);

    // Retourner le nouveau créneau créé
    return {
        success: true,
        operation: 'created',
        data: creneauToRetrieve
    };

  } catch (error) {
      console.error("Erreur lors de la génération des créneaux:", error);
      throw error; // Propagation de l'erreur pour gestion par l'appelant
  }
}

// --------- Fonction pour modifier Creneau --------------------------- //
export async function modifierCreneau(req, res) {
    try {
    const { idcreneau, timeSlots } = req.body;
    
    // Rechercher le creneau avec son identifiant
    const creneau = await Creneau.findById(idcreneau);
    
    // Si creneau non trouvé retourner data vide et message adequoit
    if (!creneau) {
        return res.status(404).json({
            success: false,
            data: null,
            message: "Creneau non trouvé avec l'identifiant fourni"
        });
    }
    
    // Écraser les timeSlots du creneau trouver par les timeSlot fournie en paramètre
    creneau.timeSlots = timeSlots;
    
    // Sauvegarder le creneau pour prise en compte du creneau
    const updatedCreneau = await creneau.save();
    
    // Retourner le nouvel objet modifier
    return res.status(200).json({
        success: true,
        data: updatedCreneau,
        message: "Creneau modifié avec succès"
    });

    } catch (error) {
        console.error("Erreur lors de la modification du creneau:", error);
        return res.status(500).json({ 
            success: false,
            message: "Erreur serveur lors de la modification du creneau",
            error: error.message 
        });
    }
}
//-----------------------ReserverCreneau----------------------------
// POST /api/creneaux/reserver
export async function reserverCreneau(req, res) {
    try {
        const { idCreneau, time, idPatient } = req.body;

        /* ---------- 1.  Vérification minimale ---------- */
        if (!idCreneau || !time || !idPatient) {
            return res.status(400).json({
                success: false,
                message: "idCreneau, time et idPatient sont requis"
            });
        }

        /* ---------- 2.  Récupération du créneau ---------- */
        const creneau = await Creneau.findById(idCreneau);
        if (!creneau) {
            return res.status(404).json({
                success: false,
                message: "Créneau introuvable"
            });
        }

        /* ---------- 3.  Récupération du patient ---------- */
        const patient = await Patient.findById(idPatient);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient introuvable"
            });
        }

        /* ---------- 4.  Recherche du slot ---------- */
        const slot = creneau.timeSlots.find(s => s.time === time);
        if (!slot) {
            return res.status(404).json({
                success: false,
                message: `Aucun slot à ${time} trouvé dans ce créneau`
            });
        }

        /* ---------- 5.  Vérification de la disponibilité ---------- */
        if (slot.status !== "disponible") {
            return res.status(409).json({
                success: false,
                message: `Le slot ${time} n'est plus disponible`
            });
        }

        /* ---------- 6.  Réservation ---------- */
        slot.status   = "reserve";
        slot.patientId = idPatient;      // <-- Ici on stocke l’ID du patient

        await creneau.save();

        /* ---------- 7.  Réponse ---------- */
        return res.status(200).json({
            success: true,
            data: slot,
            message: "Réservation effectuée"
        });

    } catch (err) {
        console.error("Erreur réservation:", err);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: err.message
        });
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
  retrieveOrCreateCreneau,
  supprimerCreneau,
  getCreneauxParDate,
  filtrerCreneauxParStatut
};