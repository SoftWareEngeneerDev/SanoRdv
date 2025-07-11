import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  contenu: { type: String, required: true },
  canal: { type: String, enum: ['Email', 'SMS'], default: 'Email' },
  destinataire: { type: mongoose.Schema.Types.ObjectId, refPath: 'destinataireModel',required: [true, 'Le destinataire est obligatoire']},
  destinataireModel: {type: String,enum: ['patient', 'medecin', 'User'],required: true },// Selon vos modèles
  rendezVous: { type: mongoose.Schema.Types.ObjectId, ref: 'RendezVous' },
  statut: { type: String, enum: ['Envoyé', 'Échec', 'En attente'], default: 'En attente' },
  type: { type: String, enum: ['Confirmation', 'Rappel', 'Annulation'], default: 'Confirmation' }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
