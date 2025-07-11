import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medecin } from '../models/medecin.model'; // 🔁 adapte le chemin selon ton projet
import { environment } from 'src/environment/environments';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {

  private apiUrl = `${environment.apiUrl}/medecins`;

  constructor(private http: HttpClient) {}

  // 🔄 Récupérer tous les médecins
  getMedecins(): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(this.apiUrl);
  }

  // ➕ Ajouter un médecin
  ajouterMedecin(medecin: Medecin): Observable<Medecin> {
    return this.http.post<Medecin>(this.apiUrl, medecin);
  }

  // 🖊️ Modifier un médecin
  modifierMedecin(id: string, medecin: Medecin): Observable<Medecin> {
    return this.http.put<Medecin>(`${this.apiUrl}/${id}`, medecin);
  }

  // ❌ Supprimer un médecin
  supprimerMedecin(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 🔁 Activer/Désactiver
  toggleEtat(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/etat`, {}); // endpoint prévu pour toggle
  }

  // 🔍 Obtenir un médecin par ID
  getMedecinById(id: string): Observable<Medecin> {
    return this.http.get<Medecin>(`${this.apiUrl}/${id}`);
  }
}
