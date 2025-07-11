import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class HomeGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    // Si pas connecté → accès autorisé
    if (!token || !userString) return true;

    // Sinon, on vérifie le rôle
    const user = JSON.parse(userString);

    if (user.role === 'admin') {
      return this.router.parseUrl('/admin/dashboard');
    }

    if (user.role === 'medecin') {
      return this.router.parseUrl('/medecin/dashboard');
    }

    // Si patient connecté → accès autorisé
    return true;
  }
}
