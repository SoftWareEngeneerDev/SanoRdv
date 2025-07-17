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

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      sexe: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      adresse: [''],
      localite: [''],
      nationalite: ['']
    });
  }

  annuler(): void {
  // Exemple d'action : retour à la liste des patients
  this.router.navigate(['/admin/patients']);
}

  onSubmit() {
    if (this.patientForm.invalid) return;

    this.isSubmitting = true;
    const nouveauPatient: Patient = this.patientForm.value;

    this.patientService.ajouterPatient(nouveauPatient).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/admin/patients']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Erreur ajout patient :', err);
      }
    });
  }
}