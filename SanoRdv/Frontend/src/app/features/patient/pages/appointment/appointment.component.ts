// import { Component, OnInit } from '@angular/core';
// import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
// import { NotificationsService } from '../../../../shared/services/notifications.service';
// import { Router } from '@angular/router';
// import { Modal } from 'bootstrap';
// import { RendezVous } from '../../../../shared/models/rdv-model';

// @Component({
//   selector: 'app-rendezvous',
//   templateUrl: './appointment.component.html',
//   styleUrls: ['./appointment.component.css']
// })
// export class RendezvousComponent implements OnInit {
//   rendezvousAVenir: RendezVous[] = [];
//   rendezvousPasses: RendezVous[] = [];
//   loading = false;
//   error = '';
//   message = '';
//   ongletActif: 'avenir' | 'passes' = 'avenir';

//   rdvASupprimer: RendezVous | null = null;
//   motifs: string[] = ['Indisponibilité', 'Erreur de prise', 'Problème personnel'];
//   motifSelectionne = '';
//   autreMotif = '';

//   constructor(
//     private rendezVousService: RendezVousService,
//     private notificationsService: NotificationsService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     const confirmationMessage = localStorage.getItem('confirmationMessage');
//     if (confirmationMessage) {
//       this.message = confirmationMessage;
//       localStorage.removeItem('confirmationMessage');
//       setTimeout(() => (this.message = ''), 5000);
//     }

//     this.loadRendezvous();
//   }

//   loadRendezvous(): void {
//     const patientId = localStorage.getItem('patientId');
//     if (!patientId) {
//       this.error = 'Patient non connecté';
//       return;
//     }

//     this.loading = true;
//     this.error = '';

//     this.rendezVousService.getRendezVousByPatient(patientId).subscribe({
//       next: (data) => {
//         console.log('🚀 Données reçues depuis le service :', data);
//         const now = new Date();

//         const transformedRdvs = data.map((rdv: any) => {
//           let fullDateTime: Date | null = null;

//           try {
//             // Priorité 1 : dateHeureISO (fiable)
//             if (rdv.dateHeureISO) {
//               const iso = new Date(rdv.dateHeureISO);
//               if (!isNaN(iso.getTime())) {
//                 fullDateTime = iso;
//               }
//             }

//             // Priorité 2 : creneau.date + time (local)
//             if (!fullDateTime && rdv.time && (rdv.creneau?.date || rdv.date)) {
//               const baseDate = new Date(rdv.creneau?.date || rdv.date);
//               const [h, m] = rdv.time.split(':').map(Number);

//               fullDateTime = new Date(
//                 baseDate.getFullYear(),
//                 baseDate.getMonth(),
//                 baseDate.getDate(),
//                 h,
//                 m
//               );
//             }

//             // Priorité 3 : timeSlot.date + time
//             if (!fullDateTime && rdv.timeSlot?.date && rdv.time) {
//               const baseDate = new Date(rdv.timeSlot.date);
//               const [h, m] = rdv.time.split(':').map(Number);

//               fullDateTime = new Date(
//                 baseDate.getFullYear(),
//                 baseDate.getMonth(),
//                 baseDate.getDate(),
//                 h,
//                 m
//               );
//             }

//             if (!fullDateTime || isNaN(fullDateTime.getTime())) {
//               console.warn('⚠️ Date non définie ou invalide pour le RDV suivant :', rdv);
//               fullDateTime = new Date(); // fallback pour éviter crash
//             }
//           } catch (e) {
//             console.error('⛔ Erreur lors du parsing de la date pour RDV :', rdv, e);
//             fullDateTime = new Date();
//           }

//           const creneauId = rdv.creneau?._id || rdv.creneauId;
//           const timeSlotId = rdv.timeSlot?._id || rdv.timeSlotId;

//           return {
//             ...rdv,
//             creneauId,
//             timeSlotId,
//             fullDateTime
//           };
//         });

//         this.rendezvousAVenir = transformedRdvs.filter(rdv => rdv.fullDateTime >= now);
//         this.rendezvousPasses = transformedRdvs.filter(rdv => rdv.fullDateTime < now);

//         console.log('✅ RDVs à venir :', this.rendezvousAVenir);
//         console.log('✅ RDVs passés :', this.rendezvousPasses);

