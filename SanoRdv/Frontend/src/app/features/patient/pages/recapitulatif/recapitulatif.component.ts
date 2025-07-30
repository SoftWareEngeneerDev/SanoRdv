import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecapService } from '../../services/recap.service';
import { MedecinService } from 'src/app/features/medecin/medecin.service';
import { CreneauService } from '../../../patient/services/creneau.service';

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
    private router: Router,
    private medecinService: MedecinService,
    private creneauService: CreneauService
  ) {}

  ngOnInit(): void {
    this.motif = this.recapService.getMotif();
    this.medecin = this.recapService.getMedecin();
    this.creneau = this.recapService.getCreneau();
  }

  retour() {
    this.router.navigate(['/patient/creneau', this.medecin._id, this.creneau.patientId]);
  }

  confirmer() {
    if (!this.creneau || !this.creneau.slot) {
      alert('Veuillez sélectionner un créneau avant de confirmer.');
      return;
    }

    this.creneauService.reserverCreneau(
      this.creneau.idcreneau,
      this.creneau.slot.time,
      this.creneau.slot.patientId
    ).subscribe({
      next: () => {
        console.log("Créneau réservé avec succès");
        this.router.navigate(['/patient/confirmation']);
      },
      error: (err) => {
        console.error("Erreur lors de la réservation", err);
        alert("Une erreur est survenue lors de la réservation");
      }
    });
  }
}
