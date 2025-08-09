export interface RendezVous {
time: any;
  creneauId: string;
  timeSlotId: any;
agenda: any;
  _id: number;
  id: number;
  date: string;
  medecin: {
    nom: string;
    prenom: string;
    specialite: string;
  };
  status?: string;
  IDpatient?: string;
 patientId?: string;
  IDmedecin?: string;
  medecinId?: string;
rendezVousId?: string;
creneau?: { _id: string };
  timeSlot?: { _id: string };
}


