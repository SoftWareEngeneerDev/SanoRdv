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
  patient: Patient | null = null;
  defaultAvatar: string = 'assets/images/avatar-placeholder.png';

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientService.getPatientById(id).subscribe({
        next: (data) => {
          this.patient = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement du patient :', err);
        }
      });
    }
  }
}
