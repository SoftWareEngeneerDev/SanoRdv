import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MedecinService } from '../../medecin.service';
@Component({
  selector: 'app-creneaux',
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css']
})
export class CreneauxComponent{
  viewDate: Date = new Date();
  selectedDate: Date | null = null;
  idCreneauActuel: string | null = null;
  timeSlots: string[] = [];
  selectedSlots: string[] = [];

  constructor(
    private http: HttpClient,
    private medecinService : MedecinService
  ) {}

  previousMonth(): void {
    this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() - 1));
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() + 1));
  }

  toggleSlot(hour: string): void {
    const index = this.selectedSlots.indexOf(hour);
    if (index === -1) {
      this.selectedSlots.push(hour);
    } else {
      this.selectedSlots.splice(index, 1);
    }
  }

  isSlotSelected(hour: string): boolean {
    return this.selectedSlots.includes(hour);
  }

  saveUnavailability(): void {
  if (!this.selectedDate || this.selectedSlots.length === 0) {
    alert('Veuillez sélectionner une date et au moins une heure.');
    return;
  }

  if (!this.idCreneauActuel) {
    alert("Aucun créneau associé à cette date.");
    return;
  }

  // On récupère tous les timeSlots, avec les heures sélectionnées marquées comme indisponibles
  const updatedSlots = this.timeSlots.map((hour) => ({
    time: hour,
    status: this.selectedSlots.includes(hour) ? 'indisponible' : 'disponible'
  }));

  const body = {
    idcreneau: this.idCreneauActuel,
    timeSlots: updatedSlots
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

      // 🎯 Récupérer les créneaux générés pour cette date
      if (agenda?.creneaux?.length > 0) {
        const premierCreneau = agenda.creneaux[0];
        this.idCreneauActuel = premierCreneau._id;
        this.timeSlots = premierCreneau.timeSlots.map((slot: any) => slot.time);
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


}
