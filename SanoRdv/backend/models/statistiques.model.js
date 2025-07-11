import mongoose from 'mongoose';

const statistiqueSchema = new mongoose.Schema({
  date: {             
    type: Date,
    required: true
  },
  type: {             
    type: String,
    enum: ['hebdomadaire', 'mensuel', 'journalier'],
    required: true
  },
  periode: {          
    type: String,
    required: true,
    unique: true
  },
  totalRendezVous: {
    type: Number,
    default: 0
  },
  totalConfirmes: {
    type: Number,
    default: 0
  },
  totalAnnules: {
    type: Number,
    default: 0
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

const Statistique = mongoose.model('Statistique', statistiqueSchema);
export default Statistique;
