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

// export interface RendezVous {
//   _id?: string;
//   id: string;
//   patient: {
//     nom: string;
//     prenom: string;
//     nomComplet?: string;
//     dateNaissance: Date;
//     telephone?: string;
//     email?: string;
//   };
//   medecin: {
//     nom: string;
//     prenom: string;
//     specialite?: string;
//     telephone?: string;
//     email?: string;
//   };
//   creneau: {
//     date: Date; 
//   };
//   time: string;
//   statut: 'confirmé' | 'annulé';
//   motif?: string;
//   lieu?: {
//     nom: string;
//     adresse: string;
//     telephone?: string;
//   };
//   notes?: string;
//   dateHeure?: Date;
// }



export interface Medecin {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  anneeExperience: number;
  nomComplet?: string;
}

export interface Agenda {
  medecin?: Medecin;
}

export interface TimeSlot {
  heure: string;
  status: string;
  rendezVousId?: string;
}

export interface Creneau {
  _id?: string;
  date: string;
  agenda?: Agenda;
  timeSlots?: TimeSlot[];
}

export interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone: string;
  dateNaissance?: string;
  sex: string;
  isActive: boolean;
  nomComplet?: string; 
}

export interface RendezVous {
  _id: string;
  date: string;               // la date du rendez-vous (souvent redondante avec creneau.date)
  time: string;               // l'heure précise choisie dans le créneau
  status: string;
  motif: string;
  patient: Patient;
  creneau: Creneau;
  lieu?: {
    nom: string;
    adresse?: string;
    telephone?: string;
  };
  medecin?: {
    nom: string;
    prenom: string;
    specialite?: string;
  };
  notes?: string;
}

export interface RendezVousAvecDateHeure extends RendezVous {
  dateHeure: Date;
}