import { Component, OnInit } from '@angular/core';
import { SpecialiteService } from '../../services/specialite.service';
import { Specialite } from '../../models/specialites.model';

@Component({
  selector: 'app-specialites',
  templateUrl: './specialites.component.html',
  styleUrls: ['./specialites.component.css']
})
export class SpecialitesComponent implements OnInit {

    specialites: Specialite[] = [];
  rechercheSpecialite = '';
  specialiteEnEdition: Specialite | null = null;
  nouvelleSpecialite = {
    nom: '',
    description: ''
  };

  

  constructor(private specialiteService: SpecialiteService) {}

  ngOnInit(): void {
    this.chargerSpecialites();
  }
  

  chargerSpecialites(): void {
    this.specialiteService.getSpecialites().subscribe(specialites => {
      this.specialites = specialites;
    });
  }

  commencerEdition(specialite: Specialite): void {
    this.specialiteEnEdition = { ...specialite };
  }

  annulerEdition(): void {
    this.specialiteEnEdition = null;
  }

  validerEdition(): void {
    if (this.specialiteEnEdition) {
      this.specialiteService.modifierSpecialite(this.specialiteEnEdition).subscribe(() => {
        this.specialiteEnEdition = null;
        this.chargerSpecialites();
      });
    }
  }

  ajouterSpecialite(): void {
    if (!this.nouvelleSpecialite.nom.trim()) return;

    this.specialiteService.ajouterSpecialite({
      ...this.nouvelleSpecialite,
      nombreMedecins: 0
    }).subscribe(() => {
      this.nouvelleSpecialite = { nom: '', description: '' };
      this.chargerSpecialites();
    });
  }

 specialiteASupprimer: any = null;

modalSuppression(specialite: any): void {
  this.specialiteASupprimer = specialite;
}

annulerSuppression(): void {
  this.specialiteASupprimer = null;
}

confirmerSuppression(): void {
  if (this.specialiteASupprimer && this.specialiteASupprimer.id) {
    this.specialiteService.supprimerSpecialite(this.specialiteASupprimer.id).subscribe(() => {
      // Rafraîchir la liste après suppression
      this.chargerSpecialites(); // ou loadSpecialites()
      this.specialiteASupprimer = null;
    });
  }
}


  filteredSpecialites: Specialite[] = [];



searchSpecialites(): void {
  if (!this.rechercheSpecialite.trim()) {
    this.filteredSpecialites = [...this.specialites];
    return;
  }
  
  const term = this.rechercheSpecialite.toLowerCase();
  this.filteredSpecialites = this.specialites.filter(s => 
    s.nom.toLowerCase().includes(term) || 
    s.description.toLowerCase().includes(term)
  );
}

}
