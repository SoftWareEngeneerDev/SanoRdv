import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../../shared/services/patient.service';

@Component({
  selector: 'app-register',
  templateUrl: './modifier.component.html',
  styleUrls: ['./modifier.component.css']
})
export class RegisterComponent implements OnInit {
  patient: any = null;

  constructor(
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.patient = JSON.parse(storedUser);
      } catch (error) {
        console.error('Erreur lors du parsing du user dans localStorage:', error);
        this.patient = null;
      }
    }
  }

  modifierProfil(): void {
    this.router.navigate(['/patient/profil'], { relativeTo: this.route });
  }
}
