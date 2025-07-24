import { Component, OnInit } from '@angular/core';
import { RendezVousService } from '../../../../shared/services/rendez-vous.service';

@Component({
  selector: 'app-rdv-stats',
  templateUrl: './rdv-stats.component.html',
  styleUrls: ['./rdv-stats.component.css']
})
export class RdvStatsComponent implements OnInit {

  value: number = 0;

  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
  // 1. Chargement  des stats
  this.rechargerStats();

  this.rendezVousService.nouveauxRdv$.subscribe(() => {
    this.rechargerStats();
  });
}

rechargerStats(): void {
  this.rendezVousService.getAllRendezVous().subscribe({
    next: (rdvList) => {
      const now = new Date();
      //  RDV dont la date est à venir ou maintenant
      this.value = rdvList.filter(rdv => new Date(rdv.date) >= now).length;
    },
    error: (err) => {
      console.error('Erreur chargement stats RDV :', err);
    }
  });
}

}
