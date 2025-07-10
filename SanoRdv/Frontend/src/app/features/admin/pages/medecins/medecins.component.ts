import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedecinService } from '../../services/medecin.service';
import { Medecin } from '../../models/medecin.model';

@Component({
  selector: 'app-medecins',
  templateUrl: './medecins.component.html',
  styleUrls: ['./medecins.component.css']
})
export class MedecinsComponent implements OnInit {

      medecins: Medecin[] = [];

  constructor(
    private router: Router,
    private medecinService: MedecinService
  ) {}

  ngOnInit(): void {
    this.chargerMedecins();
  }

  chargerMedecins(): void {
    this.medecinService.getMedecins().subscribe(data => {
      this.medecins = data;
    });
  }

  ajouterMedecin(): void {
    this.router.navigate(['/admin/ajouter-medecin']);
  }

  modifier(medecin: Medecin): void {
    this.router.navigate(['/admin/ajouter-medecin'], { queryParams: { id: medecin.id } });
  }

  supprimer(medecin: Medecin): void {
    const confirmDelete = confirm(`Voulez-vous vraiment supprimer ${medecin.nom} ${medecin.prenom} ?`);
    if (confirmDelete) {
      this.medecinService.supprimerMedecin(medecin.id).subscribe(() => {
        this.chargerMedecins();
      });
    }
  }

  toggleEtat(medecin: Medecin): void {
    const action = medecin.actif ? 'désactiver' : 'activer';
    const confirmToggle = confirm(`Voulez-vous vraiment ${action} ce médecin ?`);
    if (confirmToggle) {
      this.medecinService.toggleEtat(medecin.id).subscribe(() => {
        this.chargerMedecins();
      });
    }
  }

}
