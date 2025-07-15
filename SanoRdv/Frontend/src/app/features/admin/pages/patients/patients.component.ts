// patients.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  recherche: string = '';
  patientsFiltres: Patient[] = [];
  isLoading = true;

  constructor(private patientService: PatientService, private router: Router) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement patients', err);
        this.isLoading = false;
      }
    });
  }

  voirDetails(id: string): void {
    this.router.navigate(['/admin/detail-patient', id]);
  }

  activer(id: string): void {
    this.patientService.activerPatient(id).subscribe(() => this.loadPatients());
  }

  desactiver(id: string): void {
    this.patientService.desactiverPatient(id).subscribe(() => this.loadPatients());
  }

  supprimer(id: string): void {
    if (confirm('Confirmer la suppression de ce patient ?')) {
      this.patientService.supprimerPatient(id).subscribe(() => this.loadPatients());
    }
  }

  filtrerPatients(): void {
  // implémentation basique
  this.patientsFiltres = this.patients.filter(p =>
    p.nom.toLowerCase().includes(this.recherche.toLowerCase())
  );
  }

  ajouterPatient(): void {
    this.router.navigate(['/admin/ajouter-patient']);
  }

  
}
