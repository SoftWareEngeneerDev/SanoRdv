import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RechercheMedecinService } from '../../services/recherche-medecin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recherche-medecin',
  templateUrl: './search-medecin.component.html',
  styleUrls: ['./search-medecin.component.css']
})
export class RechercheMedecinComponent {
  photoPreview: string | ArrayBuffer | null = null;
  selectedPhoto!: File;
  medecin: any;

  // Champs de recherche
  query: string = '';
  suggestions: any[] = [];
  nextLetters: string[] = [];
  results: any[] = [];
  medecinDetails: any[] = [];

  constructor(
    private rechercheMedecinService: RechercheMedecinService,
    private router: Router
  ) {
    // Initialiser les abonnements aux données
    this.rechercheMedecinService.query$.subscribe(data => this.query = data);
    this.rechercheMedecinService.suggestions$.subscribe(data => this.suggestions = data);
    this.rechercheMedecinService.nextLetters$.subscribe(data => this.nextLetters = data);
    this.rechercheMedecinService.results$.subscribe(data => this.results = data);
    this.rechercheMedecinService.medecinDetails$.subscribe(data => this.medecinDetails = data);
  }

  // Voir profil du médecin sélectionné
  voirProfil(medecin: any) {
    console.log('👉 CLIC détecté - Médecin :', medecin);  // ← Cela DOIT apparaître en console
    this.router.navigate(['/patient/informations'], {
      state: { medecin }
    });
  }


  // Sélection de suggestion
  selectSuggestion(suggestion: any) {
    this.query = suggestion.text;
    this.rechercheMedecinService.updateQuery(this.query);
    this.rechercheMedecinService.search(this.query);
  }

  // Recherche à la frappe
  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query = value;
    this.rechercheMedecinService.updateQuery(value);
    this.rechercheMedecinService.autocomplete(value);
  }

  // Lancer recherche manuelle
  onSearch() {
    this.rechercheMedecinService.updateQuery(this.query);
    this.rechercheMedecinService.search(this.query);
  }

  // Détection de résultats
  get afficherTitreResultats(): boolean {
    return (this.results.length > 0 || this.medecinDetails.length > 0) && this.suggestions.length === 0;
  }

  // Photo
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      const reader = new FileReader();
      reader.onload = () => this.photoPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  // ✅ Upload photo
  uploadPhoto() {
    if (!this.selectedPhoto || !this.medecin?.id) return;

    const formData = new FormData();
    formData.append('photo', this.selectedPhoto);

    this.rechercheMedecinService.uploadPhoto(formData, this.medecin.id).subscribe({
      next: () => {
        alert('Photo mise à jour avec succès');
        this.photoPreview = null;
        this.loadMedecin();
      },
      error: () => alert('Erreur lors de l’envoi de la photo.')
    });
  }

  loadMedecin() {
  }
}
