export interface Medecin {
  nom: string;
  prenom: string;
  specialite: string;
}

export interface Agenda {
  medecin: Medecin;
}

export interface RendezVous {
  _id: string;
  patientId: string;
  medecinId: string;
  creneauId: string;
  creneau: string;
  time: string;
  motif: string;
  date: string;
  agenda?: Agenda;
  timeSlotId?: string;
  prenom: string;
}
