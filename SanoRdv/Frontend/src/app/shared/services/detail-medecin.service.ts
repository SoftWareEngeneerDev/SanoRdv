import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetailMedecinService {
  private apiUrl = 'http://localhost:3000/api/medecins'; // adapte cette URL à ton backend

  constructor(private http: HttpClient) {}

  // Fonction pour récupérer les détails d’un médecin par son ID
  getMedecinDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Fonction pour calculer l’âge d’un médecin à partir de sa date de naissance
  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const ageDiff = Date.now() - birthDate.getTime();
    return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
