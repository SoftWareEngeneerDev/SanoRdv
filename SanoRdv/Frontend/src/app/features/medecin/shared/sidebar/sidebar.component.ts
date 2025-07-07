import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MedecinService } from '../../medecin.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed: boolean = false;
  @Output() collapseChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  medecin = {
    nom: 'Ouédraogo',
    prenom: 'Issa',
    avatar: 'assets/images/faiçal.jpg'
  };

  ngOnInit(): void {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseChange.emit(this.isCollapsed);
  }

  menuItems = [
    { title: 'Tableau de bord', icon: 'bi-grid-fill', link: '/medecin/dashboard' },
    { title: 'Mes Rendez-vous', icon: 'bi-calendar-event', link: '/medecin/rendez-vous' },
    { title: 'Creneaux', icon: 'bi-people-fill', link: '/medecin/creneaux' },
    { title: 'Patients', icon: 'bi-person-badge', link: '/medecin/patients' }
  ];
}
