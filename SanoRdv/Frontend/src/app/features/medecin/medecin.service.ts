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
  selectedSlots: any;
  selectedDate: any;

  constructor(private http: HttpClient) {}

  getRendezVousParMedecin(medecinId: string): Observable<any> {
    return this.http.get(`${this.rdvUrl}/medecin/${medecinId}`);
  }

  annulerRendezVous(id: string): Observable<any> {
    return this.http.put(`${this.rdvUrl}/${id}/annuler`, {});
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
    const medecin = JSON.parse(localStorage.getItem('medecin') || '{}');
    return medecin.agendaId;
  }

  creerAgenda(date: string, medecinId: string) {
    return this.http.post('http://localhost:3000/api/agenda/creer', { date, medecinId });
  }

  modifierCreneau(payload: any) {
    return this.http.put('http://localhost:3000/api/creneaux/update', payload);
  }

  obtenirAgenda(selectedDate : Date, medecinId: string) {
  return this.http.post('http://localhost:3000/api/agenda/afficherAgenda', {selectedDate,medecinId });
}





}
