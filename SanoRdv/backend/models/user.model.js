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
    unique: true,
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
  confirmationMotDePasse: {
    type: String,
    required: false,
  },
  dateNaissance: {
    type: Date,
    required: false,
  },
  sex: {
    type: String,
    enum: ['masculin', 'féminin', 'autre'],
    required: false,
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
