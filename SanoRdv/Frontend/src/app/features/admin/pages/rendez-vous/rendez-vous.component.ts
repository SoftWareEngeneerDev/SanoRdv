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
  motifs: string[] = ['Patient indisponible', 'Médecin absent', 'Problème technique'];
motifSelectionne: string = '';
autreMotif: string = '';
rendezVousAAnnulerId: string | null = null;



  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
    this.chargerRendezVous();
  }

  chargerRendezVous(): void {
    this.rendezVousService.getRendezVous().subscribe({
      next: (rendezVous) => {
        this.rendezVousListe = rendezVous;
        this.filteredRendezVous = [...rendezVous];
        this.chargement = false;
      },
      error: () => this.chargement = false
    });
  }

  searchRendezVous(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRendezVous = [...this.rendezVousListe];
      return;
    }
    
    this.filteredRendezVous = this.rendezVousListe.filter(rdv => 
      rdv.patient.nomComplet.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      rdv.medecin.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  rendezVousASupprimer: any = null;

annulerRendezVous(id: number): void {
  this.rendezVousAAnnulerId = id.toString();
  this.motifSelectionne = '';
  this.autreMotif = '';
  const modalElement = document.getElementById('annulationModal');
  if (modalElement) {
    const bootstrapModal = new bootstrap.Modal(modalElement);
    bootstrapModal.show();
  }
}

confirmerAnnulation(): void {
  const motif = this.motifSelectionne === 'autre' ? this.autreMotif : this.motifSelectionne;

  if (!motif || !this.rendezVousAAnnulerId) {
    alert('Veuillez sélectionner un motif ou vérifier le rendez-vous.');
    return;
  }

  this.rendezVousService.annulerRendezVous(this.rendezVousAAnnulerId, motif).subscribe(() => {
    this.rendezVousAAnnulerId = null;
    const modal = bootstrap.Modal.getInstance(document.getElementById('annulationModal')!);
    modal?.hide();
    this.searchRendezVous();
  });
}



  getStatusClass(statut: string): string {
    switch (statut) {
      case 'Confirmé': return 'bg-success';
      case 'En attente': return 'bg-warning text-dark';
      case 'Annulé': return 'bg-danger';
      case 'Terminé': return 'bg-secondary';
      default: return 'bg-info';
    }
  }

  formaterDateFrancais(date: Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

}
