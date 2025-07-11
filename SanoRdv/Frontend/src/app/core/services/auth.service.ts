import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators'; // ✅ Il manquait `map`

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

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  register(userData: Register): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, userData, {
      headers: this.headers
    });
  }

  login(credentials: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials, {
      headers: this.headers
    }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          // Stocke l'objet 'user' complet en JSON stringifié
        }
        console.log("Réponse du backend:", res);
      }),
      map(res => res) // ✅ Important pour transmettre les données au `subscribe`
    );
  }

  logout(): Observable<AuthResponse> {
    const token = localStorage.getItem('token');

    if (!token) {
      return of({ success: true, message: 'Pas de token trouvé.' });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<AuthResponse>(`${this.baseUrl}/logout`, {}, { headers });
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/forgot-password`, { email }, {
      headers: this.headers
    });
  }

  verifyResetCode(code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/verify-reset-code`, { resetCode: code }, {
      headers: this.headers
    });
  }

  resetPassword(resetData: ResetPassword, token: string): Observable<AuthResponse> {
    const headers = this.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<AuthResponse>(`${this.baseUrl}/reset-password`, resetData, { headers });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

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
