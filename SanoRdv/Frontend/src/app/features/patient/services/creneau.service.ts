import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environment/environments';


@Injectable({
  providedIn: 'root'
})
export class CreneauService {

  private apiUrl = 'http://localhost:3000/api/creneaux';
  private apibaseUrl = 'http://localhost:3000/api/medecin/:id/agenda'

  constructor(private http: HttpClient) {}

  // Récupérer les créneaux par date
  getCreneauxParDate(agendaId: string, date: string): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/parDate/${agendaId}/${date}`).pipe(
      map(response => response.data)
    );
  }

  // getCreneauxDispoByAgenda(agendaId: string, date: string): Observable<string[]> {
  //   return this.http.get<any>(`${this.apiUrl}/filtrer/${agendaId}/${date}/disponible`)
  //     .pipe(
  //       map(response => response.data.timeSlots.map((slot: any) => slot.time))
  //     );
  // }


  // getCreneauxReservesByAgenda(agendaId: string, date: string): Observable<string[]> {
  //   return this.http.get<any>(`${this.apiUrl}/filtrer/${agendaId}/${date}/reserve`)
  //     .pipe(
  //       map(response => response.data.timeSlots.map((slot: any) => slot.time))
  //     );
  // }

  // getCreneauxDisponibles(date: string, medecinId: string): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/disponibles?date=${date}&medecinId=${medecinId}`);
  // }

  //  Modifier un créneau
 updateCreneau(idcreneau: string, timeSlots: any[]) {
 return this.http.put<any>(`${this.apiUrl}/update`, { idcreneau, timeSlots });
}

  //  Supprimer un créneau
  supprimerCreneau(creneauId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supprimer/${creneauId}`);
  }

  // Réserver un créneau
reserverCreneau(idcreneau: string, time: string, idPatient: string) {
  return this.http.post(`${environment.apiUrl}/creneaux/reserver`, {
    idcreneau,
    time,
    idPatient
  });
}


 afficherAgenda(data: any): Observable<any> {
  return this.http.post('http://localhost:3000/api/agenda/afficherAgenda', data);
}


}
