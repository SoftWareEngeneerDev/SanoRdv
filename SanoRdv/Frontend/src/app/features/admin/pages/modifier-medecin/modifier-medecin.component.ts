import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedecinService } from '../../services/medecin.service';
import { Medecin } from '../../models/medecin.model';

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
  specialites = [
    'Médecin généraliste', 'Dermatologie', 'Cardiologie',
    'Pédiatrie', 'Gynécologie', 'Neurologie'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private medecinService: MedecinService
  ) {
    this.medecinForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      sexe: ['Homme', Validators.required],
      dateNaissance: ['', Validators.required],
      anneesExperience: ['', Validators.required],
      specialite: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      localisation: ['', Validators.required],
      description: [''],
      etat: ['Actif', Validators.required]
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
  this.id = params['id'];
  if (this.id) {
    this.medecinService.getMedecinById(this.id).subscribe((medecin: Medecin) => {
      this.medecinForm.patchValue(medecin);
    });
  }
});

  }

  onSubmit(): void {
    if (this.medecinForm.valid) {
      this.medecinService.modifierMedecin(this.id, this.medecinForm.value).subscribe(() => {
        alert('Médecin modifié avec succès.');
        this.router.navigate(['/admin/medecins']);
      });
    }

    const formValue = { ...this.medecinForm.value };

if (this.photoPreview) {
  formValue.photo = this.photoPreview.toString(); // base64
}

this.medecinService.modifierMedecin(this.id, formValue).subscribe(() => {
  alert('Médecin modifié avec succès.');
  this.router.navigate(['/admin/medecins']);
});

  }

  onCancel(): void {
    this.router.navigate(['/admin/medecins']);
  }
}
