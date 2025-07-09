import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environments';
import { Observable } from 'rxjs';
import { Specialite } from '../models/specialites.model';

@Injectable({
  providedIn: 'root'
})
export class SpecialiteService {

  private apiUrl = `${environment.apiUrl}/specialites`;

  constructor(private http: HttpClient) {}

  getSpecialites(): Observable<Specialite[]> {
    return this.http.get<Specialite[]>(this.apiUrl);
  }

  ajouterSpecialite(specialite: { nom: string }): Observable<Specialite> {
    return this.http.post<Specialite>(this.apiUrl, specialite);
  }

  supprimerSpecialite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
