import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['disponible', 'reserve', 'indisponible'],
    default: 'disponible'
  },
  motifAnnulation: {
    type: String,
    default: ''
  },
  motifRendezVous: {
    type: String,
    default: ''
  },
  annulePar: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'annulePar.type'
    },
    type: {
      type: String,
      enum: ['Patient', 'Medecin'],
      default: null
    }
  },
  dateAnnulation: {
    type: Date
  },
  dateReservation: {
    type: Date
  },
  // Autres informations éventuelles
});

const creneauSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  timeSlots: [timeSlotSchema],
  agenda: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agenda',
    required: true
  }
}, { timestamps: true });

const Creneau = mongoose.model('Creneau', creneauSchema);
export default Creneau;


