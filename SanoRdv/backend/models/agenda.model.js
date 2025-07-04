// models/Agenda.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const agendaSchema = new Schema({
  // Identifiant personnalisé (au lieu de _id)
  idAgenda: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Génération automatique
    unique: true
  },

  // Référence obligatoire au médecin
  idMedecin: {
    type: Schema.Types.ObjectId,
    ref: 'Medecin',
    required: [true, 'L\'identifiant du médecin est obligatoire'],
    validate: {
      validator: async function(id) {
        const medecin = await mongoose.model('Medecin').findById(id);
        return medecin !== null;
      },
      message: 'Le médecin spécifié n\'existe pas'
    }
  },

  DateJour: {
    type: Date,
    required: [true, 'La date est obligatoire'],
    validate: {
      validator: function(date) {
        return date >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'La date doit être aujourd\'hui ou dans le futur'
    },
    get: (date) => date.toISOString().split('T')[0]
  },

  motif: {
    type: String,
    maxlength: [500, 'Le motif ne doit pas dépasser 500 caractères'],
    default: null
  },

  Lieu: {
    type: String,
    required: [true, 'Le lieu est obligatoire'],
    enum: {
      values: ['Cabinet A', 'Cabinet B', 'En ligne'],
      message: 'Lieu non valide'
    }
  },

  Statut: {
    type: String,
    enum: ['actif', 'inactif', 'complet'],
    default: 'actif',
    set: (statut) => statut.toLowerCase()
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    getters: true,
    transform: (doc, ret) => {
      ret.id = ret.idAgenda; // Alias pour la compatibilité
      delete ret._id;        // Supprime _id par défaut
      delete ret.__v;
      return ret;
    }
  }
});

// Index composite
agendaSchema.index({ idMedecin: 1, DateJour: 1 }, { unique: true });

// Virtual Populate
agendaSchema.virtual('creneaux', {
  ref: 'Creneau',
  localField: 'idAgenda',  // Maintenant lié à idAgenda au lieu de _id
  foreignField: 'agendaId'
});

// Middleware de suppression
agendaSchema.pre('deleteOne', { document: true }, async function(next) {
  await mongoose.model('Creneau').deleteMany({ agendaId: this.idAgenda });
  next();
});

export default mongoose.model('Agenda', agendaSchema);
// export default mongoose.model('Admin', adminSchema);
