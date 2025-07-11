import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RecapService } from './../../services/recap.service';

@Component({
  selector: 'app-motif',
  templateUrl: './motif.component.html',
  styleUrls: ['./motif.component.css']
})
export class MotifComponent {
  motifConsultation: string = '';
  motifLibre: string = '';  // pour le texte libre si "Autres" choisi
  medecin: any;
  precedentClickedOnce: boolean = false;

  constructor(
    private router: Router,
    private recapService: RecapService
  ) {}

  onMotifChange() {
    this.precedentClickedOnce = false;

    // Si "Autres" est sélectionné, on garde tout ici et on affiche un champ texte dans le template (pas de redirection)
    // Si tu veux garder la redirection vers une autre page, remets ta ligne suivante et supprime le champ texte dans ce composant.
    // if (this.motifConsultation === 'Autres') {
    //   this.router.navigate(['/patient/autre-motif']);
    // }

    // Si l'utilisateur change de motif et ce n'est pas "Autres", on reset le texte libre
    if (this.motifConsultation !== 'Autres') {
      this.motifLibre = '';
    }
  }

  isMotifValide(): boolean {
    if (!this.motifConsultation) return false;
    if (this.motifConsultation === 'Autres' && this.motifLibre.trim() === '') return false;
    return true;
  }

  precedent() {
    if (!this.precedentClickedOnce) {
      this.motifConsultation = '';
      this.motifLibre = '';
      this.precedentClickedOnce = true;
    } else {
      this.router.navigate(['/patient/informations']);
    }
  }

  suivant() {
    const motifFinal = this.motifConsultation === 'Autres' ? this.motifLibre.trim() : this.motifConsultation;
    this.recapService.setMotif(motifFinal);
    this.router.navigate(['/patient/creneau']);
  }
}
