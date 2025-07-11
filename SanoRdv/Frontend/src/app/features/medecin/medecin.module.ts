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

import { CalendarModule, DateAdapter, CalendarMonthModule, CalendarWeekModule, CalendarDayModule } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ProfileComponent } from './profile/profile.component';
import { ProfilViewComponent } from './profil-view/profil-view.component';



@NgModule({
  declarations: [
    DashboardComponent,
    MyAppointmentComponent,
    CreneauxComponent,
    PatientComponent,
    SidebarComponent,
    NavbarComponent,
    LayoutComponent,
    ProfileComponent,
    ProfilViewComponent
  ],
  imports: [
    CommonModule,
    MedecinRoutingModule,
    FormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    CalendarMonthModule,
    CalendarWeekModule,
    CalendarDayModule
  ]
})
export class MedecinModule { }
