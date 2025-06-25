import mongoose from 'mongoose';
const { Schema } = mongoose;
const creneauSchema = new Schema({
  agenda: {
    type: Schema.Types.ObjectId,
    ref: 'Agenda',
    required: [true, 'Un créneau doit être lié à un agenda'],
    index: true,
  },
  debut: {
    type: Date,
    required: [true, 'L\'heure de début est obligatoire'],
  },
  fin: {
    type: Date,
    required: [true, 'L\'heure de fin est obligatoire'],
    validate: {
      validator: function (v) {
        return v > this.debut;
      },
      message: 'L\'heure de fin doit être après l\'heure de début',
    },
  },
  statut: {
    type: String,
    enum: ['libre', 'réservé', 'bloqué'],
    default: 'libre',
  },
  rendezVous: {
    type: Schema.Types.ObjectId,
    ref: 'RendezVous',
    default: null,
  },
}, {
  timestamps: true,
});


// Middleware : empêcher les chevauchements de créneaux dans le même agenda
creneauSchema.pre('save', async function (next) {
  const chevauchement = await this.constructor.findOne({
    agenda: this.agenda,
    _id: { $ne: this._id },
    $or: [
      { debut: { $lt: this.fin, $gte: this.debut } },
      { fin: { $gt: this.debut, $lte: this.fin } },
      { debut: { $lte: this.debut }, fin: { $gte: this.fin } },
    ],
  });
  if (chevauchement) {
    return next(new Error(`Ce créneau chevauche un autre créneau (${chevauchement.debut.toISOString()} - ${chevauchement.fin.toISOString()})`));
  }
  next();
});


// Méthode d'instance pour durée en minutes
creneauSchema.methods.dureeMinutes = function () {
  return (this.fin - this.debut) / (1000 * 60);
};
// Vérifie si disponible
creneauSchema.methods.estDisponible = function () {
  return this.statut === 'libre';
};

const Creneau = mongoose.model('Creneau', creneauSchema);
export default Creneau;