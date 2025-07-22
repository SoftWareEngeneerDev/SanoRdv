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
  confirmerRendezVous(id: string): Observable<any> {
    return this.http.put(`${this.rdvUrl}/${id}/annuler`, {});
  }

  modifierRendezVous(rendezvousId: string, data: any): Observable<any> {
    return this.http.put(`${this.rdvUrl}/${rendezvousId}/modifier`, data);
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

  getCreneauxFromBackend(): void {
  const medecin = JSON.parse(localStorage.getItem('medecin') || '{}');
  const agendaId = medecin._id;
  const dateISO = this.selectedDate.toISOString().split('T')[0];

  this.http.get<any>(`http://localhost:3000/api/creneaux/parDate/${agendaId}/${dateISO}`)
    .subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.timeSlots) {
          this.selectedSlots = res.data.timeSlots
            .filter((slot: any) => slot.status === 'indisponible')
            .map((slot: any) => slot.time); // Récupère uniquement les heures
        }
      },
      error: (err) => {
        console.error("Erreur lors de la récupération :", err);
        this.selectedSlots = []; // Aucun créneau
      }
    });
}


}
