import mongoose from 'mongoose';

const specialiteSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour garantir l'unicité
specialiteSchema.index({ nom: 1 }, { unique: true });

const Specialite = mongoose.model('Specialite', specialiteSchema);

export default Specialite;