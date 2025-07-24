import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  sidebarOpen = false;
  isSidebarCollapsed = false;

  nbreDossiers = 0;
  totalNotif = 0;
  prenom = '';
  rdvTotal = 0;
  prochainRDV: any = null;
  totalDossiers = 0;

  isLoading = false;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading = true;

    // Récupérer l'objet user complet pour extraire _id
    const userDataString = localStorage.getItem('user');
    let patientId: string | null = null;

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        // Récupérer uniquement _id
        patientId = userData._id || null;
      } catch (e) {
        console.error('Erreur lors du parsing de user depuis localStorage', e);
      }
    }

    console.log('DashboardComponent - patientId récupéré:', patientId);

    if (!patientId || patientId.trim().length === 0) {
      console.warn('patientId non trouvé, chargement sans données spécifiques.');
      this.isLoading = false;
      // Optionnel : rediriger vers login si patientId manquant
      // this.router.navigate(['/patient/login']);
      return;
    }

    this.dashboardService.getDashboardData(patientId).subscribe({
      next: (data) => {
        this.prenom = data.prenom || 'Invité';
        this.rdvTotal = data.rdvTotal || 0;
        this.prochainRDV = data.prochainRDV || null;
        this.totalNotif = data.totalNotif || 0;
        this.totalDossiers = data.totalDossiers || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données du dashboard :', err);
        this.isLoading = false;
      }
    });
  }

  onSidebarToggle(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }

  rendezVous(): void {
    this.router.navigate(['/patient/pages/appointment']);
  }

  dossiers(): void {
    this.router.navigate(['/patient/pages/dossiers-medicaux']);
  }

  notifications(): void {
    this.router.navigate(['/patient/pages/notifications']);
  }
}
