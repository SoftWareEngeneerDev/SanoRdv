import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetCodeComponent } from './reset-code/reset-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SharedLayoutComponent } from '../../shared/components/shared-layout/shared-layout.component';
import { SuccessFullComponent } from './success-full/success-full.component';

const routes: Routes = [
  {
    path: '',
    component: SharedLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-code', component: ResetCodeComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      {path: 'successFull' , component: SuccessFullComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
