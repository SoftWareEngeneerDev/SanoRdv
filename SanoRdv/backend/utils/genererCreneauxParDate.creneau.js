import { validerDate } from '../utils/valiadateDate.creneau.js';
import Creneau from '../models/creneau.model.js';

export async function genererCreneauxParDate(date) {
    // 1. Validation améliorée (optionnel si déjà fait dans le controller)
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        throw new Error("Format de date invalide");
    }
    // 2. Recherche dans la base de données
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const creneauExistant = await Creneau.findOne({ date: dateOnly });

    // 3. Retour des créneaux existants ou génération de nouveaux
    if (creneauExistant) {
        return creneauExistant.timeSlots;
    } else {
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
                time: timeString,
                status: 'disponible', // Statut par défaut
                // Ajoutez d'autres champs requis par votre modèle si nécessaire
            });
        }

        return timeSlots;
    }
}