import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { environment } from 'src/environment/environments';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/admins/patients`;

  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

  getPatientById(id: string): Observable<Patient> {
  return this.http.get<Patient>(`${this.apiUrl}/patients/${id}`);
}


  activerPatient(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activation`, {});
  }

  desactiverPatient(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desactivation`, {});
  }

  supprimerPatient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  ajouterPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }
}
