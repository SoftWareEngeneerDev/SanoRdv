import { Component, OnInit } from '@angular/core';
import { StatsDossierService } from '../../services/stats-dossier.service';

@Component({
  selector: 'app-dossier',
  templateUrl: './dossier.component.html',
  styleUrls: ['./dossier.component.css']
})
export class DossierComponent implements OnInit {
  totalAjouts = 0;
value: any;

  constructor(private statsService: StatsDossierService) {}

  ngOnInit(): void {
    this.statsService.ajouts$.subscribe(count => this.totalAjouts = count);
  }
}
