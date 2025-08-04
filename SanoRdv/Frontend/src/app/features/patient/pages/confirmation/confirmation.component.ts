import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { parseISO } from 'date-fns';

import { RecapService } from '../../services/recap.service';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';

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
  selectedSlot: any = null;
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
    const dateStr = this.recapService.getDate(); // ex: "2025-08-03T00:00:00.000Z"
    this.heure = this.recapService.getHeure() || ''; // ex: "14:30"
    this.motif = this.recapService.getMotif() || '';

    if (dateStr && this.heure) {
      try {
        // Assure-toi que l'heure est bien au format HH:mm:ss
        let heureComplete = this.heure;
        if (this.heure.length === 5) {
          heureComplete += ':00'; // ex: "14:30" => "14:30:00"
        }

        // Concatène la date (sans heure) et l'heure choisie pour créer un ISO complet
        const dateOnly = dateStr.split('T')[0]; // ex: "2025-08-03"
        const dateHeureStr = `${dateOnly}T${heureComplete}`;

        this.date = parseISO(dateHeureStr);
        this.selectedDate = this.date; // met à jour selectedDate utilisé dans le template

        // Format lisible pour affichage dans la page (optionnel)
        this.dateAffichee = this.date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        console.error('Erreur parsing date:', e);
        this.erreur = "La date du rendez-vous est invalide.";
        return;
      }
    } else {
      this.erreur = "Date ou heure du rendez-vous non disponible.";
      return;
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
      motif: this.motif,
      date: this.date.toISOString()
    };

    console.log("Données RDV envoyées au backend :", rdvData);

    // Ici tu peux appeler ton service pour envoyer rdvData au backend si tu veux
    // ex:
    /*
    this.rendezVousService.prendreRendezVous(rdvData).subscribe({
      next: (res) => {
        this.rendezVousCree = res.data;
      },
      error: (err) => {
        this.erreur = "Erreur lors de la prise de rendez-vous.";
        console.error(err);
      }
    });
    */
  }

  goToAccueil() {
    this.router.navigate(['/patient/dashboard']);
  }

  goToListeRdv() {
    this.router.navigate(['/patient/appointment']);
  }
}
