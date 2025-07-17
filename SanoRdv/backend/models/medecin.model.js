import mongoose from 'mongoose';

const medecinSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  motDePasse: { type: String, required: true },
  IDmedecin: { type: String, required: false, unique: true, trim: true },  // Remplacé ici
  telephone: { type: String, required: false, trim: true },
  specialite: { type: String, required: false, trim: true },
  anneeExperience: { type: Number, required: false },
  loginAttempts: { type: Number, default: 0 },
  localite: { type: String, required: false, trim: true },
  photo: { type: String, required: false, trim: true },
  adresse: { type: String, required: false, trim: true },
  nationalite: { type: String, required: false, trim: true },
  sexe: { type: String, required: false, enum: ['Homme', 'Femme', 'Autre'] }, // ✅ Ajouté ici
  dateCreation: { type: Date, default: Date.now },
  dateNaissance: { type: Date, required: false },
  lockUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  role: { type: String, default: 'medecin' },
  parcours: { type: String, required: false, trim: true }, // ✅ Champ ajouté ici
  //j'ai ajouté le SEXE et le PARCOURS PROFESSIONNEL : signé KABORE FAICAL
}, { timestamps: true });

export default mongoose.model('Medecin', medecinSchema);
