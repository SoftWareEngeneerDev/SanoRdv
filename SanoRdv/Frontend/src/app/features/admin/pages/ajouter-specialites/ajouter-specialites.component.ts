import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SpecialiteService } from '../../services/specialite.service';
import { Specialite } from '../../models/specialites.model';

@Component({
  selector: 'app-ajouter-specialites',
  templateUrl: './ajouter-specialites.component.html',
  styleUrls: ['./ajouter-specialites.component.css']
})
export class AjouterSpecialitesComponent {

      nouvelleSpecialite: Omit<Specialite, 'id' | 'nombreMedecins'> = {
    nom: '',
    description: ''
  };

  constructor(
    private specialiteService: SpecialiteService,
    private router: Router
  ) {}

  enregistrer(): void {
    if (!this.nouvelleSpecialite.nom.trim()) return;

    this.specialiteService.ajouterSpecialite({
      ...this.nouvelleSpecialite,
      nombreMedecins: 0
    }).subscribe({
      next: () => this.router.navigate(['admin/specialites']),
      error: (err) => console.error('Erreur lors de l\'ajout', err)
    });
  }

}
