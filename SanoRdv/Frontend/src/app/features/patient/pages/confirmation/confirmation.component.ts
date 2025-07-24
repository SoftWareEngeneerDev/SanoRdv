import { Component, OnInit } from '@angular/core';
import { RecapService } from '../../services/recap.service';
import { Router } from '@angular/router';
import { parseISO } from 'date-fns';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service'; // <- import du service RDV
import { Notification } from 'src/app/shared/models/notifications.model';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  medecin: any;
  dateAffichee: string = '';
  heure: string = '';
  date: Date | null = null;

  constructor(
    private recapService: RecapService,
    private router: Router,
    private notificationsService: NotificationsService,
    private rendezVousService: RendezVousService  // <- injection du service RDV
  ) {}

  ngOnInit(): void {
    this.medecin = this.recapService.getMedecin();
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
    this.heure = this.recapService.getHeure()!;

    if (this.medecin && this.date && this.heure) {
      // Préparation des données pour créer le RDV
      const rdvData = {
        patientId: this.recapService.getPatient()?._id,
        medecinId: this.medecin._id,
        creneauId: this.recapService.getCreneau(),
        time: this.heure,
        motif: this.recapService.getMotif()
      };


      console.log('rdvData:', rdvData);

      this.rendezVousService.creerRendezVous(rdvData).subscribe({
        next: (rdv: any) => {
          console.log('Rendez-vous créé avec succès', rdv);

          // Création de la notification seulement si le rdv a réussi
          const notification: Notification = {
            id: '',
            message: `Rendez-vous avec Dr. ${this.medecin.nom} demain à ${this.heure}.`,
            dateNotification: new Date().toISOString(),
            type: 'rappel',
            medecin: `Dr. ${this.medecin.nom}`,
            read: false
          };

          this.notificationsService.creerNotification(notification).subscribe({
            next: () => {
              console.log('Notification de rappel créée avec succès');
            },
            error: (err) => {
              console.error('Erreur lors de la création de la notification', err);
            }
          });
        },
        error: (err: any) => {
          console.error('Erreur lors de la prise de rendez-vous', err);
          alert('Erreur lors de la prise de rendez-vous. Veuillez réessayer.')
        }
      });
    }
  }

  goToAccueil() {
    this.router.navigate(['/patient/dashboard']);
  }

  goToListeRdv() {
    this.router.navigate(['/patient/appointment']);
  }
}
