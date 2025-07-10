import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreneauxComponent } from './creneaux/creneaux.component';
import { MyAppointmentComponent } from './my-appointment/my-appointment.component';
import { PatientComponent } from './patient/patient.component';

import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { ProfilViewComponent } from './profil-view/profil-view.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivateChild: [AuthGuard], // <-- Protéger toutes les routes enfants
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'rendez-vous', component: MyAppointmentComponent },
      { path: 'creneaux', component: CreneauxComponent },
      { path: 'patients', component: PatientComponent },
      { path: 'profil-view', component: ProfilViewComponent },
      { path: 'profile', component: ProfileComponent },
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedecinRoutingModule { }
