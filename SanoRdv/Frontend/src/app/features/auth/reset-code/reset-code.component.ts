import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-code',
  templateUrl: './reset-code.component.html',
  styleUrls: ['./reset-code.component.css']
})
export class ResetCodeComponent implements OnInit {
  codeForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.codeForm = this.fb.group({
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
  }

  onSubmit(): void {
    if (this.codeForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      const { code } = this.codeForm.value;

      this.authService.verifyResetCode(code).subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Code vérifié avec succès !';
          this.isSubmitting = false;

          const resetToken = (res as any).token || '';

          // Stocker le token dans le localStorage
          localStorage.setItem('resetToken', resetToken);

          // Rediriger avec email et resetToken
          this.router.navigate(['/auth/reset-password'], {
            queryParams: { email: this.email, resetToken }
          });
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur lors de la vérification';
          this.isSubmitting = false;
        }
      });
    } else {
      this.codeForm.markAllAsTouched();
    }
  }
}
