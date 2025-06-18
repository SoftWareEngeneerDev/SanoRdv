import mongoose from 'mongoose';

const RendezVousSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: 'Medecin', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
});

RendezVousSchema.index({ medecin: 1, date: 1, time: 1 }, { unique: true });

const Rendezvous = mongoose.model('RendezVous', RendezVousSchema);
export default Rendezvous;
