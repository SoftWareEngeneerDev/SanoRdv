import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedecinService } from '../../../../shared/services/medecin.service';
import { RecapService } from '../../services/recap.service';
import { format, addMonths, subMonths } from 'date-fns';
import { CalendarView } from 'angular-calendar';

@Component({
  selector: 'app-creneau',
  templateUrl: './creneau.component.html',
  styleUrls: ['./creneau.component.css']
})
export class CreneauComponent implements OnInit {

  /* ---------- Angular‑Calendar ---------- */
  view: CalendarView = CalendarView.Month;   // vue mensuelle
  CalendarView = CalendarView;               // alias pour le template
  viewDate: Date = new Date();               // date actuellement affichée

  /* ---------- Sélection et données ---------- */
  selectedDate: Date | null = null;
  selectedCreneau: string | null = null;
  horairesDispo: string[] = [];

  /* ---------- Médecin / agenda ---------- */
  medecinId!: string;
  agendaId!: string;

  /* ---------- Gestion d’erreur ---------- */
  messageErreur: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private medecinService: MedecinService,
    private recapService: RecapService,
    private router: Router
  ) {}

  /* ============================ INIT ============================ */
  ngOnInit(): void {
    /* Récupération de l’ID du médecin dans l’URL */
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.messageErreur = "Aucun identifiant de médecin trouvé.";
        return;
      }

      this.medecinId = id;
      this.messageErreur = null;

      /* Récupérer l’ID d’agenda du médecin */
      this.medecinService.getAgendaIdByMedecinId(this.medecinId).subscribe({
        next: agendaId => (this.agendaId = agendaId),
        error: () => (this.messageErreur = "Impossible de récupérer l'agenda du médecin.")
      });
    });
  }

  /* ===================== NAVIGATION MENSUELLE ===================== */
  moisPrecedent(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  moisSuivant(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  /* ====================== GESTION DU CLIC JOUR ===================== */
  dayClicked(date: Date): void {
    this.selectDate(date);
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    const dateString = format(date, 'yyyy-MM-dd');

    /* Réinitialise la sélection de créneau */
    this.selectedCreneau = null;
    this.messageErreur = null;

    /* --- Simulation backend --- */
    // this.horairesDispo = this.getFakeCreneaux(dateString);
    // if (this.horairesDispo.length === 0) {
    //   this.messageErreur = "Aucun créneau disponible pour cette date.";
    // }

    //  Exemple si tu repasses à l’API réelle
    if (!this.agendaId) {
      this.messageErreur = "L’agenda du médecin n’est pas encore chargé. Veuillez patienter.";
      return;
    }

    this.medecinService.getCreneauxDispoByAgenda(this.agendaId, dateString).subscribe({
      next: horaires => {
        this.horairesDispo = horaires;
        if (!horaires.length) {
          this.messageErreur = "Aucun créneau disponible pour cette date.";
        }
      },
      error: () => {
        this.horairesDispo = [];
        this.messageErreur = "Une erreur est survenue lors du chargement des créneaux.";
      }
    });

  }

  /* ======================= SÉLECTION CRÉNEAU ====================== */
  selectCreneau(horaire: string): void {
    this.selectedCreneau = horaire;
  }

  /* ========================= FAKE DONNÉES ========================= */
  // private getFakeCreneaux(dateString: string): string[] {
  //   const sample: Record<string, string[]> = {
  //     '2025-07-09': ['09:00', '10:30', '14:00', '16:30'],
  //     '2025-07-10': ['08:00', '12:00', '15:00'],
  //     '2025-07-11': ['11:00', '13:30', '17:00'],
  //   };
  //   return sample[dateString] ?? ['09:00', '10:00', '11:00', '14:00', '15:00'];
  // }

  /* ======================= NAVIGATION ÉTAPES ====================== */
  retourMotif(): void {
    if (this.selectedDate) {
      /* Premier clic : annule la sélection */
      this.selectedDate = null;
      this.selectedCreneau = null;
      this.horairesDispo = [];
    } else {
      /* Deuxième clic : retourne à la page Motif */
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

    /* Enregistre le créneau choisi dans le RecapService */
    const dateString = format(this.selectedDate, 'yyyy-MM-dd');
    this.recapService.setCreneau({ date: dateString, heure: this.selectedCreneau });

    /* Redirige vers le récapitulatif */
    this.router.navigate(['/patient/recapitulatif']);
  }
}
