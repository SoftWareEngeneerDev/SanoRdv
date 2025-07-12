import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedecinService } from '../../services/medecin.service';
import { Medecin } from '../../models/medecin.model';

@Component({
  selector: 'app-modifier-medecin',
  templateUrl: './modifier-medecin.component.html',
  styleUrls: ['./modifier-medecin.component.css']
})
export class ModifierMedecinComponent implements OnInit {

    medecinForm: FormGroup;
  id: string = '';

  specialites = ['Médecin généraliste', 'Dermatologie', 'Cardiologie', 'Pédiatrie', 'Gynécologie'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private medecinService: MedecinService
  ) {
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
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.medecinService.getMedecinById(this.id).subscribe((medecin: Medecin) => {
        this.medecinForm.patchValue(medecin);
      });
    }
  }

  onSubmit(): void {
    if (this.medecinForm.valid) {
      this.medecinService.modifierMedecin(this.id, this.medecinForm.value).subscribe(() => {
        alert('Médecin modifié avec succès.');
        this.router.navigate(['/admin/medecins']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/medecins']);
  }
}
