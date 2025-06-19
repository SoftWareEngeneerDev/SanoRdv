// models/Agenda.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// const creneauSchema = new Schema({
//   debut: { type: String, required: true }, // Format "HH:MM"
//   fin: { type: String, required: true },
//   statut: { type: String, enum: ['libre', 'réservé', 'bloqué'], default: 'libre' },
//   rendezVousId: { type: Schema.Types.ObjectId, ref: 'RendezVous', default: null }
// });

const agendaSchema = new Schema({
  medecinId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Medecin', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    validate: {
      validator: (date) => date >= new Date(),
      message: "La date doit être dans le futur"
    }
  },
  creneaux: [creneauSchema], // Liste des créneaux horaires
  lieu: { type: String, required: true }
}, { timestamps: true });

// Méthode pour ajouter un créneau
agendaSchema.methods.ajouterCreneau = function(debut, fin) {
  this.creneaux.push({ debut, fin });
  return this.save();
};

// Méthode pour vérifier la disponibilité
agendaSchema.methods.estDisponible = function(debut, fin) {
  return this.creneaux.some(
    c => c.debut === debut && c.fin === fin && c.statut === 'libre'
  );
};

module.exports = mongoose.model('Agenda', agendaSchema);