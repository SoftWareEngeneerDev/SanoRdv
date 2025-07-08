import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Patient {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  sexe: string;
  motDePasse?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {

 getMonProfil(): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/me`);
  }

  private apiUrl = 'http://localhost:3000/api/patient';

  constructor(private http: HttpClient) {}

  getProfilPatient(): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/me`);
  }

  updateProfile(patient: Partial<Patient>): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, patient);
  }

  saveProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, data);
  }
}
