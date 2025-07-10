// Fonction qui permet de modifier plusieurs statuts horaires dans la base de données.
export function modifierStatusParHeure(timeSlots, heuresCibles, nouveauStatus = 'indisponible') {
    return timeSlots.map(slot => {
        if (heuresCibles.includes(slot.time)) {
            return { ...slot, status: nouveauStatus };
        }
        return slot;
    });
}