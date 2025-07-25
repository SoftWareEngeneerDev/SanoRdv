import { Patient } from './../../../../shared/models/patient.model';
import { Component, OnInit } from '@angular/core';
import { RecapService } from '../../services/recap.service';
import { Router } from '@angular/router';
import { MedecinService } from 'src/app/features/medecin/medecin.service';

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

  ) {}

  retour() {
    this.router.navigate(['/patient/creneau', this.medecin._id, this.creneau.patientId]);
  }

  confirmer() {
    if (!this.creneau) {
      alert('Veuillez sélectionner un créneau avant de confirmer.');
      return;
    }
    this. saveTimeSlots();
    // this.recapService.setRdv(this.medecin, this.creneau);
  }

  saveTimeSlots(): void {
    this.creneau.timeSlots.forEach((element: any) => {
      if (element.time==this.creneau.slot.time) {
        element.status=this.creneau.slot.status;
        element.patient=this.creneau.slot.patient;

      }


    });
    const body = {
      idcreneau: this.creneau.idCreneau,
      timeSlots: this.creneau.timeSlots,
    };

    this.medecinService.modifierCreneau(body).subscribe({
      next: (res: any) => {
        // alert(res.message || 'Indisponibilités mises à jour');
       this.router.navigate(['/patient/confirmation']);
      },
      error: (err) => {
        alert('Erreur serveur lors de la mise à jour du créneau');
        console.error(err);
      }
    });
  }


  ngOnInit(): void {
    this.motif = this.recapService.getMotif();
    this.medecin = this.recapService.getMedecin();
    this.creneau = this.recapService.getCreneau();

  }
}
// patientId: string; dateSelectionne: Date; slot: any ; timeSlots: any
