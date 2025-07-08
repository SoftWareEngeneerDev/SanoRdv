import mongoose from 'mongoose';


// Définir le schéma pour le créneau
const creneauSchema = new mongoose.Schema({
    agenda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agenda', // Référence à l'agenda auquel le créneau appartient
        required: true,
    },
    date: {
        /* type: String,*/
        type: Date,
        required: true, // Date du créneau (au format 'yyyy-mm-dd')
    },
    timeSlots: [
        {
            time: {
                type: String,
                required: true, // Heure du créneau (au format 'hh:mm')
            },
            status: {
                type: String,
                enum: ['disponible', 'indisponible'],
                default: 'disponible', // Valeur par défaut
            },
        },
    ],
});


// Créer un modèle à partir du schéma
const Creneau = mongoose.model('Creneau', creneauSchema);

export default Creneau;
