export interface Medecin {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  etat: 'Actif' | 'Inactif';
   telephone: string;
  motDePasse: string;
  email: string;
}