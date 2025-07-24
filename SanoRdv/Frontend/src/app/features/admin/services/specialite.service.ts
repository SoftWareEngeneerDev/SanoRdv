// src/app/features/admin/services/specialite.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environments';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';  // <-- Import de map
import { Specialite } from '../models/specialites.model';

@Injectable({
  providedIn: 'root'
})
export class SpecialiteService {

  private apiUrl = `${environment.apiUrl}/specialites`;  // corrige ici, c'est /specialites, pas /admins/specialites

  constructor(private http: HttpClient) {}

getSpecialites(): Observable<Specialite[]> {
    return this.http.get<{ message: string, specialites: any[] }>(this.apiUrl).pipe(
      map(response => response.specialites.map(s => ({
        _id: s._id,
        nom: s.nom,
        description: s.description
      })))
    );
  }




  ajouterSpecialite(specialite: Omit<Specialite, 'id'>): Observable<Specialite> {
    return this.http.post<Specialite>(this.apiUrl, specialite);
  }

  modifierSpecialite(id: string, specialite: any): Observable<Specialite> {
    return this.http.put<Specialite>(`${this.apiUrl}/${id}`, specialite);
  }

  supprimerSpecialite(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}


  getSpecialiteById(id: string): Observable<Specialite> {
    return this.http.get<Specialite>(`${this.apiUrl}/${id}`);
  }
}
