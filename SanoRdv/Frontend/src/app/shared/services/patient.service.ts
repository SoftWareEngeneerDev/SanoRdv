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
    return this.http.get<Patient>(`${this.apiUrl}/patients`);
  }

  // Ici on change le type du paramètre en FormData pour correspondre à ce que tu envoies
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
}
