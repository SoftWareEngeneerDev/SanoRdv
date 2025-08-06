export interface Notification {
  _id: string;
  canal: 'Email' | 'SMS';
  type: 'Confirmation' | 'Annulation' | 'Rappel';
  statut: 'En attente' | 'Envoyé' | 'Échec';
  rendezVous: any; // ou type `Creneau` si tu veux typer précisément
  destinataire: string;
  destinataireModel: 'patient' | 'medecin';
  createdAt: string;
  dateNotification?: string;
  read?: boolean;             // ← Ajouté
  contenu?: string;           // ← Ajouté si utilisé côté backend
  medecin?: string;
}