import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = 'http://localhost:3000/api/patients';

  constructor(private http: HttpClient) {}

  getMonProfil(): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/me`);
  }

  getProfilPatient(): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}`);
  }

  // mettre à jour le profil du patient
 updateProfile(id: string, data: FormData): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return this.http.put(`${this.apiUrl}/me/${id}`, data, { headers });
}


  // saveProfile(data: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/save`, data);
  // }

  // medecin.service.ts
obtenirAgenda(date: string, medecinId: string): Observable<any> {
  return this.http.post(`http://localhost:3000/api/agenda/afficherAgenda`, { date, medecinId });
}

}
