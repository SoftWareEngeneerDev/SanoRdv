import { Component, OnInit } from '@angular/core';
import { RecapService } from '../../services/recap.service';
import { Router } from '@angular/router';
import { parseISO } from 'date-fns';
import { NotificationsService } from '../../../../shared/services/notifications.service';
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
     private notificationsService: NotificationsService
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
  }
}


  goToAccueil() {
    this.router.navigate(['/patient/dashboard']);
  }

  goToListeRdv() {
    this.router.navigate(['/patient/appointment']);
  }
}
