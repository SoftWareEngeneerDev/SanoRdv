import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {

  private apiUrl = 'http://localhost:3000/api'; // Adapte à ton URL backend si besoin

  constructor(private http: HttpClient) {}

  /**
   * Récupérer les rendez-vous d'un médecin
   */
  getRendezVousPourMedecin(medecinId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rendezvous/medecin/${medecinId}`);
  }

  /**
   * Ajouter un créneau
   */
  ajouterCreneau(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/creneau`, data);
  }

  /**
   * Supprimer un créneau par ID
   */
  supprimerCreneau(idCreneau: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/creneau/${idCreneau}`);
  }

  // Tu peux ajouter d'autres méthodes ici (modifier creneau, charger patient, etc.)
}
