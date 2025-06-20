// models/Creneau.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const creneauSchema = new Schema({
  // Clé primaire personnalisée
  idCreneau: {
    type: String,
    unique: true, // S'assurer qu'il soit unique
    required: [true, 'L\'idCreneau est obligatoire'],
    default: () => new mongoose.Types.ObjectId().toString() // Génère une valeur unique pour idCreneau
  },

  // Clé étrangère vers l'agenda parent (obligatoire)
  agendaId: {
    type: Schema.Types.ObjectId,
    ref: 'Agenda',
    required: [true, 'Un créneau doit être lié à un agenda'],
    index: true // Index pour optimiser les requêtes
  },

  // Heure de début (format HH:MM)
  debut: {
    type: String,
    required: [true, 'L\'heure de début est obligatoire'],
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM invalide'],
    set: (h) => h.replace(/^(\d):/, '0$1:') // Normalise 9:00 → 09:00
  },

  // Heure de fin
  fin: {
    type: String,
    required: [true, 'L\'heure de fin est obligatoire'],
    validate: {
      validator: function(v) { 
        return v > this.debut; // Valide que fin > début
      },
      message: 'L\'heure de fin doit être après l\'heure de début'
    }
  },

  // Statut du créneau
  statut: {
    type: String,
    enum: ['libre', 'réservé', 'bloqué'],
    default: 'libre'
  },

  // Référence optionnelle au rendez-vous
  rendezVousId: {
    type: Schema.Types.ObjectId,
    ref: 'RendezVous',
    default: null
  }
}, { 
//   _id: false, // Empêche Mongoose de générer l'ID par défaut (_id)
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Middleware : Empêche les créneaux qui se chevauchent
creneauSchema.pre('save', async function(next) {
  const chevauchement = await this.constructor.findOne({
    agendaId: this.agendaId,
    $or: [
      { debut: { $lt: this.fin }, fin: { $gt: this.debut } }
    ],
    idCreneau: { $ne: this.idCreneau } // Ignore le document actuel lors des updates
  });

  if (chevauchement) {
    throw new Error(`Ce créneau chevauche un autre créneau (${chevauchement.debut}-${chevauchement.fin})`);
  }
  next();
});

// Index composé pour des requêtes optimisées
creneauSchema.index({ agendaId: 1, debut: 1, fin: 1 }, { unique: true });

// Méthode pour vérifier la disponibilité
creneauSchema.methods.estDisponible = function() {
  return this.statut === 'libre';
};

export default mongoose.model('Creneau', creneauSchema);
