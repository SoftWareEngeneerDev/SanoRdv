import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../../medecin.service';

interface Appointment {
  _id: string;
  time: string;
  motif: string;
  statut: 'confirmé' | 'annulé';
  patient: {
    nom: string;
    prenom: string;
    email: string;
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
  query: string = '';

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const medecinId = '64bfb40c4cb1d174d3b1bcf0'; // Remplace ceci dynamiquement si besoin
    this.medecinService.getRendezVousParMedecin(medecinId).subscribe({
      next: (groupedData) => {
        const allRdv: Appointment[] = [];
        Object.values(groupedData).forEach((rdvList: any) => {
          allRdv.push(...(rdvList as Appointment[]));
        });
        this.appointments = allRdv;
        this.filteredAppointments = [...this.appointments];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous', err);
      }
    });
  }

  viewAppointmentDetails(appointment: Appointment): void {
    this.selectedAppointment = { ...appointment };
  }

  closeModal(): void {
    this.selectedAppointment = null;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
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
}
