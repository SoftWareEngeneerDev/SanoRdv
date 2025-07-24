import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecapService } from '../../services/recap.service';
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
  selectedDate: Date = new Date();

  selectedCreneau: string | null = null;
  horairesDispo: string[] = [];
  creneauxReserves: string[] = [];

  medecinId!: string;
  patientId!: string;
  messageErreur: string | null = null;
  agendaId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private recapService: RecapService,
    private medecinService: MedecinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patientId = localStorage.getItem('patientId') || '';

    this.route.paramMap.subscribe(params => {
      const medecinId = params.get('medecin_id');
      if (!medecinId) {
        this.messageErreur = "Aucun identifiant de médecin trouvé.";
        return;
      }
      this.medecinId = medecinId;
      this.messageErreur = null;
      this.selectDate(this.selectedDate);
    });
  }

  moisPrecedent(): void {
    this.selectedDate = subMonths(this.selectedDate, 1);
    this.selectDate(this.selectedDate);
  }

  moisSuivant(): void {
    this.selectedDate = addMonths(this.selectedDate, 1);
    this.selectDate(this.selectedDate);
  }

  dayClicked(date: Date): void {
    this.selectDate(date);
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    const dateISO = format(date, 'yyyy-MM-dd');

    this.selectedCreneau = null;
    this.messageErreur = null;
    this.horairesDispo = [];
    this.creneauxReserves = [];

    if (!this.medecinId) {
      this.messageErreur = "L'identifiant du médecin n'est pas disponible.";
      return;
    }

    this.medecinService.creerAgenda(dateISO, this.medecinId).subscribe({
      next: (res: any) => {
        const agenda = res?.data;
        if (agenda?._id) {
          this.agendaId = agenda._id;
          localStorage.setItem('agendaId', agenda._id);

          const creneaux = agenda.creneaux || [];
          this.horairesDispo = [];
          this.creneauxReserves = [];

          for (let creneau of creneaux) {
            for (let slot of creneau.timeSlots) {
              if (slot.status === 'disponible' && !this.horairesDispo.includes(slot.time)) {
                this.horairesDispo.push(slot.time);
              }
              if (slot.status === 'reserve' && slot.patient === this.patientId && !this.creneauxReserves.includes(slot.time)) {
                this.creneauxReserves.push(slot.time);
              }
            }
          }

          if (this.horairesDispo.length === 0 && this.creneauxReserves.length === 0) {
            this.messageErreur = "Aucun créneau disponible pour cette date.";
          } else {
            this.messageErreur = null;
          }
        }
      },
      error: (err: any) => {
        console.error("Erreur lors de la récupération de l'agenda :", err);
        this.messageErreur = "Erreur lors de la récupération de l'agenda.";
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
    this.router.navigate(['/patient/motif', this.medecinId, this.patientId]);
  }

  allerSuivant(): void {
    if (!this.selectedCreneau) {
      alert("Veuillez sélectionner un créneau horaire avant de continuer.");
      return;
    }

    const dateString = format(this.selectedDate, 'yyyy-MM-dd');

    // Stocker uniquement la date et l'heure du créneau sélectionné
    this.recapService.setCreneau({
      date: dateString, heure: this.selectedCreneau,
      _id: ''
    });

    this.router.navigate(['/patient/recapitulatif']);
  }
}
