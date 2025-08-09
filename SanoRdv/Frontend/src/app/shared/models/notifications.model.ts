export interface Notification {
  _id: string;
  canal: 'Email' | 'SMS';
  type: 'Confirmation' | 'Annulation' | 'Rappel';
  statut: 'En attente' | 'Envoyé' | 'Échec';
  rendezVous: any; 
  destinataire: string;
  destinataireModel: 'patient' | 'medecin';
  createdAt: string;
  dateNotification?: string;
  read?: boolean;             
  contenu?: string;           
  medecin?: string;
  message?: string;
}