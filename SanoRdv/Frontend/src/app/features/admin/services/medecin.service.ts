import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Medecin } from '../models/medecin.model';
import { environment } from 'src/environment/environments';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private apiUrl = `${environment.apiUrl}/admins/medecins`;

  constructor(private http: HttpClient) {}

getMedecins(): Observable<{ medecins: Medecin[], total: number }> {
  return this.http.get<{ medecins: Medecin[], total: number }>(this.apiUrl);
}

  // Ajouter un médecin
  ajouterMedecin(medecin: Medecin): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admins/ajouter`, medecin);
  }

  // Supprimer un médecin
  supprimerMedecin(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Désactiver un médecin
  desactiverMedecin(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desactivation`, {});
  }

  // Activer un médecin
  activerMedecin(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activation`, {});
  }

  // Récupérer un médecin par ID
  getMedecinById(id: string): Observable<Medecin> {
    return this.http.get<Medecin>(`${this.apiUrl}/${id}`);
  }
  // Modifier un médecin
  modifierMedecin(id: string, medecin: Medecin): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, medecin);
  }
}