import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreneauxComponent } from './creneaux/creneaux.component';
import { MyAppointmentComponent } from './my-appointment/my-appointment.component';
import { PatientComponent } from './patient/patient.component';

const routes: Routes = [

  {
    path: '',
    component: LayoutComponent, // Le wrapper contenant navbar + sidebar
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'rendez-vous', component: MyAppointmentComponent },
      { path: 'creneaux', component: CreneauxComponent },
      { path: 'patients', component: PatientComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedecinRoutingModule { }
