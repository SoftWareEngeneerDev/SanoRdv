import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';  // ajouter ActivatedRoute
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
    private router: Router,
    private route: ActivatedRoute  // injecter ici
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.patient = JSON.parse(storedUser);
      } catch (error) {
        console.error('Erreur lors du parsing du user dans localStorage:', error);
      }
    } else {
      this.patient = {
        nom: 'TRAORE',
        prenom: 'Sharifa',
        email: 'sharifa@example.com',
        telephone: '+226 70 00 00 00',
        sexe: 'Féminin',  // correction aussi ici : 'sexe' au lieu de 'sex'
        dateNaissance: '1995-04-12',
        photo: ''
      };
    }
  }

  modifierProfil(): void {
    this.router.navigate(['/patient/profil'], { relativeTo: this.route });
  }
}
