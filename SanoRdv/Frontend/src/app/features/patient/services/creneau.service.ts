import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CreneauService {

  private apiUrl = 'http://localhost:3000/api/creneau';

  constructor(private http: HttpClient) {}


getCreneauxParDate(agendaId: string, date: string): Observable<string[]> {
  return this.http.get<any>(`http://localhost:3000/api/creneau/parDate/${agendaId}/${date}`).pipe(
    map(response => response.data) // On extrait la propriété data du JSON
  );
}

 getCreneauxDispoByAgenda(agendaId: string, date: string): Observable<string[]> {
  return this.http.get<{success: boolean, message: string, data: string[]}>(`${this.apiUrl}/parDate/${agendaId}/${date}`)
    .pipe(
      map(response => response.data)
    );
}

getCreneauxReservesByAgenda(agendaId: string, date: string): Observable<string[]> {
  return this.http.get<any>(`${this.apiUrl}/reserves/${agendaId}/${date}`).pipe(
    map(response => response.data)
  );
}


  // Ajoute ici d’autres méthodes CRUD pour les créneaux si besoin
}
