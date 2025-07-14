import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://sanordv.onrender.com/api/patient/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${patientId}`);
  }
}
