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
  medecin: any = null;
  patient: any = null;
  precedentClickedOnce: boolean = false;

  constructor(
    private router: Router,
    private recapService: RecapService
  ) {}

  ngOnInit(): void {
    // Récupérer médecin et patient depuis RecapService
    this.medecin = this.recapService.getMedecin();
    this.patient = this.recapService.getPatient();

    // Redirection si données manquantes
    if (!this.medecin || !this.medecin._id) {
      console.warn('Médecin manquant, redirection vers recherche médecin');
      this.router.navigate(['/patient/search-medecin']);
      return;
    }

    if (!this.patient || !this.patient._id) {
      console.warn('Patient manquant, redirection vers login');
      this.router.navigate(['/patient/login']);
      return;
    }
  }

  onMotifChange(): void {
    this.precedentClickedOnce = false;

    // Si le motif choisi n'est pas "Autres", on vide le champ libre
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
      // Reset des champs la première fois
      this.motifConsultation = '';
      this.motifLibre = '';
      this.precedentClickedOnce = true;
    } else {
      // Navigation vers la page précédente
      this.router.navigate(['/patient/informations']);
    }
  }

  suivant(): void {
    if (!this.isMotifValide()) {
      alert('Veuillez renseigner un motif valide.');
      return;
    }

    const motifFinal = this.motifConsultation === 'Autres' ? this.motifLibre.trim() : this.motifConsultation;
    this.recapService.setMotif(motifFinal);

    console.log('medecin:', this.medecin);
    console.log('patient:', this.patient);
    console.log('medecin._id:', this.medecin?._id);
    console.log('patient._id:', this.patient?._id);

    if (this.medecin?._id && this.patient?._id) {
      this.router.navigate(['/patient/creneau', this.medecin._id, this.patient._id]);
    } else {
      alert("Erreur : informations patient ou médecin manquantes.");
    }
  }
}
