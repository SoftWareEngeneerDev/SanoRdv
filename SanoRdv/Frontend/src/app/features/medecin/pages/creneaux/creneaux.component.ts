import { HttpClient } from '@angular/common/http';
import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { MedecinService } from '../../medecin.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-creneaux',
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css']
})
export class CreneauxComponent implements OnInit{
  viewDate: Date = new Date();
  selectedDate: Date = new Date ();
  idCreneauActuel: string | null = null;
  timeSlots: any[] = [];
  selectedSlots: string[] = [];
  medecinId: string | null = null;
  patientId: string | null = null;
  isMedecin: boolean = false;

  constructor(
    private http: HttpClient,
    private medecinService : MedecinService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.medecinId = params.get('medecinId');
      this.patientId = params.get('patientId');

      this.isMedecin = this.patientId === 'NaN';
      // if(this.patientId && this.medecinId ) {
      //   this.handleDayClick(this.selectedDate);
      // }
    })

  }

  previousMonth(): void {
    this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() - 1));
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() + 1));
  }

  //parcourir tout les timeslots enfin d'identifier celui dont le time egal hour
  toggleSlot(hour: string): void {
    this.timeSlots.forEach(slot =>{
      if(slot.time==hour){
        if (slot.status=='indisponible'){
          slot.status= 'disponible';
        }
        else if(slot.status=='disponible') {
          slot.status= 'indisponible';
        }
      }
    })
  }

  isSlotSelected(hour: string): boolean {
    return this.selectedSlots.includes(hour);
  }

  saveUnavailability(): void {
    const body = {
      idcreneau: this.idCreneauActuel,
      timeSlots: this.timeSlots,
    };

    this.medecinService.modifierCreneau(body).subscribe({
      next: (res: any) => {
        alert(res.message || 'Indisponibilités mises à jour');
        // this.selectedSlots = [];
      },
      error: (err) => {
        alert('Erreur serveur lors de la mise à jour du créneau');
        console.error(err);
      }
    });
  }

  handleDayClick(date: Date): void {
    this.selectedDate = date;
    const dateISO = date.toISOString().split('T')[0];
    const medecin = JSON.parse(localStorage.getItem('user') || '{}');
    const medecinId = medecin._id;
    if (!medecinId) {
      alert("Impossible de récupérer l'identifiant du médecin.");
      return;
    }
    this.medecinService.creerAgenda(dateISO, medecinId).subscribe({
      next: (res: any) => {
        console.log('Agenda créé ou récupéré avec succès:', res);
        const agenda = res?.data;
        if (agenda?._id) {
          localStorage.setItem('agendaId', agenda._id);
        }
        //Récupérer les créneaux générés pour cette date
        if (agenda?.creneaux?.length > 0) {
          const premierCreneau = agenda.creneaux[0];
          this.idCreneauActuel = premierCreneau._id;
          this.timeSlots = premierCreneau.timeSlots;
        } else {
          this.timeSlots = [];
        }
      },
      error: (err) => {
        console.error("Erreur lors de la création de l'agenda :", err);
        alert("Erreur lors de la création de l'agenda.");
      }
    });
  }

// this.router.navigate(['creneaux',this.medecinId,'NAN'])
}
