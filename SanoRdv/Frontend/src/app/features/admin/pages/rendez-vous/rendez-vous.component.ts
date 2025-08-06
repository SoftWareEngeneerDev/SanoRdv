// import { Component, OnInit } from '@angular/core';
// import { RendezVous } from '../../models/rendez-vous.model';
// import { RendezVousService } from '../../services/rendez-vous.service';
// import * as bootstrap from 'bootstrap';

// @Component({
//   selector: 'app-rendez-vous',
//   templateUrl: './rendez-vous.component.html',
//   styleUrls: ['./rendez-vous.component.css']
// })
// export class RendezVousComponent implements OnInit {
//   rendezVousListe: RendezVous[] = [];
//   filteredRendezVous: RendezVous[] = [];
//   searchTerm = '';
//   chargement = true;

//   // Annulation
//   rendezVousAAnnulerId: string = '';
//   motifSelectionne: string = '';
//   autreMotif: string = '';
//   motifs: string[] = ['Patient indisponible', 'Médecin absent', 'Problème technique', 'Autre'];

//   private modalInstance: bootstrap.Modal | null = null;

//   constructor(private rendezVousService: RendezVousService) {}

//   ngOnInit(): void {
//     this.initialiserModal();
//     this.chargerRendezVous();
//   }

//   private initialiserModal(): void {
//     const modalElement = document.getElementById('annulationModal');
//     if (modalElement) {
//       this.modalInstance = new bootstrap.Modal(modalElement, { backdrop: 'static' });
//     }
//   }

//   chargerRendezVous(): void {
//     this.chargement = true;
//     this.rendezVousService.getTousLesRendezVousPourAdmin().subscribe({
//       next: (rendezVous) => {
//         this.rendezVousListe = rendezVous
//           .filter(rdv => rdv?.creneau?.date && rdv?.time)
//           .map(rdv => this.mapperRendezVous(rdv));

//         this.filteredRendezVous = [...this.rendezVousListe];
//         this.chargement = false;
//       },
//       error: (err) => {
//         console.error('Erreur chargement des rendez-vous :', err);
//         this.chargement = false;
//       }
//     });
//   }

//   private mapperRendezVous(rdv: any): RendezVous {
//     const creneauDate = rdv.creneau.date as unknown;
//     let dateISO = '';

//     if (typeof creneauDate === 'string') {
//       dateISO = creneauDate.substring(0, 10);
//     } else if (creneauDate instanceof Date) {
//       dateISO = creneauDate.toISOString().substring(0, 10);
//     }

//     const dateHeure = dateISO && rdv.time ? new Date(`${dateISO}T${rdv.time}`) : undefined;

//     return {
//       ...rdv,
//       id: rdv._id || rdv.id,
//       dateHeure,
//       patient: {
//         ...rdv.patient,
//         nomComplet: `${rdv.patient?.prenom ?? ''} ${rdv.patient?.nom ?? ''}`
//       },
//       medecin: {
//         ...rdv.medecin,
//         nomComplet: `${rdv.medecin?.prenom ?? ''} ${rdv.medecin?.nom ?? ''}`
//       }
//     };
//   }

//   searchRendezVous(): void {
//     const terme = this.searchTerm.trim().toLowerCase();

//     if (!terme) {
//       this.filteredRendezVous = [...this.rendezVousListe];
//       return;
//     }

//     this.filteredRendezVous = this.rendezVousListe.filter(rdv =>
//       rdv.patient.nomComplet?.toLowerCase().includes(terme) ||
//       rdv.medecin.nom?.toLowerCase().includes(terme)
//     );
//   }

//   ouvrirAnnulationModal(rdvId: string): void {
//     this.rendezVousAAnnulerId = rdvId;
//     this.motifSelectionne = '';
//     this.autreMotif = '';
//     this.modalInstance?.show();
//   }

//   confirmerAnnulation(): void {
//     const motifFinal = this.getMotifFinal();

//     if (!this.rendezVousAAnnulerId) {
//       alert("Aucun rendez-vous sélectionné.");
//       return;
//     }

