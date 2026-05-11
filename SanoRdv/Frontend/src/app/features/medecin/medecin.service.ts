import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environments';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private ApiUrl = `${environment.apiUrl}`;
  private medUrl = `${this.ApiUrl}/medecins`;
  private rdvUrl = `${this.ApiUrl}/rendezvous`;
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
    return this.http.post(`${this.medUrl}/creneaux`, payload);
  }

  getCreneauxParMedecin(medecinId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.medUrl}/creneaux/medecin/${medecinId}`);
  }

  getMedecinById(id: string): Observable<any> {
    return this.http.get(`${this.medUrl}/${id}`);
  }
  updateMedecin(id: string, data: any): Observable<any> {
    return this.http.put(`${this.medUrl}/${id}`, data);
  }

  getAgendaId(): string {
    const medecin = JSON.parse(localStorage.getItem('medecin') || '{}');
    return medecin.agendaId;
  }

  creerAgenda(date: string, medecinId: string) {
    // return this.http.post('http://localhost:3000/api/agenda/creer', { date, medecinId });
    return this.http.post(`${this.ApiUrl}/agenda/creer`, { date, medecinId });
  }

  modifierCreneau(payload: any) {
    // return this.http.put('http://localhost:3000/api/creneaux/update', payload);
    return this.http.put(`${this.ApiUrl}/creneaux/update`, payload);
  }

  obtenirAgenda(selectedDate : Date, medecinId: string) {
    // return this.http.post('http://localhost:3000/api/agenda/afficherAgenda', {selectedDate,medecinId });
    return this.http.post(`${this.ApiUrl}/agenda/afficherAgenda`, {selectedDate,medecinId });
  }





}
