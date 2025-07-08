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
    this.rendezVousService.nouveauxRdv$.subscribe(count => {
      this.value = count;
    });
  }
}
