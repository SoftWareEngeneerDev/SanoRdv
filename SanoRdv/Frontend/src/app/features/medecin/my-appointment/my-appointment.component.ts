// import { Component, OnInit } from '@angular/core';
// import { MedecinService } from '../medecin.service';

// interface Appointment {
//   id: number;
//   patientId: number;
//   patientName: string;
//   patientEmail: string;
//   patientPhone: string;
//   date: string;
//   time: string;
//   reason: string;
//   notes?: string;
//   status: 'pending' | 'confirmed' | 'cancelled';
// }

// @Component({
//   selector: 'app-my-appointment',
//   templateUrl: './my-appointment.component.html',
//   styleUrls: ['./my-appointment.component.css']
// })
// export class MyAppointmentComponent implements OnInit {
//   appointments: Appointment[] = [];
//   filteredAppointments: Appointment[] = [];
//   selectedAppointment: Appointment | null = null;

//   searchFilters = {
//     patientName: '',
//     date: '',
//     status: ''
//   };

//    // Champs de recherche
//   query: string = '';
//   suggestions: any[] = [];
//   nextLetters: string[] = [];
//   results: any[] = [];
//   medecinDetails: any[] = [];

//   ngOnInit(): void {
//     this.loadAppointments();
//   }

//   loadAppointments(): void {
//     // Données simulées — à remplacer par appel API réel
//     this.appointments = [
//       {
//         id: 1,
//         patientId: 101,
//         patientName: "Jean Dupont",
//         patientEmail: "jean.dupont@example.com",
//         patientPhone: "0123456789",
//         date: "2024-03-15",
//         time: "14:30",
//         reason: "Consultation générale",
//         notes: "Patient à risque - Allergie aux pénicillines",
//         status: "pending"
//       },
//       {
//         id: 2,
//         patientId: 102,
//         patientName: "Marie Martin",
//         patientEmail: "marie.martin@example.com",
//         patientPhone: "0987654321",
//         date: "2024-03-16",
//         time: "10:00",
//         reason: "Suivi post-opératoire",
//         notes: "Opération du genou droit le 02/03/2024",
//         status: "confirmed"
//       },
//       {
//         id: 3,
//         patientId: 103,
//         patientName: "Pierre Durand",
//         patientEmail: "pierre.durand@example.com",
//         patientPhone: "0654321987",
//         date: "2024-03-17",
//         time: "11:15",
//         reason: "Vaccination annuelle",
//         notes: "Vaccin contre la grippe nécessaire",
//         status: "pending"
//       },
//       {
//         id: 4,
//         patientId: 104,
//         patientName: "Sophie Lambert",
//         patientEmail: "sophie.lambert@example.com",
//         patientPhone: "0234567891",
//         date: "2024-03-18",
//         time: "16:45",
//         reason: "Bilan sanguin",
//         notes: "Vérifier taux de cholestérol",
//         status: "cancelled"
//       }
//     ];

//     this.filteredAppointments = [...this.appointments];
//   }

//   searchAppointments(): void {
//     const { patientName, date, status } = this.searchFilters;
//     this.filteredAppointments = this.appointments.filter(appt => {
//       const nameMatch = appt.patientName.toLowerCase().includes(patientName.toLowerCase());
//       const dateMatch = date ? appt.date === date : true;
//       const statusMatch = status ? appt.status === status : true;
//       return nameMatch && dateMatch && statusMatch;
//     });
//   }

//   resetSearch(): void {
//     this.searchFilters = { patientName: '', date: '', status: '' };
//     this.filteredAppointments = [...this.appointments];
//   }

//   viewAppointmentDetails(appointment: Appointment): void {
//     this.selectedAppointment = { ...appointment };
//   }

//   closeModal(): void {
//     this.selectedAppointment = null;
//   }

//   updateStatus(newStatus: 'pending' | 'confirmed' | 'cancelled'): void {
//     if (!this.selectedAppointment) return;
//     const index = this.appointments.findIndex(a => a.id === this.selectedAppointment!.id);
//     if (index !== -1) {
//       this.appointments[index].status = newStatus;
//       this.searchAppointments();
//       this.closeModal();
//     }
//   }

//   formatDate(dateStr: string): string {
//     return new Date(dateStr).toLocaleDateString('fr-FR', {
//       weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
//     });
//   }

//   getStatusClass(status: string): string {
//     return {
//       pending: 'status-pending',
//       confirmed: 'status-confirmed',
//       cancelled: 'status-cancelled'
//     }[status] || '';
//   }

//   getStatusLabel(status: string): string {
//     return {
//       pending: '⏳ En attente',
//       confirmed: '✅ Confirmé',
//       cancelled: '❌ Annulé'
//     }[status] || status;


//   }
// }



// src/app/medecin/my-appointment.component.ts
import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../medecin.service';

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

  // Filtrage par nom/prénom ou email dans le champ de recherche
  searchAppointments(): void {
    const lowerQuery = this.query.toLowerCase();
    this.filteredAppointments = this.appointments.filter(app =>
      app.patient.nom.toLowerCase().includes(lowerQuery) ||
      app.patient.prenom.toLowerCase().includes(lowerQuery) ||
      app.patient.email.toLowerCase().includes(lowerQuery) ||
      app.motif?.toLowerCase().includes(lowerQuery)
    );
  }
}
