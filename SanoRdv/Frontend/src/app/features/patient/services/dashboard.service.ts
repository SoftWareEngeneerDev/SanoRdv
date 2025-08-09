import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DashboardData {
  prenom: string;
  rdvTotal: number;
  prochainRDV: any;
  totalNotif: number;
  totalDossiers: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/patients/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(patientId: string): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/${patientId}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération du dashboard', error);
        return throwError(() => error);
      })
    );
  }
}
