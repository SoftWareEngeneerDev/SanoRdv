// models/admin.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema({
  // Identifiants principaux
  IDadmin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  motDePasse: {
    type: String,
    required: true,
  },

  // Informations personnelles
  nom: {
    type: String,
    default: 'Administrateur',
  },
  prenom: {
    type: String,
    default: 'Système',
  },
  datenaissance: {
    type: Date,
    required: false,
  },
  adresse: {
    type: String,
    required: false,
    trim: true,
  },
  localite: {
    type: String,
    required: false,
    trim: true,
  },

  // Rôle & statut
  role: {
    type: String,
    default: 'admin',
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  resetCode: {
    type: String,
    required: false,
  },

  resetCodeExpire: {
    type: Date,
    required: false,
  },

  // Sécurité et verrouillage
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },

  // Activités
  lastLogin: {
    type: Date,
  },

  // Photo / avatar (ajouté ici)
  photo: {
    type: String,
    default: '', // ou null si tu préfères
  },

}, {
  timestamps: true,
});

// Middleware : hash du mot de passe avant sauvegarde (prioritaire pour la sécurité)
adminSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();

  try {
    this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode : comparaison du mot de passe (authentification)
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.motDePasse);
};

// Méthode : vérification si le compte est verrouillé (sécurité)
adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

export default mongoose.model('Admin', adminSchema);
