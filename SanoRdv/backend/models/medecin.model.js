// modèle Medecin

import mongoose from 'mongoose';

const DisponibiliteSchema = new mongoose.Schema({
  date: String,
  slots: [String],
});

const MedecinSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nationalite: { type: String }, 
  photo: { type: String },
  dateInscription: { type: Date, default: Date.now }, 
  specialite: { type: String }, 
  availability: [DisponibiliteSchema],
});

const Medecin = mongoose.model('Medecin', MedecinSchema);
export default Medecin;
