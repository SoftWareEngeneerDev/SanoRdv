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
  patient: any;

  constructor(
    private recapService: RecapService,
    private router: Router
  ) {}

  retour() {
    this.router.navigate(['/patient/creneau']);
  }

  confirmer() {
    if (!this.creneau) {
      alert('Veuillez sélectionner un créneau avant de confirmer.');
      return;
    }
    this.recapService.setRdv(this.medecin, this.creneau.date, this.creneau.heure);
    this.router.navigate(['/patient/confirmation']);
  }

  ngOnInit(): void {
    this.motif = this.recapService.getMotif();
    this.medecin = this.recapService.getMedecin();
    this.creneau = this.recapService.getCreneau();
  this.patient = this.recapService.getPatient(); 

  if (!this.medecin || !this.patient) {
    this.router.navigate(['/patient/search-medecin']);
  }
    // if (!this.medecin || !this.creneau) {
    //   // Redirection si données manquantes
    //   this.router.navigate(['/patient/motif']);
    // }
  }
}
