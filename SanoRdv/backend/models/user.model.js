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
  },
  telephone: {
    type: String,
    required: true,
    trim: true,
  },
  motDePasse: {
    type: String,
    required: false, 
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
});

const User = mongoose.model('User', userSchema);
export default User;
