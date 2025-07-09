import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from './models/admin.model'; // 🔁 adapte le chemin selon ton projet
import { of } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class AdminService {

    private apiUrl = 'http://localhost:3000/api/admin'; // 🔁 adapte à ton backend

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

getRendezVousStats7DerniersJours(): Observable<any> {
  return of({
    dates: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    rdv7Jours: [5, 8, 12, 10, 15, 7, 6]
  });
}
/** fin du service pour le dashboard */

}
