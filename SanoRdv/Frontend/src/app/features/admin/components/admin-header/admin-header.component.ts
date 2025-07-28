import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent {
  @Input() isCollapsed: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}
  
  AccueilPage() {
    this.router.navigate(['/admin/accueil']); // adapte si ta route est différente
  }

  AProposPage() {
    this.router.navigate(['/admin/a-propos']); // adapte selon ta route réelle
  }


  notification() {
    this.router.navigate(['/admin/notifications']);
  }

  deconnexion() {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log('Déconnexion réussie :', res.message);
        // Supprime les infos du localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Erreur lors de la déconnexion :', err);
        // On redirige quand même pour forcer la déconnexion côté client
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
