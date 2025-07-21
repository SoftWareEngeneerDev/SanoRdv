import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedecinService } from '../../medecin.service';


interface PatientLocal {
  nom: string;
  prenom: string;
  photo?: string;
}
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  patient: PatientLocal = {
      nom: '',
      prenom: '',
      photo: ''
    };

    isCollapsed: boolean = false;

    @Output() sidebarToggled = new EventEmitter<boolean>();
    @Output() collapseChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private router: Router) {}

    ngOnInit(): void {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          this.patient.nom = userData.nom || '';
          this.patient.prenom = userData.prenom || '';
          this.patient.photo = userData.photo || ''; 
        } catch (e) {
          console.error('Erreur lecture patient localStorage', e);
        }
      }
    }

    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      this.collapseChange.emit(this.isCollapsed);
    }

    menuItems = [
      { title: 'TABLEAU DE BORD', link: '/medecin/dashboard', icon: 'bi-grid-fill' },
      { title: 'RENDEZ-VOUS', icon: 'bi-calendar-event', link: '/medecin/rendez-vous' },
      { title: 'AGENDA', icon: 'bi-people-fill', link: '/medecin/creneaux' },
      { title: 'PATIENTS', icon: 'bi-person-badge', link: '/medecin/patients' },
      { title: 'PROFIL', link: '/medecin/profil-view', icon: 'fas fa-user fa-0,5x' },
    ];
}
