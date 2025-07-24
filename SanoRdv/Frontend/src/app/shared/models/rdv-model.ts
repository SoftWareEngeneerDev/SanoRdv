export interface RendezVous {
  _id: number;
  id: number;
  date: string;
  medecin: {
    nom: string;
    specialite?: string;
  };
  status?: string;
  IDpatient?: string;
 patientId?: string;
  IDmedecin?: string;
  medecinId?: string;
rendezVousId?: string;
}


