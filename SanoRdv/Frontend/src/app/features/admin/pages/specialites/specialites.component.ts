import { Component, OnInit } from '@angular/core';
import { SpecialiteService } from '../../services/specialite.service';
import { Specialite } from '../../models/specialites.model';
import { Router } from '@angular/router';

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

  specialiteASupprimer: any = null;
  filteredSpecialites: Specialite[] = [];

  constructor(private specialiteService: SpecialiteService, private router: Router) {}

  ngOnInit(): void {
    this.chargerSpecialites();
  }

  chargerSpecialites(): void {
    this.specialiteService.getSpecialites().subscribe(specialites => {
      this.specialites = specialites;
      this.filteredSpecialites = [...specialites]; // IMPORTANT : initialiser filteredSpecialites
    });
  }

  commencerEdition(specialite: any): void {
   if (specialite && specialite._id) {
    this.router.navigate(['admin/modifier-specialites', specialite._id]);
  } else {
    console.error("L'ID de la spécialité est introuvable", specialite);
  }
  }

  annulerEdition(): void {
    this.specialiteEnEdition = null;
  }

  validerEdition(): void {
    if (this.specialiteEnEdition && this.specialiteEnEdition._id) {
      this.specialiteService
        .modifierSpecialite(this.specialiteEnEdition._id, this.specialiteEnEdition)
        .subscribe(() => {
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

  modalSuppression(specialite: any): void {
    this.specialiteASupprimer = specialite;
  }

  annulerSuppression(): void {
    this.specialiteASupprimer = null;
  }

  confirmerSuppression(): void {
  if (this.specialiteASupprimer && this.specialiteASupprimer._id) {
    this.specialiteService.supprimerSpecialite(this.specialiteASupprimer._id).subscribe({
      next: () => {
        console.log("Spécialité à supprimer :", this.chargerSpecialites);
        this.chargerSpecialites(); // Recharge la liste
        this.specialiteASupprimer = null;
      },
      error: (err) => {
        console.error('Erreur de suppression :', err);
      }
    });
  }
}



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