import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../medecin.service';

@Component({
  selector: 'app-my-appointment',
  templateUrl: './my-appointment.component.html',
  styleUrls: ['./my-appointment.component.css']
})
export class MyAppointmentComponent implements OnInit {
  rendezVous: any[] = [];

  constructor(private medecinService: MedecinService) {}

  ngOnInit(): void {
    const medecinId = '123'; // Remplace par l'ID réel du médecin (à récupérer depuis le token ou session)
    this.medecinService.getRendezVousPourMedecin(medecinId).subscribe({
      next: (data) => {
        this.rendezVous = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous', err);
      }
    });
  }
}
