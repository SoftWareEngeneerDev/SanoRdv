import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous } from '../models/rendez-vous.model'; // Assurez-vous que le modèle RendezVous est correctement importé
import { environment } from 'src/environment/environments';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {

   private apiUrl = `${environment.apiUrl}/rendezvous`;

  constructor(private http: HttpClient) {}

  getRendezVous(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.apiUrl);
  }

  annulerRendezVous(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/annuler`, {});
  }

  // Bonus : Modifier un rendez-vous
  modifierRendezVous(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
