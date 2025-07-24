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
  selectedMedecin: any;

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

      this.medecinService.getAgendaIdByMedecinId(this.medecinId).subscribe({
  next: (agendaId) => {
    this.agendaId = agendaId;
    console.log('Agenda ID reçu :', agendaId);
  },
  error: (err) => {
    console.error('Erreur récupération agenda ID :', err);
  }
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

    if (!this.medecinId) {
      this.messageErreur = "L'identifiant du médecin n'est pas disponible.";
      return;
    }

    console.log('Données envoyées au service afficherAgenda :', {
      medecin_id: this.medecinId,
      date: dateString
    });

    this.creneauService.afficherAgenda({
  medecinId: this.medecinId,
  date: dateString
}).subscribe({
  next: (response) => {
    if (response.success && response.data && response.data.creneaux) {
      const horairesSet = new Set<string>();

      response.data.creneaux.forEach((creneau: any) => {
        creneau.timeSlots.forEach((slot: any) => {
          if (slot.status === 'disponible') {
            horairesSet.add(slot.time);
          }
        });
      });

      this.horairesDispo = Array.from(horairesSet).sort((a, b) => {
        const [hA, mA] = a.split(':').map(Number);
        const [hB, mB] = b.split(':').map(Number);
        return hA !== hB ? hA - hB : mA - mB;
      });

      if (this.horairesDispo.length === 0) {
        this.messageErreur = "Aucun créneau disponible pour cette date.";
      } else {
        this.messageErreur = null;
      }
    } else {
      this.messageErreur = "Aucun agenda trouvé pour cette date.";
    }
  },
  error: (err) => {
    this.messageErreur = "Erreur lors de la récupération de l’agenda.";
    console.error(err);
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
