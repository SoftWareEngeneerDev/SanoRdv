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




   import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RendezVous } from '../models/rendez-vous.model';
import { environment } from 'src/environment/environments';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {

  private apiUrl = `${environment.apiUrl}/rendezvous`;

  constructor(private http: HttpClient) {}

  // 🔄 Obtenir tous les rendez-vous pour l’admin
  getTousLesRendezVousPourAdmin(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/admin/tous`).pipe(
      catchError(() => of([]))
    );
  }

  // 🔍 Détails d’un rendez-vous par ID
  getDetailsRendezVous(id: string): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => throwError(() => new Error('Erreur lors du chargement du rendez-vous')))
    );
  }

  // 🔍 Recherche personnalisée
  searchRendezVous(term: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}?q=${term}`).pipe(
      catchError(() => of([]))
    );
  }

  // ❌ Annulation de rendez-vous
 annulerRendezVous(id: string, data: { motif: string }) {
  return this.http.patch(`${this.apiUrl}/annuler/${id}`, data);
}



  // ✏️ Modification de rendez-vous
  modifierRendezVous(rendezVousId: string, userId: string, newTime: string, newMotif: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/modifier`, {
      rendezVousId,
      userId,
      newTime,
      newMotif
    }).pipe(
      catchError((err) => throwError(() => new Error(err.error?.message || 'Erreur modification')))
    );
  }
}

