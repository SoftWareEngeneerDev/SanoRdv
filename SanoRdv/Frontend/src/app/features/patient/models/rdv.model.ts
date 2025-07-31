export interface RendezVous {
  patientId: string;
  medecinId: string;
  creneauId: string;
  creneau: string;
  time: string;
  motif: string;
   _id: string;
  date: string;
  agenda?: {
    medecin?: {
      nom: string;
      prenom: string;
      specialite: string;
    }
  };
  timeSlotId?: string;
}
