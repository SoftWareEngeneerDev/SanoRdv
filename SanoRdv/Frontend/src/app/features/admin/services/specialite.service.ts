import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environments';
import { Observable, throwError, catchError } from 'rxjs';
import { Specialite } from '../models/specialites.model';

@Injectable({
  providedIn: 'root'
})
export class SpecialiteService {

  private apiUrl = `${environment.apiUrl}/admins/specialites`;

  constructor(private http: HttpClient) {}

  getSpecialites(): Observable<Specialite[]> {
    return this.http.get<Specialite[]>(this.apiUrl);
  }

  ajouterSpecialite(specialite: Omit<Specialite, 'id'>): Observable<Specialite> {
    return this.http.post<Specialite>(this.apiUrl, specialite);
  }

  modifierSpecialite(specialite: Specialite): Observable<Specialite> {
    return this.http.put<Specialite>(`${this.apiUrl}/${specialite.id}`, specialite);
  }

  supprimerSpecialite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSpecialiteById(id: string): Observable<Specialite> {
  return this.http.get<Specialite>(`${this.apiUrl}/${id}`).pipe(
    catchError(() => throwError(() => new Error('Spécialité non trouvée')))
  );
}
}
