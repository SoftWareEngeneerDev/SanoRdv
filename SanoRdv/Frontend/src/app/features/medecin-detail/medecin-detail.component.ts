import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedecinService } from '../medecin/Medecin.service';

@Component({
  selector: 'app-medecin-detail',
  templateUrl: './medecin-detail.component.html',
  styleUrls: ['./medecin-detail.component.css']
})
export class MedecinDetailComponent implements OnInit {
  profile: any;

  constructor(private medecinService: MedecinService, private router: Router) {
    // Initialiser ici si tu veux, mais en général c'est mieux dans ngOnInit
  }

  ngOnInit(): void {
    // Initialisation du profil dans ngOnInit (recommandé)
    this.profile = this.medecinService.getProfile();
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const ageDiff = Date.now() - birthDate.getTime();
    return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