//     if (!motifFinal) {
//       alert("Veuillez spécifier un motif d'annulation.");
//       return;
//     }

//     this.rendezVousService.annulerRendezVous(this.rendezVousAAnnulerId, { motif: motifFinal }).subscribe({
//       next: () => {
//         alert("Rendez-vous annulé avec succès.");
//         this.modalInstance?.hide();
//         this.reinitialiserAnnulation();
//         this.chargerRendezVous();
//       },
//       error: (err) => {
//         console.error('Erreur lors de l’annulation :', err);
//         alert(err.error?.message || "Une erreur est survenue lors de l’annulation.");
//       }
//     });
//   }

//   private reinitialiserAnnulation(): void {
//     this.rendezVousAAnnulerId = '';
//     this.motifSelectionne = '';
//     this.autreMotif = '';
//   }

//   getMotifFinal(): string {
//     return this.motifSelectionne.toLowerCase() === 'autre'
//       ? this.autreMotif.trim()
//       : this.motifSelectionne;
//   }

//   getStatusClass(statut: string): string {
//     switch (statut.toLowerCase()) {
//       case 'confirmé':
//         return 'bg-success';
//       case 'annulé':
//         return 'bg-danger';
//       default:
//         return 'bg-secondary';
//     }
//   }

//   formaterDateFrancais(dateHeure: Date | string | undefined): string {
//     if (!dateHeure) return 'Date inconnue';

//     const dateObj = new Date(dateHeure);
//     if (isNaN(dateObj.getTime())) return 'Date invalide';

//     const jour = dateObj.toLocaleDateString('fr-FR', {
//       weekday: 'long',
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric'
//     });

//     const heure = dateObj.toLocaleTimeString('fr-FR', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false
//     });

//     return `${jour} à ${heure}`;
//   }
// }import { Component, OnInit } from '@angular/core';




import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { RendezVousService } from '../../services/rendez-vous.service';
import { Creneau } from '../../models/rendez-vous.model';
import { Patient } from '../../models/patient.model';
import { Medecin } from '../../models/medecin.model';
import { Modal } from 'bootstrap';

interface RendezVousAffiche {
  id: string;
  date?: string | Date;
  status: string;
  patient: Patient & { nomComplet?: string };
  medecin: Medecin & { nomComplet?: string };
  dateReservation?: string | Date;
}

@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.component.html',
  styleUrls: ['./rendez-vous.component.css']
})
export class RendezVousComponent implements OnInit, AfterViewInit {
  rendezVousListe: RendezVousAffiche[] = [];
  filteredRendezVous: RendezVousAffiche[] = [];
  chargement: boolean = false;
  searchTerm: string = '';

  rendezVousAAnnulerId: string = '';
  motifSelectionne: string = '';
  autreMotif: string = '';
  modalInstance: Modal | null = null;
  filtreDemande: string = 'tous';
  totalCreneauxRecuperes: number = 0;
  creneauxAvecReservation: number = 0;


  @ViewChild('annulationModal') annulationModalRef!: ElementRef;

  constructor(
    private rendezVousService: RendezVousService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerRendezVous();
  }

  ngAfterViewInit(): void {
    if (this.annulationModalRef) {
      this.modalInstance = new Modal(this.annulationModalRef.nativeElement);
    }
  }

