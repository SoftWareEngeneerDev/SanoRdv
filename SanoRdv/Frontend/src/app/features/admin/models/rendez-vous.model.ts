export interface RendezVous {
  id: string;
  dateHeure: string; // format ISO ou 'YYYY-MM-DDTHH:mm'
  patientNom: string;
  medecinNom: string;
  statut: 'En_attente' | 'Confirmé' | 'Annulé';
}
