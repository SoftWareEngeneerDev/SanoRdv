import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../../../shared/models/rdv-model';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// @ts-ignore : Si Bootstrap n'est pas reconnu, à corriger via typings
declare var bootstrap: any;

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
    this.loading = true;
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
      const modal = new bootstrap.Modal(modalElement);
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
              const modal = bootstrap.Modal.getInstance(modalElement);
              modal.hide();
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
