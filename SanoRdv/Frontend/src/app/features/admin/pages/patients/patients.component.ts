import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {

     patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchTerm: string = '';
  addPatientForm: FormGroup;
  isAddingPatient: boolean = false;
  showForm: boolean = false;

  constructor(private router: Router,
    private patientService: PatientService,
    private fb: FormBuilder
  ) {
    this.addPatientForm = this.fb.group({
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['Homme', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe(
      patients => {
        this.patients = patients;
        this.filteredPatients = [...patients];
      }
    );
  }

  searchPatients(): void {
    if (!this.searchTerm) {
      this.filteredPatients = [...this.patients];
      return;
    }

    this.patientService.searchPatients(this.searchTerm).subscribe(
      patients => this.filteredPatients = patients
    );
  }

 toggleAddPatientForm(): void {
  this.router.navigate(['/admin/ajouter-patient']);
}

  onSubmit(): void {
    if (this.addPatientForm.valid) {
      this.isAddingPatient = true;
      const newPatient: Patient = {
        id: 0, // Will be set by the server
        ...this.addPatientForm.value
      };

      this.patientService.addPatient(newPatient).subscribe({
        next: (patient) => {
          this.patients.unshift(patient);
          this.filteredPatients.unshift(patient);
          this.addPatientForm.reset({
            gender: 'Homme'
          });
          this.showForm = false;
          this.isAddingPatient = false;
        },
        error: () => {
          this.isAddingPatient = false;
        }
      });
    }
  }
}
