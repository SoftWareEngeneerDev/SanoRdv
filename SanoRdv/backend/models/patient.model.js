import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
  },
  prenom: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  telephone: {
    type: String,
    required: true,
    trim: true,
  },
  motDePasse: {
    type: String,
    required: true,
  },
  confirmationMotDePasse: {
    type: String,
    required: false,
  },
  sex: {
    type: String,
    enum: ['masculin', 'féminin', 'autre'],
  },
  IDpatient: {  // renommé ici
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  localite: {
    type: String,
    required: false,
    trim: true,
  },
  dateNaissance: {
    type: Date,
    required: false,
  },
  adresse: {
    type: String,
    required: false,
    trim: true,
  },
  resetCode: {
    type: String,
  },
  resetCodeExpire: {
    type: Date,
  },
  // Sécurité - verrouillage login
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  // Rôle
  role: {
    type: String,
    default: 'patient',
  }
}, {
  timestamps: true,
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
