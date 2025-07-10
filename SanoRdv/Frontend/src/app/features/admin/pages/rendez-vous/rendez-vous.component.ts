import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../models/rendez-vous.model';
import { RendezVousService } from '../../services/rendez-vous.service';

@Component({
  selector: 'app-rendez-vous',
  templateUrl: './rendez-vous.component.html',
  styleUrls: ['./rendez-vous.component.css']
})
export class RendezVousComponent implements OnInit {

    rendezVousList: RendezVous[] = [];

  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
    this.chargerRendezVous();
  }

  chargerRendezVous() {
    this.rendezVousService.getRendezVous().subscribe(data => {
      this.rendezVousList = data;
    });
  }

  annuler(id: string) {
    this.rendezVousService.annulerRendezVous(id).subscribe(() => {
      this.chargerRendezVous(); // rafraîchir après annulation
    });
  }

  modifier(id: string) {
    // Naviguer ou ouvrir un modal pour modifier (à faire plus tard)
    console.log('Modifier le rendez-vous avec ID :', id);
  }

}
