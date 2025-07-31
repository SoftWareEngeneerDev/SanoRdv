import { Component, OnInit } from '@angular/core';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { RendezVous } from '../../../../shared/models/rdv-model';

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
  message: string = '';

  ongletActif: 'avenir' | 'passes' = 'avenir';

  // Modal d'annulation
  rdvASupprimer: RendezVous | null = null;
  motifs: string[] = ['Indisponibilité', 'Erreur de prise', 'Problème personnel'];
  motifSelectionne: string = '';
  autreMotif: string = '';
  patient: any;
  medecin: any;

  constructor(
    private rendezVousService: RendezVousService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const confirmationMessage = localStorage.getItem('confirmationMessage');
    if (confirmationMessage) {
      this.message = confirmationMessage;
      localStorage.removeItem('confirmationMessage');
      setTimeout(() => (this.message = ''), 5000);
    }
    this.loadRendezvous();
  }

  loadRendezvous(): void {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) {
      this.error = 'Patient non connecté';
      return;
    }

    this.error = '';
    this.loading = true;

    this.rendezVousService.getRendezVousByPatient(patientId).subscribe({
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

  annulerRdv(rdv: RendezVous): void {
    console.log('Rdv sélectionné pour annulation:', rdv);
    this.rdvASupprimer = rdv;
    this.motifSelectionne = '';
    this.autreMotif = '';

    const modalElement = document.getElementById('annulationModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

    confirmerAnnulation(): void {
    if (!this.rdvASupprimer) return;

    console.log('rdvASupprimer complet:', this.rdvASupprimer);

    const motif = this.motifSelectionne === 'autre' ? this.autreMotif : this.motifSelectionne;
    if (!motif || motif.trim() === '') {
      alert('Veuillez sélectionner ou préciser un motif.');
      return;
    }

    const patientId = localStorage.getItem('patientId');
    if (!patientId) {
      alert('Patient non connecté.');
      return;
    }

    // Récupération sécurisée du timeSlotId
    let timeSlotId: string | undefined;
    const ts = this.rdvASupprimer.timeSlotId;

    if (typeof ts === 'string') {
      timeSlotId = ts;
    } else if (Array.isArray(ts) && ts.length > 0) {
      timeSlotId = typeof ts[0] === 'string' ? ts[0] : ts[0]?._id || ts[0]?.id;
    } else if (typeof ts === 'object' && ts !== null) {
      timeSlotId = ts._id || ts.id;
    }

    const creneauId = this.rdvASupprimer.creneauId || this.rdvASupprimer._id?.toString();

    if (!creneauId || !timeSlotId) {
      alert('Données du rendez-vous incomplètes (creneauId ou timeSlotId manquant).');
      console.error(' creneauId ou timeSlotId manquant:', { creneauId, timeSlotId });
      return;
    }

    this.rendezVousService.annulerRendezVous({
      creneauId,
      timeSlotId,
      userId: patientId,
      userType: 'patient',
      motifAnnulation: motif
    }).subscribe({
      next: () => {
        const creneauIdNumber = typeof creneauId === 'string' ? parseInt(creneauId, 10) : creneauId;

        this.notificationsService.envoyerNotificationAnnulationPatient(creneauIdNumber).subscribe();
        this.notificationsService.envoyerNotificationAnnulationMedecin(creneauIdNumber).subscribe();

        const modalElement = document.getElementById('annulationModal');
        if (modalElement) {
          const modal = Modal.getInstance(modalElement);
          modal?.hide();
        }

        this.loadRendezvous();
        this.message = 'Rendez-vous annulé avec succès.';
        setTimeout(() => (this.message = ''), 5000);
      },
      error: (err) => {
        console.error('Erreur lors de l\'annulation:', err);
        alert('Une erreur est survenue lors de l\'annulation.');
      }
    });
  }


  modifierRdv(rdv: RendezVous): void {
    if (!rdv.agenda?.medecin?._id) {
      alert('Médecin non disponible pour ce rendez-vous.');
      return;
    }

    const patientId = localStorage.getItem('patientId');
    if (!patientId) {
      alert('Patient non connecté.');
      return;
    }

    localStorage.setItem('rdvAModifier', rdv._id.toString());

    this.router.navigate(
      ['/patient/creneau', rdv.agenda.medecin._id, patientId],
      { queryParams: { modification: true } }
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
