import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Admin } from '../../models/admin.model';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {

  admin!: Admin;
  isCollapsed: boolean = false;

  @Output() collapseChange = new EventEmitter<boolean>();

  menuItems = [
    { title: 'TABLEAU DE BORD', icon: 'bi-grid-fill', link: '/admin/dashboard' },
    { title: 'RENDEZ-VOUS', icon: 'bi-calendar-event', link: '/admin/rendez-vous' },
    { title: 'PATIENTS', icon: 'bi-people-fill', link: '/admin/patients' },
    { title: 'MEDECINS', icon: 'bi-person-badge', link: '/admin/medecins' },
    { title: 'SPECIALITES', icon: 'bi-diagram-3', link: '/admin/specialites' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const adminData = localStorage.getItem('user'); // <-- ici 'user' au lieu de 'admin'
    if (adminData) {
      try {
        this.admin = JSON.parse(adminData);
      } catch (error) {
        console.error('Erreur de parsing admin depuis localStorage :', error);
      }
    } else {
      console.warn('Aucun admin trouvé dans le localStorage');
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapseChange.emit(this.isCollapsed);
  }

  allerAuProfil(): void {
    this.router.navigate(['/admin/profil']);
  }


}
