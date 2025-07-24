import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-ajouter-patient',
  templateUrl: './ajouter-patient.component.html',
  styleUrls: ['./ajouter-patient.component.css'],
})
export class AjouterPatientComponent implements OnInit {
  patientForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmationMotDePasse: ['', Validators.required],
      sex: [''],
      localite: [''],
      dateNaissance: [''],
      adresse: [''],
      photo: [''],
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const formValue = this.patientForm.value;

    const nouveauPatient: Patient = {
      ...formValue,
      sex: formValue.sex || '',
      dateNaissance: formValue.dateNaissance
        ? new Date(formValue.dateNaissance).toISOString()
        : undefined,
    };

    this.patientService.ajouterPatient(nouveauPatient).subscribe({
      next: (response : any) => {
        this.successMessage = response.message || 'Patient ajouté avec succès.';
        this.router.navigate(['/admin/patients']);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Une erreur est survenue.';
      },
    });
  }

  annuler(): void {
  this.router.navigate(['/admin/patients']);
}

}
