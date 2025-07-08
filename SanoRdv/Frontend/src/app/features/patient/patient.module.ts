import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


import { PatientRoutingModule } from './patient-routing.module';
import { SidebarPatientComponent } from './components/sidebar-patient/sidebar-patient.component';
import { NotificationStatsComponent } from './components/notifications-stats/notifications-stats.component';

import { HeaderPatientComponent } from './components/header-patient/header-patient.component'
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { DossierComponent } from './components/dossier/dossier.component';
import { RdvStatsComponent } from './components/rdv-stats/rdv-stats.component';
import { RechercheMedecinComponent } from './components/search-medecin/search-medecin.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import {RendezvousComponent } from './pages/appointment/appointment.component';


@NgModule({
  declarations: [
    SidebarPatientComponent,
    HeaderPatientComponent,
    NotificationStatsComponent,
     PatientLayoutComponent,
      RechercheMedecinComponent,
      DashboardComponent,
      RdvStatsComponent,
      DossierComponent,
      RendezvousComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PatientRoutingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
     FormsModule,
    ReactiveFormsModule,
    SharedModule

  ],
  exports: [
    SidebarPatientComponent,
    NotificationStatsComponent,
    HeaderPatientComponent,
    RdvStatsComponent
  ],
})
export class PatientModule { }
