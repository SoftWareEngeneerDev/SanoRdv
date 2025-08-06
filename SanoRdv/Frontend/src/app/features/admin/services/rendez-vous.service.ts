/**import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { RendezVous } from '../models/rendez-vous.model'; // Assurez-vous que le modèle RendezVous est correctement importé
import { environment } from 'src/environment/environments';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {

   private apiUrl = `${environment.apiUrl}/admins/rendezvous`;

  constructor(private http: HttpClient) {}

  getRendezVous(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  getDetailsRendezVous(id: number): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => throwError(() => new Error('Erreur lors du chargement du rendez-vous')))
    );
  }

  searchRendezVous(term: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}?q=${term}`).pipe(
      catchError(() => of([]))
    );
  }

  annulerRendezVous(id: string, motif: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}/rendezvous/${id}/annuler`, { motif });
}

}
*/






import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environments';
import { RendezVous } from '../models/rendez-vous.model';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private apiUrl = `${environment.apiUrl}/rendezvous`;

  constructor(private http: HttpClient) {}

  getTousLesRendezVousPourAdmin(filtre: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/admin/tous?filtre=${filtre}`);
  }

  getDetailsRendezVous(id: string): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.apiUrl}/${id}`);
  }

  searchRendezVous(term: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}?q=${term}`);
  }
  annulerRendezVous(id: string, data: { motif: string }) {
    return this.http.patch(`${this.apiUrl}/annuler/${id}`, data);
  }
}
