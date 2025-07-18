import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../../../shared/models/rdv-model';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Modal } from 'bootstrap';


// @ts-ignore : Si Bootstrap n'est pas reconnu, à corriger via typings
// declare var bootstrap: any;

@Component({
  selector: 'app-rendezvous',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class RendezvousComponent implements OnInit {
  rendezvousAVenir: RendezVous[] = [];
  rendezvousPasses: RendezVous[] = [];
  loading = false;
  error = '';

  ongletActif: 'avenir' | 'passes' = 'avenir';

  // Modal d'annulation
  rdvASupprimerId: number | null = null;
  motifs: string[] = ['Indisponibilité', 'Erreur de prise', 'Problème personnel'];
  motifSelectionne: string = '';
  autreMotif: string = '';

  constructor(
    private rendezVousService: RendezVousService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRendezvous();
  }

  loadRendezvous(): void {
    // this.loading = true;
    this.error = '';

    this.rendezVousService.getAllRendezVous().subscribe({
      next: (data) => {
        const now = new Date();
        this.rendezvousAVenir = data.filter(rdv => new Date(rdv.date) >= now);
        this.rendezvousPasses = data.filter(rdv => new Date(rdv.date) < now);
        // this.loading = false;
      },
      // error: () => {
      //   this.error = 'Erreur lors du chargement des rendez-vous.';
      //   this.loading = false;
      // }
    });
  }

  selectOnglet(event: Event, onglet: 'avenir' | 'passes'): void {
    event.preventDefault();
    this.ongletActif = onglet;
  }

  annulerRdv(id: number): void {
    this.rdvASupprimerId = id;
    this.motifSelectionne = '';
    this.autreMotif = '';

    const modalElement = document.getElementById('annulationModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  confirmerAnnulation(): void {
    if (!this.rdvASupprimerId) return;

    const motif = this.motifSelectionne === 'autre' ? this.autreMotif : this.motifSelectionne;

    if (!motif || motif.trim() === '') {
      alert('Veuillez sélectionner ou préciser un motif.');
      return;
    }

    this.rendezVousService.annulerRendezVous(this.rdvASupprimerId, motif).subscribe({
      next: () => {
        forkJoin([
          this.notificationsService.envoyerNotificationAnnulationPatient(this.rdvASupprimerId!),
          this.notificationsService.envoyerNotificationAnnulationMedecin(this.rdvASupprimerId!)
        ]).subscribe({
          next: () => {
            this.rendezvousAVenir = this.rendezvousAVenir.filter(rdv => rdv.id !== this.rdvASupprimerId);

            const modalElement = document.getElementById('annulationModal');
            if (modalElement) {
              const modal = Modal.getInstance(modalElement);
            if (modal) modal.hide();

            }
            this.router.navigate(['/patient/appointment']);
          },
          error: () => {
            alert("Erreur lors de l'envoi des notifications d'annulation.");
          }
        });
      },
      error: () => {
        alert("Une erreur est survenue lors de l'annulation.");
      }
    });
  }

  modifierRdv(id: number): void {
    this.router.navigate(['/patient/creneau']);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}





/**import { Component, OnInit } from '@angular/core';
import { RendezVous } from 'src/app/features/admin/models/rendez-vous.model';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rendezvous',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class RendezvousComponent implements OnInit {
  rendezvousAVenir: RendezVous[] = [];
  rendezvousPasses: RendezVous[] = [];
  loading = false;
  error = '';

  ongletActif: 'avenir' | 'passes' = 'avenir';

  constructor(
    private rendezVousService: RendezVousService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRendezvous();
  }

  loadRendezvous(): void {
    this.loading = true;
    this.error = '';

    this.rendezVousService.getAllRendezVous().subscribe({
      next: (data) => {
        const now = new Date();

        // On combine la date et l'heure (time) pour comparer précisément
        const dateTimeFromRdv = (rdv: RendezVous): Date => {
          return new Date(`${rdv.creneau.date.toISOString().split('T')[0]}T${rdv.time}`);
        };

        this.rendezvousAVenir = data.filter(rdv => dateTimeFromRdv(rdv) >= now && rdv.statut === 'confirmé');
        this.rendezvousPasses = data.filter(rdv => dateTimeFromRdv(rdv) < now);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des rendez-vous.';
        this.loading = false;
      }
    });
  }

  selectOnglet(event: Event, onglet: 'avenir' | 'passes'): void {
    event.preventDefault();
    this.ongletActif = onglet;
  }

  annulerRdv(id: string): void {
    this.rendezVousService.annulerRendezVous(id).subscribe({
      next: () => {
        this.loadRendezvous();  // Recharge les données du backend après annulation
      },
      error: () => {
        this.error = 'Erreur lors de l\'annulation du rendez-vous.';
      }
    });
  }

  modifierRdv(id: string): void {
    // Tu peux adapter la route si besoin, ici un exemple générique
    this.router.navigate(['/patient/creneau', id]);
  }

  formatDate(dateStr: string | Date, timeStr?: string): string {
  const date = new Date(dateStr);
  if (timeStr) {
    // Si on a l'heure en string, on la concatène pour avoir date+heure exacte
    const [hours, minutes] = timeStr.split(':');
    date.setHours(+hours, +minutes);
  }
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

}
*/
