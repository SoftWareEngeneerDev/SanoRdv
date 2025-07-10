import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedecinService } from '../../medecin.service';


interface PatientLocal {
  nom: string;
  prenom: string;
  photo?: string;
  // ajoute d'autres champs si besoin
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
      // Récupérer les données patient stockées en JSON dans localStorage sous la clé 'user'
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          this.patient.nom = userData.nom || '';
          this.patient.prenom = userData.prenom || '';
          this.patient.photo = userData.photo || '';  // peut être vide
        } catch (e) {
          console.error('Erreur lecture patient localStorage', e);
        }
      }
    }

    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      this.collapseChange.emit(this.isCollapsed);
    }

    // goToProfileEdit(): void {
    //   this.router.navigate(['']);
    // }

    menuItems = [
      { title: 'Tableau de bord', link: '/medecin/dashboard', icon: 'bi-grid-fill' },
       { title: 'Mes Rendez-vous', icon: 'bi-calendar-event', link: '/medecin/rendez-vous' },
      { title: 'Agenda', icon: 'bi-people-fill', link: '/medecin/creneaux' },
      { title: 'Patients', icon: 'bi-person-badge', link: '/medecin/patients' },
      // { title: 'Profil', link: '/patient/', icon: 'bi-gear' },
    ];
  // isCollapsed: boolean = false;
  // @Output() collapseChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  // medecin = {
  //   nom: 'Ouédraogo',
  //   prenom: 'Issa',
  //   avatar: 'assets/images/faiçal.jpg'
  // };

  // ngOnInit(): void {}

  // toggleSidebar() {
  //   this.isCollapsed = !this.isCollapsed;
  //   this.collapseChange.emit(this.isCollapsed);
  // }

  // menuItems = [
  //   { title: 'Tableau de bord', icon: 'bi-grid-fill', link: '/medecin/dashboard' },
  //   { title: 'Mes Rendez-vous', icon: 'bi-calendar-event', link: '/medecin/rendez-vous' },
  //   { title: 'Agenda', icon: 'bi-people-fill', link: '/medecin/creneaux' },
  //   { title: 'Patients', icon: 'bi-person-badge', link: '/medecin/patients' }
  // ];
}
