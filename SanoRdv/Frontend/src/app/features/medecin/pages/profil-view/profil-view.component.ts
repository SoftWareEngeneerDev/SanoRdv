import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../../medecin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profil-view',
  templateUrl: './profil-view.component.html',
  styleUrls: ['./profil-view.component.css']
})
export class ProfilViewComponent implements OnInit {

  profile: any = null;

  constructor(
    private medecinService: MedecinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const medecinId = user._id;

    if (medecinId) {
      this.medecinService.getMedecinById(medecinId).subscribe({
        next: data => {
          this.profile = data;
        },
        error: (err: any) => {
          console.error('Erreur lors du chargement du profil :', err);
        }
      });
    } else {
      console.warn("Aucun médecin connecté.");
    }
  }

  editProfile() {
    this.router.navigate(['/medecin/profile']);
  }

  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const ageDiff = Date.now() - birthDate.getTime();
    return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
