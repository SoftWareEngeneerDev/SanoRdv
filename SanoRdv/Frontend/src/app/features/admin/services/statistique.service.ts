import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environments';

export interface StatsHebdo {
  date: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {

    private apiUrl = `${environment.apiUrl}/admins/statistiques`;
  constructor(private http: HttpClient) { }

   getRapportHebdomadaire(): Observable<StatsHebdo[]> {
    return this.http.get<StatsHebdo[]>(`${this.apiUrl}/hebdo`);
  }

  getRapportHebdo(): Observable<{ date: string, count: number }[]> {
    return this.http.get<{ date: string, count: number }[]>(`${this.apiUrl}/hebdo`);
  }
}
