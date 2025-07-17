import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../models/rendez-vous.model';
import { RendezVousService } from '../../services/rendez-vous.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.component.html',
  styleUrls: ['./rendez-vous.component.css']
})
export class RendezVousComponent implements OnInit {
  rendezVousListe: RendezVous[] = [];
  filteredRendezVous: RendezVous[] = [];
  searchTerm = '';
  chargement = true;

  rendezVousAAnnulerId: string = '';
  motifSelectionne: string = '';
  autreMotif: string = '';
  motifs: string[] = ['Patient indisponible', 'Médecin absent', 'Problème technique', 'Autre'];

  private modalInstance: bootstrap.Modal | null = null;

  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
    this.chargerRendezVous();

    const modalElement = document.getElementById('annulationModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement, { backdrop: 'static' });
    }
  }

  chargerRendezVous(): void {
    this.chargement = true;
    this.rendezVousService.getTousLesRendezVousPourAdmin().subscribe({
      next: (rendezVous) => {
        this.rendezVousListe = rendezVous
          .filter(rdv => rdv?.creneau?.date && rdv?.time)
          .map(rdv => {
  // On cast rdv.creneau.date en string ou Date explicitement
  const creneauDate = rdv.creneau.date as unknown;

  let dateISO: string = '';

  if (typeof creneauDate === 'string') {
    dateISO = creneauDate.substring(0, 10);
  } else if (creneauDate instanceof Date) {
    dateISO = creneauDate.toISOString().substring(0, 10);
  } else {
    // valeur par défaut ou erreur silencieuse
    dateISO = '';
  }

  const time = rdv.time;

  const dateHeure = (dateISO && time) ? new Date(`${dateISO}T${time}`) : undefined;

  return {
    ...rdv,
    id: rdv._id || rdv.id,
    dateHeure,
    patient: {
      ...rdv.patient,
      nomComplet: `${rdv.patient?.prenom ?? ''} ${rdv.patient?.nom ?? ''}`
    },
    medecin: {
      ...rdv.medecin,
      nomComplet: `${rdv.medecin?.prenom ?? ''} ${rdv.medecin?.nom ?? ''}`
    }
  };
});

        this.filteredRendezVous = [...this.rendezVousListe];
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur chargement des rendez-vous :', err);
        this.chargement = false;
      }
    });
  }

  searchRendezVous(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRendezVous = [...this.rendezVousListe];
      return;
    }
    const terme = this.searchTerm.toLowerCase();
    this.filteredRendezVous = this.rendezVousListe.filter(rdv =>
      rdv.patient.nomComplet?.toLowerCase().includes(terme) ||
      rdv.medecin.nom?.toLowerCase().includes(terme)
    );
  }

  ouvrirAnnulationModal(rdvId: string): void {
    console.log('Ouverture modal pour RDV ID:', rdvId);
    this.rendezVousAAnnulerId = rdvId;
    this.motifSelectionne = '';
    this.autreMotif = '';
    this.modalInstance?.show();
  }

  getMotifFinal(): string {
    return this.motifSelectionne.toLowerCase() === 'autre' ? this.autreMotif.trim() : this.motifSelectionne;
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

  this.rendezVousService.annulerRendezVous(this.rendezVousAAnnulerId, {
    motif: motifFinal
  }).subscribe({
    next: () => {
      alert("Rendez-vous annulé avec succès.");
      this.chargerRendezVous(); // Recharge la liste après annulation
      this.rendezVousAAnnulerId = '';
      this.motifSelectionne = '';
      this.autreMotif = '';
      this.modalInstance?.hide(); // Ferme le modal
    },
    error: (err) => {
      console.error('Erreur lors de l’annulation :', err);
      alert(err.error?.message || "Une erreur est survenue lors de l’annulation.");
    }
  });
}


  getStatusClass(statut: string): string {
    switch (statut.toLowerCase()) {
      case 'confirmé': return 'bg-success';
      case 'annulé': return 'bg-danger';
      default: return 'bg-info';
    }
  }

  formaterDateFrancais(dateHeure: Date | string | undefined): string {
    if (!dateHeure) return 'Date inconnue';

    const dateObj = new Date(dateHeure);
    if (isNaN(dateObj.getTime())) return 'Date invalide';

    const jour = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const heure = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });

    return `${jour} à ${heure}`;
  }
}
