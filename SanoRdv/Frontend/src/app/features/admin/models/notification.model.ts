export interface Notification {
  id: string;
  titre: string;
  message: string;
  date: Date;
  lu: boolean;
  destinataireId: string;
  destinataireNom: string;
  destinataireType: 'patient' | 'medecin';
}
