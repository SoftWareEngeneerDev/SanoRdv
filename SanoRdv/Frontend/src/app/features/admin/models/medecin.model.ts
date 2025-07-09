export interface Medecin {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  motDePasse?: string;
  actif?: boolean;
  rendezVousMensuels?: number;
}