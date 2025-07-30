import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedecinRoutingModule } from './medecin-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MyAppointmentComponent } from './pages/my-appointment/my-appointment.component';
import { CreneauxComponent } from './pages/creneaux/creneaux.component';
import { PatientComponent } from './pages/patient/patient.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LayoutComponent } from './components/layout/layout.component';
import { FormsModule } from '@angular/forms';

import { CalendarModule, DateAdapter, CalendarMonthModule, CalendarWeekModule, CalendarDayModule } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfilViewComponent } from './pages/profil-view/profil-view.component';
import { HttpClientModule } from '@angular/common/http';
import { NotificationsComponent } from './pages/notifications/notifications.component';



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
    ProfilViewComponent,
    NotificationsComponent
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
    CalendarDayModule,
    HttpClientModule

  ]
})
export class MedecinModule { }
