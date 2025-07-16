export interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
   photo?: string;
  sex: string;
  genre: 'Homme' | 'Femme';
  dateNaissance?: string;
  adresse?: string;
  localite?: string;
  nationalite?: string;
  isActive: boolean;
  dateCreation?: Date;
  historiqueMedical?: string[]; // Exemple : ["Consultation le 15/01/2023 - Rhume"]
  rendezVousAVenir?: string[]; // Exemple : ["15/02/2023 à 14h30 - Dr. Martin"]
}
