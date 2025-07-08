import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedecinRoutingModule } from './medecin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyAppointmentComponent } from './my-appointment/my-appointment.component';
import { CreneauxComponent } from './creneaux/creneaux.component';
import { PatientComponent } from './patient/patient.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DashboardComponent,
    MyAppointmentComponent,
    CreneauxComponent,
    PatientComponent,
    SidebarComponent,
    NavbarComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    MedecinRoutingModule,
    FormsModule
  ]
})
export class MedecinModule { }
