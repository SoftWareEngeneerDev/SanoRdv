
import Creneau from '../models/creneau.model.js';

// -----------Fonction pour valider la date------------------------
function validerDate(date) {
    const isValidDate = !isNaN(new Date(date).getTime());
    return isValidDate;
}



// -------Fonction pour générer les créneaux horaires sans les enregistrer immédiatement--
function genererCreneauxParDate(dateChoisie) {
    if (!validerDate(dateChoisie)) {
        throw new Error('La date fournie n\'est pas valide.');
    }

    const startTime = 8;  // 8h00
    const endTime = 17.5; // 17h30
    const interval = 0.5; // Intervalle de 30 minutes

    const timeSlots = [];

    // Générer les créneaux horaires pour la date choisie
    for (let time = startTime; time <= endTime; time += interval) {
        let hours = Math.floor(time);
        let minutes = (time % 1 === 0.5) ? '30' : '00';
        let formattedTime = `${hours}:${minutes}`;

        timeSlots.push({
            time: formattedTime,
            status: 'disponible', // Par défaut, tous les créneaux sont disponibles
        });
    }

    return timeSlots;
}



// ----------Fonction pour modifier le statut d'un créneau spécifique-----------------
function mettreAJourStatutCreneau(timeSlots, time, newStatus) {
    const timeSlot = timeSlots.find(slot => slot.time === time);

    if (timeSlot) {
        if (!['disponible', 'indisponible', 'réservé'].includes(newStatus)) {
            throw new Error('Statut invalide.');
        }
        timeSlot.status = newStatus;
    } else {
        throw new Error('Créneau horaire non trouvé');
    }

    return timeSlots;
}

// --------------Fonction pour vérifier et supprimer les créneaux existants pour une date donnée
async function verifierEtSupprimerCreneauxExistants(dateChoisie, agendaId) {
    const existingCreneaux = await Creneau.findOne({ date: dateChoisie, agenda: agendaId });

    if (existingCreneaux) {
        await Creneau.deleteOne({ date: dateChoisie, agenda: agendaId });
    }
}



// -------------Fonction pour enregistrer les créneaux dans la base de données
async function saveCreneaux(dateChoisie, agendaId, timeSlots) {
    try {
        // Vérifier si des créneaux existent déjà pour cette date et cet agenda
        await verifierEtSupprimerCreneauxExistants(dateChoisie, agendaId);

        const newCreneau = new Creneau({
            agenda: agendaId,
            date: dateChoisie,
            timeSlots: timeSlots,
        });

        // Sauvegarder les créneaux dans la base de données
        const savedCreneau = await newCreneau.save();
        return savedCreneau;
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement des créneaux:', error);
        throw new Error('Échec de l\'enregistrement des créneaux.');
    }
}



// -------------Fonction pour insérer les créneaux par lots (Bulk insert) pour optimiser les performances
async function saveCreneauxBulk(dateChoisie, agendaId, timeSlots) {
    try {
        // Vérifier si des créneaux existent déjà pour cette date et cet agenda
        await verifierEtSupprimerCreneauxExistants(dateChoisie, agendaId);

        const operations = timeSlots.map(slot => ({
            updateOne: {
                filter: { agenda: agendaId, date: dateChoisie, time: slot.time },
                update: { $set: slot },
                upsert: true, // Crée un créneau si inexistant
            },
        }));

        // Enregistrer les créneaux par lots
        const result = await Creneau.bulkWrite(operations);
        return result;
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement des créneaux par lots:', error);
        throw new Error('Échec de l\'enregistrement des créneaux par lots.');
    }
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

export default {

    genererCreneauxParDate,
    mettreAJourStatutCreneau,
    saveCreneaux,
    saveCreneauxBulk  // Ajouter la méthode d'insertion par lots
};
