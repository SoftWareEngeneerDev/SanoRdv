import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecapService } from '../../services/recap.service';
import { MedecinService } from 'src/app/features/medecin/medecin.service';
import { CreneauService } from '../../../patient/services/creneau.service';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
import {NotificationsService } from '../../../../shared/services/notifications.service';


@Component({
  selector: 'app-recapitulatif',
  templateUrl: './recapitulatif.component.html',
  styleUrls: ['./recapitulatif.component.css']
})
export class RecapitulatifComponent implements OnInit {
  motif: string = '';
  medecin: any = null;
  creneau: any = null;

  constructor(
    private recapService: RecapService,
    private router: Router,
    private medecinService: MedecinService,
    private creneauService: CreneauService,
    private rendezVousService: RendezVousService,
    private notificationsService: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.motif = this.recapService.getMotif() || '';
    this.medecin = this.recapService.getMedecin();
    this.creneau = this.recapService.getCreneau();
  }

  retour(): void {
    if (!this.medecin || !this.creneau) {
      alert("Informations manquantes pour revenir en arrière.");
      return;
    }

    const patientId = this.creneau?.slot?.patientId || null;
    this.router.navigate(['/patient/creneau', this.medecin._id, patientId]);
  }

  confirmer(): void {
    if (!this.creneau || !this.creneau.slot) {
      alert('Veuillez sélectionner un créneau avant de confirmer.');
      return;
    }

    const data = {
      creneauId: this.creneau.idcreneau,
      timeSlotId: this.creneau.slot._id,
      patientId: this.creneau.slot.patientId,
      motifRendezVous: this.motif
    };

    this.rendezVousService.prendreRendezVous(data).subscribe({
      next: () => {
        console.log("Rendez-vous pris avec succès");
        console.log("On va envoyer la notification au patient...");

        this.notificationsService.envoyerNotificationPriseRdvPatient({
          creneauId: data.creneauId,
          timeSlotId: data.timeSlotId
        }).subscribe({
          next: () => {
            console.log('Notification envoyée au patient.');
            this.router.navigate(['/patient/confirmation']);
          },
          error: (err: any) => {
            console.error('Erreur lors de l\'envoi de la notification:', err);
            this.router.navigate(['/patient/confirmation']);
          }
        });
      },
      error: (err) => {
        console.error("Erreur lors de la prise de rendez-vous", err);
        alert("Une erreur est survenue lors de la prise de rendez-vous. Veuillez réessayer.");
      }
    });
  }
}
