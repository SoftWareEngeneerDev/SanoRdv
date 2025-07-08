import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResetCodeComponent } from './reset-code/reset-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SuccessFullComponent } from './success-full/success-full.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetCodeComponent,
    ResetPasswordComponent,
    SuccessFullComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,  // ✅ Routing interne du module
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ]
})
export class AuthModule { }
