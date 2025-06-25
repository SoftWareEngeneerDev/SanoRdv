import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './composant/home/home.component';
import { SharedLayoutComponent } from './composant/shared/shared-layout/shared-layout.component';

const routes: Routes = [
  // Page d'accueil avec layout commun
  {
    path: '',
    component: SharedLayoutComponent,
    children: [
      { path: '', component: HomeComponent }
    ]
  },

  // Lazy loading des modules
  {
    path: 'auth',
    loadChildren: () => import('./composant/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./composant/users/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'medecin',
    loadChildren: () => import('./composant/users/medecin/medecin.module').then(m => m.MedecinModule)
  },
  {
    path: 'patient',
    loadChildren: () => import('./composant/users/patient/patient.module').then(m => m.PatientModule)
  },

  // Toute URL inconnue redirige vers la page d'accueil
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