//         this.loading = false;
//       },
//       error: () => {
//         this.error = 'Erreur lors du chargement des rendez-vous.';
//         this.loading = false;
//       }
//     });
//   }

//   formatDateSafe(date: Date | null | undefined): string {
//     if (!date || isNaN(date.getTime())) return 'Date non définie';

//     return date.toLocaleDateString('fr-FR', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     }) + ' à ' + date.toLocaleTimeString('fr-FR', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false
//     });
//   }

//   selectOnglet(event: Event, onglet: 'avenir' | 'passes'): void {
//     event.preventDefault();
//     this.ongletActif = onglet;
//   }

//   annulerRdv(rdv: RendezVous): void {
//     console.log('Rendez-vous sélectionné:', rdv);
//     this.rdvASupprimer = rdv;
//     this.motifSelectionne = '';
//     this.autreMotif = '';

//     const modalElement = document.getElementById('annulationModal');
//     if (modalElement) {
//       const modal = new Modal(modalElement);
//       modal.show();
//     }
//   }

//   confirmerAnnulation(): void {
//     if (!this.rdvASupprimer) return;

//     const motif = this.motifSelectionne === 'autre' ? this.autreMotif : this.motifSelectionne;
//     if (!motif.trim()) {
//       alert('Veuillez sélectionner ou préciser un motif.');
//       return;
//     }

//     const patientId = localStorage.getItem('patientId');
//     if (!patientId) {
//       alert('Patient non connecté.');
//       return;
//     }

//     let timeSlotId: string | undefined;
//     const ts = this.rdvASupprimer.timeSlotId;

//     if (typeof ts === 'string') {
//       timeSlotId = ts;
//     } else if (Array.isArray(ts) && ts.length > 0) {
//       timeSlotId = typeof ts[0] === 'string' ? ts[0] : ts[0]?._id || ts[0]?.id;
//     } else if (typeof ts === 'object' && ts !== null) {
//       timeSlotId = ts._id || ts.id;
//     }

//     const creneauId = this.rdvASupprimer.creneauId || this.rdvASupprimer._id?.toString();

//     if (!creneauId || !timeSlotId) {
//       alert('Données du rendez-vous incomplètes.');
//       return;
//     }

//     this.rendezVousService.annulerRendezVous({
//       creneauId,
//       timeSlotId,
//       userId: patientId,
//       userType: 'patient',
//       motifAnnulation: motif
//     }).subscribe({
//       next: () => {
//         const idAsNumber = typeof creneauId === 'string' ? parseInt(creneauId, 10) : creneauId;
//         this.notificationsService.envoyerNotificationAnnulationPatient(idAsNumber).subscribe();
//         this.notificationsService.envoyerNotificationAnnulationMedecin(idAsNumber).subscribe();

//         const modalElement = document.getElementById('annulationModal');
//         if (modalElement) {
//           const modal = Modal.getInstance(modalElement);
//           modal?.hide();
//         }

//         this.loadRendezvous();
//         this.message = 'Rendez-vous annulé avec succès.';
//         setTimeout(() => (this.message = ''), 5000);
//       },
//       error: (err) => {
//         console.error('Erreur lors de l’annulation :', err);
//         alert('Erreur lors de l’annulation.');
//       }
//     });
//   }

//   modifierRdv(rdv: RendezVous): void {
//     const patientId = localStorage.getItem('patientId');
//     if (!patientId) {
//       alert('Patient non connecté.');
//       return;
//     }

//     if (!rdv.agenda?.medecin?._id) {
//       alert('Médecin non disponible pour ce rendez-vous.');
//       return;
//     }

//     localStorage.setItem('rdvAModifier', rdv._id.toString());

//     this.router.navigate(
//       ['/patient/creneau', rdv.agenda.medecin._id, patientId],
//       { queryParams: { modification: true } }
//     );
//   }

//   formatDate(date: Date | string): string {
//     const dt = typeof date === 'string' ? new Date(date) : date;
//     if (!dt || isNaN(dt.getTime())) return 'Date invalide';

//     return dt.toLocaleDateString('fr-FR', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     }) + ' à ' + dt.toLocaleTimeString('fr-FR', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false
//     });
//   }

