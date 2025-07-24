export interface Medecin {
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  anneeExperience: number;
  motDePasse?: string;
  localite?: string;
  dateNaissance?: string; // format ISO ("YYYY-MM-DD")
  photo?: string;
  adresse?: string;
  nationalite?: string;
  IDmedecin?: string;
  role?: string;
  dateCreation?: string;
  etat?: string;
  isActive?: boolean;
}