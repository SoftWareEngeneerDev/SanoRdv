import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../../medecin.service';

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

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const medecinId = user._id;

    if (medecinId) {
      this.loadAppointments(medecinId);
    } else {
      console.error("Identifiant médecin non trouvé !");
    }
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

  annulerRendezVous(appointment: Appointment): void {
   if (!appointment._id) return;

    this.medecinService.annulerRendezVous(appointment._id).subscribe({
        next: () => {
          // Met à jour le statut dans l'objet concerné
          appointment.statut = 'annulé';
          // Met à jour la modale si elle est ouverte
          if (this.selectedAppointment && this.selectedAppointment._id === appointment._id) {
            this.selectedAppointment.statut = 'annulé';
          }
          // 💥 Force Angular à détecter le changement dans le tableau
          this.filteredAppointments = [...this.filteredAppointments];
        },
        error: err => {
          console.error('Erreur annulation :', err);
        }
    });
  }

  confirmerRendezVous(appointment: Appointment): void {
   if (!appointment._id) return;

    this.medecinService.confirmerRendezVous(appointment._id).subscribe({
        next: () => {
          // Met à jour le statut dans l'objet concerné
          appointment.statut = 'confirmé';
          // Met à jour la modale si elle est ouverte
          if (this.selectedAppointment && this.selectedAppointment._id === appointment._id) {
            this.selectedAppointment.statut = 'confirmé';
          }
          // 💥 Force Angular à détecter le changement dans le tableau
          this.filteredAppointments = [...this.filteredAppointments];
        },
        error: err => {
          console.error('Erreur annulation :', err);
        }
    });
  }

  modifierRendezVous(appointment: Appointment): void {
    if (!appointment._id) return;

    const nouveauMotif = prompt("Entrez le nouveau motif du rendez-vous :", appointment.motif);

    if (nouveauMotif && nouveauMotif.trim() !== '' && nouveauMotif !== appointment.motif) {
      this.medecinService.modifierRendezVous(appointment._id, { motif: nouveauMotif }).subscribe({
        next: () => {
          appointment.motif = nouveauMotif;
          alert("Rendez-vous modifié avec succès.");
          this.closeModal();
        },
        error: (err) => {
          console.error("Erreur lors de la modification :", err);
          alert("Échec de la modification du rendez-vous.");
        }
      });
    }
  }
}
