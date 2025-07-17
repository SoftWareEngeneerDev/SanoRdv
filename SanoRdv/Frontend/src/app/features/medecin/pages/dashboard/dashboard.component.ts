import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../../medecin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private medecinService: MedecinService, private router: Router) {}

  totalAjouts = 32;
  unreadCount: number = 6;

  monthName: string = '';
  dayNumber: number = 0;

  appointmentCount: number = 0;         // Total des rendez-vous
  confirmedCount: number = 0;          // Confirmés
  cancelledCount: number = 0;          // Annulés

  ngOnInit(): void {
    const today = new Date();
    this.monthName = today.toLocaleDateString('fr-FR', { month: 'long' });
    this.dayNumber = today.getDate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log("👤 Utilisateur depuis localStorage :", user);
    const medecinId = user._id;

    if (medecinId) {
      this.medecinService.getRendezVousParMedecin(medecinId).subscribe(rdv => {
        console.log("✅ Tous les rendez-vous :", rdv);
        console.log("👤 Utilisateur depuis localStorage :", user);

        this.appointmentCount = rdv.length;
        this.confirmedCount = rdv.filter((a: any) => a.statut === 'confirmé').length;
        this.cancelledCount = rdv.filter((a: any) => a.statut === 'annulé').length;
      }, (err: any) => {
        console.error('❌ Erreur chargement rendez-vous:', err);
      });
    } else {
      console.error('❌ Médecin non connecté');
    }
  }
   goToRendezVous(): void {
    this.router.navigate(['/medecin/rendez-vous']);
  }
}
