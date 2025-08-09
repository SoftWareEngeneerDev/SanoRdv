import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RendezVous } from '../../shared/models/rdv-model';
import { environment } from '../../../environment/environments';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private apiUrl = `${environment.apiUrl}/rendezvous`;

  private nouveauxRdvSubject = new BehaviorSubject<number>(0);
  nouveauxRdv$ = this.nouveauxRdvSubject.asObservable();

  constructor(private http: HttpClient) {}

  // === HEADERS ===
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    };
  }

  // === COMPTEUR NOUVEAUX RDV ===
  increment(): void {
    this.nouveauxRdvSubject.next(this.nouveauxRdvSubject.value + 1);
  }

  decrement(): void {
    const current = this.nouveauxRdvSubject.value;
    if (current > 0) {
      this.nouveauxRdvSubject.next(current - 1);
    }
  }

  reset(): void {
    this.nouveauxRdvSubject.next(0);
  }

  // === RDV ===

  getAllRendezVous(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.apiUrl, this.getHeaders());
  }

  getRendezVousParPatient(patientId: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(
      `${this.apiUrl}/patient/${patientId}`,
      this.getHeaders()
    );
  }


  prendreRendezVous(data: {
    creneauId: string;
    timeSlotId: string;
    patientId: string;
    motifRendezVous: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data, this.getHeaders());
  }


  
  annulerRendezVous(params: {
  creneauId: string;
  timeSlotId: string;
  userId: string;
  userType: string;
  motifAnnulation: string;
}): Observable<any> {
  const { timeSlotId, ...body } = params;  // extraire timeSlotId pour l’URL

  return this.http.patch(
    `${this.apiUrl}/annuler/${timeSlotId}`,  // timeSlotId dans l’URL
    body,                                   // creneauId, userId, userType, motif dans le corps
    this.getHeaders()
  );
}





  modifierRendezVous(id: string, data: Partial<RendezVous>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/modifier`, data, this.getHeaders());
  }



}






