import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

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
import { RegisterComponent } from './pages/modifier/modifier.component';
import { MotifComponent } from './pages/motif/motif.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { RecapitulatifComponent } from './pages/recapitulatif/recapitulatif.component';
import { ConfirmationComponent } from './pages/confirmation/confirmation.component';
import { CreneauComponent } from './pages/creneau/creneau.component';
import { DeconnexionComponent } from './pages/deconnexion/deconnexion.component';



@NgModule({
  declarations: [
    SidebarPatientComponent,
    HeaderPatientComponent,
    NotificationStatsComponent,
    MotifComponent,
     PatientLayoutComponent,
      RechercheMedecinComponent,
      DashboardComponent,
      RdvStatsComponent,
      DossierComponent,
      RendezvousComponent,
      RegisterComponent,
      ProfilComponent,
      NotificationsComponent,
      RecapitulatifComponent,
      ConfirmationComponent,
      CreneauComponent,
      DeconnexionComponent,
  ],
  imports: [
      CommonModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
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
