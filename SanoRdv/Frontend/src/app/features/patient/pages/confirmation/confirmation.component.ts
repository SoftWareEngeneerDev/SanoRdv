import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { parseISO } from 'date-fns';

import { RecapService } from '../../services/recap.service';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';

import { Notification } from 'src/app/shared/models/notifications.model';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  medecin: any;
  patient: any;
  dateAffichee: string = '';
  heure: string = '';
  date: Date | null = null;
  motif: string = '';
  rendezVousCree: any = null;
  erreur: string = '';
  selectedDate: Date = new Date();
  selectedSlot: any= null;
creneau: any;

  constructor(
    private recapService: RecapService,
    private rendezVousService: RendezVousService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.medecin = this.recapService.getMedecin();
    this.patient = this.recapService.getPatient();
    const dateStr = this.recapService.getDate();
    this.heure = this.recapService.getHeure() || '';
    this.motif = this.recapService.getMotif() || '';

    if (dateStr) {
      this.date = parseISO(dateStr);
      this.dateAffichee = this.date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    // Vérifie que toutes les données sont bien présentes
    if (!this.medecin || !this.patient || !this.heure || !this.date || !this.motif) {
      this.erreur = "Informations de rendez-vous incomplètes.";
      return;
    }

    // Récupération de l'ID du créneau choisi
    const creneau = this.recapService.getCreneau();
    if (!creneau || !creneau._id) {
      this.erreur = "Identifiant du créneau indisponible.";
      return;
    }

    const rdvData = {
      patientId: this.patient._id,
      medecinId: this.medecin._id,
      creneauId: creneau._id,
      time: this.heure,
      motif: this.motif
    };

    console.log(" Données RDV envoyées au backend :", rdvData);

  }

  goToAccueil() {
    this.router.navigate(['/patient/dashboard']);
  }

  goToListeRdv() {
    this.router.navigate(['/patient/appointment']);
  }
}
