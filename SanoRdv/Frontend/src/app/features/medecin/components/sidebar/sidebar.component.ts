import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedecinService } from '../../medecin.service';


interface userLocalData {
  _id: string;
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
  user: userLocalData = {
     _id: '',
      nom: '',
      prenom: '',
      photo: ''
    };

    isCollapsed: boolean = false;
    menuItems: any[] = [];

    @Output() sidebarToggled = new EventEmitter<boolean>();
    @Output() collapseChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private router: Router) {}

    ngOnInit(): void {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          this.user.nom = userData.nom || '';
          this.user.prenom = userData.prenom || '';
          this.user.photo = userData.photo || '';
          this.user._id = userData._id;

      this.menuItems = [
        { title: 'TABLEAU DE BORD', link: '/medecin/dashboard', icon: 'bi-grid-fill' },
        { title: 'RENDEZ-VOUS', icon: 'bi-calendar-event', link: '/medecin/rendez-vous' },
        { title: 'AGENDA', icon: 'bi-people-fill', link: `/medecin/creneaux/${this.user._id}/NAN` },
        { title: 'PATIENTS', icon: 'bi-person-badge', link: '/medecin/patients' },
        { title: 'NOTIFICATIONS', icon: 'bi bi-bell-fill fs-5', link: '/medecin/notifications' },
        { title: 'PROFIL', link: '/medecin/profil-view', icon: 'fas fa-user fa-0,5x' },
      ];
      } catch (e) {
            console.error('Erreur lecture patient localStorage', e);
      }
    }
  }

      toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
        this.collapseChange.emit(this.isCollapsed);
      }

}

