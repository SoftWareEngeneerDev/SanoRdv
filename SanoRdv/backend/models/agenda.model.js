import mongoose from 'mongoose';

const agendaSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    enum: ['Actif', 'Inactif'],
    default: 'Actif'
  },
  creneaux: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creneau'
  }],
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medecin',
    required: true
  }
}, {
  timestamps: true
});
const Agenda = mongoose.model('Agenda', agendaSchema);
export default Agenda;