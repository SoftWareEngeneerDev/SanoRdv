import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MedecinService } from '../../medecin.service';
@Component({
  selector: 'app-creneaux',
  templateUrl: './creneaux.component.html',
  styleUrls: ['./creneaux.component.css']
})
export class CreneauxComponent {
  viewDate: Date = new Date();
  selectedDate: Date | null = null;

  timeSlots: string[] = [
    '08:00', '08:30', '09:00',
    '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

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

  handleDayClick(date: Date): void {
    this.selectedDate = date;
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

    const dateKey = this.selectedDate.toISOString().split('T')[0];
    const agendaId = this.medecinService.getAgendaId();

    const body = {
      agendaId: agendaId,
      date: dateKey,
      heuresIndisponibles: this.selectedSlots
    };

    this.http.post('http://localhost:3000/api/creneaux/genererEtEnregistrer', body).subscribe({
      next: (res: any) => {
        alert(res.message || 'Créneaux enregistrés');
        this.selectedSlots = [];
      },
      error: (err) => {
        alert('Erreur serveur');
        console.error(err);
      }
    });
  }
}
