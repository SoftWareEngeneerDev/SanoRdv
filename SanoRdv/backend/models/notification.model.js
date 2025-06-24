const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  contenu: { type: String, required: true },
  canal: { type: String, enum: ['Email', 'SMS'], default: 'Email' },
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rendezVous: { type: mongoose.Schema.Types.ObjectId, ref: 'RendezVous' },
  statut: { type: String, enum: ['Envoyé', 'Échec', 'En attente'], default: 'En attente' },
  type: { type: String, enum: ['Confirmation', 'Rappel', 'Annulation'], default: 'Confirmation' }
}, { timestamps: true });