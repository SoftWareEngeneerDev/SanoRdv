import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  modifierCreneau(body: { idcreneau: any; timeSlots: any; }) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:3000/api/medecins';

  private selectedMedecin: any = null;

  constructor(private http: HttpClient) {}

  //Medecin selectionné
  setSelectedMedecin(medecin: any): void {
    this.selectedMedecin = medecin;
  }

  getSelectedMedecin(): any {
    return this.selectedMedecin;
  }

  clearSelectedMedecin(): void {
    this.selectedMedecin = null;
  }


  // Obtenir tous les médecins
  getAllMedecins(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtenir un médecin par son ID
  getMedecinById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Obtenir les médecins par spécialité
  getMedecinsParSpecialite(specialite: string): Observable<any[]> {
    const params = new HttpParams().set('specialite', specialite);
    return this.http.get<any[]>(`${this.apiUrl}/recherche`, { params });
  }

  // Obtenir les médecins par nom
  getMedecinsParNom(nom: string): Observable<any[]> {
    const params = new HttpParams().set('nom', nom);
    return this.http.get<any[]>(`${this.apiUrl}/recherche`, { params });
  }

  // Obtenir les médecins par prénom
  getMedecinsParPrenom(prenom: string): Observable<any[]> {
    const params = new HttpParams().set('prenom', prenom);
    return this.http.get<any[]>(`${this.apiUrl}/recherche`, { params });
  }

  // Mettre à jour la photo du médecin
  uploadPhoto(formData: FormData, medecinId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${medecinId}/photo`, formData);
  }

  // Obtenir l'agenda ID du médecin
  getAgendaIdByMedecinId(medecinId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/${medecinId}/agenda`);
}

 creerAgenda(date: string, medecinId: string) {
    return this.http.post('http://localhost:3000/api/agenda/creer', { date, medecinId });
  }


}
