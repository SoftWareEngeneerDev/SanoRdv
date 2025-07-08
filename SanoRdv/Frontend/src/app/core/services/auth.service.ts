import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Interfaces des données utilisées pour l'authentification
export interface Register {
  nom: string;
  prenom: string;
  telephone: string;
  sex: string;
  email: string;
  motDePasse: string;
  confirmationMotDePasse: string;
}

export interface Login {
  UserID: string;
  motDePasse: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  resetToken?: string;
  user?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

export interface ResetPassword {
  motDePasse: string;
  confirmationMotDePasse: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth';
  private url = 'http://localhost:3000/api/patients';

  // En-têtes par défaut avec content-type JSON
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  /**
   * Enregistrement d'un nouvel utilisateur
   * @param userData Données du formulaire d'inscription
   */
  register(userData: Register): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, userData, {
      headers: this.headers
    });
  }

  /**
   * Connexion utilisateur
   * @param credentials Identifiants de connexion
   * Stocke le token JWT dans localStorage si la connexion réussit
   */
  login(credentials: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials, {
      headers: this.headers
    }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        console.log("Réponse du backend:", res);
      })
    );
  }

  /**
   * Déconnexion utilisateur
   * Envoie une requête POST au backend avec le token dans les headers
   * et nettoie le stockage local (à gérer dans le composant)
   */
  logout(): Observable<AuthResponse> {
    const token = localStorage.getItem('token');

    // Si aucun token, retourner un succès local
    if (!token) {
      return new Observable(observer => {
        observer.next({ success: true, message: 'Pas de token trouvé.' });
        observer.complete();
      });
    }

    // En-tête avec Authorization (token JWT)
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    // Appel à l'API backend de déconnexion
    return this.http.post<AuthResponse>(`${this.baseUrl}/logout`, {}, { headers });
  }

  /**
   * Demande de réinitialisation de mot de passe (envoi d'email)
   * @param email Email de l'utilisateur
   */
  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/forgot-password`, { email }, {
      headers: this.headers
    });
  }

  /**
   * Vérification du code de réinitialisation envoyé par email
   * @param code Code de réinitialisation
   */
  verifyResetCode(code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/verify-reset-code`, { resetCode: code }, {
      headers: this.headers
    });
  }

  /**
   * Réinitialisation du mot de passe avec le token reçu
   * @param resetData Nouvelles données du mot de passe
   * @param token Token JWT valide
   */
  resetPassword(resetData: ResetPassword, token: string): Observable<AuthResponse> {
    const headers = this.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<AuthResponse>(`${this.baseUrl}/reset-password`, resetData, { headers });
  }

  /**
   * Vérifie si l'utilisateur est connecté (token présent dans localStorage)
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Récupère le rôle de l'utilisateur à partir du token (décodé manuellement)
   */
  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.role || null;
    } catch {
      return null;
    }
  }
}
