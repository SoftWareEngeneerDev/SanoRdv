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
  selectedSlot: any = null;
  listeDeSlots: any[] = [];
  timeSlotGlobal: any[] = [];

  medecinId!: string;
  patientId!: string;
  messageErreur: string = '';
  idcreneau: string = '';

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
      this.messageErreur = '';
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
    this.messageErreur = '';
    this.listeDeSlots = [];

    this.medecinService.creerAgenda(dateISO, this.medecinId).subscribe({
      next: (res: any) => {
        const agenda = res?.data;
        if (agenda?._id) {
          const creneaux = agenda.creneaux;
          this.timeSlotGlobal = creneaux[0].timeSlots;
          this.idcreneau = creneaux[0]._id;

          console.log('afficher creneau:', creneaux);

          for (let slot of this.timeSlotGlobal) {
            const dejaExistant = this.listeDeSlots.some(s => s.time === slot.time);
            if (!dejaExistant && (
              slot.status === 'disponible' ||
              (slot.status === 'reserve' && slot.patientId === this.patientId)
            )) {
              this.listeDeSlots.push(slot);
            }
          }

          if (this.listeDeSlots.length === 0) {
            this.messageErreur = "Aucun créneau disponible pour cette date.";
          } else {
            this.messageErreur = '';
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

    return this.listeDeSlots.some(slot => slot.time === horaire && slot.status === 'reserve');
  }

  // selectCreneau(creneauString: string): void {
  //   this.listeDeSlots.forEach(slot => {
  //     if (slot.time === creneauString) {
  //       if (slot.status === 'disponible') {
  //         slot.status = 'reserve';
  //         slot.patientId = this.patientId;
  //         this.selectedSlot = slot;
  //       }
  //     }
  //   });

  //   this.listeDeSlots.forEach(slot => {
  //     if (slot.time !== this.selectedSlot.time) {
  //       slot.status = 'disponible';
  //       slot.patientId = '';
  //     }
  //   });
  // }


  selectCreneau(creneauString: string): void {
  const slotSelectionne = this.listeDeSlots.find(slot => slot.time === creneauString && slot.status === 'disponible');

  if (!slotSelectionne) {
    alert("Ce créneau n'est plus disponible.");
    return;
  }

  this.selectedSlot = slotSelectionne;

  // Optionnel : visuellement, si tu veux indiquer le slot sélectionné
  this.listeDeSlots.forEach(slot => {
    slot.isSelected = slot._id === this.selectedSlot._id;
  });
}



  retourMotif(): void {
    this.router.navigate(['/patient/motif', this.medecinId, this.patientId]);
  }

  allerSuivant(): void {
    if (!this.selectedSlot) {
      alert("Veuillez sélectionner un créneau horaire avant de continuer.");
      return;
    }

    this.recapService.setCreneau({
      patientId: this.patientId,
      dateSelectionne: this.selectedDate,
      slot: this.selectedSlot,
      timeSlots: this.timeSlotGlobal,
      idcreneau: this.idcreneau
    });

    this.router.navigate(['/patient/recapitulatif']);
  }
}
