import { Component, OnInit } from '@angular/core';
import { RecapService } from '../../services/recap.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recapitulatif',
  templateUrl: './recapitulatif.component.html',
  styleUrls: ['./recapitulatif.component.css']
})
export class RecapitulatifComponent implements OnInit {
  motif: string = '';
  medecin: any;
  creneau: any;

  constructor(
    private recapService: RecapService,
    private router: Router
  ) {}

  retour() {
    this.router.navigate(['/patient/creneau/:medecin_id/:patient_id']);
  }

  confirmer() {
    if (!this.creneau) {
      alert('Veuillez sélectionner un créneau avant de confirmer.');
      return;
    }
    this.recapService.setRdv(this.medecin, this.creneau);
    this.router.navigate(['/patient/confirmation']);
  }

  ngOnInit(): void {
    this.motif = this.recapService.getMotif();
    this.medecin = this.recapService.getMedecin();
    this.creneau = this.recapService.getCreneau();

  console.log('Motif sélectionné :', this.motif);
  console.log('Heure sélectionnée :', this.creneau?.heure);
  console.log('Date sélectionnée :', this.creneau?.date);

    // if (!this.medecin || !this.creneau) {
    //   // Redirection si données manquantes
    //   this.router.navigate(['/patient/motif']);
    // }
  }
}
