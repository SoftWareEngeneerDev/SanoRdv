/**import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RendezVousService } from '../../services/rendez-vous.service';
import { RendezVous } from '../../models/rendez-vous.model';
@Component({
  selector: 'app-detail-rendez-vous',
  templateUrl: './detail-rendez-vous.component.html',
  styleUrls: ['./detail-rendez-vous.component.css']
})
export class DetailRendezVousComponent implements OnInit {

  rendezVous: RendezVous | null = null;
  chargement = true;
  erreur: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private rendezVousService: RendezVousService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chargerDetailsRendezVous(+id);
    }
  }

  chargerDetailsRendezVous(id: number): void {
    this.rendezVousService.getDetailsRendezVous(id).subscribe({
      next: (rendezVous) => {
        this.rendezVous = rendezVous;
        this.chargement = false;
      },
      error: (err) => {
        this.erreur = err.message || 'Erreur lors du chargement';
        this.chargement = false;
      }
    });
  }

  formaterDateHeureFrancais(dateHeure: { debut: Date, fin: Date }): string {
  const debut = new Date(dateHeure.debut);
  const fin = new Date(dateHeure.fin);
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return `${debut.toLocaleDateString('fr-FR', options)} - ${fin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}
}
*/



   import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RendezVousService } from '../../services/rendez-vous.service';
import { RendezVous } from '../../models/rendez-vous.model';

interface RendezVousAvecDateHeure extends RendezVous {
  dateHeure: Date;
}

@Component({
  selector: 'app-detail-rendez-vous',
  templateUrl: './detail-rendez-vous.component.html',
  styleUrls: ['./detail-rendez-vous.component.css']
})
export class DetailRendezVousComponent implements OnInit {

  rendezVous: RendezVousAvecDateHeure | null = null;
  chargement = true;
  erreur: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private rendezVousService: RendezVousService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chargerDetailsRendezVous(id);
    }
  }

  chargerDetailsRendezVous(id: string): void {
    this.rendezVousService.getDetailsRendezVous(id).subscribe({
      next: (rendezVous) => {
        this.rendezVous = {
          ...rendezVous,
          dateHeure: new Date(`${rendezVous.creneau.date}T${rendezVous.time}`),
          patient: {
            ...rendezVous.patient,
            nomComplet: `${rendezVous.patient.prenom} ${rendezVous.patient.nom}`
          }
        };
        this.chargement = false;
      },
      error: (err) => {
        this.erreur = err.message || 'Erreur lors du chargement';
        this.chargement = false;
      }
    });
  }

  formaterDateFrancais(date: Date | string, time: string): string {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
