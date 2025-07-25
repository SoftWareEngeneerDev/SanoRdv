import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedecinService } from '../../services/medecin.service';
import { Medecin } from '../../models/medecin.model';
import { SpecialiteService } from '../../services/specialite.service';
import { Specialite } from '../../models/specialites.model';

interface MedecinAvecSpecialiteNom extends Medecin {
  specialiteNom: string;
  etatTexte: string;
}

@Component({
  selector: 'app-medecins',
  templateUrl: './medecins.component.html',
  styleUrls: ['./medecins.component.css']
})
export class MedecinsComponent implements OnInit {

  medecins: MedecinAvecSpecialiteNom[] = [];
  recherche: string = '';
  medecinsFiltres: MedecinAvecSpecialiteNom[] = [];
  specialites: Specialite[] = [];

  constructor(
    private router: Router,
    private medecinService: MedecinService,
    private specialiteService: SpecialiteService
  ) {}

  ngOnInit(): void {
    this.specialiteService.getSpecialites().subscribe(specialites => {
      this.specialites = specialites;
      this.chargerMedecins();
    });
  }

  chargerMedecins(): void {
    this.medecinService.getMedecins().subscribe(data => {
      this.medecins = data.medecins.map(med => {
        const spec = this.specialites.find(s => s._id === med.specialite);
        return {
          ...med,
          specialiteNom: spec?.nom || 'Inconnue',
          etatTexte: med.isActive ? 'Actif' : 'Inactif'
        };
      });
      this.medecinsFiltres = this.medecins;
    });
  }

  filtrer(): void {
    const terme = this.recherche.toLowerCase().trim();
    this.medecinsFiltres = this.medecins.filter(m =>
      m.nom.toLowerCase().includes(terme) ||
      m.specialiteNom.toLowerCase().includes(terme) ||
      m.email.toLowerCase().includes(terme)
    );
  }

  activer(medecin: Medecin): void {
    if (!medecin._id) return;
    this.medecinService.activerMedecin(medecin._id).subscribe(() => {
      this.chargerMedecins();
    });
  }

  ajouterMedecin(): void {
    this.router.navigate(['/admin/ajouter-medecin']);
  }

  modifier(medecin: Medecin): void {
    if (!medecin._id) return;
    this.router.navigate(['/admin/modifier-medecin'], {
      queryParams: { idDuMedecin: medecin._id }
    });
  }

  voirFiche(medecin: Medecin): void {
    this.router.navigate(['/admin/detail-medecin'], {
      queryParams: { id: medecin._id }
    });
  }

  supprimer(medecin: Medecin): void {
    if (confirm('Voulez-vous vraiment supprimer ce médecin ?')) {
      this.medecinService.supprimerMedecin(medecin._id).subscribe(() => {
        this.chargerMedecins();
      });
    }
  }

  toggleEtat(medecin: Medecin): void {
    if (!medecin._id) return;

    const action = medecin.isActive ? 'désactiver' : 'activer';
    const confirmToggle = confirm(`Voulez-vous vraiment ${action} ce médecin ?`);

    if (confirmToggle) {
      const actionObservable = medecin.isActive
        ? this.medecinService.desactiverMedecin(medecin._id)
        : this.medecinService.activerMedecin(medecin._id);

      actionObservable.subscribe(() => {
        this.chargerMedecins();
      });
    }
  }
}
