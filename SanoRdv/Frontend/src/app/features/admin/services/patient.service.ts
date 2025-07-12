import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environment/environments';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

 getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl).pipe(
      catchError(this.handleError<Patient[]>('getPatients', []))
    );
  }

  searchPatients(term: string): Observable<Patient[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<Patient[]>(`${this.apiUrl}?q=${term}`).pipe(
      catchError(this.handleError<Patient[]>('searchPatients', []))
    );
  }

  addPatient(patient: Patient): Observable<Patient> {
  return this.http.post<Patient>(this.apiUrl, patient).pipe(
    catchError(this.handleError<Patient>('addPatient'))
  );}

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  getPatientById(id: number): Observable<Patient> {
  return this.http.get<Patient>(`${this.apiUrl}/${id}`).pipe(
    catchError(this.handleError<Patient>('getPatientById'))
  );
}
}
