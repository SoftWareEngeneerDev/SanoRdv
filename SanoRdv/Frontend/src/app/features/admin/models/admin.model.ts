export interface Admin {
  _id: string;      // la vraie clé MongoDB (souvent _id)
  IDadmin?: string; // si tu en as besoin
  email: string;
  nom: string;
  prenom: string;
  photo?: string;
  role?: string;
  isActive?: boolean;
}
