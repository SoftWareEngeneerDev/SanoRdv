import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    const expectedRoles = route.data['roles'] as string[]; // ← rôles attendus (optionnels)

    if (token && userString) {
      const user = JSON.parse(userString);

      // ✅ Si des rôles sont exigés, vérifier l'autorisation
      if (expectedRoles && !expectedRoles.includes(user.role)) {
        // ❌ Accès refusé → redirection dashboard de l'utilisateur
        return this.router.parseUrl(`/${user.role}/dashboard`);
      }

      // ✅ Redirection automatique si on est sur les routes publiques (ex : /auth, /)
      if (state.url === '/' || state.url.startsWith('/auth')) {
        return this.router.parseUrl(`/${user.role}/dashboard`);
      }

      return true; // autorisé
    }

    // ✅ Si pas connecté et pas sur une route protégée → OK
    if (!expectedRoles) return true;

    // ❌ Route protégée → redirection vers login
    return this.router.parseUrl('/auth/login');
  }
}
