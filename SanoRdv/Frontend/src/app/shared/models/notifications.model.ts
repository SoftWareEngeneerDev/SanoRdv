export interface Notification {
id?: string;
  IDpatient?: string;
  message?: string;
  date?: string;
  medecinId?: string;
  medecin?: string;
  dateRdv?: string;
  dateNotification: string;
  read?: boolean;
  canal?: string;
  details?: string;
   rendezVousId?: string;
   type?:
    | 'rappel'
    | 'mise_a_jour'
    | 'confirmation'
    | 'annulation'
    | 'profil';
}
