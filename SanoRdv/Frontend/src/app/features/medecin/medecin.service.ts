import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {

  private apiUrl = 'http://localhost:3000/api'; // Adapte à ton URL backend si besoin
  baseUrl: any;

  constructor(private http: HttpClient) {}


  getRendezVousDuJour() {
  return this.http.get<any[]>('/api/medecin/rendez-vous'); // adapte l’URL selon ton backend
}

  ajouterCreneau(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/creneaux`, payload);
}


}
