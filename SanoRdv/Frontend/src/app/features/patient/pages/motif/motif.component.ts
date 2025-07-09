import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RecapService } from './../../services/recap.service';

@Component({
  selector: 'app-motif',
  templateUrl: './motif.component.html',
  styleUrls: ['./motif.component.css']
})
export class MotifComponent {
  motifConsultation: string = '';
  medecin: any;
  precedentClickedOnce: boolean = false;

  constructor(
    private router: Router,
    private recapService: RecapService
  ) {}

  onMotifChange() {
    this.precedentClickedOnce = false;
  }

  precedent() {
    if (!this.precedentClickedOnce) {
      this.motifConsultation = '';
      this.precedentClickedOnce = true;
    } else {
      this.router.navigate(['/patient/informations']);
    }
  }

  suivant() {
    this.recapService.setMotif(this.motifConsultation);
    this.router.navigate(['/patient/creneau']);
  }

  // Optionnel : fonction pour naviguer avec un médecin
  // creneaux(medecinId: string) {
  //   if (!this.motifConsultation) return;
  //   this.router.navigate(
  //     ['/patient/medecin', medecinId, 'creneaux'],
  //     { queryParams: { motif: this.motifConsultation } }
  //   );
  // }
}
