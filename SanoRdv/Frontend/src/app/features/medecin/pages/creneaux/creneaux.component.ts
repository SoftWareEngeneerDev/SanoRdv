import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../../Medecin.service';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { addMonths, subMonths } from 'date-fns';

@Component({
  selector: 'app-creneaux',
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css']
})
export class CreneauxComponent {
  viewDate: Date = new Date(); // mois affiché
  selectedDate: Date | null = null;

  timeSlots: string[] = [
    '08:00', '09:00', '10:00',
    '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00',
    '17:00', '18:00'
  ];

  selectedSlots: string[] = [];

  previousMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  handleDayClick(date: Date): void {
    this.selectedDate = date;
    const dateKey = date.toISOString().split('T')[0];
    // Appelle ton API ici pour récupérer les créneaux s'il y a une connexion avec le backend
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
    if (!this.selectedDate) return;
    const dateKey = this.selectedDate.toISOString().split('T')[0];
    // Appelle API POST ici
    alert(`Indisponibilités sauvegardées pour le ${dateKey}`);
  }
}
