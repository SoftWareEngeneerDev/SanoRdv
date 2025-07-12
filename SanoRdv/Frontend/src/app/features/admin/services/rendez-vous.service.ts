import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { RendezVous } from '../models/rendez-vous.model'; // Assurez-vous que le modèle RendezVous est correctement importé
import { environment } from 'src/environment/environments';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {

   private apiUrl = `${environment.apiUrl}/rendezvous`;

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
}
