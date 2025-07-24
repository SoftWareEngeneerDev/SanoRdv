import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedecinService } from '../../services/medecin.service';
import { Medecin } from '../../models/medecin.model';
import { SpecialiteService } from '../../services/specialite.service';

@Component({
  selector: 'app-modifier-medecin',
  templateUrl: './modifier-medecin.component.html',
  styleUrls: ['./modifier-medecin.component.css']
})
export class ModifierMedecinComponent implements OnInit {

  photoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  medecinForm: FormGroup;
  id: string = '';
 specialites: any[] = [];
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private medecinService: MedecinService,
    private specialiteService: SpecialiteService
  ) {
    this.medecinForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      sexe: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      anneeExperience: ['', Validators.required],
      specialite: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      localisation: [''],
      description: [''],
      etat: ['', Validators.required]
    });
  }

  onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = e => this.photoPreview = reader.result;
    reader.readAsDataURL(file);
  }
}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
  this.id = params['idDuMedecin'];
  if (this.id) {
    this.medecinService.getMedecinById(this.id).subscribe((medecin: Medecin) => {
  
      this.medecinForm.patchValue({
          ...medecin,
          etat: medecin.isActive ? 'Actif' : 'Inactif',
          specialite: medecin.specialite 
        });
      this.medecinForm.get('dateNaissance')?.setValue(medecin.dateNaissance ? new Date(medecin.dateNaissance).toISOString().substring(0, 10) : '');
       console.log('Etat dans formulaire:', this.medecinForm.get('etat')?.value);
       console.log('formulaire du médecin:', this.medecinForm.value);
    });
  }
});    this.chargerSpecialites();

  }
 
  
    chargerSpecialites(): void {
  this.specialiteService.getSpecialites().subscribe({
    next: (data) => {
      console.log('Spécialités reçues du backend :', data); // 👈 Ajoute ceci
      this.specialites = data;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des spécialités :', err);
    }
  });
}


  onSubmit(): void {
  if (this.medecinForm.valid) {
    const formValue = { ...this.medecinForm.value };

    // Convertir etat en booléen
    formValue.isActive = formValue.etat === 'Actif';

    // Ajouter la photo si modifiée
    if (this.photoPreview) {
      formValue.photo = this.photoPreview.toString(); // base64
    }

    // Supprimer etat du payload car il ne correspond pas au modèle backend
    delete formValue.etat;

    this.medecinService.modifierMedecin(this.id, formValue).subscribe(() => {
      alert('Médecin modifié avec succès.');
      this.router.navigate(['/admin/medecins']);
    });
  }
}


  onCancel(): void {
    this.router.navigate(['/admin/medecins']);
  }
}
