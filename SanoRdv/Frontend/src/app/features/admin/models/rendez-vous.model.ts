export interface RendezVous {
 id: number;
  patient: {
    nomComplet: string;
    dateNaissance: Date;
    telephone?: string;
    email?: string;
  };
  medecin: {
    nom: string;
    specialite: string;
    telephone?: string;
  };
  dateHeure: {
    debut: Date;
    fin: Date;
  };
  statut: 'Confirmé' | 'En attente' | 'Annulé' | 'Terminé';
  motif?: string;
  lieu?: {
    nom: string;
    adresse: string;
    telephone?: string;
  };
  notes?: string;
}
