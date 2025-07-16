import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ajouter-patient',
  templateUrl: './ajouter-patient.component.html',
  styleUrls: ['./ajouter-patient.component.css']
})
export class AjouterPatientComponent  {
  patientForm: FormGroup;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d+$/)]],
      gender: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.patientForm.valid) {
      this.patientService.addPatient(this.patientForm.value).subscribe({
        next: () => this.router.navigate(['/admin/patients']),
        error: (err) => console.error('Erreur lors de l\'ajout:', err)
      });
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

   cancel() {
    this.router.navigate(['/admin/patients']);
  }
}
