import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminHeaderComponent } from './components/admin-header/admin-header.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NgChartsModule } from 'ng2-charts';
import { RendezVousComponent } from './pages/rendez-vous/rendez-vous.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { MedecinsComponent } from './pages/medecins/medecins.component';
import { SpecialitesComponent } from './pages/specialites/specialites.component';
import { NotificationsComponent } from './pages/notifications/notifications.component'; // Assurez-vous d'avoir installé ng2-charts
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminLayoutComponent,
    DashboardComponent,
    RendezVousComponent,
    PatientsComponent,
    MedecinsComponent,
    SpecialitesComponent,
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgChartsModule,
    FormsModule,
    RouterModule
  ]
})
export class AdminModule { }
