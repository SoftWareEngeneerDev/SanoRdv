import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { SharedLayoutComponent } from './shared/components/shared-layout/shared-layout.component';
import { LoginGuard } from './core/guards/login.guard';

const routes: Routes = [
  {
    path: '',
    component: SharedLayoutComponent,
    canActivate: [LoginGuard],
    children: [
      { path: '', component: HomeComponent }
    ]
  },
  {
    path: 'auth',
    canActivate: [LoginGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    canActivate: [LoginGuard],
    data: { roles: ['admin'] }, //  Seul l'admin peut accéder
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'medecin',
    canActivate: [LoginGuard],
    data: { roles: ['medecin'] }, //  Seul le médecin peut accéder
    loadChildren: () => import('./features/medecin/medecin.module').then(m => m.MedecinModule)
  },
  {
    path: 'patient',
    canActivate: [LoginGuard],
    data: { roles: ['patient'] }, //  Seul le patient peut accéder
    loadChildren: () => import('./features/patient/patient.module').then(m => m.PatientModule)
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