//   trackByRdvId(index: number, rdv: RendezVous): string | number {
//     return rdv._id || index;
//   }
// }




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
  message = '';
  ongletActif: 'avenir' | 'passes' = 'avenir';

  rdvASupprimer: RendezVous | null = null;
  motifs: string[] = ['Indisponibilité', 'Erreur de prise', 'Problème personnel'];
  motifSelectionne = '';
  autreMotif = '';

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
      console.error('Patient non connecté : patientId manquant dans localStorage');
      return;
    }

    this.loading = true;
    this.error = '';

    this.rendezVousService.getRendezVousParPatient(patientId).subscribe({
      next: (data: RendezVous[]) => {
        console.log('🚀 Rendez-vous reçus du backend:', data);
        const now = new Date();

        this.rendezvousAVenir = data.filter(rdv => {
          if (!rdv.date) {
            console.warn('⚠️ RDV sans date détecté:', rdv);
            return false;
          }
          const rdvDate = new Date(rdv.date);
          if (isNaN(rdvDate.getTime())) {
            console.warn('⚠️ RDV avec date invalide:', rdv);
            return false;
          }
          return rdvDate >= now;
        });

        this.rendezvousPasses = data.filter(rdv => {
          if (!rdv.date) {
            console.warn('⚠️ RDV sans date détecté (passé):', rdv);
            return false;
          }
          const rdvDate = new Date(rdv.date);
          if (isNaN(rdvDate.getTime())) {
            console.warn('⚠️ RDV avec date invalide (passé):', rdv);
            return false;
          }
          return rdvDate < now;
        });

        console.log('✅ RDVs à venir filtrés:', this.rendezvousAVenir);
        console.log('✅ RDVs passés filtrés:', this.rendezvousPasses);

        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erreur lors du chargement des rendez-vous.';
        this.loading = false;
        console.error('❌ Erreur dans loadRendezvous:', err);
      }
    });
  }

  selectOnglet(event: Event, onglet: 'avenir' | 'passes'): void {
    event.preventDefault();
    this.ongletActif = onglet;
  }

  annulerRdv(rdv: RendezVous): void {
     console.log('Rendez-vous sélectionné:', rdv);
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

  const motif = this.motifSelectionne === 'autre' ? this.autreMotif : this.motifSelectionne;
  if (!motif.trim()) {
    alert('Veuillez sélectionner ou préciser un motif.');
    return;
  }

  const patientId = localStorage.getItem('patientId');
  if (!patientId) {
    alert('Patient non connecté.');
    return;
  }

  // Récupérer timeSlotId correctement
 let timeSlotId: string | undefined;

if (this.rdvASupprimer.id !== undefined && this.rdvASupprimer.id !== null) {
  timeSlotId = this.rdvASupprimer.id.toString();
} else if (this.rdvASupprimer.timeSlot?._id) {
  timeSlotId = this.rdvASupprimer.timeSlot._id;
} else if (this.rdvASupprimer.timeSlotId) {
  timeSlotId = this.rdvASupprimer.timeSlotId;
} else {
  alert('Impossible de trouver l’ID du timeSlot.');
  return;
}


  const creneauId = this.rdvASupprimer.creneauId || this.rdvASupprimer._id?.toString();

  if (!creneauId || !timeSlotId) {
    alert('Données du rendez-vous incomplètes.');
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
      this.notificationsService.envoyerNotificationAnnulationPatient(parseInt(creneauId, 10)).subscribe();
      this.notificationsService.envoyerNotificationAnnulationMedecin(parseInt(creneauId, 10)).subscribe();

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
      console.error('Erreur lors de l’annulation :', err);
      alert('Erreur lors de l’annulation.');
    }
  });
}

  modifierRdv(rdv: RendezVous): void {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) {
      alert('Patient non connecté.');
      return;
    }

    if (!rdv.agenda?.medecin?._id) {
      alert('Médecin non disponible pour ce rendez-vous.');
      return;
    }

    localStorage.setItem('rdvAModifier', rdv._id.toString());

    this.router.navigate(
      ['/patient/creneau', rdv.agenda.medecin._id, patientId],
      { queryParams: { modification: true } }
    );
  }

  formatDate(dateString: string, time?: string): string {
    if (!dateString) return 'Date inconnue';

    const date = new Date(dateString);
    let formatted = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (time) {
      formatted += ` à ${time}`;
    } else {
      formatted += ` à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return formatted;
  }

  trackByRdvId(index: number, rdv: RendezVous): string | number {
    return rdv._id || index;
  }
}




