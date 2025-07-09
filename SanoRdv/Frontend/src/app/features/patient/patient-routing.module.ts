
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RendezvousComponent } from './pages/appointment/appointment.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { RegisterComponent } from './pages/modifier/modifier.component';
// import { DossierMedicalComponent } from './pages/dossiers-medicaux/dossiers-medicaux.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { MotifComponent} from './pages/motif/motif.component';
import { CreneauComponent } from './pages/creneau/creneau.component';
import { ProfilMedecinComponent} from './pages/informations/informations.component';
import {RecapitulatifComponent} from './pages/recapitulatif/recapitulatif.component';
import {ConfirmationComponent} from './pages/confirmation/confirmation.component';
import { DeconnexionComponent } from './pages/deconnexion/deconnexion.component';

const routes: Routes = [
   { path: 'informations', component: ProfilMedecinComponent },
   { path: 'motif', component: MotifComponent },
   { path: 'creneau', component: CreneauComponent },
   { path: 'recapitulatif', component: RecapitulatifComponent },
   { path: 'confirmation', component: ConfirmationComponent },
   { path: 'deconnexion', component: DeconnexionComponent },
 { path: '', component: PatientLayoutComponent,
   children: [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'appointment', component: RendezvousComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'modifier', component: RegisterComponent },
  { path: 'profil', component: ProfilComponent },
  // { path: 'dossiers-medicaux', component: DossierMedicalComponent },
  { path: '**', redirectTo: 'dashboard' },
]
}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientRoutingModule {}
