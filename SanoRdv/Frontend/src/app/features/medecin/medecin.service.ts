import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private apiUrl = 'http://localhost:3000/api/medecins';

  constructor(private http: HttpClient) {}

  getRendezVousParMedecin(medecinId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rendezvous/medecin/${medecinId}`);
  }

  ajouterCreneau(payload: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/creneaux`, payload); // utilise apiUrl, pas baseUrl
}

getCreneauxParMedecin(medecinId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/creneaux/medecin/${medecinId}`);
  }

   profile = {
    photo: '',
    nom: 'Kabore',
    prenom: 'Faical',
    specialite: 'Médecin généraliste',
    sexe: 'Homme',
    dateNaissance: '1983-01-01',
    anneeExperience: 15,
    localisation: 'Clinique Philadelphie\n404 Rue du President Maurice YAMEOGO',
    telephone: '60 80 62 53',
    email: 'Faicalkabore2@gmail.com',
    parcours: `Diplômée de la faculté de médecine de Paris en 2003. Spécialisation en dermatologie obtenue en 2008. Ancienne interne des Hôpitaux de Paris. Membre de la Société Française de Dermatologie. Spécialiste des maladies de peau et des traitements laser.`
  };

  getProfile() {
    return this.profile;
  }

  updateProfile(data: any) {
    this.profile = { ...this.profile, ...data };
  }

}

