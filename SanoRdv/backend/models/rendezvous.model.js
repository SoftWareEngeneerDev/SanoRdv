// models/rendezvous.model.js
import mongoose from 'mongoose';
const rendezVousSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medecin',
    required: true,
  },
  creneau: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creneau',
    required: true,
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true 
  },
  motif: {
    type: String,
  },
  statut: {
    type: String,
    enum: ['confirmé', 'annulé'],
    default: 'confirmé',
  },
}, { timestamps: true });

const RendezVous = mongoose.model('RendezVous', rendezVousSchema);
export default RendezVous;