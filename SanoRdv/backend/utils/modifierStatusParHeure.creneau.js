// ---------- Fonction pour marquer des heures comme "indisponibles"-------------
export function modifierStatusParHeure(timeSlots, heuresIndisponibles) {
    return timeSlots.map(slot => {
        if (heuresIndisponibles.includes(slot.time)) {
            slot.status = 'indisponible';  // Marquer le créneau comme "indisponible"
        }
        return slot;
    });
    
}