import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environments';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

getHistoriqueRendezVous(patientId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/${patientId}/historique`);
}


  supprimerPatient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleEtat(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/etat`, {});
  }
}
