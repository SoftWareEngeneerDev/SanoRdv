import { Component, OnInit } from '@angular/core';
import { SpecialiteService } from '../../services/specialite.service';
import { Specialite } from '../../models/specialites.model';

@Component({
  selector: 'app-specialites',
  templateUrl: './specialites.component.html',
  styleUrls: ['./specialites.component.css']
})
export class SpecialitesComponent implements OnInit {

      specialites: Specialite[] = [];
  nouvelleSpecialite: string = '';

  constructor(private specialiteService: SpecialiteService) {}

  ngOnInit(): void {
    this.chargerSpecialites();
  }

  chargerSpecialites() {
    this.specialiteService.getSpecialites().subscribe(data => {
      this.specialites = data;
    });
  }

  ajouterSpecialite() {
    if (!this.nouvelleSpecialite.trim()) return;

    this.specialiteService.ajouterSpecialite({ nom: this.nouvelleSpecialite }).subscribe(() => {
      this.nouvelleSpecialite = '';
      this.chargerSpecialites();
    });
  }

  supprimerSpecialite(id: string) {
    this.specialiteService.supprimerSpecialite(id).subscribe(() => {
      this.chargerSpecialites();
    });
  }

}
