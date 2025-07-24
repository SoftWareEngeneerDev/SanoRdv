import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RendezvousComponent } from './pages/appointment/appointment.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { RegisterComponent } from './pages/modifier/modifier.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { MotifComponent } from './pages/motif/motif.component';
import { CreneauComponent } from './pages/creneau/creneau.component';
import { ProfilMedecinComponent } from './pages/informations/informations.component';
import { RecapitulatifComponent } from './pages/recapitulatif/recapitulatif.component';
import { ConfirmationComponent } from './pages/confirmation/confirmation.component';
import { DeconnexionComponent } from './pages/deconnexion/deconnexion.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';  // Importation du AuthGuard



const routes: Routes = [
  { path: 'informations/:id', component: ProfilMedecinComponent, canActivate: [AuthGuard] },
  { path: 'motif/:medecin_id/:patient_id', component: MotifComponent, canActivate: [AuthGuard] },
 { path: 'creneau/:medecin_id/:patient_id', component: CreneauComponent, canActivate: [AuthGuard] },
  { path: 'recapitulatif', component: RecapitulatifComponent, canActivate: [AuthGuard] },
  { path: 'confirmation', component: ConfirmationComponent, canActivate: [AuthGuard] },
  { path: 'deconnexion', component: DeconnexionComponent,  canActivate: [AuthGuard, AuthGuard ]},
  {
    path: '',
    component: PatientLayoutComponent,
    canActivateChild: [AuthGuard], // Protection de toutes les routes enfants
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'appointment', component: RendezvousComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'modifier', component: RegisterComponent },
      { path: 'profil', component: ProfilComponent },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientRoutingModule {}
