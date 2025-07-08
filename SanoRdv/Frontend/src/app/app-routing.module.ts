import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { SharedLayoutComponent } from './shared/components/shared-layout/shared-layout.component';

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
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'medecin',
    loadChildren: () => import('./features/medecin/medecin.module').then(m => m.MedecinModule)
  },
  {
    path: 'patient',
    loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule)
  },

  // Toute URL inconnue redirige vers la page d'accueil
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
