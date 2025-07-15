import { Component, OnInit } from '@angular/core';
import { SpecialiteService } from '../../services/specialite.service';
import { Specialite } from '../../models/specialites.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-specialites',
  templateUrl: './specialites.component.html',
  styleUrls: ['./specialites.component.css']
})
export class SpecialitesComponent implements OnInit {
  specialites: Specialite[] = [];
  filteredSpecialites: Specialite[] = [];
  rechercheSpecialite: string = '';
  specialiteEnEdition: Specialite | null = null;
  nouvelleSpecialite: { nom: string; description: string } = {
    nom: '',
    description: ''
  };
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private specialiteService: SpecialiteService) {}

  ngOnInit(): void {
    this.chargerSpecialites();
  }

  chargerSpecialites(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.specialiteService.getSpecialites()
      .pipe(
        catchError(error => {
          this.errorMessage = 'Erreur lors du chargement des spécialités';
          console.error(error);
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(specialites => {
        this.specialites = specialites;
        this.filteredSpecialites = [...specialites];
      });
  }

  commencerEdition(specialite: Specialite): void {
    this.specialiteEnEdition = { ...specialite };
  }

  annulerEdition(): void {
    this.specialiteEnEdition = null;
  }

  validerEdition(): void {
    if (!this.specialiteEnEdition) return;

    this.isLoading = true;
    this.specialiteService.modifierSpecialite(this.specialiteEnEdition)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Erreur lors de la modification';
          console.error(error);
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(() => {
        this.specialiteEnEdition = null;
        this.chargerSpecialites();
      });
  }

  ajouterSpecialite(): void {
    if (!this.nouvelleSpecialite.nom.trim()) {
      this.errorMessage = 'Le nom de la spécialité est requis';
      return;
    }

    this.isLoading = true;
    this.specialiteService.ajouterSpecialite({
      ...this.nouvelleSpecialite,
      nombreMedecins: 0
    })
      .pipe(
        catchError(error => {
          this.errorMessage = 'Erreur lors de l\'ajout';
          console.error(error);
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(() => {
        this.nouvelleSpecialite = { nom: '', description: '' };
        this.chargerSpecialites();
      });
  }

  supprimerSpecialite(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette spécialité ?')) return;

    this.isLoading = true;
    this.specialiteService.supprimerSpecialite(id)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error(error);
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(() => {
        this.chargerSpecialites();
      });
  }

  searchSpecialites(): void {
    if (!this.rechercheSpecialite.trim()) {
      this.filteredSpecialites = [...this.specialites];
      return;
    }
    
    const term = this.rechercheSpecialite.toLowerCase();
    this.filteredSpecialites = this.specialites.filter(s => 
      s.nom.toLowerCase().includes(term) || 
      (s.description && s.description.toLowerCase().includes(term))
    );
  }
}