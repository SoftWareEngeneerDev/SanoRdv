import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from './models/admin.model'; // 🔁 adapte le chemin selon ton projet
import { of } from 'rxjs';
import { environment } from 'src/environment/environments'; // 🔁 adapte le chemin selon ton projet




@Injectable({
  providedIn: 'root'
})
export class AdminService {

    private apiUrl = `${environment.apiUrl}/admins`; // 🔁 adapte à ton backend

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Récupère le profil complet de l'administrateur connecté
   */
  getAdmin(): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/profil`);
  }

  /**
   * 🔄 Récupérer un admin par son ID (utile dans le profil)
   */
  getAdminById(id: string): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/${id}`);
  }

  /**
   * ✅ Mettre à jour le profil admin
   */
  updateAdmin(id: string, admin: Admin): Observable<Admin> {
    return this.http.put<Admin>(`${this.apiUrl}/${id}`, admin);
  }

  /**
   * 📊 services pour le dashboard
   */

  getDashboardStats(): Observable<any> {
  return of({
    totalPatients: 120,
    medecinsActifs: 15,
    totalRendezVous: 85
  });
}

getStatsHebdo(): Observable<{ labels: string[], donnees: number[] }> {
    return this.http.get<{ labels: string[], donnees: number[] }>(`${this.apiUrl}/hebdo`);
  }
/** fin du service pour le dashboard */

}
