import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../../../shared/models/rdv-model';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Modal } from 'bootstrap';

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
  rdvASupprimerId: string | null = null;
  rdvCreneauId: string | null = null; // <- Ajouté pour corriger l'erreur TS
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
    this.error = '';
    this.loading = true;

    this.rendezVousService.getAllRendezVous().subscribe({
      next: (data) => {
        const now = new Date();

        this.rendezvousAVenir = data.filter(rdv => new Date(rdv.date) >= now);
        this.rendezvousPasses = data.filter(rdv => new Date(rdv.date) < now);

        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des rendez-vous.';
        this.loading = false;
      }
    });
  }

  selectOnglet(event: Event, onglet: 'avenir' | 'passes'): void {
    event.preventDefault();
    this.ongletActif = onglet;
  }

  annulerRdv(timeSlotId: string): void {
    this.rdvASupprimerId = timeSlotId;

    // Recherche du créneau parent du rendez-vous
    const rdv = this.rendezvousAVenir.find(r => r.id.toString() === timeSlotId);
    this.rdvCreneauId = rdv?.creneauId?.toString() ?? null;

    this.motifSelectionne = '';
    this.autreMotif = '';

    const modalElement = document.getElementById('annulationModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  confirmerAnnulation(): void {
    if (!this.rdvASupprimerId || !this.rdvCreneauId) return;

    const motif = this.motifSelectionne === 'autre' ? this.autreMotif : this.motifSelectionne;

    if (!motif || motif.trim() === '') {
      alert('Veuillez sélectionner ou préciser un motif.');
      return;
    }

    const idNumber = Number(this.rdvASupprimerId);

    this.rendezVousService.annulerRendezVous(this.rdvCreneauId, this.rdvASupprimerId, motif).subscribe({
      next: () => {
        forkJoin([
          this.notificationsService.envoyerNotificationAnnulationPatient(idNumber),
          this.notificationsService.envoyerNotificationAnnulationMedecin(idNumber)
        ]).subscribe({
          next: () => {
            this.rendezvousAVenir = this.rendezvousAVenir.filter(rdv => String(rdv.id) !== this.rdvASupprimerId);

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

  modifierRdv(id: string): void {
    this.router.navigate(['/patient/modifier-rdv', id]);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
