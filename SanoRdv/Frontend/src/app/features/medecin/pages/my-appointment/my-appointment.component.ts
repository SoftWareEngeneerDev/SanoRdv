import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../../medecin.service';

declare var bootstrap: any;

interface Appointment {
  date: any;
  _id: string;
  time: string;
  motif: string;
  statut: 'confirmé' | 'annulé';
  patient: {
    nom: string;
    prenom: string;
    email: string;
    telephone:string,
    _id: string;
  };
  creneau: {
    date: string;
    _id: string;
  };
}

@Component({
  selector: 'app-my-appointment',
  templateUrl: './my-appointment.component.html',
  styleUrls: ['./my-appointment.component.css']
})
export class MyAppointmentComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  recherche: string = '';

  motifSelectionne:string = '';
  motifs: string[] = ['Patient indisponible', 'Médecin absent', 'Problème technique', 'Autre'];
  autreMotif: string = '';
  rendezVousAAnnulerId: string = '';
  private modalInstance: bootstrap.Modal | null = null;

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const medecinId = user._id;

    if (medecinId) {
      this.loadAppointments(medecinId);
    } else {
      console.error("Identifiant médecin non trouvé !");
    }

     // Initialisation du modal Bootstrap
    const modalElement = document.getElementById('annulationModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
    }
  }

  getMotifFinal(): string {
    return this.motifSelectionne.toLowerCase() === 'autre' ? this.autreMotif.trim() : this.motifSelectionne;
  }

  filtrer(): void {
    const terme = this.recherche.toLowerCase().trim();

    this.filteredAppointments = this.appointments.filter(appointment =>
      appointment.patient.nom.toLowerCase().includes(terme) ||
      appointment.patient.prenom.toLowerCase().includes(terme) ||
      appointment.statut.toLowerCase().includes(terme) ||
      appointment.patient._id.toLowerCase().includes(terme)
    );
  }


 loadAppointments(medecinId: string): void {
    this.medecinService.getRendezVousParMedecin(medecinId).subscribe({
      next: (rendezVous: Appointment[]) => {
        this.appointments = rendezVous;
        this.filteredAppointments = [...this.appointments];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous', err);
      }
    });
  }

  viewAppointmentDetails(appointment: Appointment): void {
    console.log('Rendez-vous sélectionné :', appointment);
    this.selectedAppointment = { ...appointment };
  }

  closeModal(): void {
    this.selectedAppointment = null;
  }

  formatDate(dateInput: any): string {
    const date = new Date(dateInput); // Convertir en Date JS
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    return {
      'confirmé': 'status-confirmed',
      'annulé': 'status-cancelled'
    }[status] || '';
  }

 getStatusLabel(status: string): string {
    return {
      'confirmé': '✅ Confirmé',
      'annulé': '❌ Annulé'
    }[status] || status;
  }

ouvrirAnnulationModal(rdvId: string): void {
  console.log('Ouverture modal pour RDV ID:', rdvId);

  // Ferme le modal des détails
  // this.closeModal();

  // Préparer les données
  this.rendezVousAAnnulerId = rdvId;
  this.motifSelectionne = '';
  this.autreMotif = '';

  //Ouvrir le modal Bootstrap d’annulation
  if (this.modalInstance) {
    this.modalInstance.show();
  }
}

confirmerAnnulation(): void {
  const motifFinal = this.getMotifFinal();
  if (!motifFinal) {
    alert('Veuillez sélectionner ou préciser un motif.');
    return;
  }

  this.medecinService.annulerRendezVous(this.rendezVousAAnnulerId).subscribe({
    next: () => {
      const rdv = this.appointments.find(a => a._id === this.rendezVousAAnnulerId);
      if (rdv) {
        rdv.statut = 'annulé';
      }
      this.filteredAppointments = [...this.appointments];
      this.modalInstance?.hide();
    },
    error: err => console.error('Erreur lors de l’annulation :', err)
  });
}


}
