import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MedecinService } from '../../../../shared/services/medecin.service';
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

  constructor(
    private route: ActivatedRoute,
    private medecinService: MedecinService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.medecinId = id;

        // On vide le message d'erreur
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
  }
}