  chargerRendezVous(filtre: string = 'tous'): void {
  this.filtreDemande = filtre;
  this.chargement = true;

  this.rendezVousService.getTousLesRendezVousPourAdmin(filtre).subscribe({
    next: (creneaux: Creneau[]) => {
      this.totalCreneauxRecuperes = creneaux.length;
      this.creneauxAvecReservation = creneaux.filter(c =>
        c.timeSlots?.some(ts => ts.status === 'reserve')
      ).length;

      const rdvs: RendezVousAffiche[] = [];

creneaux.forEach((creneau: any) => {
  const medecin = creneau.agenda?.medecin;

  creneau.timeSlots.forEach((ts: any) => {
    if (ts.status !== 'reserve') return;

    // Fusion date + heure
    const [hours, minutes] = ts.time?.split(':') ?? ['00', '00'];
    const fullDate = new Date(creneau.date);
    fullDate.setHours(parseInt(hours, 10));
    fullDate.setMinutes(parseInt(minutes, 10));

    const patient = ts.patientId;
    const dateReservation = ts.dateReservation ? new Date(ts.dateReservation) : undefined;

    rdvs.push({
      id: ts._id,
      date: fullDate.toISOString(),  // ✅ convertit l'objet Date en string ISO
      dateReservation,
      status: ts.status,
      patient: {
        _id: patient?._id ?? '',
        nom: patient?.nom ?? '',
        prenom: patient?.prenom ?? '',
        email: patient?.email ?? '',
        telephone: patient?.telephone ?? '',
        dateNaissance: patient?.dateNaissance ?? '',
        sex: patient?.sex ?? 'non spécifié',
        isActive: patient?.isActive ?? true,
        nomComplet: `${patient?.prenom ?? ''} ${patient?.nom ?? ''}`.trim()
      },
      medecin: {
        _id: medecin?._id ?? '',
        nom: medecin?.nom ?? '',
        prenom: medecin?.prenom ?? '',
        email: medecin?.email ?? '',
        telephone: medecin?.telephone ?? '',
        specialite: medecin?.specialite ?? '',
        anneeExperience: medecin?.anneeExperience ?? 0,
        nomComplet: `${medecin?.prenom ?? ''} ${medecin?.nom ?? ''}`.trim()
      }
    });
  });
});


      this.rendezVousListe = rdvs;
      this.rechercher(this.searchTerm);
      this.chargement = false;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des rendez-vous :', err);
      this.chargement = false;
    }
  });
}


  voirDetailRendezVous(rendezVous: RendezVousAffiche): void {
    this.router.navigate(['/admin/detail-rendez-vous', rendezVous.id]);
  }

  rechercher(term: string = ''): void {
    this.searchTerm = term.toLowerCase().trim();
    this.filteredRendezVous = this.rendezVousListe.filter(rdv => {
      const patient = rdv.patient?.nomComplet?.toLowerCase() ?? '';
      const medecin = rdv.medecin?.nomComplet?.toLowerCase() ?? '';
      return patient.includes(this.searchTerm) || medecin.includes(this.searchTerm);
    });
  }

  ouvrirAnnulationModal(rdvId: string): void {
    this.rendezVousAAnnulerId = rdvId;
    this.motifSelectionne = '';
    this.autreMotif = '';
    this.modalInstance?.show();
  }

  confirmerAnnulation(): void {
    const motifFinal = this.getMotifFinal();

    if (!this.rendezVousAAnnulerId) {
      alert("Aucun rendez-vous sélectionné.");
      return;
    }

    if (!motifFinal) {
      alert("Veuillez spécifier un motif d'annulation.");
      return;
    }

    this.rendezVousService.annulerRendezVous(this.rendezVousAAnnulerId, { motif: motifFinal }).subscribe({
      next: () => {
        this.modalInstance?.hide();
        this.reinitialiserAnnulation();
        this.chargerRendezVous();
      },
      error: (err) => {
        console.error('Erreur lors de l’annulation :', err);
        alert(err.error?.message || "Une erreur est survenue lors de l’annulation.");
      }
    });
  }

  private reinitialiserAnnulation(): void {
    this.rendezVousAAnnulerId = '';
    this.motifSelectionne = '';
    this.autreMotif = '';
  }

  getMotifFinal(): string {
    return this.motifSelectionne.toLowerCase() === 'autre'
      ? this.autreMotif.trim()
      : this.motifSelectionne;
  }
  searchRendezVous(): void {
    this.rechercher(this.searchTerm);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmé':
        return 'bg-success';
      case 'annulé':
        return 'bg-danger';
      case 'reserve':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  formaterDateFrancais(dateReservation: Date | string | undefined): string {
    if (!dateReservation) return 'Date inconnue';

    const dateObj = new Date(dateReservation);
    if (isNaN(dateObj.getTime())) return 'Date invalide';

    const jour = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const heure = dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${jour} à ${heure}`;
  }
}

