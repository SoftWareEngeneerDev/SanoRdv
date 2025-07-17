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

  constructor(private adminService: AdminService ) {}

  ngOnInit(): void {
    this.chargerStats();
    
  }

  chargerStats(): void {
    this.adminService.getDashboardStats().subscribe(data => {
      this.totalPatients = data.totalPatients;
      this.medecinsActifs = data.medecinsActifs;
      this.totalRendezVous = data.totalRendezVous;
    });
  }

 
}



