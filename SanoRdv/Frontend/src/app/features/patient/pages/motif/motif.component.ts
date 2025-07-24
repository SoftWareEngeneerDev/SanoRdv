import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecapService } from './../../services/recap.service';

@Component({
  selector: 'app-motif',
  templateUrl: './motif.component.html',
  styleUrls: ['./motif.component.css']
})
export class MotifComponent implements OnInit {
  motifConsultation: string = '';
  motifLibre: string = '';
  medecin: any;
  precedentClickedOnce: boolean = false;
  patient: any;

  constructor(
    private router: Router,
    private recapService: RecapService
  ) {}

  ngOnInit(): void {
    // Récupérer le médecin depuis le service
    this.medecin = this.recapService.getMedecin();
    this.patient = this.recapService.getPatient();

  //   if (!this.medecin) {
  //   this.router.navigate(['/patient/search-medecin']);
  // }

  // if (!this.patient) {
  //   this.router.navigate(['/patient/login']); // ou la page correspondante
  // }
  }

  onMotifChange(): void {
    this.precedentClickedOnce = false;

    // Si l'utilisateur choisit un motif autre que "Autres"
    if (this.motifConsultation !== 'Autres') {
      this.motifLibre = '';
    }
  }

  isMotifValide(): boolean {
    if (!this.motifConsultation) return false;
    if (this.motifConsultation === 'Autres' && this.motifLibre.trim() === '') return false;
    return true;
  }

  precedent(): void {
    if (!this.precedentClickedOnce) {
      this.motifConsultation = '';
      this.motifLibre = '';
      this.precedentClickedOnce = true;
    } else {
      this.router.navigate(['/patient/informations']);
    }
  }

  suivant(): void {
    if (!this.isMotifValide()) return;

    const motifFinal = this.motifConsultation === 'Autres' ? this.motifLibre.trim() : this.motifConsultation;
    this.recapService.setMotif(motifFinal);

  if (this.medecin && this.patient) {
      this.router.navigate(['/patient/creneau', this.medecin._id, this.patient._id]);
    } else {
      alert("Erreur : informations patient ou médecin manquantes.");
    }
  }
}
