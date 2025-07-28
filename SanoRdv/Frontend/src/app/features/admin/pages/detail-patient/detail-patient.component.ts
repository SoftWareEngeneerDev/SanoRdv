import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-detail-patient',
  templateUrl: './detail-patient.component.html',
  styleUrls: ['./detail-patient.component.css']
})
export class DetailPatientComponent implements OnInit {
  patient!: Patient;
  defaultAvatar = 'assets/images/default-avatar.png';
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPatient(id);
    }
  }

  loadPatient(id: string): void {
    this.isLoading = true;
    this.patientService.getPatientById(id).subscribe({
      next: (data: Patient) => {
        this.patient = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement du patient.';
        this.isLoading = false;
      }
    });
  }
}
