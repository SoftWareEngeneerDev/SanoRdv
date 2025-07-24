import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  sidebarOpen: any;
  toggleSidebar() {
    throw new Error('Method not implemented.');
  }

  nbreDossiers = 0;
  totalNotif: number = 0;
  prenom: string = 'Invité';
  rdvTotal: number = 0;
  prochainRDV: any = null;
  data: any;
  totalDossiers: number = 0;
  isSidebarCollapsed = false;

  isLoading = false;

  onSidebarToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    const patientId = localStorage.getItem('patientId');

    if (patientId && patientId.trim().length > 0) {
      this.dashboardService.getDashboardData(patientId).subscribe({
        next: (data: { prenom: string; rdvTotal: number; prochainRDV: any; totalNotif: number; totalDossiers: number; }) => {
          this.prenom = data.prenom;
          this.rdvTotal = data.rdvTotal;
          this.prochainRDV = data.prochainRDV;
          this.totalNotif = data.totalNotif;
          this.totalDossiers = data.totalDossiers;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Erreur lors du chargement des données du dashboard :', err);
          this.isLoading = false;
        }
      });
    } else {
      console.warn('patientId non trouvé, chargement sans données spécifiques.');
      this.isLoading = false;
    }
  }

  rendezVous() {
    this.router.navigate(['/patients/pages/appointment']);
  }

  dossiers() {
    this.router.navigate(['/patients/pages/dossiers-medicaux']);
  }

  notifications() {
    this.router.navigate(['/patients/pages/notifications']);
  }
}
