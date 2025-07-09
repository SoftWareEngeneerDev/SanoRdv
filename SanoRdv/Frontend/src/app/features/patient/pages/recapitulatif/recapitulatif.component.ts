import { Component, OnInit } from '@angular/core';
import { RecapService } from '../../services/recap.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recapitulatif',
  templateUrl: './recapitulatif.component.html',
  styleUrls: ['./recapitulatif.component.css']
})
export class RecapitulatifComponent implements OnInit {
  motif: string = '';
  medecin: any;
  creneau: any;

  constructor(private recapService: RecapService,
    private router: Router
  ) {}

  retour() {
  this.router.navigate(['/creneau']);
}

confirmer() {
  this.recapService.setRdv(this.medecin, this.creneau.date, this.creneau.heure);
  this.router.navigate(['/confirmation']);
}


  ngOnInit(): void {
    this.motif = this.recapService.motif;
    this.medecin = this.recapService.medecin;
    this.creneau = this.recapService.creneau;
  }
}
