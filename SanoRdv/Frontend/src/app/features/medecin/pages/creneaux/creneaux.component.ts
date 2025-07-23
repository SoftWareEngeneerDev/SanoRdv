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
    if(this.patientId && this.medecinId ) {
      this.handleDayClick(this.selectedDate);
    }
    
  })
  
}
// obtenirAgenda(): void {
//   if (!this.medecinId) ;

//   this.medecinService.obtenirAgenda(this.medecinId, this.selectedDate).subscribe({
//     next: (agendaId) => {
//       this.timeSlots = agendaId;
//       console.log('Créneaux disponibles récupérés:', this.timeSlots);
//     },
//     error: (err) => {
//       console.error("Erreur lors de la récupération des créneaux disponibles :", err);
//     }
//   });
// }

  // chargerSlotDisponibles() {
    
  //   this.medecinService.getCreneauxDisponibles(this.selectedDate, this.medecinId).subscribe({
  //     next:(data)=> {
  //       this.timeSlots = data;
  //     },
  //      error: (err) => {
  //       console.error('erreur du chargement du creneau :', err);
  //      }
  //   })
  // }
  



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
      this.selectedSlots = [];
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
  if (!this.medecinId) {
    alert("Impossible de récupérer l'identifiant du médecin.");
    return;
  }
  if (this.isMedecin) {
    
    this.medecinService.creerAgenda(dateISO, this.medecinId).subscribe({
      next: (res: any) => {
        console.log('Agenda créé ou récupéré avec succès:', res);
        const agenda = res?.data;
        if (agenda?._id) {
          localStorage.setItem('agendaId', agenda._id);
        }
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
  } else {
    
    this.medecinService.obtenirAgenda(this.medecinId, dateISO).subscribe({
      next: (data: any) => {
        this.timeSlots = data.timeSlots || [];
        this.idCreneauActuel = data._id || null;
        console.log('Créneaux disponibles chargés pour patient:', this.timeSlots);
      },
      error: (err) => {
        console.error('Erreur chargement créneaux disponibles:', err);
        this.timeSlots = [];
      }
    });
  }
}








  
// this.router.navigate(['creneaux',this.medecinId,'NAN'])

}
