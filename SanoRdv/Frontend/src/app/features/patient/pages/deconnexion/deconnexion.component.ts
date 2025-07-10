import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deconnexion',
  templateUrl: './deconnexion.component.html',
  styleUrls: ['./deconnexion.component.css']
})
export class DeconnexionComponent {
  constructor(private router: Router) {}

  annuler() {
    this.router.navigate(['/patient/dashboard']);
  }

  deconnecter() {
    localStorage.clear();
    this.router.navigate(['/Accueil']);
  }
}
