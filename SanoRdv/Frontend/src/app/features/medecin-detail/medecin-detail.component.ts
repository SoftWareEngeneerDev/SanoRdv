import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailMedecinService } from 'src/app/shared/services/detail-medecin.service';

@Component({
  selector: 'app-medecin-detail',
  templateUrl: './medecin-detail.component.html',
  styleUrls: ['./medecin-detail.component.css']
})
export class MedecinDetailComponent implements OnInit {
  profile: any = null;
  age: number = 0;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private detailMedecinService: DetailMedecinService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMedecin(id);
    } else {
      this.error = "ID du médecin non trouvé dans l'URL.";
      this.loading = false;
    }
  }

  loadMedecin(id: string): void {
    this.detailMedecinService.getMedecinDetails(id).subscribe({
      next: (data) => {
        this.profile = data;
        this.age = this.calculateAge(data.dateNaissance);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.error = 'Erreur lors du chargement du médecin.';
        this.loading = false;
      }
    });
  }

  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  prendreRendezVous(): void {
    if (!this.profile || !this.profile._id) {
      this.error = "Impossible de prendre rendez-vous, médecin inconnu.";
      return;
    }

    this.router.navigate(['/auth/login'], {
      queryParams: {
        redirect: `/prendre-rendezvous/${this.profile._id}`
      },
      state: { medecinInfo: this.profile }
    });
  }
  retourAccueil(): void {
    this.router.navigate(['/']);
  }
}
