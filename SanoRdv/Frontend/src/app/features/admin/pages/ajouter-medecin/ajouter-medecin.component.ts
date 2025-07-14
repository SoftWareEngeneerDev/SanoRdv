import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedecinService } from '../../services/medecin.service';
import { Router } from '@angular/router';
import { Medecin } from '../../models/medecin.model'; // 🔁 adapte le chemin selon ton projet

@Component({
  selector: 'app-ajouter-medecin',
  templateUrl: './ajouter-medecin.component.html',
  styleUrls: ['./ajouter-medecin.component.css']
})
export class AjouterMedecinComponent {


    medecinForm: FormGroup;
  @Output() medecinAjoute = new EventEmitter<void>();

  specialites: string[] = [
    'Médecin généraliste', 'Dermatologie', 'Cardiologie',
    'Pédiatrie', 'Gynécologie', 'Neurologie'
  ];

  constructor(private fb: FormBuilder, private medecinService: MedecinService, private router: Router) {
    this.medecinForm = this.fb.group({
  nom: ['', Validators.required],
  prenom: ['', Validators.required],
  sexe: ['Homme'],
  dateNaissance: [''],
  anneesExperience: [''],
  specialite: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  telephone: ['', Validators.required],
  localisation: [''],
  description: [''],
  etat: ['Inactif']
})
  }

  onSubmit(): void {
    if (this.medecinForm.valid) {
      const nouveauMedecin: Medecin = this.medecinForm.value;

      this.medecinService.ajouterMedecin(nouveauMedecin).subscribe(() => {
        alert('Médecin ajouté avec succès !');
        
        this.router.navigate(['/admin/medecins']);
      });
    }
  }

  onCancel(): void {
    this.medecinForm.reset();
    this.medecinAjoute.emit(); // pour fermer la modale
    this.router.navigate(['/admin/medecins']);
  }
}
