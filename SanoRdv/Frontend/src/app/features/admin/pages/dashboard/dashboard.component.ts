import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

      totalPatients: number = 0;
      medecinsActifs: number = 0;
      totalRendezVous: number = 0;


    chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  chartType: 'line' = 'line';

  chartData: ChartData<'line'> = {
  labels: [],
  datasets: [
    {
      data: [],
      label: 'Rendez-vous'
    }
  ]
};


  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getRendezVousStats7DerniersJours().subscribe(stats => {
  this.chartData.labels = stats.labels;
  this.chartData.datasets[0].data = stats.donnees;
});

  }

  chargerStats(): void {
    this.adminService.getDashboardStats().subscribe(data => {
      this.totalPatients = data.totalPatients;
      this.medecinsActifs = data.medecinsActifs;
      this.totalRendezVous = data.totalRendezVous;
    });
  }

  chargerRendezVousGraphique(): void {
    this.adminService.getRendezVousStats7DerniersJours().subscribe(data => {
      this.chartData.labels = data.labels;  // ["LUN", "MAR", ...]
      this.chartData.datasets[0].data = data.donnees;  // [5, 12, 8, ...]
    });
  }

}
