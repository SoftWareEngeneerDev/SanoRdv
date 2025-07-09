import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Création du formulaire avec les validations
    this.registerForm = this.fb.group(
      {
        nom: ['', [Validators.required, Validators.minLength(2)]],
        prenom: ['', [Validators.required, Validators.minLength(2)]],
        telephone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        sex: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        motDePasse: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmationMotDePasse: ['', Validators.required],
      },
      {
        validators: this.passwordsMatch,
      }
    );
  }
// Validation si les mots de passe correspondent
  passwordsMatch(form: FormGroup) {
    const pass = form.get('motDePasse')?.value;
    const confirm = form.get('confirmationMotDePasse')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'Ce champ est requis';
      if (field.errors['email']) return 'Email invalide';
      if (field.errors['minlength'])
        return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['pattern'] && fieldName === 'telephone')
        return 'Numéro invalide';
      if (field.errors['pattern'] && fieldName === 'motDePasse') {
        return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)';
      }
    }
    return '';
  }
// Vérification de l'erreur de non-correspondance des mots de passe
  get passwordMismatchError(): boolean {
    return (
      this.registerForm.errors?.['passwordMismatch'] &&
      this.registerForm.get('confirmationMotDePasse')?.touched
    );
  }
// Fonction pour afficher/masquer le mot de passe
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
// Fonction pour afficher/masquer le mot de passe de confirmation
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onCancel(): void {
    this.router.navigate(['/auth/login']);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.registerForm.value;
      const formData = {
        nom: formValue.nom,
        prenom: formValue.prenom,
        email: formValue.email,
        telephone: formValue.telephone,
        sex: formValue.sex,
        motDePasse: formValue.motDePasse,
        confirmationMotDePasse: formValue.confirmationMotDePasse,
      };
      console.log('Données envoyées :', this.registerForm.value);

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Inscription réussie !';
          this.isSubmitting = false;
          this.registerForm.reset();

          Object.keys(this.registerForm.controls).forEach((key) => {
            this.registerForm.get(key)?.setErrors(null);
          });

          this.router.navigate(['/auth/successFull']);
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message ||
            "Une erreur est survenue lors de l'inscription";
          this.isSubmitting = false;
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
