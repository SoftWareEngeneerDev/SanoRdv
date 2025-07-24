import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from './models/admin.model'; // adapte le chemin selon ton projet
import { environment } from 'src/environment/environments'; // adapte le chemin selon ton projet

export interface AdminProfile {
  _id: string;
  IDadmin: string;
  email: string;
  photo?: string;
  role: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admins`; // base URL API admin
private readonly ApiBaseUrl = `${environment.apiUrl}/state/dashboard`
  constructor(private http: HttpClient) {}

  /**
   * Récupère le profil complet de l'administrateur connecté
   */
  getAdmin(): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/profil`);
  }

  /**
   * Récupérer un admin par son ID (utile pour afficher/modifier un profil)
   */
  getAdminById(id: string): Observable<Admin> {
    return this.http.get<Admin>(`${this.apiUrl}/${id}`);
  }
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.ApiBaseUrl}`);
  }
  /**
   * Mettre à jour le profil admin (seuls email et photo modifiables côté backend)
   * data peut contenir { email?: string; photo?: string }
   */
  updateAdmin(id: string, data: { email?: string; photo?: string }): Observable<{ message: string; admin: AdminProfile }> {
    return this.http.put<{ message: string; admin: AdminProfile }>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Récupérer les statistiques du dashboard (adapter l'URL backend si besoin)
   */
 

  /**
   * Récupérer les statistiques hebdomadaires pour graphique
   */
  getStatsHebdo(): Observable<{ labels: string[]; donnees: number[] }> {
    return this.http.get<{ labels: string[]; donnees: number[] }>(`${this.apiUrl}/hebdo`);
  }
}
