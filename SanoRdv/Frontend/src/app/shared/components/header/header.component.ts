import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false; // Contrôle l'ouverture/fermeture du menu latéral (mobile)
  isLogged = false;   // Indique si l'utilisateur est connecté ou non

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // À l'initialisation, on vérifie si l'utilisateur est connecté
    this.isLogged = this.authService.isLoggedIn();
  }

  toggleMenu(): void {
    // Bascule l'affichage du menu latéral sur mobile
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    // Appelle l'API de déconnexion backend
    this.authService.logout().subscribe({
      next: () => {
        // Si déconnexion réussie, on nettoie le token localement
        localStorage.removeItem('token');
        this.isLogged = false;
        this.isMenuOpen = false;
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Même en cas d'erreur, on supprime le token pour éviter d'avoir un faux "connecté"
        localStorage.removeItem('token');
        this.isLogged = false;
        this.isMenuOpen = false;
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
