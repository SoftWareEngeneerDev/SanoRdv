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

  loadMedecins(): void {
  this.medecinService.getMedecins().subscribe((data) => {
    this.medecins = data;
  });
}

  chargerMedecins(): void {
    this.medecinService.getMedecins().subscribe(data => {
      this.medecins = data;
    });
  }

  activer(medecin: Medecin): void {
  this.medecinService.activerMedecin(medecin.id).subscribe(() => {
    this.loadMedecins();
  });
}

  ajouterMedecin(): void {
    this.router.navigate(['/admin/ajouter-medecin']);
  }

  modifier(medecin: Medecin): void {
    this.router.navigate(['/admin/modifier-medecin'], { queryParams: { id: medecin.id } });
  }

 supprimer(id: string): void {
  if (confirm('Voulez-vous vraiment supprimer ce médecin ?')) {
    this.medecinService.supprimerMedecin(id).subscribe(() => {
      this.loadMedecins();
    });
  }
}

  toggleEtat(medecin: Medecin): void {
    const action = medecin.etat === 'Actif' ? 'désactiver' : 'activer';
    const confirmToggle = confirm(`Voulez-vous vraiment ${action} ce médecin ?`);
    if (confirmToggle) {
      this.medecinService.activerMedecin(medecin.id).subscribe(() => {
        this.chargerMedecins();
      });
    }
  }

}
