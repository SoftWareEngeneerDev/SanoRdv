import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
    lowercase: true,
    trim: true,
    unique: true,  // souvent nécessaire pour éviter doublons
  },
  telephone: {
    type: String,
    required: true,
    trim: true,
  },
  motDePasse: {
    type: String,
    required: false, // tu peux mettre true si c’est obligatoire
  },
  dateNaissance: {
    type: Date,
    required: false,
  },
  role: {
    type: String,
    enum: ['patient'],
    default: 'patient',
  },
  dateInscription: {
    type: Date,
    default: Date.now,
  },
  ID: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  }
});

const User = mongoose.model('User', userSchema);
export default User;
