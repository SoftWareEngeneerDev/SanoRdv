
import mongoose from 'mongoose';
import Creneau from '../models/creneau.model.js';
import Patient from '../models/patient.model.js';
// import { retrieveTimeSlotsByDate } from '../utils/genererCreneauxParDate.creneau.js';


export async function retrieveOrCreateCreneau(agendaId, date) {
    try {

        if (!mongoose.Types.ObjectId.isValid(agendaId)) {
            throw new Error("Identifiant 'agendaId' invalide");
        }

        // 2. Récupérer les timeSlots du creneau à la date indiquée
        // const timeSlots = await retrieveTimeSlotsByDate(date);
 
            // 2. Recherche dans la base de données
            const dateOnly = new Date(date);
          dateOnly.setHours(0, 0, 0, 0);

          let isNewInstance=false; 
          let creneauToRetrieve = null;
          const creneauExistant = await Creneau.findOne({ agenda: agendaId,
          date: dateOnly, });
          console.log('Voici le creneau que j\'ai trouvé:', creneauExistant, agendaId);               
          // 3. Si aucun creneau à cette date alors créons le
          if (creneauExistant) {
              console.log('Creneau déjà existant pour cet agenda:', creneauExistant);
              creneauToRetrieve = creneauExistant;
              isNewInstance = false;
          }else{  
              console.log('Creneau non existant pour cet agenda:', creneauExistant);
              isNewInstance = true;

              // Génération des créneaux par défaut (8h-17h30, toutes les 30 minutes)
              const timeSlots = [];
              const startTime = 8;   // Heure de début configurable
              const endTime = 17.5;   // Heure de fin configurable
              const interval = 0.5;   // Intervalle configurable (30 minutes)
      
              for (let time = startTime; time <= endTime; time += interval) {
                  const hours = Math.floor(time);
                  const minutes = (time % 1 === 0.5) ? '30' : '00';
                  const timeString = `${hours}:${minutes}`;
                  
                  timeSlots.push({
                      _id: new Types.ObjectId(),
                      time: timeString,
                      status: 'disponible', // Statut par défaut
                      // Ajoutez d'autres champs requis par votre modèle si nécessaire
                  });
              }

              creneauToRetrieve = new Creneau({
              date: new Date(date),
              timeSlots: timeSlots,
              agenda: agendaId
          });
          await creneauToRetrieve.save();

          }
        // // 5. Mise à jour ou création
        // let operationType = 'update';
        // let creneau;

        // if (existingCreneau) {
        //     existingCreneau.timeSlots = timeSlots;
        //     creneau = await existingCreneau.save();
        // } else {
        //     operationType = 'create';
        //     creneau = new Creneau({
        //         date: new Date(date),
        //         timeSlots: timeSlots,
        //         agenda: agendaId
        //     });
        //     await creneau.save();
        // }

        // 6. Retour du résultat
        return {
            isNewCreation: isNewInstance,
            success: true,            
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
        const { idcreneau, time, idPatient } = req.body;

        /* ---------- 1.  Vérification minimale ---------- */
        if (!idcreneau || !time || !idPatient) {
            return res.status(400).json({
                success: false,
                message: "idcreneau, time et idPatient sont requis"
            });
        }

        /* ---------- 2.  Récupération du créneau ---------- */
        const creneau = await Creneau.findById(idcreneau);
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
  filtrerCreneauxParStatut,
   modifierCreneau,
  reserverCreneau
};