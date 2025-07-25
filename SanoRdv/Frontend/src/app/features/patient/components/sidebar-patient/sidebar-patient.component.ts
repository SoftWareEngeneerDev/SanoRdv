import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  photo?: string;
  // ajoute d'autres champs si besoin
}

@Component({
  selector: 'app-sidebar-patient',
  templateUrl: './sidebar-patient.component.html',
  styleUrls: ['./sidebar-patient.component.css']
})
export class SidebarPatientComponent implements OnInit {
  patient: Patient = {
    _id: '',
    nom: '',
    prenom: '',
    photo: '',
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
        this.patient._id = userData._id ;
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

  goToProfileEdit(): void {
    this.router.navigate(['/patient/modifier']);
  }

  menuItems = [
    { title: 'Tableau de bord', link: '/patient/dashboard', icon: 'bi-grid-fill' },
    { title: 'Mes rendez-vous', link: '/patient/appointment', icon: 'bi-calendar-event' },
    { title: 'Notifications', link: '/patient/notifications', icon: 'bi-bell' },
    { title: 'Dossiers medicaux', link: '/patient/dossiers-medicaux', icon: 'bi-file-earmark-medical' },
    { title: 'Profil', link: '/patient/modifier', icon: 'bi bi-person-circle'},
  ];
}
