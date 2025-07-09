import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../admin.service';
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
    { title: 'Tableau de bord', icon: 'bi-grid-fill', link: '/admin/dashboard' },
    { title: 'Rendez-vous', icon: 'bi-calendar-event', link: '/admin/rendez-vous' },
    { title: 'Patients', icon: 'bi-people-fill', link: '/admin/patients' },
    { title: 'Médecins', icon: 'bi-person-badge', link: '/admin/medecins' },
    { title: 'Spécialités', icon: 'bi-diagram-3', link: '/admin/specialites' },
    { title: 'Notifications', icon: 'bi-bell-fill', link: '/admin/notifications' },
    { title: 'Rapports', icon: 'bi-file-earmark-text-fill', link: '/admin/rapports' }
  ];

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.adminService.getAdmin().subscribe({
      next: (data) => this.admin = data,
      error: (err) => {
        console.error('Erreur lors du chargement du profil admin :', err);
      }
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapseChange.emit(this.isCollapsed);
  }

  allerAuProfil(): void {
    this.router.navigate(['/admin/profil']);
  }


}
