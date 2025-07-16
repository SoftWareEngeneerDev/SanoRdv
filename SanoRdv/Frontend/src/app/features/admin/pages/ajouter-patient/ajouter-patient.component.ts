import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-ajouter-patient',
  templateUrl: './ajouter-patient.component.html',
  styleUrls: ['./ajouter-patient.component.css']
})
export class AjouterPatientComponent {
  patientForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      sex: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      adresse: [''],
      localite: [''],
      nationalite: [''],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  annuler(): void {
    this.router.navigate(['/admin/patients']);
  }

  onSubmit(): void {
  if (this.patientForm.invalid) {
    this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement';
    return;
  }

  this.isSubmitting = true;
  this.errorMessage = '';
  this.successMessage = '';

  const nouveauPatient: Patient = {
    ...this.patientForm.value,
    sex: this.patientForm.value.sex || '', // S'assurer qu'il est bien transmis
  };

  this.patientService.ajouterPatient(nouveauPatient).subscribe({
    next: (res) => {
      this.isSubmitting = false;
      this.successMessage = '✅ Patient ajouté avec succès ! Redirection...';
      
      // Redirection avec état pour afficher message dans la liste
      setTimeout(() => {
        this.router.navigate(['/admin/patients'], { state: { patientAdded: true } });
      }, 1500);
    },
    error: (err) => {
      this.isSubmitting = false;
      this.errorMessage = err.error?.message || '❌ Erreur lors de l\'ajout du patient';
      console.error('Erreur ajout patient:', err);
    }
  });
}

}