import { Component, OnInit, Input } from '@angular/core';
import { PatientService } from '../../../../shared/services/patient.service';
import { Patient } from '../../../../shared/models/patient.model';

@Component({
  selector: 'app-header-patient',
  templateUrl: './header-patient.component.html',
  styleUrls: ['./header-patient.component.css']
})
export class HeaderPatientComponent implements OnInit {
  prenom: string = '';
  searchTerm: string = '';

  @Input() isCollapsed: boolean = false;
  // Dans ton component TS
isMenuOpen = false;

toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
}


  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.patientService.getProfilPatient().subscribe({
      next: (patient: Patient) => {
        this.prenom = patient.prenom || '';
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
