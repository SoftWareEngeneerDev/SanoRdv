import { Component, OnInit, Input } from '@angular/core';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-header-patient',
  templateUrl: './header-patient.component.html',
  styleUrls: ['./header-patient.component.css']
})
export class HeaderPatientComponent implements OnInit {
  prenom: string = '';
  searchTerm: string = '';

  @Input() isCollapsed: boolean = false;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.patientService.getProfilPatient().subscribe({
      next: (data: { prenom: string }) => {
        this.prenom = data.prenom;
      },
      error: () => {
        this.prenom = '';
      }
    });
  }

  onSearch(): void {
    console.log('Recherche en cours :', this.searchTerm);
  }
}
