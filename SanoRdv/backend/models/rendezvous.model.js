import mongoose from 'mongoose';
const RendezVousSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medecin',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },  
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['confirmé', 'annulé'],
    default: 'confirmé',
  }
}, {
  timestamps: true
});
RendezVousSchema.index({ medecin: 1, date: 1, time: 1 }, { unique: true });
const Rendezvous = mongoose.model('RendezVous', RendezVousSchema);
export default Rendezvous;
