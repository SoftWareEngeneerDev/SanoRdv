// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class MedecinService {

//   private apiUrl = 'http://localhost:3000/api';
//   baseUrl: any;

//   constructor(private http: HttpClient) {}


//   getRendezVousDuJour() {
//   return this.http.get<any[]>('/api/medecin/rendez-vous');
// }

//   ajouterCreneau(payload: any): Observable<any> {
//   return this.http.post(`${this.baseUrl}/creneaux`, payload);
// }


// }




// src/app/medecin/medecin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private apiUrl = 'http://localhost:3000/api'; // API base URL

  constructor(private http: HttpClient) {}

  getRendezVousParMedecin(medecinId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rendezvous/medecin/${medecinId}`);
  }

  ajouterCreneau(payload: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/creneaux`, payload); // utilise apiUrl, pas baseUrl
}

getCreneauxParMedecin(medecinId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/creneaux/medecin/${medecinId}`);
  }
}

