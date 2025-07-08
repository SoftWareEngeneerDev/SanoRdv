
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { PatientService, Patient } from '../../../../shared/services/patient.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-patient',
  templateUrl: './sidebar-patient.component.html',
  styleUrls: ['./sidebar-patient.component.css']
})
export class SidebarPatientComponent implements OnInit {
  patient: Patient = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sexe: '',
    motDePasse: '',
  };


   isCollapsed: boolean = false;

  @Output() sidebarToggled = new EventEmitter<boolean>();
  @Output() collapseChange: EventEmitter<boolean> = new EventEmitter<boolean>();


  constructor(private patientService: PatientService, private router: Router) {}


  ngOnInit(): void {
    this.patientService.getMonProfil().subscribe((data: Patient) => {
      this.patient = data;
    });
  }

  patients={
    nom:'TRAORE',
    prenom:'Sharifa',
    avatar:'assets/sharifa.jpg'
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseChange.emit(this.isCollapsed);
  }

goToProfileEdit(): void {
  this.router.navigate(['/modifier']);
}

  menuItems = [
    { title: 'Tableau de bord', link: '/patient/dashboard', icon: 'bi-grid-fill' },
    { title: 'Mes rendez-vous',link: '/patient/appointment',icon: 'bi-calendar-event',},
    { title: 'Notifications', link: '/patient/notifications', icon: 'bi-bell' },
    { title: 'Dossiers medicaux',link: '/patient/dossiers-medicaux', icon: ' bi-file-earmark-medical',},
    { title: 'Profil', link: '/patient/modifier', icon: 'bi-gear' },
  ];
}

