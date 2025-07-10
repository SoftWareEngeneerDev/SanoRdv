import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../medecin.service';

@Component({
  selector: 'app-creneaux',
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css']
})
export class CreneauxComponent implements OnInit {

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {}
}
