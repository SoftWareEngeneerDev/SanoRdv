import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedecinService } from '../../../../shared/services/medecin.service';
import { RecapService } from '../../services/recap.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-creneau',
  templateUrl: './creneau.component.html',
  styleUrls: ['./creneau.component.css']
})
export class CreneauComponent implements OnInit {
  viewDate: Date = new Date();
  selectedDate: Date | null = null;
  horairesDispo: string[] = [];
  medecinId!: string;
  agendaId!: string;
  messageErreur: string | null = null;

  selectedCreneau: string | null = null; // <- Créneau sélectionné

  constructor(
    private route: ActivatedRoute,
    private medecinService: MedecinService,
    private recapService: RecapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.medecinId = id;
        this.messageErreur = null;

        this.medecinService.getAgendaIdByMedecinId(this.medecinId).subscribe({
          next: (agendaId) => {
            this.agendaId = agendaId;
          },
          error: () => {
            this.messageErreur = "Impossible de récupérer l'agenda du médecin.";
          }
        });

      } else {
        this.messageErreur = "Aucun identifiant de médecin trouvé.";
      }
    });
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    const dateString = format(date, 'yyyy-MM-dd');

    // Réinitialiser la sélection de créneau quand on change de date
    this.selectedCreneau = null;

    // Simule la récupération de créneaux sans backend
    this.messageErreur = null;
    this.horairesDispo = this.getFakeCreneaux(dateString);

    if (this.horairesDispo.length === 0) {
      this.messageErreur = "Aucun créneau disponible pour cette date.";
    }

    /*
    // Si tu veux revenir à la vraie API, décommente cette partie et supprime la simulation au-dessus
    if (!this.agendaId) {
      this.messageErreur = "L’agenda du médecin n’est pas encore chargé. Veuillez patienter.";
      return;
    }

    this.messageErreur = null;

    this.medecinService.getCreneauxDispoByAgenda(this.agendaId, dateString).subscribe({
      next: (horaires) => {
        this.horairesDispo = horaires;
        if (horaires.length === 0) {
          this.messageErreur = "Aucun créneau disponible pour cette date.";
        }
      },
      error: () => {
        this.horairesDispo = [];
        this.messageErreur = "Une erreur est survenue lors du chargement des créneaux.";
      }
    });
    */
  }

  selectCreneau(horaire: string): void {
    this.selectedCreneau = horaire;
  }

  private getFakeCreneaux(dateString: string): string[] {
    const sampleCreneaux: { [key: string]: string[] } = {
      '2025-07-09': ['09:00', '10:30', '14:00', '16:30'],
      '2025-07-10': ['08:00', '12:00', '15:00'],
      '2025-07-11': ['11:00', '13:30', '17:00'],
    };

    if (sampleCreneaux[dateString]) {
      return sampleCreneaux[dateString];
    } else {
      return ['09:00', '10:00', '11:00', '14:00', '15:00'];
    }
  }

  retourMotif(): void {
    if (this.selectedDate) {
      // Premier clic : annule la sélection
      this.selectedDate = null;
      this.horairesDispo = [];
      this.selectedCreneau = null;
    } else {
      // Deuxième clic : redirige vers la page du motif
      this.router.navigate(['/patient/motif']);
    }
  }

 allerSuivant(): void {
  if (!this.selectedCreneau) {
    this.messageErreur = "Veuillez sélectionner un créneau horaire avant de continuer.";
    return;
  }
  if (!this.selectedDate) {
    this.messageErreur = "Veuillez sélectionner une date avant de continuer.";
    return;
  }

  // Convertir la date en string format 'yyyy-MM-dd'
  const dateString = format(this.selectedDate, 'yyyy-MM-dd');

  this.recapService.setCreneau({
    date: dateString,
    heure: this.selectedCreneau
  });

  this.router.navigate(['/patient/recapitulatif']);
}

}
