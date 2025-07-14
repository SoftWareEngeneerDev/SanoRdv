export interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
   photo?: string;
  sexe?: string;
  genre: 'Homme' | 'Femme';
  dateNaissance?: string;
  adresse?: string;
  localite?: string;
  nationalite?: string;
  isActive: boolean;
  dateCreation?: Date;
}
