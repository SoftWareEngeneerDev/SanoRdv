import { Component, OnInit } from '@angular/core';
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



