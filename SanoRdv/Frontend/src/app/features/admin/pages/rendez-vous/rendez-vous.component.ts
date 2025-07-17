/**import { Component, OnInit } from '@angular/core';
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
*/





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
    this.rendezVousService.getTousLesRendezVousPourAdmin().subscribe({
      next: (rendezVous) => {
        // Traitement pour ajouter `dateHeure` et `nomComplet`
        this.rendezVousListe = rendezVous.map(rdv => ({
          ...rdv,
          dateHeure: new Date(`${rdv.creneau.date}T${rdv.time}`),
          patient: {
            ...rdv.patient,
            nomComplet: `${rdv.patient.prenom} ${rdv.patient.nom}`
          }
        }));
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

  annulerRendezVous(rdvId: string): void {
    const userId = localStorage.getItem('userId'); // Ou depuis ton authService

    if (!userId) {
      alert("Utilisateur non identifié.");
      return;
    }

    this.rendezVousService.annulerRendezVous(rdvId, userId).subscribe({
      next: () => {
        alert("Rendez-vous annulé.");
        this.chargerRendezVous();
      },
      error: (err) => {
        console.error('Erreur annulation:', err);
        alert(err.error?.message || "Erreur d'annulation.");
      }
    });
  }

  getStatusClass(statut: string): string {
    switch (statut.toLowerCase()) {
      case 'confirmé': return 'bg-success';
      case 'en attente': return 'bg-warning text-dark';
      case 'annulé': return 'bg-danger';
      case 'terminé': return 'bg-secondary';
      default: return 'bg-info';
    }
  }

  formaterDateFrancais(date: Date | string, time: string): string {
  const dateTime = new Date(`${date}T${time}`);
  return dateTime.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


}

   




