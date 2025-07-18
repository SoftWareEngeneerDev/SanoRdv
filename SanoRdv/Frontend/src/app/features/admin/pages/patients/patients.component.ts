import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap, take } from 'rxjs/operators';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { ViewChild, ElementRef } from '@angular/core';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  recherche: string = '';
  private rechercheSubject = new BehaviorSubject<string>('');
  @ViewChild('modalConfirmationSuppression', { static: false }) modalElement!: ElementRef;
  private patientASupprimerId: string | null = null;

  patientsFiltres$!: Observable<Patient[]>;
  errorMessage = '';
  successMessage = '';
  isLoading$ = this.patientService.isLoading;

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patientService.refreshPatients();

    this.patientsFiltres$ = combineLatest([
      this.patientService.patients$,
      this.rechercheSubject.asObservable()
    ]).pipe(
      map(([patients, recherche]) => {
        if (!recherche) return patients;
        const terme = recherche.toLowerCase();
        return patients.filter(p => 
          (p.nom?.toLowerCase().includes(terme)) ||
          (p.prenom?.toLowerCase().includes(terme)) ||
          (p.email?.toLowerCase().includes(terme))
        );
      })
    );

    // Vérifie si on vient d'ajouter un patient
    this.patientService.patients$.pipe(take(1)).subscribe({
      next: () => {
        const state = this.router.getCurrentNavigation()?.extras.state;
        if (state?.['patientAdded']) {
          this.successMessage = 'Patient ajouté avec succès!';
          setTimeout(() => this.successMessage = '', 3000);
        }
      }
    });
  }

  setRecherche(val: string): void {
    this.recherche = val;
    this.rechercheSubject.next(val);
  }

  ajouterPatient(): void {
    this.router.navigate(['/admin/ajouter-patient']);
  }

  voirDetails(id: string): void {
    this.router.navigate(['/admin/detail-patient', id]);
  }

  supprimer(id: string): void {
  this.patientASupprimerId = id;
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmationSuppression')!);
  modal.show();
}

confirmerSuppression(): void {
  if (!this.patientASupprimerId) return;

  this.patientService.supprimerPatient(this.patientASupprimerId).subscribe({
    next: () => {
      this.successMessage = 'Patient supprimé avec succès.';
      setTimeout(() => this.successMessage = '', 3000);
      this.patientASupprimerId = null;

      // Fermer la modale
      const modalEl = document.getElementById('modalConfirmationSuppression');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }
    },
    error: () => {
      this.errorMessage = 'Erreur lors de la suppression du patient.';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  });
}

}