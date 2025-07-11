import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../../../shared/models/rdv-model';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';
import { Router } from '@angular/router';

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

  // Onglet actif : 'avenir' ou 'passes' (initialisation par défaut)
  ongletActif: 'avenir' | 'passes' = 'avenir';

  constructor(private rendezVousService: RendezVousService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Option temporaire pour tests IHM
    this.chargerRendezvousMock();

  }

  // Données mock pour test IHM
  chargerRendezvousMock(): void {
    this.loading = false;
    this.error = '';

    this.rendezvousAVenir = [
      {
        id: 1,
        date: '2025-06-28T10:30:00',
        status: 'confirmé',
        medecin: {
          nom: 'Dr. Fatou Traoré',
          specialite: 'Dermatologie'
        }
      },
      {
        id: 2,
        date: '2025-06-29T15:00:00',
        status: 'confirmé',
        medecin: {
          nom: 'Dr. Issa Kaboré',
          specialite: 'Cardiologie'
        }
      }
    ];

    this.rendezvousPasses = [
      {
        id: 3,
        date: '2025-06-15T09:00:00',
        status: 'passé',
        medecin: {
          nom: 'Dr. Salif Ouédraogo',
          specialite: 'Pédiatrie'
        }
      }
    ];
  }

  // Utilisation backend réel
  loadRendezvous(): void {
    this.loading = true;
    this.error = '';

    this.rendezVousService.getAllRendezVous().subscribe({
      next: (data) => {
        const now = new Date();
        this.rendezvousAVenir = data.filter(rdv => new Date(rdv.date) >= now);
        this.rendezvousPasses = data.filter(rdv => new Date(rdv.date) < now);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des rendez-vous.';
        this.loading = false;
      }
    });
  }

  // Méthode appelée depuis le HTML pour changer l’onglet (avec preventDefault)
  selectOnglet(event: Event, onglet: 'avenir' | 'passes'): void {
    event.preventDefault();
    this.ongletActif = onglet;
  }

  // Annulation de rendez-vous
  annulerRdv(id: number): void {
    this.rendezVousService.annulerRendezVous(id).subscribe(() => {
      // Recharger les données après annulation
      this.chargerRendezvousMock(); // ou this.loadRendezvous()
    });
  }

  // Modification d’un RDV
 modifierRdv(id: number) {
    this.router.navigate(['/patient/creneau']);
  }


  // Formatage de la date
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
