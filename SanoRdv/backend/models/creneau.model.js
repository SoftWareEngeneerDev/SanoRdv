// models/Creneau.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const creneauSchema = new Schema({
  debut: {
    type: String, // Format "HH:MM"
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/ // Validation du format
  },
  fin: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.debut; // Fin > Début
      },
      message: 'L\'heure de fin doit être après l\'heure de début'
    }
  },
  statut: {
    type: String,
    enum: ['libre', 'réservé', 'bloqué'],
    default: 'libre'
  },
  agendaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agenda',
    required: true
  },
  rendezVousId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RendezVous',
    default: null
  }
});

module.exports = mongoose.model('Creneau', creneauSchema);