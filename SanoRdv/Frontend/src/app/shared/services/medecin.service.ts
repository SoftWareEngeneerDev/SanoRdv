import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private apiUrl = 'http://localhost:3000/api/medecins';

  constructor(private http: HttpClient) {}

  // Obtenir tous les médecins
  getAllMedecins(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtenir un médecin par son ID
  getMedecinById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Obtenir médecins par spécialité
  getMedecinsParSpecialite(specialite: string): Observable<any[]> {
    const params = new HttpParams().set('specialite', specialite);
    return this.http.get<any[]>(`${this.apiUrl}/recherche`, { params });
  }

  //  Obtenir médecins par nom
  getMedecinsParNom(nom: string): Observable<any[]> {
    const params = new HttpParams().set('nom', nom);
    return this.http.get<any[]>(`${this.apiUrl}/recherche`, { params });
  }

  //  Obtenir médecins par prénom
  getMedecinsParPrenom(prenom: string): Observable<any[]> {
    const params = new HttpParams().set('prenom', prenom);
    return this.http.get<any[]>(`${this.apiUrl}/recherche`, { params });
  }

  uploadPhoto(formData: FormData, medecinId: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/${medecinId}/photo`, formData);
}
}

