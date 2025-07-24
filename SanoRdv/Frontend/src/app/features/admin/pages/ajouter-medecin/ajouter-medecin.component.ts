import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedecinService } from '../../services/medecin.service';
import { Router } from '@angular/router';
import { Medecin } from '../../models/medecin.model'; 
import { SpecialiteService } from '../../services/specialite.service';

@Component({
  selector: 'app-ajouter-medecin',
  templateUrl: './ajouter-medecin.component.html',
  styleUrls: ['./ajouter-medecin.component.css']
})
export class AjouterMedecinComponent implements OnInit {


    medecinForm: FormGroup;
  @Output() medecinAjoute = new EventEmitter<void>();

  specialites: any[] = [];

  constructor(private fb: FormBuilder, private medecinService: MedecinService, private router: Router, private specialiteService: SpecialiteService) {
  this.medecinForm = this.fb.group({
  nom: ['', Validators.required],
  prenom: ['', Validators.required],
  specialite: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  telephone: ['', Validators.required],
  motDePasse: ['', Validators.required],
  anneeExperience: [0, [Validators.required, Validators.min(0)]]
});
  }

  ngOnInit(): void {
    this.chargerSpecialites();
  }

  chargerSpecialites(): void {
    this.specialiteService.getSpecialites().subscribe({
      next: (data) => {
        this.specialites = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des spécialités :', err);
      }
    });
  }

  onSubmit(): void {
    if (this.medecinForm.valid) {
      const nouveauMedecin: Medecin = this.medecinForm.value;
      console.log('données envoyé', this.medecinForm.value);
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
