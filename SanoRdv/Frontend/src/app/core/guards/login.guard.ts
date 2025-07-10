import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      const user = JSON.parse(userString);

      if (user.role === 'admin') return this.router.parseUrl('/admin/dashboard');
      if (user.role === 'medecin') return this.router.parseUrl('/medecin/dashboard');
      if (user.role === 'patient') return this.router.parseUrl('/patient/dashboard');
    }

    return true; // Autorise si non connecté
  }
}
