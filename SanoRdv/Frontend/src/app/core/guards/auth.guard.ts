import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  private checkAuth(): boolean | UrlTree {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      return true;
    }

    // Redirection vers login si pas authentifié
    return this.router.parseUrl('/');
  }

  canActivate(): boolean | UrlTree {
    return this.checkAuth();
  }

  canActivateChild(): boolean | UrlTree {
    return this.checkAuth();
  }
}
