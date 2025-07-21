import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedecinService } from '../../../../shared/services/medecin.service';
import { RecapService } from '../../services/recap.service';
import {CreneauService } from '../../services/creneau.service';
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
  agendaId!: string;

  messageErreur: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private medecinService: MedecinService,
     private creneauService: CreneauService,
    private recapService: RecapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.messageErreur = "Aucun identifiant de médecin trouvé.";
        return;
      }

      this.medecinId = id;
      this.messageErreur = null;

      this.medecinService.getAgendaIdByMedecinId(this.medecinId).subscribe({
        next: (agendaId: string) => (this.agendaId = agendaId),
        error: () => (this.messageErreur = "Impossible de récupérer l'agenda du médecin.")
      });
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

    if (!this.agendaId) {
      this.messageErreur = "L’agenda du médecin n’est pas encore chargé. Veuillez patienter.";
      return;
    }

    // Récupère tous les créneaux disponibles
    this.creneauService.getCreneauxDispoByAgenda(this.agendaId, dateString).subscribe({
      next: horaires => {
        this.horairesDispo = horaires;
        if (!horaires.length) {
          this.messageErreur = "Aucun créneau disponible pour cette date.";
        }

        // Ensuite, récupérer les réservés pour la même date
        this.creneauService.getCreneauxReservesByAgenda(this.agendaId, dateString).subscribe({
          next: reserves => {
            this.creneauxReserves = reserves;
          },
          error: () => {
            this.creneauxReserves = [];
            console.warn("Impossible de récupérer les créneaux réservés.");
          }
        });
      },
      error: () => {
        this.horairesDispo = [];
        this.messageErreur = "Une erreur est survenue lors du chargement des créneaux.";
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
