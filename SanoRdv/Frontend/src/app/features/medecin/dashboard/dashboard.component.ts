import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  value: number = 10;
  totalAjouts = 32;
  unreadCount: number = 6;

    // constructor(private rendezVousService: RendezVousService) {}

    // ngOnInit(): void {
    //   this.rendezVousService.nouveauxRdv$.subscribe(count => {
    //     this.value = count;
    //   });
    // }

}
