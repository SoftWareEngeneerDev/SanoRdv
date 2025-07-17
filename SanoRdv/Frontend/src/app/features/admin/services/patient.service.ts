import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Patient } from '../models/patient.model';
import { environment } from 'src/environment/environments';

interface ApiResponse {
  success: boolean;
  patients: Patient[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiBaseUrl = `${environment.apiUrl}/patients/register`;
  private apiUrl = `${environment.apiUrl}/admins/patients`;
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();
  public isLoading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadInitialPatients();
  }

  private loadInitialPatients(): void {
    this.refreshPatients();
  }

  refreshPatients(): void {
    this.isLoading.next(true);
    this.http.get<ApiResponse | Patient[]>(this.apiUrl).pipe(
      tap(response => console.log('Réponse API:', response)), // Debug
      map(response => {
        // Gère les deux formats de réponse possibles
        if (Array.isArray(response)) {
          return response; // Si c'est directement un tableau
        } else {
          return (response as ApiResponse).patients || []; // Si format encapsulé
        }
      }),
      catchError(err => {
        console.error('Erreur API:', err);
        return []; // Retourne un tableau vide en cas d'erreur
      })
    ).subscribe({
      next: (patients) => {
        this.patientsSubject.next(patients);
        this.isLoading.next(false);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading.next(false);
      }
    });
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  activerPatient(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activation`, {}).pipe(
      tap(() => this.refreshPatients())
    );
  }

  desactiverPatient(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/desactivation`, {}).pipe(
      tap(() => this.refreshPatients())
    );
  }

  supprimerPatient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshPatients())
    );
  }

  ajouterPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.apiBaseUrl, patient).pipe(
      tap(() => this.refreshPatients())
    );
  }
}