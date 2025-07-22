import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DossierMedical } from '../models/dossier-medical.models';

@Injectable({
  providedIn: 'root'
})
export class DossierMedicalService {
  private apiUrl = 'http://localhost:3000/api/dossier-medical';

  constructor(private http: HttpClient) {}

  getDossierMedicalByPatientId(patientId: string): Observable<DossierMedical> {
    return this.http.get<DossierMedical>(`${this.apiUrl}/patient/${patientId}`);
  }
}
