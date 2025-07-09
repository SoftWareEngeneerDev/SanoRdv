import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../medecin.service';

@Component({
  selector: 'app-my-appointment',
  templateUrl: './my-appointment.component.html',
  styleUrls: ['./my-appointment.component.css']
})
export class MyAppointmentComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  selectedAppointment: any = null;
  showModal = false;

  filters = {
    patient: '',
    date: '',
    status: ''
  };

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.medecinService.getRendezVousDuJour().subscribe({
      next: (data) => {
        this.appointments = data;
        this.filteredAppointments = [...this.appointments];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous :', err);
      }
    });
  }

  formatDate(dateStr: string): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    };
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
  }

  getStatusClass(status: string): string {
    return {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled'
    }[status] || '';
  }

  getStatusText(status: string): string {
    return {
      pending: '⏳ En attente',
      confirmed: '✅ Confirmé',
      cancelled: '❌ Annulé'
    }[status] || '';
  }

  searchAppointments(): void {
    const { patient, date, status } = this.filters;
    this.filteredAppointments = this.appointments.filter(rdv =>
      (!patient || rdv.patientName.toLowerCase().includes(patient.toLowerCase())) &&
      (!date || rdv.date === date) &&
      (!status || rdv.status === status)
    );
  }

  resetSearch(): void {
    this.filters = { patient: '', date: '', status: '' };
    this.filteredAppointments = [...this.appointments];
  }

  viewAppointmentDetails(appointment: any): void {
    this.selectedAppointment = appointment;
    this.showModal = true;
  }

  closeAppointmentDetailsModal(): void {
    this.selectedAppointment = null;
    this.showModal = false;
  }

  confirmAppointment(id: number): void {
    const appointment = this.appointments.find(r => r.id === id);
    if (appointment) {
      appointment.status = 'confirmed';
      this.closeAppointmentDetailsModal();
      this.searchAppointments();
    }
  }

  cancelAppointment(id: number): void {
    const appointment = this.appointments.find(r => r.id === id);
    if (appointment) {
      appointment.status = 'cancelled';
      this.closeAppointmentDetailsModal();
      this.searchAppointments();
    }
  }
}
