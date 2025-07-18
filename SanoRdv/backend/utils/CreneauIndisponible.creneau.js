// Dans votre fichier de gestion des créneaux (ex: creneauxManager.js)
let heuresIndisponibles = [];

export function ajouterHeureIndisponible(time, isSelected) {
    const heureValide = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    if (!heureValide) {
        console.error(`Format d'heure invalide: ${time}`);
        return [...heuresIndisponibles];
    }

    if (isSelected) {
        if (!heuresIndisponibles.includes(time)) {
            heuresIndisponibles.push(time);
        }
    } else {
        heuresIndisponibles = heuresIndisponibles.filter(h => h !== time);
    }

    return [...heuresIndisponibles];
}

// Nouvelle fonction pour préparer les données avant envoi
export function getHeuresIndisponibles() {
    return [...heuresIndisponibles]; // Retourne une copie du tableau
}

// // Fonction pour réinitialiser après envoi
// export function reinitialiserIndisponibles() {
//     heuresIndisponibles = [];
// }