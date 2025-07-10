import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { SharedLayoutComponent } from './shared/components/shared-layout/shared-layout.component';
import { LoginGuard } from './core/guards/login.guard';
import { AboutComponent } from './features/about/about.component';

const routes: Routes = [
  {
    path: '',
    component: SharedLayoutComponent,
    canActivate: [LoginGuard], // ✅ Bloque l'accès si connecté
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent } // <-- Ajoute cette ligne ici
    ]
  },
  {
    path: 'auth',
    canActivate: [LoginGuard], // ✅ Bloque tout le module auth si connecté
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



  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
