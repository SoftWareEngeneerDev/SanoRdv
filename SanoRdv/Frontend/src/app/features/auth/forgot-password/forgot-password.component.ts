import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      const email = this.forgotForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: res => {
          this.successMessage = res.message || 'Lien de réinitialisation envoyé avec succès.';
          this.isSubmitting = false;
          this.emailSent = true;
          this.forgotForm.reset();

          setTimeout(() => {
            // On passe l'email en query param à la page de saisie du code
            this.router.navigate(['/auth/reset-code'], { queryParams: { email } });
          }, 2000);
        },
        error: err => {
          this.errorMessage = err.error?.message || 'Erreur lors de la demande.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }
}
