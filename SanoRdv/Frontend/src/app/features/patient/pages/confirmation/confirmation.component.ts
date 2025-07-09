import { Component, OnInit } from '@angular/core';
import { RecapService } from '../../services/recap.service';
import { Router } from '@angular/router';
import { parseISO } from 'date-fns';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  medecin: any;
  dateAffichee: string = '';
  heure: string = '';
  date: Date | null = null;

  constructor(
    private recapService: RecapService,
    private router: Router
  ) {}

 ngOnInit(): void {
  this.medecin = this.recapService.getMedecin();

  const dateStr = this.recapService.getDate(); // ISO string
  if (dateStr) {
    this.date = parseISO(dateStr);
    const dateObj = this.date;
    this.dateAffichee = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  this.heure = this.recapService.getHeure()!;
}


  goToAccueil() {
    this.router.navigate(['/dashboard']);
  }

  goToListeRdv() {
    this.router.navigate(['/appointment']);
  }
}
