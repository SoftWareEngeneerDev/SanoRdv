import { RecapService } from './../../services/recap.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedecinService } from '../../../../shared/services/medecin.service';

@Component({
  selector: 'app-profil-medecin',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.css']
})
export class ProfilMedecinComponent implements OnInit {
  medecin: any;

  constructor(
    private route: ActivatedRoute,
    private medecinService: MedecinService,
    private recapService: RecapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Essaye de récupérer depuis navigation.state (priorité)
    const navigation = this.router.getCurrentNavigation();
    this.medecin = navigation?.extras?.state?.['medecin'];

    // Si pas dans navigation.state, récupère depuis backend via ID url
    if (!this.medecin) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.medecinService.getMedecinById(id).subscribe((data: { dateNaissance: string; }) => {
          this.medecin = {
            ...data,
            age: this.calculerAge(data.dateNaissance)
          };
        });
      }
    }
  }

  prendreRDV() {
    this.recapService.setMedecin(this.medecin);
    this.router.navigate(['/motif']);
  }

  retour() {
    this.router.navigate(['/dashboard']);
  }

  calculerAge(dateNaissance: string): number {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
