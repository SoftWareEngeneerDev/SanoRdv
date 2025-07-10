import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  email: string = '';
  resetToken: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.resetToken = this.route.snapshot.queryParams['resetToken'] || localStorage.getItem('resetToken') || '';
    console.log('Email:', this.email);
    console.log('Token reset récupéré (JWT):', this.resetToken);
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      if (!this.resetToken) {
        this.errorMessage = "Token de réinitialisation manquant. Veuillez valider votre code avant.";
        this.isSubmitting = false;
        return;
      }

      const resetData = {
        email: this.email,
        motDePasse: this.resetForm.value.newPassword,
        confirmationMotDePasse: this.resetForm.value.confirmPassword
      };

      this.authService.resetPassword(resetData, this.resetToken).subscribe({
        next: res => {
          this.successMessage = res.message || 'Votre mot de passe a été réinitialisé avec succès.';
          this.isSubmitting = false;

          // Supprimer le token du localStorage
          localStorage.removeItem('resetToken');

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: err => {
          this.errorMessage = err.error?.message || 'Erreur lors de la réinitialisation.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  // Fonction pour afficher/masquer le mot de passe
  togglePasswordVisibility(field: string): void {
    const inputField = document.getElementById(field) as HTMLInputElement;
    const icon = document.querySelector(`#${field} + .input-with-icon i`) as HTMLElement;

    if (inputField.type === 'password') {
      inputField.type = 'text';
      icon.classList.remove('bi-eye-slash');
      icon.classList.add('bi-eye');
    } else {
      inputField.type = 'password';
      icon.classList.remove('bi-eye');
      icon.classList.add('bi-eye-slash');
    }
  }
}
