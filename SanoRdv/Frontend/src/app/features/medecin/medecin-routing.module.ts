import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreneauxComponent } from './pages/creneaux/creneaux.component';
import { MyAppointmentComponent } from './pages/my-appointment/my-appointment.component';
import { PatientComponent } from './pages/patient/patient.component';

import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfilViewComponent } from './pages/profil-view/profil-view.component';
import { LogOutComponent } from './pages/log-out/log-out.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivateChild: [AuthGuard], // <-- Protéger toutes les routes enfants
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'rendez-vous', component: MyAppointmentComponent },
      { path: 'creneaux/:idmedecin/:idpatient', component: CreneauxComponent },
      { path: 'patients', component: PatientComponent },
      { path: 'profil-view', component: ProfilViewComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'log-out', component: LogOutComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedecinRoutingModule { }
