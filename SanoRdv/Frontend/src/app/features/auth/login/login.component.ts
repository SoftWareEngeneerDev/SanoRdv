import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  password: string = '';
  showPassword: boolean = false;
  redirectUrl: string | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      UserID: ['', [Validators.required, Validators.email]],
      motDePasse: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    if (this.loginForm.valid) {
      console.log('Données envoyées au backend :', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.successMessage = 'Connexion réussie ! Redirection en cours...';
          this.isSubmitting = false;

          setTimeout(() => {
            const role = response?.user?.role;

            if (this.redirectUrl) {
              this.router.navigateByUrl(`/${this.redirectUrl}`);
              return;
            }

            if (role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else if (role === 'medecin') {
              this.router.navigate(['/medecin']);
            } else if (role === 'patient') {
              this.router.navigate(['/patient']);
            } else {
              this.router.navigate(['/Accueil']);
            }
          }, 1500);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Erreur de connexion :', err);

          if (err.status === 401) {
            this.errorMessage = 'Email ou mot de passe incorrect.';
          } else if (err.status === 0) {
            this.errorMessage = 'Connexion au serveur impossible. Vérifiez votre connexion.';
          } else {
            this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          }
        }
      });
    } else {
      this.isSubmitting = false;
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
