import { validerDate } from '../utils/valiadateDate.creneau.js';
// -------Fonction pour générer les créneaux horaires sans les enregistrer immédiatement--
export function genererCreneauxParDate(dateChoisie) {
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