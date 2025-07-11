import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medecin } from '../models/medecin.model'; // 🔁 adapte le chemin selon ton projet
import { environment } from 'src/environment/environments';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {

  private apiUrl = 'http://localhost:3000/api/medecins'; // Modifie selon ton backend

  constructor(private http: HttpClient) {}

  getMedecins(): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(this.apiUrl);
  }

  ajouterMedecin(medecin: Medecin): Observable<Medecin> {
    return this.http.post<Medecin>(this.apiUrl, medecin);
  }

  supprimerMedecin(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  activerMedecin(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activer`, {});
  }

  getMedecinById(id: string): Observable<Medecin> {
  return this.http.get<Medecin>(`${this.apiUrl}/${id}`);
}

modifierMedecin(id: string, medecin: Medecin): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, medecin);
}


}
