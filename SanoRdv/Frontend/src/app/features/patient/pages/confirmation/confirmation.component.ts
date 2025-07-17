import { Component, OnInit } from '@angular/core';
import { RecapService } from '../../services/recap.service';
import { Router } from '@angular/router';
import { parseISO, subDays } from 'date-fns';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
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

  constructor(
    private recapService: RecapService,
    private router: Router,
    private notificationsService: NotificationsService,
    private rendezVousService: RendezVousService
  ) {}

  ngOnInit(): void {
    // Récupération des données
    this.medecin = this.recapService.getMedecin();
    const patientData = localStorage.getItem('patient');
    this.patient = patientData ? JSON.parse(patientData) : null;

    if (!this.patient) {
      console.error('Patient non trouvé dans le localStorage');
      return;
    }

    const dateStr = this.recapService.getDate();
    if (dateStr) {
      this.date = parseISO(dateStr);
      this.dateAffichee = this.date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    this.heure = this.recapService.getHeure() || '';

    if (!this.date) {
      console.error('Date du rendez-vous invalide.');
      return;
    }

    // Création du rendez-vous
    this.rendezVousService.creerRendezVous({
      patientId: this.patient.id,
      medecinId: this.medecin.id,
      date: this.date.toISOString(),
      status: 'confirmé'
    }).subscribe({
      next: (rdv) => {
        console.log('RDV créé ', rdv);

        // Incrémenter des statistiques
        this.rendezVousService.increment();
        this.notificationsService.increment();

        const rdvId = (rdv as any).id ?? (rdv as any)._id ?? '';

        // Programmation de la notification de rappel (la veille)
        const dateRappel = subDays(this.date!, 1);
        const rappelNotification: Notification = {
          rendezVousId: rdvId,
          type: 'rappel',
          message: `Rappel : Rendez‑vous avec Dr. ${this.medecin.nom} demain à ${this.heure}.`,
          dateNotification: dateRappel.toISOString(),
          medecin: `Dr. ${this.medecin.nom}`,
          read: false
        };

        // Notification d'annulation 
        const annulationNotification: Notification = {
          rendezVousId: rdvId,
          type: 'annulation',
          message: `Annulation : Votre rendez‑vous avec Dr. ${this.medecin.nom} a été annulé.`,
          dateNotification: new Date().toISOString(),
          medecin: `Dr. ${this.medecin.nom}`,
          read: false
        };

        // Création de la notification de rappel
        this.notificationsService.creerNotification(rappelNotification).subscribe({
          next: () => {
            console.log('Notification de rappel créée avec succès');
          },
          error: (err) => {
            console.error('Erreur lors de la création de la notification de rappel', err);
          }
        });

        // Création de la notification d'annulation
        this.notificationsService.creerNotification(annulationNotification).subscribe({
          next: () => {
            console.log('Notification d’annulation créée avec succès');
          },
          error: (err) => {
            console.error('Erreur lors de la création de la notification d’annulation', err);
          }
        });

      },
      error: (err) => {
        console.error('Erreur lors de la création du rendez-vous', err);
      }
    });
  }

  goToAccueil() {
    this.router.navigate(['/patient/dashboard']);
  }

  goToListeRdv() {
    this.router.navigate(['/patient/appointment']);
  }
}
