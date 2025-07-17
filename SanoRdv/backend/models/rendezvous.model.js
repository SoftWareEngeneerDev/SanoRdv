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
  motifAnnulation: { 
    type: String
  },
  annulePar: {
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  type: {
    type: String,
    enum: ['Admin', 'Patient', 'Medecin'], 
    required: false,
  }
}
,
  dateAnnulation: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const RendezVous = mongoose.model('RendezVous', rendezVousSchema);
export default RendezVous;