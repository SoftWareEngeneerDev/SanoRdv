import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../medecin.service';
@Component({
  selector: 'app-creneaux',
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css']
})
export class CreneauxComponent implements OnInit {
  jours: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  medecinId = '123'; // à remplacer par ID dynamique plus tard

  nouveauCreneau = {
    jour: 'Lundi',
    heureDebut: '',
    heureFin: ''
  };

  creneaux: any[] = [];

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
    this.chargerCreneaux();
  }

  ajouterCreneau(): void {
    const payload = {
      ...this.nouveauCreneau,
      medecinId: this.medecinId
    };

    this.medecinService.ajouterCreneau(payload).subscribe({
      next: (res) => {
        this.chargerCreneaux();
        this.nouveauCreneau = { jour: 'Lundi', heureDebut: '', heureFin: '' };
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout', err);
      }
    });
  }

  supprimerCreneau(id: string): void {
    this.medecinService.supprimerCreneau(id).subscribe({
      next: () => this.chargerCreneaux(),
      error: (err) => console.error('Erreur suppression', err)
    });
  }

  chargerCreneaux(): void {
    // Simulation temporaire en attendant GET /creneaux/medecin/:id
    this.creneaux = [
      { _id: '1', jour: 'Lundi', heureDebut: '09:00', heureFin: '12:00' },
      { _id: '2', jour: 'Mercredi', heureDebut: '14:00', heureFin: '18:00' }
    ];
  }
}
