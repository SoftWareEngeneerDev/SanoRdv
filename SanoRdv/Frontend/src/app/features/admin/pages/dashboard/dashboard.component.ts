import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AdminService } from '../../admin.service';
import { StatistiqueService } from '../../services/statistique.service';


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
    elements: {
      line: { tension: 0.4 }
    },
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {},
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
  };

  chartType: 'line' = 'line';

  chartData: ChartData<'line'> = {
    labels: ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'],
    datasets: [
      {
        data: [],
        label: 'Rendez-vous',
        borderColor: '#0052cc',
        backgroundColor: 'rgba(0, 119, 255, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  constructor(private adminService: AdminService, private statistiqueService: StatistiqueService ) {}

  ngOnInit(): void {
    this.chargerStats();
    this.chargerRendezVousGraphique();
  }

  chargerStats(): void {
    this.adminService.getDashboardStats().subscribe(data => {
      this.totalPatients = data.totalPatients;
      this.medecinsActifs = data.medecinsActifs;
      this.totalRendezVous = data.totalRendezVous;
    });
  }

  chargerRendezVousGraphique(): void {
  this.statistiqueService.getRapportHebdo().subscribe(data => {
    const labels = data.map(stat => {
      const date = new Date(stat.date);
      const jours = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
      return jours[date.getDay()];
    });

    const counts = data.map(stat => stat.count);

    this.chartData.labels = labels;
    this.chartData.datasets[0].data = counts;
  });
}


}
