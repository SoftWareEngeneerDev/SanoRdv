import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private baseUrl = 'http://localhost:3000/api';
  private apiUrl = `${this.baseUrl}/medecins`;
  private rdvUrl = `${this.baseUrl}/rendezvous`;

  constructor(private http: HttpClient) {}

  getRendezVousParMedecin(medecinId: string): Observable<any> {
    return this.http.get(`${this.rdvUrl}/medecin/${medecinId}`);
  }

  annulerRendezVous(rendezvousId: string): Observable<any> {
    return this.http.put(`${this.rdvUrl}/annuler`, { id: rendezvousId });
  }

  modifierRendezVous(rendezvousId: string, data: any): Observable<any> {
    return this.http.put(`${this.rdvUrl}/modifier`, {
      id: rendezvousId,
      ...data
    });
  }

  ajouterCreneau(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/creneaux`, payload);
  }

  getCreneauxParMedecin(medecinId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/creneaux/medecin/${medecinId}`);
  }

  getMedecinById(id: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/${id}`);
}
  updateMedecin(id: string, data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, data);
}

  getAgendaId(): string {
  // Suppose que tu as stocké le médecin connecté dans localStorage ou via API
  const medecin = JSON.parse(localStorage.getItem('medecin') || '{}');
  return medecin.agendaId;
}

}