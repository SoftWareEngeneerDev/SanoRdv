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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfilComponent } from './pages/profil/profil.component';
import { AjouterMedecinComponent } from './pages/ajouter-medecin/ajouter-medecin.component';
import { ModifierMedecinComponent } from './pages/modifier-medecin/modifier-medecin.component';
import { AjouterPatientComponent } from './pages/ajouter-patient/ajouter-patient.component';
import { DetailPatientComponent } from './pages/detail-patient/detail-patient.component';
import { DetailRendezVousComponent } from './pages/detail-rendez-vous/detail-rendez-vous.component';
import { ModifierSpecialitesComponent } from './pages/modifier-specialites/modifier-specialites.component';
import { AjouterSpecialitesComponent } from './pages/ajouter-specialites/ajouter-specialites.component';
import { DetailMedecinComponent } from './pages/detail-medecin/detail-medecin.component';


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
    NotificationsComponent,
    ProfilComponent,
    AjouterMedecinComponent,
    ModifierMedecinComponent,
    AjouterPatientComponent,
    DetailPatientComponent,
    DetailRendezVousComponent,
    ModifierSpecialitesComponent,
    AjouterSpecialitesComponent,
    DetailMedecinComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgChartsModule,
    FormsModule,
    ReactiveFormsModule,


  ]
})
export class AdminModule { }
