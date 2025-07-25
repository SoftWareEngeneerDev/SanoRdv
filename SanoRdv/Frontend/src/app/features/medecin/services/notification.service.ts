import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RendezVous {
  _id: string;
  date: string;
}

export interface Notification {
  _id: string;
  contenu: string;
  type: 'Confirmation' | 'Rappel' | 'Annulation';
  statut: 'Envoyé' | 'Échec' | 'En attente';
  createdAt: string | Date;
  rendezVous?: RendezVous;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api/notifications';

  constructor(private http: HttpClient) {}

  getNotificationsMedecin(medecinId: string): Observable<{ success: boolean; notifications: Notification[] }> {
    return this.http.get<{ success: boolean; notifications: Notification[] }>(
      `${this.apiUrl}/medecin/${medecinId}`
    );
  }


  envoyerConfirmationAuMedecin(rdvId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notification/medecin/confirmation/${rdvId}`, {});
  }

  envoyerAnnulationAuMedecin(rdvId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notification/medecin/annulation/${rdvId}`, {});
  }
}
