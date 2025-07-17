/**export interface RendezVous {
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
  date: Date;
time: string;
  statut: 'Confirmé' | 'En attente' | 'Annulé' | 'Terminé';
  motif?: string;
  lieu?: {
    nom: string;
    adresse: string;
    telephone?: string;
  };
  notes?: string;
}
*/

export interface RendezVous {
  _id?: string;
  id: string;
  patient: {
    nom: string;
    prenom: string;
    nomComplet?: string;
    dateNaissance: Date;
    telephone?: string;
    email?: string;
  };
  medecin: {
    nom: string;
    prenom: string;
    specialite?: string;
    telephone?: string;
    email?: string;
  };
  creneau: {
    date: Date; 
  };
  time: string;
  statut: 'confirmé' | 'annulé';
  motif?: string;
  lieu?: {
    nom: string;
    adresse: string;
    telephone?: string;
  };
  notes?: string;
  dateHeure?: Date;
}
