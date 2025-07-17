import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RendezVous } from '../../shared/models/rdv-model';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {

  private nouveauxRdvSubject = new BehaviorSubject<number>(0);
  nouveauxRdv$ = this.nouveauxRdvSubject.asObservable();

  private apiUrl = 'http://localhost:3000/api/rendezvous';

  constructor(private http: HttpClient) {}

  increment(): void {
    const current = this.nouveauxRdvSubject.value;
    this.nouveauxRdvSubject.next(current + 1);
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

  getAllRendezVous(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.apiUrl);
  }

  annulerRendezVous(id: number, motif: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/annuler`, { motif });
  }

  modifierRendezVous(id: number, data: Partial<RendezVous>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  creerRendezVous(rdv: Partial<RendezVous>): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.apiUrl, rdv);
  }

 
}
