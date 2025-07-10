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
    // match: /...regex email.../  // optionnel
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
  sex: {
    type: String,
    enum: ['masculin', 'féminin', 'autre'],
    required: false,
  },
  IDpatient: {
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
  photo: {
    type: String,
    required: false,
    trim: true,
  },
  groupeSanguin: {
    type: String,
    required: false,
  },
  allergies: {
    type: String, // ou [String] si plusieurs allergies à prévoir
    required: false,
  },
  resetCodeExpire: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  role: {
    type: String,
    default: 'patient',
  }
}, {
  timestamps: true,
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
