import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-register',
  templateUrl: './modifier.component.html',
  styleUrls: ['./modifier.component.css']
})
export class RegisterComponent implements OnInit {
  patient: any;

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //  Données fictives pour test CSS
    this.patient = {
      nom: 'TRAORE',
      prenom: 'Sharifa',
      email: 'sharifa@example.com',
      telephone: '+226 70 00 00 00',
      sexe: 'Féminin',
      dateNaissance: '1995-04-12',
      photo: ''
    };

    // Décommente ceci quand le backend est prêt
    this.patientService.getProfilPatient().subscribe((data: any) => {
      this.patient = data;
    });

  }

  modifierProfil(): void {
    this.router.navigate(['/profil']);
  }
}
