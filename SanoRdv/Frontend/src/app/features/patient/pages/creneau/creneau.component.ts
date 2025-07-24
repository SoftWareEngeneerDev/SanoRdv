import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecapService } from '../../services/recap.service';
import { CreneauService } from '../../services/creneau.service';
import { MedecinService } from '../../../../shared/services/medecin.service';
import { format, addMonths, subMonths } from 'date-fns';
import { CalendarView } from 'angular-calendar';

@Component({
  selector: 'app-creneau',
  templateUrl: './creneau.component.html',
  styleUrls: ['./creneau.component.css']
})
export class CreneauComponent implements OnInit {

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();

  selectedDate: Date | null = null;
  selectedCreneau: string | null = null;
  horairesDispo: string[] = [];
  creneauxReserves: string[] = [];

  medecinId!: string;
  patientId!: string;
  messageErreur: string | null = null;
  agendaId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private creneauService: CreneauService,
    private recapService: RecapService,
    private medecinService: MedecinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const medecinId = params.get('medecin_id');
      console.log('ID médecin récupéré :', medecinId);

      if (!medecinId) {
        this.messageErreur = "Aucun identifiant de médecin trouvé.";
        return;
      }

      this.medecinId = medecinId;
      this.messageErreur = null;
    });
  }

  moisPrecedent(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  moisSuivant(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  dayClicked(date: Date): void {
    this.selectDate(date);
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    const dateString = format(date, 'yyyy-MM-dd');

    this.selectedCreneau = null;
    this.messageErreur = null;
    this.horairesDispo = [];
    this.creneauxReserves = [];

    if (!this.medecinId) {
      this.messageErreur = "L'identifiant du médecin n'est pas disponible.";
      return;
    }

    this.creneauService.afficherAgenda({ medecinId: this.medecinId, date: dateString }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data._id) {
          this.agendaId = response.data._id;

          // Vérification de agendaId 
          if (!this.agendaId) {
            this.messageErreur = "Agenda ID introuvable dans la réponse.";
            return;
          }

          this.creneauService.getCreneauxDispoByAgenda(this.agendaId, dateString).subscribe({
            next: (disponibles) => {
              this.horairesDispo = disponibles;

              this.creneauService.getCreneauxReservesByAgenda(this.agendaId!, dateString).subscribe({
                next: (reserves) => {
                  this.creneauxReserves = reserves;

                  if (this.horairesDispo.length === 0) {
                    this.messageErreur = "Aucun créneau disponible pour cette date.";
                  } else {
                    this.messageErreur = null;
                  }
                },
                error: (err) => {
                  console.error('Erreur récupération créneaux réservés:', err);
                  this.messageErreur = "Erreur lors de la récupération des créneaux réservés.";
                }
              });
            },
            error: (err) => {
              console.error('Erreur récupération créneaux disponibles:', err);
              this.messageErreur = "Erreur lors de la récupération des créneaux disponibles.";
            }
          });
        } else {
          this.messageErreur = "Aucun agenda trouvé pour ce médecin à cette date.";
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l’agenda:', err);
        this.messageErreur = "Erreur lors de la récupération de l’agenda.";
      }
    });
  }

  isReserved(horaire: string): boolean {
    return this.creneauxReserves.includes(horaire);
  }

  selectCreneau(horaire: string): void {
    if (!this.isReserved(horaire)) {
      this.selectedCreneau = horaire;
    }
  }

  retourMotif(): void {
    if (this.selectedDate) {
      this.selectedDate = null;
      this.selectedCreneau = null;
      this.horairesDispo = [];
      this.creneauxReserves = [];
    } else {
      this.router.navigate(['/patient/motif']);
    }
  }

  allerSuivant(): void {
    if (!this.selectedDate) {
      this.messageErreur = "Veuillez sélectionner une date avant de continuer.";
      return;
    }
    if (!this.selectedCreneau) {
      this.messageErreur = "Veuillez sélectionner un créneau horaire avant de continuer.";
      return;
    }

    const dateString = format(this.selectedDate, 'yyyy-MM-dd');
    this.recapService.setCreneau({ date: dateString, heure: this.selectedCreneau });
    this.router.navigate(['/patient/recapitulatif']);
  }
}
