import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../models/rendez-vous.model';
import { RendezVousService } from '../../services/rendez-vous.service';

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

  annulerRendezVous(id: number): void {
    // Implémentez la logique d'annulation ici
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
