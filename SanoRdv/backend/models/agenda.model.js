import mongoose from 'mongoose';

const agendaSchema = new mongoose.Schema({
  // 📅 Le jour concerné par cet agenda
  jour: {
    type: Date,
    required: true,
    unique: true
  },

  // 🔗 Référence les IDs des créneaux liés
  creneaux: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creneau'
    }
  ],

  // 🕒 Date de création automatique
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optionnel : ajout d’un index pour accélérer les recherches par date
agendaSchema.index({ jour: 1 });

export default mongoose.model('Agenda', agendaSchema);
