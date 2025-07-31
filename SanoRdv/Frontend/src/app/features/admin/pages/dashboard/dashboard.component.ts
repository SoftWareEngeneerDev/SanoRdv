import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

totalPatients: number | null = null;
medecinsActifs: number | null = null;
totalRendezVous: number | null = null;

  isLoading: boolean = true;

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerStats();
  }

  chargerStats(): void {
    this.isLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('Statistiques du tableau de bord:', data);
        this.totalPatients = data.totalPatients ;
        this.medecinsActifs = data.medecinsActifs ;
        this.totalRendezVous = data.totalRendezVous;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }
}
