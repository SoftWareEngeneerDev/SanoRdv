import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RendezVousComponent } from './pages/rendez-vous/rendez-vous.component';
import { MedecinsComponent } from './pages/medecins/medecins.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { SpecialitesComponent } from './pages/specialites/specialites.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfilComponent } from './pages/profil/profil.component';

const routes: Routes = [
  { path: '', 
       component: AdminLayoutComponent,
       children: [
           { path: 'dashboard', component: DashboardComponent},
           { path: 'rendez-vous', component: RendezVousComponent},
           { path: 'medecins', component: MedecinsComponent},
           { path: 'patients', component: PatientsComponent},
           { path: 'profil', component: ProfilComponent},
           { path: 'specialites', component: SpecialitesComponent},
           { path: 'notifications', component: NotificationsComponent},
       ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
