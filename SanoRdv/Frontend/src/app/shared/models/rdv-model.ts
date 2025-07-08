export interface RendezVous {
  id: number;
  date: string;
  medecin: {
    nom: string;
    specialite?: string;
  };
  status?: string;
}


